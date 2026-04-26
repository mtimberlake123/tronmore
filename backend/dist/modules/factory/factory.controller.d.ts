import { FactoryService } from './factory.service';
export declare class FactoryController {
    private factoryService;
    constructor(factoryService: FactoryService);
    getFactoryModules(): Promise<{
        code: number;
        data: {
            key: string;
            name: string;
            description: string;
            mediaType: string;
            goal: string;
            supportedRatios: string[];
            cost: number;
        }[];
    }>;
    createFactoryGeneration(body: {
        merchant_id: string;
        module_key: string;
        prompt: string;
        ratio: string;
        style: string;
        reference_images?: string[];
    }, user: any): Promise<{
        code: number;
        data: {
            id: string;
            status: string;
            cost: number;
            message: string;
        };
    }>;
    getFactoryGeneration(id: string, user: any): Promise<{
        code: number;
        data: {
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
        };
    }>;
    getFactoryHistory(query: {
        module_key?: string;
        merchant_id?: string;
        page?: number;
        page_size?: number;
    }, user: any): Promise<{
        code: number;
        data: {
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
        };
    }>;
    getTemplates(query: {
        category?: string;
        scene?: string;
        page?: number;
        page_size?: number;
    }): Promise<{
        code: number;
        data: {
            list: {
                id: number;
                name: string;
                category: string;
                scene: string;
                thumbnail_url: string;
                template_url: string;
            }[];
            total: number;
        };
    }>;
    createPoster(body: {
        template_id: number;
        customizations: {
            text?: string;
            image?: string;
            background?: string;
        };
        merchant_id: string;
    }, user: any): Promise<{
        code: number;
        data: {
            id: string;
            image_url: string;
        };
    }>;
    saveDraft(body: {
        type: string;
        content: any;
        merchant_id: string;
        template_id?: number;
    }, user: any): Promise<{
        code: number;
        data: {
            id: string;
        };
    }>;
    getDrafts(query: {
        type?: string;
        merchant_id?: string;
        page?: number;
        page_size?: number;
    }, user: any): Promise<{
        code: number;
        data: {
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
        };
    }>;
    getDraft(id: string, user: any): Promise<{
        code: number;
        data: {
            id: string;
            type: string;
            content: any;
            merchant_id: string;
            template_id: number;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    updateDraft(id: string, body: {
        content?: any;
        template_id?: number;
    }, user: any): Promise<{
        message: string;
        code: number;
    }>;
    deleteDraft(id: string, user: any): Promise<{
        message: string;
        code: number;
    }>;
    batchDistribute(body: {
        poster_id: string;
        merchant_ids: string[];
    }, user: any): Promise<{
        code: number;
        data: {
            total: number;
            results: {
                merchant_id: string;
                status: string;
            }[];
        };
    }>;
}
