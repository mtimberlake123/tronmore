import { QuotaService } from './quota.service';
export declare class QuotaController {
    private quotaService;
    constructor(quotaService: QuotaService);
    getBalance(req: any): Promise<{
        code: number;
        message: string;
        data: {
            balance: number;
            total_quota: number;
            used_quota: number;
        };
        timestamp: number;
        success: boolean;
    }>;
    getTenantBalance(req: any): Promise<{
        code: number;
        data: {
            balance: number;
            total_quota: number;
            used_quota: number;
        };
    }>;
    allocate(id: string, body: {
        amount: number;
    }): Promise<{
        merchant_id: string;
        before: number;
        after: number;
        transaction_id: string;
        code: number;
    }>;
    getLogs(query: any): Promise<{
        code: number;
        data: {
            list: {
                id: string;
                merchant_id: string;
                merchant_name: any;
                type: string;
                amount: number;
                balance: number;
                created_at: Date;
            }[];
            total: number;
        };
    }>;
}
