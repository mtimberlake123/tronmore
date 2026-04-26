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
exports.FactoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const poster_template_entity_1 = require("./poster-template.entity");
const poster_entity_1 = require("./poster.entity");
const draft_entity_1 = require("./draft.entity");
const merchant_entity_1 = require("../merchant/merchant.entity");
const ai_service_1 = require("../ai/ai.service");
const tenant_entity_1 = require("../auth/tenant.entity");
const FACTORY_MODULES = [
    {
        key: 'product-display',
        name: '产品展示',
        description: '适合菜品、服务、套餐、门店环境等展示型图片。',
        mediaType: 'image',
        goal: 'display',
        supportedRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
        cost: 1,
        prompt: '你是本地生活商家的产品视觉设计师，请生成展示型图片方案。画面少字或无字，重点突出主体真实质感、清晰构图和可信消费场景，可用于商家详情页、平台内容配图和朋友圈展示。',
    },
    {
        key: 'promo-campaign',
        name: '活动促销',
        description: '适合团购、满减、新品、节日活动、社群转发海报。',
        mediaType: 'image',
        goal: 'conversion',
        supportedRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
        cost: 1,
        prompt: '你是商家端转化型活动海报设计师，请生成促销图片方案。画面需要突出用户填写的利益点、行动号召和活动氛围，信息层级清楚，但不要虚构价格、折扣、日期、地址或承诺。',
    },
    {
        key: 'platform-cover',
        name: '平台封面',
        description: '适合小红书、大众点评、抖音等平台封面图。',
        mediaType: 'image',
        goal: 'traffic',
        supportedRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
        cost: 1,
        prompt: '你是小红书、大众点评和抖音本地生活封面设计师，请生成平台封面图方案。优先考虑移动端缩略图点击率，标题醒目、主体明确、远看可读，画面干净有记忆点。',
    },
];
let FactoryService = class FactoryService {
    constructor(templateRepository, posterRepository, draftRepository, merchantRepository, tenantRepository, aiService) {
        this.templateRepository = templateRepository;
        this.posterRepository = posterRepository;
        this.draftRepository = draftRepository;
        this.merchantRepository = merchantRepository;
        this.tenantRepository = tenantRepository;
        this.aiService = aiService;
    }
    async getFactoryModules() {
        return FACTORY_MODULES.map(({ prompt, ...item }) => item);
    }
    async createFactoryGeneration(data) {
        const moduleConfig = FACTORY_MODULES.find(item => item.key === data.module_key);
        if (!moduleConfig) {
            throw new common_1.BadRequestException('宣传功能不存在');
        }
        const merchant = await this.merchantRepository.findOne({
            where: { merchantId: data.merchant_id, tenantId: data.tenantId },
        });
        if (!merchant) {
            throw new common_1.NotFoundException('商家不存在');
        }
        const tenant = await this.tenantRepository.findOne({ where: { tenantId: data.tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException('营销公司不存在');
        }
        if (tenant.balance < moduleConfig.cost) {
            throw new common_1.BadRequestException('营销公司额度不足', '4001');
        }
        tenant.balance -= moduleConfig.cost;
        tenant.usedQuota += moduleConfig.cost;
        await this.tenantRepository.save(tenant);
        const posterId = (0, uuid_1.v4)();
        const poster = this.posterRepository.create({
            posterId,
            templateId: null,
            merchantId: data.merchant_id,
            tenantId: data.tenantId,
            status: 'generating',
            customizations: {
                module_key: data.module_key,
                module_name: moduleConfig.name,
                user_prompt: data.prompt,
                ratio: data.ratio,
                style: data.style,
                reference_images: data.reference_images || [],
                cost: moduleConfig.cost,
                started_at: new Date().toISOString(),
            },
        });
        await this.posterRepository.save(poster);
        setTimeout(() => {
            void this.runFactoryGeneration(posterId);
        }, 100);
        return {
            id: posterId,
            status: 'generating',
            cost: moduleConfig.cost,
            message: '生成任务已提交，完成后会自动更新结果',
        };
    }
    async getFactoryGeneration(id, tenantId) {
        const poster = await this.posterRepository.findOne({ where: { posterId: id, tenantId } });
        if (!poster) {
            throw new common_1.NotFoundException('生成任务不存在');
        }
        return this.formatFactoryPoster(poster);
    }
    async getFactoryHistory(params) {
        const { tenantId, module_key, merchant_id, page = 1, page_size = 12 } = params;
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
        const safePageSize = Math.min(pageSizeNum || 12, 50);
        const query = this.posterRepository.createQueryBuilder('p')
            .where('p.tenantId = :tenantId', { tenantId });
        if (merchant_id) {
            query.andWhere('p.merchantId = :merchant_id', { merchant_id });
        }
        if (module_key) {
            query.andWhere("json_extract(p.customizations, '$.module_key') = :module_key", { module_key });
        }
        query.orderBy('p.createdAt', 'DESC');
        query.skip((pageNum - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        return {
            list: list.map(item => this.formatFactoryPoster(item)),
            total,
        };
    }
    async getTemplates(params) {
        const { category, scene, page = 1, page_size = 20 } = params;
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
        const safePageSize = Math.min(pageSizeNum || 20, 100);
        const query = this.templateRepository.createQueryBuilder('t')
            .where('t.isActive = :isActive', { isActive: true });
        if (category) {
            query.andWhere('t.category = :category', { category });
        }
        if (scene) {
            query.andWhere('t.scene = :scene', { scene });
        }
        query.orderBy('t.createdAt', 'DESC');
        query.skip((pageNum - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        return {
            list: list.map(t => ({
                id: t.id,
                name: t.name,
                category: t.category,
                scene: t.scene,
                thumbnail_url: t.thumbnailUrl,
                template_url: t.templateUrl,
            })),
            total,
        };
    }
    async createPoster(data) {
        const { template_id, customizations, merchant_id, tenantId } = data;
        const template = await this.templateRepository.findOne({ where: { id: template_id } });
        if (!template) {
            throw new common_1.NotFoundException('模板不存在');
        }
        const merchant = await this.merchantRepository.findOne({ where: { merchantId: merchant_id } });
        if (!merchant) {
            throw new common_1.NotFoundException('商家不存在');
        }
        const posterId = (0, uuid_1.v4)();
        const poster = this.posterRepository.create({
            posterId,
            templateId: template_id,
            merchantId: merchant_id,
            tenantId,
            customizations,
            status: 'generating',
        });
        await this.posterRepository.save(poster);
        const imageUrl = await this.generatePosterImage(template, customizations, merchant);
        poster.status = 'completed';
        poster.imageUrl = imageUrl;
        await this.posterRepository.save(poster);
        return {
            id: posterId,
            image_url: imageUrl,
        };
    }
    async saveDraft(data) {
        const { type, content, merchant_id, tenantId, template_id } = data;
        const draftId = (0, uuid_1.v4)();
        const draft = this.draftRepository.create({
            draftId,
            type,
            content,
            merchantId: merchant_id,
            tenantId,
            templateId: template_id,
        });
        await this.draftRepository.save(draft);
        return {
            id: draftId,
        };
    }
    async getDrafts(params) {
        const { tenantId, type, merchant_id, page = 1, page_size = 20 } = params;
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
        const safePageSize = Math.min(pageSizeNum || 20, 100);
        const query = this.draftRepository.createQueryBuilder('d')
            .where('d.tenantId = :tenantId', { tenantId });
        if (type) {
            query.andWhere('d.type = :type', { type });
        }
        if (merchant_id) {
            query.andWhere('d.merchantId = :merchant_id', { merchant_id });
        }
        query.orderBy('d.updatedAt', 'DESC');
        query.skip((pageNum - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        const merchantIds = [...new Set(list.map(d => d.merchantId))];
        const merchants = merchantIds.length > 0 ? await this.merchantRepository
            .createQueryBuilder('m')
            .select(['m.merchantId', 'm.name'])
            .where('m.merchantId IN (:...ids)', { ids: merchantIds })
            .getRawMany() : [];
        const merchantMap = new Map(merchants.map(m => [m.merchantId, m.name]));
        return {
            list: list.map(d => ({
                id: d.draftId,
                type: d.type,
                merchant_id: d.merchantId,
                merchant_name: merchantMap.get(d.merchantId) || '',
                content: d.content,
                template_id: d.templateId,
                updated_at: d.updatedAt,
            })),
            total,
        };
    }
    async getDraft(draftId, tenantId) {
        const draft = await this.draftRepository.findOne({
            where: { draftId, tenantId },
        });
        if (!draft) {
            throw new common_1.NotFoundException('草稿不存在');
        }
        return {
            id: draft.draftId,
            type: draft.type,
            content: draft.content,
            merchant_id: draft.merchantId,
            template_id: draft.templateId,
            created_at: draft.createdAt,
            updated_at: draft.updatedAt,
        };
    }
    async updateDraft(draftId, tenantId, data) {
        const draft = await this.draftRepository.findOne({
            where: { draftId, tenantId },
        });
        if (!draft) {
            throw new common_1.NotFoundException('草稿不存在');
        }
        if (data.content) {
            draft.content = data.content;
        }
        if (data.template_id) {
            draft.templateId = data.template_id;
        }
        await this.draftRepository.save(draft);
        return { message: '更新成功' };
    }
    async deleteDraft(draftId, tenantId) {
        const draft = await this.draftRepository.findOne({
            where: { draftId, tenantId },
        });
        if (!draft) {
            throw new common_1.NotFoundException('草稿不存在');
        }
        await this.draftRepository.remove(draft);
        return { message: '删除成功' };
    }
    async batchDistribute(data) {
        const { poster_id, merchant_ids, tenantId } = data;
        const poster = await this.posterRepository.findOne({
            where: { posterId: poster_id, tenantId },
        });
        if (!poster) {
            throw new common_1.NotFoundException('海报不存在');
        }
        const results = merchant_ids.map(merchantId => ({
            merchant_id: merchantId,
            status: 'pending',
        }));
        return {
            total: merchant_ids.length,
            results,
        };
    }
    async generatePosterImage(template, customizations, merchant) {
        return `https://via.placeholder.com/${template.config?.width || 400}x${template.config?.height || 600}?text=${encodeURIComponent(merchant.name)}`;
    }
    async runFactoryGeneration(posterId) {
        const poster = await this.posterRepository.findOne({ where: { posterId } });
        if (!poster)
            return;
        try {
            const merchant = await this.merchantRepository.findOne({
                where: { merchantId: poster.merchantId, tenantId: poster.tenantId },
            });
            if (!merchant) {
                throw new Error('商家不存在');
            }
            const moduleConfig = FACTORY_MODULES.find(item => item.key === poster.customizations?.module_key);
            if (!moduleConfig) {
                throw new Error('宣传功能不存在');
            }
            const prompt = this.buildFactoryPrompt(moduleConfig, merchant, poster.customizations);
            const aiText = await this.aiService.generate(prompt);
            const imagePrompt = this.buildImagePrompt(moduleConfig, merchant, poster.customizations, aiText);
            poster.customizations = {
                ...poster.customizations,
                ai_text: aiText,
                final_prompt: prompt,
                image_prompt: imagePrompt,
            };
            await this.posterRepository.save(poster);
            const generatedImage = await this.aiService.generateImage(imagePrompt, this.getImageSize(poster.customizations?.ratio || '1:1'), this.getFirstReferenceImage(poster.customizations?.reference_images || []));
            const imageUrl = await this.normalizeImageToBase64(generatedImage);
            poster.status = 'completed';
            poster.imageUrl = imageUrl;
            poster.customizations = {
                ...poster.customizations,
                completed_at: new Date().toISOString(),
            };
            await this.posterRepository.save(poster);
        }
        catch (error) {
            console.error('宣传工厂生成失败:', error);
            await this.refundTenantQuotaIfNeeded(poster);
            poster.status = 'failed';
            poster.customizations = {
                ...poster.customizations,
                error_message: error?.message || '生成失败',
                failed_at: new Date().toISOString(),
            };
            await this.posterRepository.save(poster);
        }
    }
    async refundTenantQuotaIfNeeded(poster) {
        if (poster.customizations?.refunded_at)
            return;
        const cost = Number(poster.customizations?.cost || 0);
        if (cost <= 0)
            return;
        const tenant = await this.tenantRepository.findOne({ where: { tenantId: poster.tenantId } });
        if (!tenant)
            return;
        tenant.balance += cost;
        tenant.usedQuota = Math.max(0, tenant.usedQuota - cost);
        await this.tenantRepository.save(tenant);
        poster.customizations = {
            ...poster.customizations,
            refunded_at: new Date().toISOString(),
            refunded_amount: cost,
        };
    }
    buildFactoryPrompt(moduleConfig, merchant, options) {
        return [
            '你是一个服务本地生活商家的智能宣传物料设计助手。',
            '',
            '【功能模块提示词】',
            moduleConfig.prompt,
            '',
            '【商家信息】',
            `商家名：${merchant.name}`,
            `商家品类：${merchant.category || '未提供'}`,
            `特色宣传点：${Array.isArray(merchant.features) ? merchant.features.join('、') : '未提供'}`,
            '',
            '【用户填写文案与要求】',
            options?.user_prompt || '无',
            '',
            '【生成参数】',
            `图片比例：${options?.ratio || '1:1'}`,
            `视觉风格：${options?.style || '简约高级'}`,
            `参考图数量：${options?.reference_images?.length || 0}`,
            '',
            '【输出要求】',
            '只输出中文正文，不要输出 Markdown。',
            '画面中的主标题、副标题、按钮文案和其他可见文字，必须严格依据用户填写的文案与要求生成；用户没有填写的产品名、活动名、价格、地址不要自行添加。',
            '商家信息只用于识别所属商家，不要把商家产品列表或系统推断的产品卖点自动写进画面文案。',
            '输出内容包含：主标题、副标题、核心卖点、画面构图、色彩建议、按钮/行动号召、适合图片生成模型使用的完整画面描述。',
            '不要虚构未提供的价格、地址、资质和极限承诺。',
            '整体符合商家端宣传物料，简洁、清晰、有转化感。',
        ].join('\n');
    }
    buildImagePrompt(moduleConfig, merchant, options, aiText) {
        return [
            `为商家“${merchant.name}”生成一张${moduleConfig.name}宣传图。`,
            `画面风格：${options?.style || '简约高级'}。`,
            `画面比例：${options?.ratio || '方图'}。`,
            `用户要求：${options?.user_prompt || '无'}。`,
            `文案与构图参考：${aiText}`.slice(0, 1400),
            '要求：中文画面，不要出现乱码，不要出现英文占位字母；所有可见文案必须严格按照用户填写的文案与要求，不要自行添加商家产品名、活动名、价格、地址、资质和极限承诺；排版简洁清晰，适合本地生活商家使用。',
        ].join('\n');
    }
    getImageSize(ratio) {
        const map = {
            '1:1': '1x1',
            '3:4': '3x4',
            '4:3': '4x3',
            '9:16': '9x16',
            '16:9': '16x9',
        };
        return map[ratio] || map['1:1'];
    }
    getFirstReferenceImage(images) {
        return Array.isArray(images) ? images.find(Boolean) : undefined;
    }
    async normalizeImageToBase64(image) {
        if (!image)
            return '';
        if (image.startsWith('data:image/'))
            return image;
        if (/^[A-Za-z0-9+/=]+$/.test(image) && image.length > 1000) {
            return `data:image/png;base64,${image}`;
        }
        try {
            const response = await fetch(image);
            if (!response.ok) {
                throw new Error(`图片下载失败：${response.status}`);
            }
            const contentType = response.headers.get('content-type') || 'image/png';
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            return `data:${contentType};base64,${base64}`;
        }
        catch (error) {
            console.error('图片转存 base64 失败:', error);
            return image;
        }
    }
    formatFactoryPoster(poster) {
        return {
            id: poster.posterId,
            merchant_id: poster.merchantId,
            status: poster.status,
            image_url: poster.imageUrl,
            module_key: poster.customizations?.module_key,
            module_name: poster.customizations?.module_name,
            prompt: poster.customizations?.user_prompt,
            ratio: poster.customizations?.ratio,
            style: poster.customizations?.style,
            reference_images: poster.customizations?.reference_images || [],
            ai_text: poster.customizations?.ai_text || '',
            error_message: poster.customizations?.error_message || '',
            created_at: poster.createdAt,
        };
    }
};
exports.FactoryService = FactoryService;
exports.FactoryService = FactoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(poster_template_entity_1.PosterTemplate)),
    __param(1, (0, typeorm_1.InjectRepository)(poster_entity_1.Poster)),
    __param(2, (0, typeorm_1.InjectRepository)(draft_entity_1.Draft)),
    __param(3, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __param(4, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_service_1.AiService])
], FactoryService);
//# sourceMappingURL=factory.service.js.map