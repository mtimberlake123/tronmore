import { Repository } from 'typeorm';
import { Generation } from './generation.entity';
import { Merchant } from '../merchant/merchant.entity';
import { MerchantImage } from '../warehouse/merchant-image.entity';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { SensitiveWord } from '../admin/sensitive-word.entity';
import { AiService } from '../ai/ai.service';
export declare class GeneratorService {
    private generationRepository;
    private merchantRepository;
    private imageRepository;
    private analyticsRepository;
    private sensitiveWordRepository;
    private aiService;
    constructor(generationRepository: Repository<Generation>, merchantRepository: Repository<Merchant>, imageRepository: Repository<MerchantImage>, analyticsRepository: Repository<AnalyticsLog>, sensitiveWordRepository: Repository<SensitiveWord>, aiService: AiService);
    generate(tenantId: string, merchantId: string, type: string, options: any): Promise<{
        trace_id: string;
        content: {
            text: any;
            images: any[];
        };
        duration: number;
    }>;
    private buildPrompt;
    private callAIService;
    private containsSensitiveWords;
    private matchImages;
    getGenerations(tenantId: string, merchantId: string, params: any): Promise<{
        list: Generation[];
        total: number;
    }>;
    feedback(generationId: number, data: any): Promise<{
        message: string;
    }>;
}
