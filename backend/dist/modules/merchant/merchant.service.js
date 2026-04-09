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
exports.MerchantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const merchant_entity_1 = require("./merchant.entity");
let MerchantService = class MerchantService {
    constructor(merchantRepository) {
        this.merchantRepository = merchantRepository;
    }
    async findAll(tenantId, params) {
        const { page = 1, page_size = 20, sort_by = 'created_at', order = 'desc' } = params;
        const query = this.merchantRepository.createQueryBuilder('m')
            .where('m.tenantId = :tenantId', { tenantId });
        const sortFieldMap = {
            created: 'createdAt',
            created_at: 'createdAt',
            daily_active: 'createdAt',
            balance: 'balance',
            updated_at: 'updatedAt',
        };
        const sortField = sortFieldMap[sort_by] || 'createdAt';
        query.orderBy(`m.${sortField}`, order.toUpperCase());
        query.skip((page - 1) * page_size).take(page_size);
        const [list, total] = await query.getManyAndCount();
        return {
            list: list.map(m => this.formatMerchant(m)),
            total,
            page: Number(page),
            page_size: Number(page_size),
        };
    }
    async findOne(merchantId) {
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.NotFoundException('商家不存在');
        }
        return this.formatMerchant(merchant);
    }
    async create(tenantId, data) {
        const merchant = new merchant_entity_1.Merchant();
        merchant.merchantId = (0, uuid_1.v4)();
        merchant.tenantId = tenantId;
        Object.assign(merchant, data);
        await this.merchantRepository.save(merchant);
        return { id: merchant.merchantId };
    }
    async update(merchantId, data) {
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.NotFoundException('商家不存在');
        }
        const { dy_url, wx_url, address, review_image_count, note_image_count, product_image_count, ...otherData } = data;
        if (dy_url !== undefined || wx_url !== undefined || address !== undefined) {
            merchant.location = {
                ...(merchant.location || {}),
                dy_url: dy_url || merchant.location?.dy_url || '',
                wx_url: wx_url || merchant.location?.wx_url || '',
                address: address || merchant.location?.address || '',
            };
        }
        if (review_image_count !== undefined)
            merchant.reviewImageCount = review_image_count;
        if (note_image_count !== undefined)
            merchant.noteImageCount = note_image_count;
        if (product_image_count !== undefined)
            merchant.productImageCount = product_image_count;
        Object.assign(merchant, otherData);
        await this.merchantRepository.save(merchant);
        return { message: '更新成功' };
    }
    async delete(merchantId) {
        await this.merchantRepository.delete({ merchantId });
        return { message: '删除成功' };
    }
    async transfer(merchantId, targetTenantId) {
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.NotFoundException('商家不存在');
        }
        merchant.tenantId = targetTenantId;
        await this.merchantRepository.save(merchant);
        return { message: '迁移成功' };
    }
    async copy(merchantId) {
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.NotFoundException('商家不存在');
        }
        const newMerchant = this.merchantRepository.create({
            ...merchant,
            id: undefined,
            merchantId: (0, uuid_1.v4)(),
            name: `${merchant.name} (副本)`,
            createdAt: undefined,
            updatedAt: undefined,
        });
        await this.merchantRepository.save(newMerchant);
        return { id: newMerchant.merchantId };
    }
    async sort(sorts) {
        for (const item of sorts) {
            await this.merchantRepository.update({ merchantId: item.id }, { sortIndex: item.sort_index });
        }
        return { message: '排序成功' };
    }
    async getBalance(merchantId) {
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.NotFoundException('商家不存在');
        }
        return {
            balance: merchant.balance,
            can_generate: merchant.balance > 0,
        };
    }
    formatMerchant(m) {
        const now = new Date();
        const createdDiff = now.getTime() - new Date(m.createdAt).getTime();
        const daysRemaining = m.expireDate
            ? Math.ceil((new Date(m.expireDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : 365;
        let statusTag = 'normal';
        if (createdDiff < 24 * 60 * 60 * 1000) {
            statusTag = 'new';
        }
        else if (m.balance > 0 && m.balance < 10) {
            statusTag = 'low_balance';
        }
        return {
            id: m.merchantId,
            logo: m.logo,
            name: m.name,
            products: m.products || [],
            features: m.features || [],
            ai_prompt_ext: m.aiPromptExt || '',
            note_prompt_ext: m.notePromptExt || '',
            note_topic: m.noteTopic || '',
            note_copy: m.noteCopy || '',
            review_image_count: m.reviewImageCount,
            note_image_count: m.noteImageCount,
            product_image_count: m.productImageCount,
            dy_url: m.location?.dy_url || '',
            wx_url: m.location?.wx_url || '',
            address: m.location?.address || '',
            expire_date: m.expireDate,
            days_remaining: daysRemaining,
            balance: m.balance,
            balance_percent: m.balance > 0 ? Math.min(100, m.balance / 10) : 0,
            storage_used: m.storageUsed,
            storage_limit: m.storageLimit,
            status_tag: statusTag,
            created_at: m.createdAt,
        };
    }
};
exports.MerchantService = MerchantService;
exports.MerchantService = MerchantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MerchantService);
//# sourceMappingURL=merchant.service.js.map