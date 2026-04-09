import { ReferenceService } from './reference.service';
export declare class ReferenceController {
    private referenceService;
    constructor(referenceService: ReferenceService);
    createNote(body: {
        content: string;
        style?: string;
        source?: string;
        tags?: string[];
    }, user: any): Promise<{
        code: number;
        data: {
            id: string;
            type: string;
            content: string;
            style: string;
            source: string;
            tags: string[];
            created_at: Date;
        };
    }>;
    getNotes(query: {
        style?: string;
        page?: number;
        page_size?: number;
    }, user: any): Promise<{
        code: number;
        data: {
            list: {
                id: string;
                content: string;
                style: string;
                source: string;
                tags: string[];
                created_at: Date;
            }[];
            total: number;
        };
    }>;
    createReview(body: {
        content: string;
        style?: string;
        source?: string;
    }, user: any): Promise<{
        code: number;
        data: {
            id: string;
            type: string;
            content: string;
            style: string;
            source: string;
            created_at: Date;
        };
    }>;
    getReviews(query: {
        style?: string;
        page?: number;
        page_size?: number;
    }, user: any): Promise<{
        code: number;
        data: {
            list: {
                id: string;
                content: string;
                style: string;
                source: string;
                created_at: Date;
            }[];
            total: number;
        };
    }>;
}
