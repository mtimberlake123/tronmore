import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getMerchantDashboard(id: string, query: any): Promise<{
        code: number;
        data: {
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
        };
    }>;
    getAdminDashboard(): Promise<{
        code: number;
        data: {
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
        };
    }>;
}
