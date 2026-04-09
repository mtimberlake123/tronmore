import { Repository } from 'typeorm';
import { Merchant } from './merchant.entity';
export declare class MerchantService {
    private merchantRepository;
    constructor(merchantRepository: Repository<Merchant>);
    findAll(tenantId: string, params: any): Promise<{
        list: {
            id: string;
            logo: string;
            name: string;
            products: string[];
            features: string[];
            ai_prompt_ext: string;
            note_prompt_ext: string;
            note_topic: string;
            note_copy: string;
            review_image_count: number;
            note_image_count: number;
            product_image_count: number;
            dy_url: any;
            wx_url: any;
            address: any;
            expire_date: Date;
            days_remaining: number;
            balance: number;
            balance_percent: number;
            storage_used: number;
            storage_limit: number;
            status_tag: string;
            created_at: Date;
        }[];
        total: number;
        page: number;
        page_size: number;
    }>;
    findOne(merchantId: string): Promise<{
        id: string;
        logo: string;
        name: string;
        products: string[];
        features: string[];
        ai_prompt_ext: string;
        note_prompt_ext: string;
        note_topic: string;
        note_copy: string;
        review_image_count: number;
        note_image_count: number;
        product_image_count: number;
        dy_url: any;
        wx_url: any;
        address: any;
        expire_date: Date;
        days_remaining: number;
        balance: number;
        balance_percent: number;
        storage_used: number;
        storage_limit: number;
        status_tag: string;
        created_at: Date;
    }>;
    create(tenantId: string, data: any): Promise<{
        id: string;
    }>;
    update(merchantId: string, data: any): Promise<{
        message: string;
    }>;
    delete(merchantId: string): Promise<{
        message: string;
    }>;
    transfer(merchantId: string, targetTenantId: string): Promise<{
        message: string;
    }>;
    copy(merchantId: string): Promise<{
        id: string;
    }>;
    sort(sorts: {
        id: string;
        sort_index: number;
    }[]): Promise<{
        message: string;
    }>;
    getBalance(merchantId: string): Promise<{
        balance: number;
        can_generate: boolean;
    }>;
    private formatMerchant;
}
