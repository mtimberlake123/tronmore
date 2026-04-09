import { Repository } from 'typeorm';
import { Reference } from './reference.entity';
export declare class ReferenceService {
    private referenceRepository;
    constructor(referenceRepository: Repository<Reference>);
    createNote(data: {
        content: string;
        style?: string;
        source?: string;
        tags?: string[];
        tenantId: string;
    }): Promise<{
        id: string;
        type: string;
        content: string;
        style: string;
        source: string;
        tags: string[];
        created_at: Date;
    }>;
    getNotes(params: {
        tenantId: string;
        style?: string;
        page?: number;
        page_size?: number;
    }): Promise<{
        list: {
            id: string;
            content: string;
            style: string;
            source: string;
            tags: string[];
            created_at: Date;
        }[];
        total: number;
    }>;
    createReview(data: {
        content: string;
        style?: string;
        source?: string;
        tenantId: string;
    }): Promise<{
        id: string;
        type: string;
        content: string;
        style: string;
        source: string;
        created_at: Date;
    }>;
    getReviews(params: {
        tenantId: string;
        style?: string;
        page?: number;
        page_size?: number;
    }): Promise<{
        list: {
            id: string;
            content: string;
            style: string;
            source: string;
            created_at: Date;
        }[];
        total: number;
    }>;
}
