import { QuotaService } from './quota.service';
export declare class QuotaController {
    private quotaService;
    constructor(quotaService: QuotaService);
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
