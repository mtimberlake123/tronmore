import { MarketingVideoService } from './marketing-video.service';
export declare class MarketingVideoController {
    private marketingVideoService;
    constructor(marketingVideoService: MarketingVideoService);
    getTypes(): Promise<{
        code: number;
        data: {
            key: string;
            name: string;
            mark: string;
        }[];
    }>;
    listProjects(user: any): Promise<{
        code: number;
        data: {
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
        };
    }>;
    createProject(body: {
        title?: string;
        type: string;
        merchant_id?: string;
    }, user: any): Promise<{
        code: number;
        data: {
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
        };
    }>;
    getProject(id: string, user: any): Promise<{
        code: number;
        data: {
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
        };
    }>;
    updateStep(id: string, stepKey: string, body: {
        input?: string;
        output?: string;
        status?: string;
    }, user: any): Promise<{
        code: number;
        data: {
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
        };
    }>;
}
