export declare class AiService {
    private readonly baseURL;
    private readonly model;
    private readonly appKey;
    private readonly temperature;
    generate(prompt: string, maxTokens?: number): Promise<string>;
    generateImage(prompt: string, size?: string, image?: string): Promise<string>;
    generateStream(prompt: string, maxTokens?: number): AsyncGenerator<string>;
    private readStreamContent;
    private parseStreamLine;
}
