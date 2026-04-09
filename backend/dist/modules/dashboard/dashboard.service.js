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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const analytics_log_entity_1 = require("../analytics/analytics-log.entity");
const generation_entity_1 = require("../generator/generation.entity");
const merchant_entity_1 = require("../merchant/merchant.entity");
const tenant_entity_1 = require("../auth/tenant.entity");
let DashboardService = class DashboardService {
    constructor(analyticsRepository, generationRepository, merchantRepository, tenantRepository) {
        this.analyticsRepository = analyticsRepository;
        this.generationRepository = generationRepository;
        this.merchantRepository = merchantRepository;
        this.tenantRepository = tenantRepository;
    }
    async getMerchantDashboard(merchantId, params) {
        const { start_date, end_date } = params;
        const dateRange = this.buildDateRange(start_date, end_date);
        const stats = await this.analyticsRepository
            .createQueryBuilder('log')
            .select('COUNT(*)', 'total_pv')
            .addSelect('COUNT(DISTINCT log.device_fingerprint)', 'total_uv')
            .addSelect('SUM(CASE WHEN log.event_type = :gen THEN 1 ELSE 0 END)', 'generation_count')
            .addSelect('SUM(CASE WHEN log.event_type = :jump THEN 1 ELSE 0 END)', 'click_jump_count')
            .where('log.merchant_id = :merchantId', { merchantId })
            .andWhere('log.created_at BETWEEN :start AND :end')
            .setParameters({ gen: 'gen', jump: 'jump', start: dateRange.start, end: dateRange.end })
            .getRawOne();
        const totalPv = parseInt(stats.total_pv) || 0;
        const totalUv = parseInt(stats.total_uv) || 0;
        const generationCount = parseInt(stats.generation_count) || 0;
        const clickJumpCount = parseInt(stats.click_jump_count) || 0;
        const dailyTrendRaw = await this.analyticsRepository
            .createQueryBuilder('log')
            .select('DATE(log.created_at)', 'date')
            .addSelect('COUNT(*)', 'pv')
            .addSelect('COUNT(DISTINCT log.device_fingerprint)', 'uv')
            .addSelect('SUM(CASE WHEN log.event_type = :gen THEN 1 ELSE 0 END)', 'gen')
            .addSelect('SUM(CASE WHEN log.event_type = :jump THEN 1 ELSE 0 END)', 'jump')
            .where('log.merchant_id = :merchantId', { merchantId })
            .andWhere('log.created_at BETWEEN :start AND :end')
            .groupBy('DATE(log.created_at)')
            .orderBy('date', 'ASC')
            .setParameters({ gen: 'gen', jump: 'jump', start: dateRange.start, end: dateRange.end })
            .getRawMany();
        const dailyTrend = dailyTrendRaw.map(row => ({
            date: row.date,
            generation: parseInt(row.gen) || 0,
            uv: parseInt(row.uv) || 0,
            jump: parseInt(row.jump) || 0,
        }));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayActive = await this.analyticsRepository
            .createQueryBuilder('log')
            .select('COUNT(DISTINCT log.device_fingerprint)', 'count')
            .where('log.merchant_id = :merchantId', { merchantId })
            .andWhere('log.created_at BETWEEN :today AND :tomorrow')
            .setParameters({ today, tomorrow })
            .getRawOne();
        const dailyActive = parseInt(todayActive?.count) || 0;
        const conversionRate = totalUv > 0 ? parseFloat(((clickJumpCount / totalUv) * 100).toFixed(2)) : 0;
        const xhsStats = { likes: 0, comments: 0, favorites: 0, shares: 0 };
        return {
            generation_count: generationCount,
            daily_active: dailyActive,
            click_jump_count: clickJumpCount,
            conversion_rate: conversionRate,
            xhs_stats: xhsStats,
            daily_trend: dailyTrend,
        };
    }
    async getAdminDashboard() {
        const totalCompanies = await this.tenantRepository.count();
        const totalMerchants = await this.merchantRepository.count();
        const totalGenerations = await this.generationRepository.count();
        const balanceStats = await this.merchantRepository
            .createQueryBuilder('m')
            .select('SUM(m.balance)', 'total')
            .getRawOne();
        const totalBalance = parseInt(balanceStats?.total) || 0;
        const companyRankingRaw = await this.merchantRepository
            .createQueryBuilder('m')
            .select('m.tenant_id', 'company_id')
            .addSelect('COUNT(m.merchant_id)', 'merchants')
            .addSelect('SUM(m.balance)', 'balance')
            .groupBy('m.tenant_id')
            .orderBy('merchants', 'DESC')
            .limit(10)
            .getRawMany();
        const tenantIds = companyRankingRaw.map(r => r.company_id);
        const tenants = await this.tenantRepository
            .createQueryBuilder('t')
            .select(['t.tenant_id', 't.name'])
            .where('t.tenant_id IN (:...ids)', { ids: tenantIds })
            .getRawMany();
        const tenantMap = new Map(tenants.map(t => [t.tenant_id, t.name]));
        const companyRanking = companyRankingRaw.map(r => ({
            company_id: r.company_id,
            company_name: tenantMap.get(r.company_id) || '未知',
            merchants: parseInt(r.merchants) || 0,
            balance: parseInt(r.balance) || 0,
        }));
        const topMerchantsRaw = await this.generationRepository
            .createQueryBuilder('g')
            .select('g.merchant_id', 'merchant_id')
            .addSelect('COUNT(g.id)', 'generations')
            .groupBy('g.merchant_id')
            .orderBy('generations', 'DESC')
            .limit(10)
            .getRawMany();
        const merchantIds = topMerchantsRaw.map(r => r.merchant_id);
        const merchants = await this.merchantRepository
            .createQueryBuilder('m')
            .select(['m.merchant_id', 'm.name'])
            .where('m.merchant_id IN (:...ids)', { ids: merchantIds })
            .getRawMany();
        const merchantMap = new Map(merchants.map(m => [m.merchant_id, m.name]));
        const topMerchants = topMerchantsRaw.map(r => ({
            merchant_id: r.merchant_id,
            name: merchantMap.get(r.merchant_id) || '未知',
            generations: parseInt(r.generations) || 0,
        }));
        const financial = {
            total_revenue: 0,
            monthly_revenue: 0,
        };
        return {
            total_companies: totalCompanies,
            total_merchants: totalMerchants,
            total_generations: totalGenerations,
            total_balance: totalBalance,
            company_ranking: companyRanking,
            top_merchants: topMerchants,
            financial,
        };
    }
    buildDateRange(startDate, endDate) {
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);
        const start = startDate ? new Date(startDate) : new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return { start, end };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(analytics_log_entity_1.AnalyticsLog)),
    __param(1, (0, typeorm_1.InjectRepository)(generation_entity_1.Generation)),
    __param(2, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __param(3, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map