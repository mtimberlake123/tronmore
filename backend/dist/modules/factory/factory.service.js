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
let FactoryService = class FactoryService {
    constructor(templateRepository, posterRepository, draftRepository, merchantRepository) {
        this.templateRepository = templateRepository;
        this.posterRepository = posterRepository;
        this.draftRepository = draftRepository;
        this.merchantRepository = merchantRepository;
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
};
exports.FactoryService = FactoryService;
exports.FactoryService = FactoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(poster_template_entity_1.PosterTemplate)),
    __param(1, (0, typeorm_1.InjectRepository)(poster_entity_1.Poster)),
    __param(2, (0, typeorm_1.InjectRepository)(draft_entity_1.Draft)),
    __param(3, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FactoryService);
//# sourceMappingURL=factory.service.js.map