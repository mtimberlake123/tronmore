import { Repository } from 'typeorm';
import { PromptTemplate } from '../admin/prompt-template.entity';
import { SensitiveWord } from '../admin/sensitive-word.entity';
import { Merchant } from '../merchant/merchant.entity';
import { Reference } from '../reference/reference.entity';
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
    private referenceRepository;
    constructor(promptRepository: Repository<PromptTemplate>, sensitiveWordRepository: Repository<SensitiveWord>, referenceRepository: Repository<Reference>);
    buildMerchantPrompt(merchant: Merchant, type: GenerateType, options?: BuildPromptOptions): Promise<string>;
    containsSensitiveWords(text: string): Promise<boolean>;
    private buildCompactNotePrompt;
    private normalizeType;
    private getPromptTemplates;
    private getReferenceNoteTemplate;
    private getActiveRiskRules;
    private getMerchantPreset;
    private pickNotePersona;
    private renderCompactAvoidRepeat;
    private renderTemplateSection;
    private renderMerchantInfo;
    private renderTextSection;
    private renderOutputLimits;
    private renderList;
    private truncate;
    private hashSeed;
    private logPromptDebug;
}
