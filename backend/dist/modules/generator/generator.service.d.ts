import { Repository } from 'typeorm';
import { Generation } from './generation.entity';
import { Merchant } from '../merchant/merchant.entity';
import { MerchantImage } from '../warehouse/merchant-image.entity';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { AiService } from '../ai/ai.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
export declare class GeneratorService {
    private generationRepository;
    private merchantRepository;
    private imageRepository;
    private analyticsRepository;
    private aiService;
    private promptBuilder;
    constructor(generationRepository: Repository<Generation>, merchantRepository: Repository<Merchant>, imageRepository: Repository<MerchantImage>, analyticsRepository: Repository<AnalyticsLog>, aiService: AiService, promptBuilder: PromptBuilderService);
    generate(tenantId: string, merchantId: string, type: string, options: any): Promise<{
        trace_id: string;
        content: {
            text: any;
            images: any[];
        };
        duration: number;
    }>;
    previewReview(tenantId: string, merchantId: string, options?: any): Promise<{
        trace_id: string;
        content: {
            text: string;
        };
        duration: number;
    }>;
    private callAIService;
    private matchImages;
    getGenerations(tenantId: string, merchantId: string, params: any): Promise<{
        list: Generation[];
        total: number;
    }>;
    feedback(generationId: number, data: any): Promise<{
        message: string;
    }>;
}
