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
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const merchant_image_entity_1 = require("./merchant-image.entity");
let WarehouseService = class WarehouseService {
    constructor(imageRepository) {
        this.imageRepository = imageRepository;
    }
    async checkStorage(merchantId) {
        const count = await this.imageRepository.count({
            where: { merchantId, isDeleted: 0 },
        });
        return {
            used: count,
            limit: 200,
            can_upload: count < 200,
        };
    }
    async upload(merchantId, url, tab, productTag) {
        const image = this.imageRepository.create({
            merchantId,
            url,
            tab,
            productTag,
        });
        await this.imageRepository.save(image);
        return {
            id: image.id,
            url: image.url,
            tab: image.tab,
            product_tag: image.productTag,
        };
    }
    async list(merchantId, params) {
        const { tab, page = 1, page_size = 20 } = params;
        const query = this.imageRepository.createQueryBuilder('i')
            .where('i.merchantId = :merchantId', { merchantId })
            .andWhere('i.isDeleted = 0');
        if (tab) {
            query.andWhere('i.tab = :tab', { tab });
        }
        query.orderBy('i.createdAt', 'DESC');
        query.skip((page - 1) * page_size).take(page_size);
        const [list, total] = await query.getManyAndCount();
        return { list, total };
    }
    async delete(merchantId, imageId) {
        await this.imageRepository.update({ id: imageId, merchantId }, { isDeleted: 1 });
        return { message: '删除成功' };
    }
    async markAsUsed(imageIds) {
        await this.imageRepository
            .createQueryBuilder()
            .update()
            .set({ isUsed: 1, usedAt: new Date() })
            .whereInIds(imageIds)
            .execute();
        return { message: '已标记为使用' };
    }
    async batchCheck(merchantId) {
        return { issues: [] };
    }
};
exports.WarehouseService = WarehouseService;
exports.WarehouseService = WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(merchant_image_entity_1.MerchantImage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WarehouseService);
//# sourceMappingURL=warehouse.service.js.map