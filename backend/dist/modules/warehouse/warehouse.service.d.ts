import { Repository } from 'typeorm';
import { MerchantImage } from './merchant-image.entity';
export declare class WarehouseService {
    private imageRepository;
    constructor(imageRepository: Repository<MerchantImage>);
    checkStorage(merchantId: string): Promise<{
        used: number;
        limit: number;
        can_upload: boolean;
    }>;
    upload(merchantId: string, url: string, tab: string, productTag?: string): Promise<{
        id: number;
        url: string;
        tab: string;
        product_tag: string;
    }>;
    list(merchantId: string, params: any): Promise<{
        list: MerchantImage[];
        total: number;
    }>;
    delete(merchantId: string, imageId: number): Promise<{
        message: string;
    }>;
    markAsUsed(imageIds: number[]): Promise<{
        message: string;
    }>;
    batchCheck(merchantId: string): Promise<{
        issues: any[];
    }>;
}
