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
exports.GeneratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const generation_entity_1 = require("./generation.entity");
const merchant_entity_1 = require("../merchant/merchant.entity");
const merchant_image_entity_1 = require("../warehouse/merchant-image.entity");
const analytics_log_entity_1 = require("../analytics/analytics-log.entity");
const ai_service_1 = require("../ai/ai.service");
const prompt_builder_service_1 = require("../prompt-builder/prompt-builder.service");
let GeneratorService = class GeneratorService {
    constructor(generationRepository, merchantRepository, imageRepository, analyticsRepository, aiService, promptBuilder) {
        this.generationRepository = generationRepository;
        this.merchantRepository = merchantRepository;
        this.imageRepository = imageRepository;
        this.analyticsRepository = analyticsRepository;
        this.aiService = aiService;
        this.promptBuilder = promptBuilder;
    }
    async generate(tenantId, merchantId, type, options) {
        const startTime = Date.now();
        const traceId = (0, uuid_1.v4)();
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.BadRequestException('商家不存在');
        }
        if (merchant.balance <= 0) {
            throw new common_1.BadRequestException('商家额度不足', '4001');
        }
        const prompt = await this.promptBuilder.buildMerchantPrompt(merchant, type, options || {});
        let generatedContent;
        try {
            generatedContent = await this.callAIService(prompt, type);
        }
        catch (error) {
            console.error('AI服务调用失败:', error);
            throw new common_1.BadRequestException(error?.message || 'AI服务异常', '4002');
        }
        if (await this.promptBuilder.containsSensitiveWords(generatedContent.text)) {
            throw new common_1.BadRequestException('内容包含敏感词', '4003');
        }
        const { images, imageIds } = await this.matchImages(merchantId, type, options?.imageCount || 6);
        merchant.balance -= 1;
        await this.merchantRepository.save(merchant);
        if (imageIds.length > 0) {
            await this.imageRepository
                .createQueryBuilder()
                .update()
                .set({ isUsed: 1, usedAt: new Date() })
                .whereInIds(imageIds)
                .execute();
        }
        const generation = this.generationRepository.create({
            merchantId,
            tenantId,
            type,
            content: generatedContent.text,
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
                text: generatedContent.text,
                images,
            },
            duration: Date.now() - startTime,
        };
    }
    async previewReview(tenantId, merchantId, options = {}) {
        const startTime = Date.now();
        const traceId = (0, uuid_1.v4)();
        const merchant = await this.merchantRepository.findOne({ where: { merchantId, tenantId } });
        if (!merchant) {
            throw new common_1.BadRequestException('商家不存在');
        }
        const prompt = await this.promptBuilder.buildMerchantPrompt(merchant, 'review', options || {});
        let generatedContent;
        try {
            generatedContent = await this.callAIService(prompt, 'review');
        }
        catch (error) {
            console.error('AI预览生成失败:', error);
            throw new common_1.BadRequestException(error?.message || 'AI服务异常', '4002');
        }
        if (await this.promptBuilder.containsSensitiveWords(generatedContent.text)) {
            throw new common_1.BadRequestException('内容包含敏感词', '4003');
        }
        return {
            trace_id: traceId,
            content: {
                text: generatedContent.text,
            },
            duration: Date.now() - startTime,
        };
    }
    async callAIService(prompt, type) {
        const text = await this.aiService.generate(prompt, type === 'note' ? 260 : 520);
        return { text };
    }
    async matchImages(merchantId, type, count) {
        const productImages = await this.imageRepository.find({
            where: { merchantId, tab: 'product', isUsed: 0, isDeleted: 0 },
            take: count,
        });
        const imageIds = [];
        const images = productImages.map(img => {
            imageIds.push(img.id);
            return {
                url: img.url,
                source: 'product',
            };
        });
        if (images.length < count) {
            const needMore = count - images.length;
            const envImages = await this.imageRepository.find({
                where: { merchantId, tab: 'environment', isUsed: 0, isDeleted: 0 },
                take: needMore,
            });
            envImages.forEach(img => {
                imageIds.push(img.id);
                images.push({
                    url: img.url,
                    source: 'environment',
                });
            });
        }
        while (images.length < count) {
            images.push({
                url: `https://via.placeholder.com/300x300?text=Image${images.length + 1}`,
                source: 'placeholder',
            });
        }
        return { images, imageIds };
    }
    async getGenerations(tenantId, merchantId, params) {
        const { type, page = 1, page_size = 20 } = params;
        const safePageSize = Math.min(parseInt(page_size) || 20, 100);
        const query = this.generationRepository
            .createQueryBuilder('g')
            .where('g.merchantId = :merchantId', { merchantId })
            .andWhere('g.tenantId = :tenantId', { tenantId });
        if (type) {
            query.andWhere('g.type = :type', { type });
        }
        query.orderBy('g.createdAt', 'DESC');
        query.skip((parseInt(page) - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        return { list, total };
    }
    async feedback(generationId, data) {
        const generation = await this.generationRepository.findOne({ where: { id: generationId } });
        if (!generation) {
            throw new common_1.BadRequestException('生成记录不存在');
        }
        generation.rating = data.rating;
        generation.feedback = data.feedback;
        await this.generationRepository.save(generation);
        return { message: '反馈已提交' };
    }
};
exports.GeneratorService = GeneratorService;
exports.GeneratorService = GeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(generation_entity_1.Generation)),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __param(2, (0, typeorm_1.InjectRepository)(merchant_image_entity_1.MerchantImage)),
    __param(3, (0, typeorm_1.InjectRepository)(analytics_log_entity_1.AnalyticsLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_service_1.AiService,
        prompt_builder_service_1.PromptBuilderService])
], GeneratorService);
//# sourceMappingURL=generator.service.js.map