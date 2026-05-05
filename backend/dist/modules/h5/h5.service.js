"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.H5Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const merchant_entity_1 = require("../merchant/merchant.entity");
const generation_entity_1 = require("../generator/generation.entity");
const analytics_log_entity_1 = require("../analytics/analytics-log.entity");
const ai_service_1 = require("../ai/ai.service");
const prompt_builder_service_1 = require("../prompt-builder/prompt-builder.service");
const merchant_image_entity_1 = require("../warehouse/merchant-image.entity");
let H5Service = class H5Service {
    constructor(merchantRepository, generationRepository, analyticsRepository, imageRepository, aiService, promptBuilder) {
        this.merchantRepository = merchantRepository;
        this.generationRepository = generationRepository;
        this.analyticsRepository = analyticsRepository;
        this.imageRepository = imageRepository;
        this.aiService = aiService;
        this.promptBuilder = promptBuilder;
    }
    async getMerchantConfig(merchantId) {
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.BadRequestException('商家不存在');
        }
        const coverImage = await this.findCoverImage(merchant.merchantId);
        const productImages = await this.findProductImages(merchant.merchantId, 6);
        return {
            merchant_id: merchant.merchantId,
            name: merchant.name,
            logo: merchant.logo,
            cover_image: coverImage || merchant.logo || '',
            product_images: productImages,
            incentive: merchant.incentive,
            jump_targets: merchant.jumpLinks?.platforms || ['dianping'],
            dy_url: merchant.location?.dy_url || merchant.jumpLinks?.dy_url || '',
            wx_qr: merchant.location?.wx_url || merchant.jumpLinks?.wx_qr || '',
            address: merchant.location?.address || '',
        };
    }
    async generateContent(merchantId, type, options = {}) {
        const traceId = (0, uuid_1.v4)();
        const startTime = Date.now();
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.BadRequestException('商家不存在');
        }
        if (merchant.balance <= 0) {
            throw new common_1.BadRequestException('该商家额度已用完', '4001');
        }
        const prompt = await this.promptBuilder.buildMerchantPrompt(merchant, type, options);
        let content;
        try {
            content = await this.aiService.generate(prompt, type === 'note' ? 260 : 520);
        }
        catch (error) {
            console.error('AI生成失败:', error);
            throw new common_1.BadRequestException(error?.message || 'AI服务异常', '4002');
        }
        if (await this.promptBuilder.containsSensitiveWords(content)) {
            throw new common_1.BadRequestException('内容优化中，请重试', '4003');
        }
        const images = await this.matchImages(merchantId, type, 6);
        merchant.balance -= 1;
        await this.merchantRepository.save(merchant);
        const generation = this.generationRepository.create({
            merchantId,
            tenantId: merchant.tenantId,
            type,
            content,
            images,
            traceId,
            duration: Date.now() - startTime,
        });
        await this.generationRepository.save(generation);
        try {
            await this.analyticsRepository.save({
                merchantId,
                traceId,
                eventType: 'gen',
                type,
            });
        }
        catch (error) {
            console.error('埋点记录失败:', error);
        }
        return {
            trace_id: traceId,
            content: {
                text: content,
                images,
            },
        };
    }
    async *generateContentStream(merchantId, type, options = {}) {
        const traceId = (0, uuid_1.v4)();
        const startTime = Date.now();
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.BadRequestException('商家不存在');
        }
        if (merchant.balance <= 0) {
            throw new common_1.BadRequestException('该商家额度已用完', '4001');
        }
        const images = await this.matchImages(merchantId, type, 6);
        yield { event: 'start', data: { trace_id: traceId, images } };
        const prompt = await this.promptBuilder.buildMerchantPrompt(merchant, type, options);
        let content = '';
        try {
            for await (const chunk of this.aiService.generateStream(prompt, type === 'note' ? 260 : 520)) {
                content += chunk;
                yield { event: 'content', data: { text: chunk } };
            }
        }
        catch (error) {
            console.error('AI流式生成失败:', error);
            throw new common_1.BadRequestException(error?.message || 'AI服务异常', '4002');
        }
        if (await this.promptBuilder.containsSensitiveWords(content)) {
            throw new common_1.BadRequestException('内容优化中，请重试', '4003');
        }
        merchant.balance -= 1;
        await this.merchantRepository.save(merchant);
        const generation = this.generationRepository.create({
            merchantId,
            tenantId: merchant.tenantId,
            type,
            content,
            images,
            traceId,
            duration: Date.now() - startTime,
        });
        await this.generationRepository.save(generation);
        try {
            await this.analyticsRepository.save({
                merchantId,
                traceId,
                eventType: 'gen',
                type,
            });
        }
        catch (error) {
            console.error('埋点记录失败:', error);
        }
        yield {
            event: 'done',
            data: {
                trace_id: traceId,
                content: {
                    text: content,
                    images,
                },
                duration: Date.now() - startTime,
            },
        };
    }
    async track(data) {
        const log = this.analyticsRepository.create({
            merchantId: data.merchant_id,
            qrId: data.qr_id,
            eventType: data.event,
            source: data.source,
            type: data.type,
            traceId: data.trace_id,
            duration: data.duration,
            targetPlatform: data.target_platform,
            clientTime: data.client_time ? new Date(data.client_time) : new Date(),
        });
        await this.analyticsRepository.save(log);
    }
    async publishCallback(data) {
        const generation = await this.generationRepository.findOne({
            where: { traceId: data.trace_id },
        });
        if (generation) {
            generation.feedback = `发布成功|${data.platform}|${data.publish_url || ''}`;
            await this.generationRepository.save(generation);
        }
        const log = this.analyticsRepository.create({
            merchantId: data.merchant_id,
            eventType: 'jump',
            traceId: data.trace_id,
            targetPlatform: data.platform,
        });
        await this.analyticsRepository.save(log);
    }
    async findCoverImage(merchantId) {
        const image = await this.imageRepository.createQueryBuilder('image')
            .where('image.merchantId = :merchantId', { merchantId })
            .andWhere('image.isDeleted = 0')
            .andWhere('image.url IS NOT NULL')
            .andWhere("image.url != ''")
            .orderBy(`CASE image.tab WHEN 'environment' THEN 1 WHEN 'product' THEN 2 WHEN 'other' THEN 3 ELSE 4 END`, 'ASC')
            .addOrderBy('image.createdAt', 'DESC')
            .getOne();
        return image?.url || '';
    }
    async findProductImages(merchantId, count) {
        const images = await this.imageRepository.find({
            where: { merchantId, tab: 'product', isDeleted: 0 },
            order: { createdAt: 'DESC' },
            take: count,
        });
        return images
            .filter(image => image.url)
            .map(image => ({
            url: image.url,
            product_tag: image.productTag || '',
            source: 'product',
        }));
    }
    async matchImages(merchantId, type, count) {
        const preferredTab = type === 'note' ? 'product' : 'environment';
        const primary = await this.imageRepository.find({
            where: { merchantId, tab: preferredTab, isDeleted: 0 },
            order: { createdAt: 'DESC' },
            take: count,
        });
        const images = primary
            .filter(image => image.url)
            .map(image => ({
            url: image.url,
            source: image.tab,
            product_tag: image.productTag || '',
        }));
        if (images.length < count) {
            const fallback = await this.imageRepository.find({
                where: { merchantId, isDeleted: 0 },
                order: { createdAt: 'DESC' },
                take: count,
            });
            fallback.forEach(image => {
                if (images.length >= count)
                    return;
                if (!image.url || images.some(item => item.url === image.url))
                    return;
                images.push({
                    url: image.url,
                    source: image.tab,
                    product_tag: image.productTag || '',
                });
            });
        }
        return images;
    }
};
exports.H5Service = H5Service;
exports.H5Service = H5Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __param(1, (0, typeorm_1.InjectRepository)(generation_entity_1.Generation)),
    __param(2, (0, typeorm_1.InjectRepository)(analytics_log_entity_1.AnalyticsLog)),
    __param(3, (0, typeorm_1.InjectRepository)(merchant_image_entity_1.MerchantImage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_service_1.AiService,
        prompt_builder_service_1.PromptBuilderService])
], H5Service);
//# sourceMappingURL=h5.service.js.map