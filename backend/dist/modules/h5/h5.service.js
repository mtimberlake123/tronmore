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
const sensitive_word_entity_1 = require("../admin/sensitive-word.entity");
const ai_service_1 = require("../ai/ai.service");
let H5Service = class H5Service {
    constructor(merchantRepository, generationRepository, analyticsRepository, sensitiveWordRepository, aiService) {
        this.merchantRepository = merchantRepository;
        this.generationRepository = generationRepository;
        this.analyticsRepository = analyticsRepository;
        this.sensitiveWordRepository = sensitiveWordRepository;
        this.aiService = aiService;
    }
    async getMerchantConfig(merchantId) {
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.BadRequestException('商家不存在');
        }
        return {
            merchant_id: merchant.merchantId,
            name: merchant.name,
            logo: merchant.logo,
            incentive: merchant.incentive,
            jump_targets: merchant.jumpLinks?.platforms || ['dianping'],
            dy_url: merchant.jumpLinks?.dy_url || '',
            wx_qr: merchant.jumpLinks?.wx_qr || '',
        };
    }
    async generateContent(merchantId, type) {
        const traceId = (0, uuid_1.v4)();
        const startTime = Date.now();
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.BadRequestException('商家不存在');
        }
        if (merchant.balance <= 0) {
            throw new common_1.BadRequestException('该商家额度已用完', '4001');
        }
        const prompt = await this.buildPrompt(merchant, type);
        let content;
        try {
            content = await this.callAI(prompt, type);
        }
        catch (error) {
            console.error('AI生成失败:', error);
            throw new common_1.BadRequestException('AI服务异常', '4002');
        }
        if (await this.containsSensitiveWords(content)) {
            throw new common_1.BadRequestException('内容优化中，请重试', '4003');
        }
        const images = this.mockImages(6);
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
        catch (e) {
            console.error('埋点记录失败:', e);
        }
        return {
            trace_id: traceId,
            content: {
                text: content,
                images,
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
    async buildPrompt(merchant, type) {
        const industryPrompts = {
            catering: '你是一个专业的餐饮营销文案专家，文风活泼、接地气，擅长写吸引人的评价。',
            beauty: '你是一个专业的美业营销文案专家，文风精致，擅长写高端感的评价。',
            general: '你是一个专业的营销文案专家，擅长写各类评价。',
        };
        const typeInstructions = {
            review: '请生成一条大众点评/美团风格的评价，内容要真实自然，突出商家特色。',
            note: '请生成一条小红书风格的笔记，内容要有分享感，可以使用emoji。',
        };
        let prompt = `${industryPrompts[merchant.category] || industryPrompts.general}\n`;
        prompt += `${typeInstructions[type] || typeInstructions.review}\n`;
        if (merchant.features?.length) {
            prompt += `商家特色：${merchant.features.join('、')}\n`;
        }
        if (merchant.products?.length) {
            prompt += `主要产品：${merchant.products.join('、')}\n`;
        }
        if (merchant.incentive) {
            prompt += `激励活动：${merchant.incentive}\n`;
        }
        const activeRules = await this.sensitiveWordRepository.find({ where: { active: true } });
        if (activeRules.length > 0) {
            const ruleConstraints = activeRules
                .filter(r => r.rule)
                .map(r => `- ${r.rule}`)
                .join('\n');
            if (ruleConstraints) {
                prompt += `\n\n【合规要求】请严格遵守以下规则：\n${ruleConstraints}`;
            }
        }
        prompt += '\n\n【重要】请确保内容符合平台规范，文风自然，避免AI味。';
        return prompt;
    }
    async callAI(prompt, type) {
        return await this.aiService.generate(prompt);
    }
    async containsSensitiveWords(text) {
        const rules = await this.sensitiveWordRepository.find({ where: { active: true } });
        if (!rules.length)
            return false;
        return rules.some(r => r.word && text.includes(r.word));
    }
    mockImages(count) {
        return Array.from({ length: count }, (_, i) => ({
            url: `https://via.placeholder.com/300x300?text=Image${i + 1}`,
            width: 300,
            height: 300,
        }));
    }
};
exports.H5Service = H5Service;
exports.H5Service = H5Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __param(1, (0, typeorm_1.InjectRepository)(generation_entity_1.Generation)),
    __param(2, (0, typeorm_1.InjectRepository)(analytics_log_entity_1.AnalyticsLog)),
    __param(3, (0, typeorm_1.InjectRepository)(sensitive_word_entity_1.SensitiveWord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_service_1.AiService])
], H5Service);
//# sourceMappingURL=h5.service.js.map