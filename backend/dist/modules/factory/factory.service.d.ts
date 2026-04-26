import { Repository } from 'typeorm';
import { PosterTemplate } from './poster-template.entity';
import { Poster } from './poster.entity';
import { Draft } from './draft.entity';
import { Merchant } from '../merchant/merchant.entity';
import { AiService } from '../ai/ai.service';
import { Tenant } from '../auth/tenant.entity';
export declare class FactoryService {
    private templateRepository;
    private posterRepository;
    private draftRepository;
    private merchantRepository;
    private tenantRepository;
    private aiService;
    constructor(templateRepository: Repository<PosterTemplate>, posterRepository: Repository<Poster>, draftRepository: Repository<Draft>, merchantRepository: Repository<Merchant>, tenantRepository: Repository<Tenant>, aiService: AiService);
    getFactoryModules(): Promise<{
        key: string;
        name: string;
        description: string;
        mediaType: string;
        goal: string;
        supportedRatios: string[];
        cost: number;
    }[]>;
    createFactoryGeneration(data: {
        merchant_id: string;
        module_key: string;
        prompt: string;
        ratio: string;
        style: string;
        reference_images?: string[];
        tenantId: string;
    }): Promise<{
        id: string;
        status: string;
        cost: number;
        message: string;
    }>;
    getFactoryGeneration(id: string, tenantId: string): Promise<{
        id: string;
        merchant_id: string;
        status: string;
        image_url: string;
        module_key: any;
        module_name: any;
        prompt: any;
        ratio: any;
        style: any;
        reference_images: any;
        ai_text: any;
        error_message: any;
        created_at: Date;
    }>;
    getFactoryHistory(params: {
        tenantId: string;
        module_key?: string;
        merchant_id?: string;
        page?: number;
        page_size?: number;
    }): Promise<{
        list: {
            id: string;
            merchant_id: string;
            status: string;
            image_url: string;
            module_key: any;
            module_name: any;
            prompt: any;
            ratio: any;
            style: any;
            reference_images: any;
            ai_text: any;
            error_message: any;
            created_at: Date;
        }[];
        total: number;
    }>;
    getTemplates(params: {
        category?: string;
        scene?: string;
        page?: number;
        page_size?: number;
    }): Promise<{
        list: {
            id: number;
            name: string;
            category: string;
            scene: string;
            thumbnail_url: string;
            template_url: string;
        }[];
        total: number;
    }>;
    createPoster(data: {
        template_id: number;
        customizations: {
            text?: string;
            image?: string;
            background?: string;
        };
        merchant_id: string;
        tenantId: string;
    }): Promise<{
        id: string;
        image_url: string;
    }>;
    saveDraft(data: {
        type: string;
        content: any;
        merchant_id: string;
        tenantId: string;
        template_id?: number;
    }): Promise<{
        id: string;
    }>;
    getDrafts(params: {
        tenantId: string;
        type?: string;
        merchant_id?: string;
        page?: number;
        page_size?: number;
    }): Promise<{
        list: {
            id: string;
            type: string;
            merchant_id: string;
            merchant_name: any;
            content: any;
            template_id: number;
            updated_at: Date;
        }[];
        total: number;
    }>;
    getDraft(draftId: string, tenantId: string): Promise<{
        id: string;
        type: string;
        content: any;
        merchant_id: string;
        template_id: number;
        created_at: Date;
        updated_at: Date;
    }>;
    updateDraft(draftId: string, tenantId: string, data: {
        content?: any;
        template_id?: number;
    }): Promise<{
        message: string;
    }>;
    deleteDraft(draftId: string, tenantId: string): Promise<{
        message: string;
    }>;
    batchDistribute(data: {
        poster_id: string;
        merchant_ids: string[];
        tenantId: string;
    }): Promise<{
        total: number;
        results: {
            merchant_id: string;
            status: string;
        }[];
    }>;
    private generatePosterImage;
    private runFactoryGeneration;
    private refundTenantQuotaIfNeeded;
    private buildFactoryPrompt;
    private buildImagePrompt;
    private getImageSize;
    private getFirstReferenceImage;
    private normalizeImageToBase64;
    private formatFactoryPoster;
}
