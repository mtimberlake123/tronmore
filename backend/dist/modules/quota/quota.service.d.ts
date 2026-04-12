import { Repository } from 'typeorm';
import { QuotaLog } from './quota-log.entity';
import { Merchant } from '../merchant/merchant.entity';
import { Tenant } from '../auth/tenant.entity';
export declare class QuotaService {
    private quotaLogRepository;
    private merchantRepository;
    private tenantRepository;
    constructor(quotaLogRepository: Repository<QuotaLog>, merchantRepository: Repository<Merchant>, tenantRepository: Repository<Tenant>);
    allocate(merchantId: string, amount: number, operatorId?: string): Promise<{
        merchant_id: string;
        before: number;
        after: number;
        transaction_id: string;
    }>;
    getLogs(params: {
        merchant_id?: string;
        type?: string;
        page?: number;
        page_size?: number;
        tenantId?: string;
    }): Promise<{
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
    }>;
    getBalance(user: any): Promise<{
        balance: number;
        total_quota: number;
        used_quota: number;
    }>;
    consume(merchantId: string, amount?: number): Promise<{
        before: number;
        after: number;
    }>;
}
