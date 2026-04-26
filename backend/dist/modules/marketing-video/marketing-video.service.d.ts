import { Repository } from 'typeorm';
import { MarketingVideoProject } from './marketing-video-project.entity';
import { MarketingVideoStep } from './marketing-video-step.entity';
export declare class MarketingVideoService {
    private projectRepository;
    private stepRepository;
    constructor(projectRepository: Repository<MarketingVideoProject>, stepRepository: Repository<MarketingVideoStep>);
    getTypes(): Promise<{
        key: string;
        name: string;
        mark: string;
    }[]>;
    listProjects(tenantId: string): Promise<{
        list: {
            id: string;
            title: string;
            type: string;
            typeName: string;
            mark: string;
            merchant_id: string;
            current_step: string;
            stepIndex: number;
            status: string;
            progress: number;
            steps: {
                id: string;
                key: string;
                title: string;
                input: string;
                output: string;
                status: string;
                error: string;
            }[];
            notes: Record<string, string>;
            created_at: Date;
            updated_at: Date;
        }[];
        total: number;
    }>;
    createProject(data: {
        tenantId: string;
        title?: string;
        type: string;
        merchantId?: string;
    }): Promise<{
        id: string;
        title: string;
        type: string;
        typeName: string;
        mark: string;
        merchant_id: string;
        current_step: string;
        stepIndex: number;
        status: string;
        progress: number;
        steps: {
            id: string;
            key: string;
            title: string;
            input: string;
            output: string;
            status: string;
            error: string;
        }[];
        notes: Record<string, string>;
        created_at: Date;
        updated_at: Date;
    }>;
    getProject(projectId: string, tenantId: string): Promise<{
        id: string;
        title: string;
        type: string;
        typeName: string;
        mark: string;
        merchant_id: string;
        current_step: string;
        stepIndex: number;
        status: string;
        progress: number;
        steps: {
            id: string;
            key: string;
            title: string;
            input: string;
            output: string;
            status: string;
            error: string;
        }[];
        notes: Record<string, string>;
        created_at: Date;
        updated_at: Date;
    }>;
    updateStep(projectId: string, stepKey: string, tenantId: string, data: {
        input?: string;
        output?: string;
        status?: string;
    }): Promise<{
        id: string;
        title: string;
        type: string;
        typeName: string;
        mark: string;
        merchant_id: string;
        current_step: string;
        stepIndex: number;
        status: string;
        progress: number;
        steps: {
            id: string;
            key: string;
            title: string;
            input: string;
            output: string;
            status: string;
            error: string;
        }[];
        notes: Record<string, string>;
        created_at: Date;
        updated_at: Date;
    }>;
    private calculateProgress;
    private formatProject;
}
