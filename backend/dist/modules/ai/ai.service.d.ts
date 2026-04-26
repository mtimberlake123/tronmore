import { Repository } from 'typeorm';
import { SystemSetting } from '../admin/system-setting.entity';
export declare class AiService {
    private settingRepository;
    constructor(settingRepository: Repository<SystemSetting>);
    generate(prompt: string, maxTokens?: number): Promise<string>;
    generateImage(prompt: string, size?: string, image?: string): Promise<string>;
    generateStream(prompt: string, maxTokens?: number): AsyncGenerator<string>;
    private getRuntimeConfig;
    private readStreamContent;
    private parseStreamLine;
}
