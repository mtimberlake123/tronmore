import { Repository } from 'typeorm';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { Generation } from '../generator/generation.entity';
import { Merchant } from '../merchant/merchant.entity';
import { Tenant } from '../auth/tenant.entity';
export declare class DashboardService {
    private analyticsRepository;
    private generationRepository;
    private merchantRepository;
    private tenantRepository;
    constructor(analyticsRepository: Repository<AnalyticsLog>, generationRepository: Repository<Generation>, merchantRepository: Repository<Merchant>, tenantRepository: Repository<Tenant>);
    getMerchantDashboard(merchantId: string, params: any): Promise<{
        generation_count: number;
        daily_active: number;
        click_jump_count: number;
        conversion_rate: number;
        xhs_stats: {
            likes: number;
            comments: number;
            favorites: number;
            shares: number;
        };
        daily_trend: {
            date: any;
            generation: number;
            uv: number;
            jump: number;
        }[];
    }>;
    getAdminDashboard(): Promise<{
        total_companies: number;
        total_merchants: number;
        total_generations: number;
        total_balance: number;
        company_ranking: {
            company_id: any;
            company_name: any;
            merchants: number;
            balance: number;
        }[];
        top_merchants: {
            merchant_id: any;
            name: any;
            generations: number;
        }[];
        financial: {
            total_revenue: number;
            monthly_revenue: number;
        };
    }>;
    private buildDateRange;
}
