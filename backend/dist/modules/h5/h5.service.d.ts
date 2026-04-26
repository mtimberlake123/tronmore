import { Repository } from 'typeorm';
import { Merchant } from '../merchant/merchant.entity';
import { Generation } from '../generator/generation.entity';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { AiService } from '../ai/ai.service';
import { BuildPromptOptions, PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { MerchantImage } from '../warehouse/merchant-image.entity';
export declare class H5Service {
    private merchantRepository;
    private generationRepository;
    private analyticsRepository;
    private imageRepository;
    private aiService;
    private promptBuilder;
    constructor(merchantRepository: Repository<Merchant>, generationRepository: Repository<Generation>, analyticsRepository: Repository<AnalyticsLog>, imageRepository: Repository<MerchantImage>, aiService: AiService, promptBuilder: PromptBuilderService);
    getMerchantConfig(merchantId: string): Promise<{
        merchant_id: string;
        name: string;
        logo: string;
        cover_image: string;
        product_images: {
            url: string;
            product_tag: string;
            source: string;
        }[];
        incentive: string;
        jump_targets: any;
        dy_url: any;
        wx_qr: any;
        address: any;
    }>;
    generateContent(merchantId: string, type: string, options?: BuildPromptOptions): Promise<{
        trace_id: string;
        content: {
            text: string;
            images: {
                url: string;
                source: string;
                product_tag: string;
            }[];
        };
    }>;
    generateContentStream(merchantId: string, type: string, options?: BuildPromptOptions): AsyncGenerator<{
        event: string;
        data: any;
    }>;
    track(data: {
        event: string;
        merchant_id: string;
        qr_id?: string;
        source?: string;
        type?: string;
        trace_id?: string;
        duration?: number;
        target_platform?: string;
        client_time?: string;
    }): Promise<void>;
    publishCallback(data: {
        trace_id: string;
        merchant_id: string;
        platform: string;
        publish_url?: string;
        client_time?: string;
    }): Promise<void>;
    private findCoverImage;
    private findProductImages;
    private matchImages;
}
