export declare class AiService {
    private readonly baseURL;
    private readonly model;
    private readonly appKey;
    generate(prompt: string, maxTokens?: number): Promise<string>;
    generateStream(prompt: string, maxTokens?: number): AsyncGenerator<string>;
}
