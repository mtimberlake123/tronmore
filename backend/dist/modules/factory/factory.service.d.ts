import { Repository } from 'typeorm';
import { PosterTemplate } from './poster-template.entity';
import { Poster } from './poster.entity';
import { Draft } from './draft.entity';
import { Merchant } from '../merchant/merchant.entity';
export declare class FactoryService {
    private templateRepository;
    private posterRepository;
    private draftRepository;
    private merchantRepository;
    constructor(templateRepository: Repository<PosterTemplate>, posterRepository: Repository<Poster>, draftRepository: Repository<Draft>, merchantRepository: Repository<Merchant>);
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
}
