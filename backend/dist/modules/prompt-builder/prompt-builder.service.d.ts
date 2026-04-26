import { Repository } from 'typeorm';
import { PromptTemplate } from '../admin/prompt-template.entity';
import { SensitiveWord } from '../admin/sensitive-word.entity';
import { Merchant } from '../merchant/merchant.entity';
export type GenerateType = 'review' | 'note' | string;
export interface BuildPromptOptions {
    preset_requirements?: string;
    topics?: string[];
    extraRequirements?: string;
    personaSeed?: string;
    variationSeed?: string;
    recentOutputs?: string[];
}
export declare class PromptBuilderService {
    private promptRepository;
    private sensitiveWordRepository;
    constructor(promptRepository: Repository<PromptTemplate>, sensitiveWordRepository: Repository<SensitiveWord>);
    buildMerchantPrompt(merchant: Merchant, type: GenerateType, options?: BuildPromptOptions): Promise<string>;
    containsSensitiveWords(text: string): Promise<boolean>;
    private normalizeType;
    private getPromptTemplates;
    private getActiveRiskRules;
    private getMerchantPreset;
    private renderTemplateSection;
    private renderMerchantInfo;
    private renderTextSection;
    private renderPersonalitySection;
    private renderVariationSection;
    private renderAvoidRepeatSection;
    private renderOutputLimits;
    private renderList;
    private hashSeed;
}
