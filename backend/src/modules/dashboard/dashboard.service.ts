import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { Generation } from '../generator/generation.entity';
import { Merchant } from '../merchant/merchant.entity';
import { Tenant } from '../auth/tenant.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(AnalyticsLog)
    private analyticsRepository: Repository<AnalyticsLog>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * 商家数据看板
   */
  async getMerchantDashboard(merchantId: string, params: any) {
    const { start_date, end_date } = params;

    // 日期范围
    const dateRange = this.buildDateRange(start_date, end_date);

    // 1. 获取基础统计数据
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

    // 2. 计算每日趋势
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

    // 3. 获取今日活跃（简化处理：当天UV）
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

    // 4. 计算转化率
    const conversionRate = totalUv > 0 ? parseFloat(((clickJumpCount / totalUv) * 100).toFixed(2)) : 0;

    // 5. 小红书统计（目前埋点未区分平台，待后续扩展）
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

  /**
   * 平台数据看板（系统后台）
   */
  async getAdminDashboard() {
    // 1. 统计总营销公司数
    const totalCompanies = await this.tenantRepository.count();

    // 2. 统计总商家数
    const totalMerchants = await this.merchantRepository.count();

    // 3. 统计总生成数
    const totalGenerations = await this.generationRepository.count();

    // 4. 统计总余额
    const balanceStats = await this.merchantRepository
      .createQueryBuilder('m')
      .select('SUM(m.balance)', 'total')
      .getRawOne();
    const totalBalance = parseInt(balanceStats?.total) || 0;

    // 5. 营销公司排名
    const companyRankingRaw = await this.merchantRepository
      .createQueryBuilder('m')
      .select('m.tenant_id', 'company_id')
      .addSelect('COUNT(m.merchant_id)', 'merchants')
      .addSelect('SUM(m.balance)', 'balance')
      .groupBy('m.tenant_id')
      .orderBy('merchants', 'DESC')
      .limit(10)
      .getRawMany();

    // 获取公司名称
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

    // 6. 热门商家
    const topMerchantsRaw = await this.generationRepository
      .createQueryBuilder('g')
      .select('g.merchant_id', 'merchant_id')
      .addSelect('COUNT(g.id)', 'generations')
      .groupBy('g.merchant_id')
      .orderBy('generations', 'DESC')
      .limit(10)
      .getRawMany();

    // 获取商家名称
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

    // 7. 财务统计（简化：按商家总余额估算）
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

  /**
   * 构建日期范围
   */
  private buildDateRange(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 7); // 默认近7天
    start.setHours(0, 0, 0, 0);

    return { start, end };
  }
}