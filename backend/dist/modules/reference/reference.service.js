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
exports.ReferenceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const reference_entity_1 = require("./reference.entity");
let ReferenceService = class ReferenceService {
    constructor(referenceRepository) {
        this.referenceRepository = referenceRepository;
    }
    async createNote(data) {
        const refId = (0, uuid_1.v4)();
        const reference = this.referenceRepository.create({
            refId,
            type: 'note',
            content: data.content,
            style: data.style || 'friendly',
            source: data.source,
            tags: data.tags,
            tenantId: data.tenantId,
        });
        await this.referenceRepository.save(reference);
        return {
            id: refId,
            type: 'note',
            content: reference.content,
            style: reference.style,
            source: reference.source,
            tags: reference.tags,
            created_at: reference.createdAt,
        };
    }
    async getNotes(params) {
        const { tenantId, style, page = 1, page_size = 20 } = params;
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
        const safePageSize = Math.min(pageSizeNum || 20, 100);
        const query = this.referenceRepository.createQueryBuilder('r')
            .where('r.tenantId = :tenantId', { tenantId })
            .andWhere('r.type = :type', { type: 'note' });
        if (style) {
            query.andWhere('r.style = :style', { style });
        }
        query.orderBy('r.createdAt', 'DESC');
        query.skip((pageNum - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        return {
            list: list.map(r => ({
                id: r.refId,
                content: r.content,
                style: r.style,
                source: r.source,
                tags: r.tags,
                created_at: r.createdAt,
            })),
            total,
        };
    }
    async createReview(data) {
        const refId = (0, uuid_1.v4)();
        const reference = this.referenceRepository.create({
            refId,
            type: 'review',
            content: data.content,
            style: data.style || 'professional',
            source: data.source,
            tenantId: data.tenantId,
        });
        await this.referenceRepository.save(reference);
        return {
            id: refId,
            type: 'review',
            content: reference.content,
            style: reference.style,
            source: reference.source,
            created_at: reference.createdAt,
        };
    }
    async getReviews(params) {
        const { tenantId, style, page = 1, page_size = 20 } = params;
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
        const safePageSize = Math.min(pageSizeNum || 20, 100);
        const query = this.referenceRepository.createQueryBuilder('r')
            .where('r.tenantId = :tenantId', { tenantId })
            .andWhere('r.type = :type', { type: 'review' });
        if (style) {
            query.andWhere('r.style = :style', { style });
        }
        query.orderBy('r.createdAt', 'DESC');
        query.skip((pageNum - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        return {
            list: list.map(r => ({
                id: r.refId,
                content: r.content,
                style: r.style,
                source: r.source,
                created_at: r.createdAt,
            })),
            total,
        };
    }
};
exports.ReferenceService = ReferenceService;
exports.ReferenceService = ReferenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reference_entity_1.Reference)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReferenceService);
//# sourceMappingURL=reference.service.js.map