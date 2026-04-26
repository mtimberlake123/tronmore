import { GeneratorService } from './generator.service';
export declare class GeneratorController {
    private generatorService;
    constructor(generatorService: GeneratorService);
    generate(req: any, body: {
        merchant_id: string;
        type: string;
        options: any;
    }): Promise<{
        code: number;
        data: {
            trace_id: string;
            content: {
                text: any;
                images: any[];
            };
            duration: number;
        };
    }>;
    previewReview(req: any, body: {
        merchant_id: string;
        options?: any;
    }): Promise<{
        code: number;
        data: {
            trace_id: string;
            content: {
                text: string;
            };
            duration: number;
        };
    }>;
    getGenerations(req: any, query: any): Promise<{
        code: number;
        data: {
            list: import("./generation.entity").Generation[];
            total: number;
        };
    }>;
    feedback(id: string, body: any): Promise<{
        message: string;
        code: number;
    }>;
}
