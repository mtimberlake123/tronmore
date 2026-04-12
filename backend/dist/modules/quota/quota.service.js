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
exports.QuotaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const quota_log_entity_1 = require("./quota-log.entity");
const merchant_entity_1 = require("../merchant/merchant.entity");
const tenant_entity_1 = require("../auth/tenant.entity");
const uuid_1 = require("uuid");
let QuotaService = class QuotaService {
    constructor(quotaLogRepository, merchantRepository, tenantRepository) {
        this.quotaLogRepository = quotaLogRepository;
        this.merchantRepository = merchantRepository;
        this.tenantRepository = tenantRepository;
    }
    async allocate(merchantId, amount, operatorId) {
        const merchant = await this.merchantRepository.findOne({
            where: { merchantId },
        });
        if (!merchant) {
            throw new common_1.BadRequestException('商家不存在');
        }
        const tenant = await this.tenantRepository.findOne({
            where: { tenantId: merchant.tenantId },
        });
        if (!tenant) {
            throw new common_1.BadRequestException('营销公司不存在');
        }
        if (tenant.balance < amount) {
            throw new common_1.BadRequestException('营销公司额度不足');
        }
        const transactionId = (0, uuid_1.v4)();
        const beforeMerchant = merchant.balance;
        const beforeTenant = tenant.balance;
        tenant.balance -= amount;
        tenant.usedQuota += amount;
        await this.tenantRepository.save(tenant);
        merchant.balance += amount;
        await this.merchantRepository.save(merchant);
        const tenantLog = this.quotaLogRepository.create({
            tenantId: merchant.tenantId,
            merchantId,
            type: 'allocate',
            amount: -amount,
            balance: tenant.balance,
            remark: `分配给商家 ${merchant.name}`,
            operatorId,
        });
        await this.quotaLogRepository.save(tenantLog);
        const merchantLog = this.quotaLogRepository.create({
            tenantId: merchant.tenantId,
            merchantId,
            type: 'allocate',
            amount: amount,
            balance: merchant.balance,
            remark: `由营销公司 ${tenant.name} 分配`,
        });
        await this.quotaLogRepository.save(merchantLog);
        return {
            merchant_id: merchantId,
            before: beforeMerchant,
            after: merchant.balance,
            transaction_id: transactionId,
        };
    }
    async getLogs(params) {
        const { merchant_id, type, page = 1, page_size = 20, tenantId } = params;
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
        const safePageSize = Math.min(pageSizeNum || 20, 100);
        const query = this.quotaLogRepository.createQueryBuilder('log')
            .where('log.tenantId = :tenantId', { tenantId });
        if (merchant_id) {
            query.andWhere('log.merchantId = :merchant_id', { merchant_id });
        }
        if (type) {
            query.andWhere('log.type = :type', { type });
        }
        query.orderBy('log.createdAt', 'DESC');
        query.skip((pageNum - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        const merchantIds = [...new Set(list.filter(l => l.merchantId).map(l => l.merchantId))];
        const merchants = merchantIds.length > 0 ? await this.merchantRepository
            .createQueryBuilder('m')
            .select(['m.merchantId', 'm.name'])
            .where('m.merchantId IN (:...ids)', { ids: merchantIds })
            .getRawMany() : [];
        const merchantMap = new Map(merchants.map(m => [m.merchantId, m.name]));
        const formattedList = list.map(log => ({
            id: log.id.toString(),
            merchant_id: log.merchantId,
            merchant_name: merchantMap.get(log.merchantId) || '',
            type: log.type,
            amount: log.amount,
            balance: log.balance,
            created_at: log.createdAt,
        }));
        return {
            list: formattedList,
            total,
        };
    }
    async getBalance(user) {
        const tenant = await this.tenantRepository.findOne({
            where: { tenantId: user.tenantId },
        });
        if (!tenant) {
            throw new common_1.BadRequestException('账号不存在');
        }
        return {
            balance: tenant.balance,
            total_quota: tenant.totalQuota,
            used_quota: tenant.usedQuota,
        };
    }
    async consume(merchantId, amount = 1) {
        const merchant = await this.merchantRepository.findOne({
            where: { merchantId },
        });
        if (!merchant) {
            throw new common_1.BadRequestException('商家不存在');
        }
        if (merchant.balance < amount) {
            throw new common_1.BadRequestException('商家额度不足');
        }
        const before = merchant.balance;
        merchant.balance -= amount;
        await this.merchantRepository.save(merchant);
        const log = this.quotaLogRepository.create({
            tenantId: merchant.tenantId,
            merchantId,
            type: 'consume',
            amount: -amount,
            balance: merchant.balance,
            remark: 'AI生成内容消耗',
        });
        await this.quotaLogRepository.save(log);
        return { before, after: merchant.balance };
    }
};
exports.QuotaService = QuotaService;
exports.QuotaService = QuotaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quota_log_entity_1.QuotaLog)),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], QuotaService);
//# sourceMappingURL=quota.service.js.map