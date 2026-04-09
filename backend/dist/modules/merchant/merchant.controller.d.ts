import { MerchantService } from './merchant.service';
export declare class MerchantController {
    private merchantService;
    constructor(merchantService: MerchantService);
    list(req: any, query: any): Promise<{
        code: number;
        data: {
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
        };
    }>;
    detail(id: string): Promise<{
        code: number;
        data: {
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
        };
    }>;
    create(req: any, body: any): Promise<{
        code: number;
        data: {
            id: string;
        };
    }>;
    update(id: string, body: any): Promise<{
        message: string;
        code: number;
    }>;
    delete(id: string): Promise<{
        message: string;
        code: number;
    }>;
    transfer(id: string, body: {
        target_company_id: string;
    }): Promise<{
        message: string;
        code: number;
    }>;
    copy(id: string): Promise<{
        code: number;
        data: {
            id: string;
        };
    }>;
    sort(body: {
        sorts: {
            id: string;
            sort_index: number;
        }[];
    }): Promise<{
        message: string;
        code: number;
    }>;
    balance(id: string): Promise<{
        code: number;
        data: {
            balance: number;
            can_generate: boolean;
        };
    }>;
    generations(id: string, query: any): Promise<{
        code: number;
        data: {
            list: any[];
            total: number;
        };
    }>;
    generateQrcode(id: string, body: {
        shape?: string;
        ratio?: string;
        show_logo?: boolean;
    }): Promise<{
        code: number;
        message: string;
        data?: undefined;
    } | {
        code: number;
        data: {
            qr_image: any;
            jump_url: string;
        };
        message?: undefined;
    }>;
}
