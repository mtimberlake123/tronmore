import { WarehouseService } from './warehouse.service';
export declare class WarehouseController {
    private warehouseService;
    constructor(warehouseService: WarehouseService);
    checkStorage(merchantId: string): Promise<{
        code: number;
        data: {
            used: number;
            limit: number;
            can_upload: boolean;
        };
    }>;
    upload(merchantId: string, body: {
        url: string;
        tab: string;
        product_tag?: string;
    }): Promise<{
        code: number;
        data: {
            id: number;
            url: string;
            tab: string;
            product_tag: string;
        };
    }>;
    list(merchantId: string, query: any): Promise<{
        code: number;
        data: {
            list: import("./merchant-image.entity").MerchantImage[];
            total: number;
        };
    }>;
    delete(merchantId: string, imageId: string): Promise<{
        message: string;
        code: number;
    }>;
    batchCheck(merchantId: string): Promise<{
        code: number;
        data: {
            issues: any[];
        };
    }>;
    settings(merchantId: string, body: any): Promise<{
        code: number;
        message: string;
    }>;
}
