import { Repository } from 'typeorm';
import { Merchant } from '../merchant/merchant.entity';
import { Generation } from '../generator/generation.entity';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { SensitiveWord } from '../admin/sensitive-word.entity';
import { AiService } from '../ai/ai.service';
export declare class H5Service {
    private merchantRepository;
    private generationRepository;
    private analyticsRepository;
    private sensitiveWordRepository;
    private aiService;
    constructor(merchantRepository: Repository<Merchant>, generationRepository: Repository<Generation>, analyticsRepository: Repository<AnalyticsLog>, sensitiveWordRepository: Repository<SensitiveWord>, aiService: AiService);
    getMerchantConfig(merchantId: string): Promise<{
        merchant_id: string;
        name: string;
        logo: string;
        incentive: string;
        jump_targets: any;
        dy_url: any;
        wx_qr: any;
    }>;
    generateContent(merchantId: string, type: string): Promise<{
        trace_id: string;
        content: {
            text: string;
            images: {
                url: string;
                width: number;
                height: number;
            }[];
        };
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
    private buildPrompt;
    private callAI;
    private containsSensitiveWords;
    private mockImages;
}
