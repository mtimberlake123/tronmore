import { H5Service } from './h5.service';
export declare class H5Controller {
    private h5Service;
    constructor(h5Service: H5Service);
    getMerchantConfig(merchantId: string): Promise<{
        code: number;
        data: {
            merchant_id: string;
            name: string;
            logo: string;
            incentive: string;
            jump_targets: any;
            dy_url: any;
            wx_qr: any;
        };
    }>;
    generate(body: {
        merchant_id: string;
        type: string;
    }): Promise<{
        code: number;
        data: {
            trace_id: string;
            content: {
                text: string;
                images: {
                    url: string;
                    width: number;
                    height: number;
                }[];
            };
        };
    }>;
    track(body: {
        event: string;
        merchant_id: string;
        qr_id?: string;
        source?: string;
        type?: string;
        trace_id?: string;
        duration?: number;
        target_platform?: string;
        client_time?: string;
    }): Promise<{
        code: number;
        message: string;
    }>;
    publishCallback(body: {
        trace_id: string;
        merchant_id: string;
        platform: string;
        publish_url?: string;
        client_time?: string;
    }): Promise<{
        code: number;
        message: string;
    }>;
}
