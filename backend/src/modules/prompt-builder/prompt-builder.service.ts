import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

@Injectable()
export class PromptBuilderService {
  constructor(
    @InjectRepository(PromptTemplate)
    private promptRepository: Repository<PromptTemplate>,
    @InjectRepository(SensitiveWord)
    private sensitiveWordRepository: Repository<SensitiveWord>,
    @InjectRepository(Reference)
    private referenceRepository: Repository<Reference>,
  ) {}

  async buildMerchantPrompt(
    merchant: Merchant,
    type: GenerateType,
    options: BuildPromptOptions = {},
  ): Promise<string> {
    const normalizedType = this.normalizeType(type);

    if (normalizedType === 'note') {
      return this.buildCompactNotePrompt(merchant, options);
    }

    const promptTemplates = await this.getPromptTemplates(merchant.category, normalizedType);
    const riskRules = await this.getActiveRiskRules();
    const merchantPreset = this.getMerchantPreset(merchant, normalizedType, options);

    const sections = [
      this.renderTemplateSection('系统通用规则', promptTemplates.common),
      this.renderTemplateSection('场景生成规则', promptTemplates.scene),
      this.renderTemplateSection('行业补充规则', promptTemplates.industry),
      this.renderMerchantInfo(merchant, true),
      this.renderTextSection('商家个性化要求', merchantPreset),
      this.renderTextSection('风控合规规则', riskRules.map(rule => `- ${rule.rule}`).join('\n')),
      this.renderOutputLimits(normalizedType),
    ].filter(Boolean);

    return sections.join('\n\n');
  }

  async containsSensitiveWords(text: string): Promise<boolean> {
    const rules = await this.sensitiveWordRepository.find({ where: { active: true } });
    if (!rules.length) return false;

    return rules.some(rule => {
      const word = (rule.word || '').trim();
      return word.length > 0 && text.includes(word);
    });
  }

  private async buildCompactNotePrompt(
    merchant: Merchant,
    options: BuildPromptOptions,
  ): Promise<string> {
    const referenceTemplate = await this.getReferenceNoteTemplate(
      merchant.tenantId,
      options.variationSeed,
    );
    const persona = this.pickNotePersona(merchant, options);
    const requirements = this.getMerchantPreset(merchant, 'note', options);
    const features = this.renderList(merchant.features);
    const avoidRepeat = this.renderCompactAvoidRepeat(options.recentOutputs);

    const sections = [
      '帮普通用户写一条小红书短笔记，只输出正文。',
      [
        `商家：${merchant.name || '未填写'}`,
        `特色：${features || '未填写'}`,
        requirements ? `商家要求：${this.truncate(requirements, 260)}` : '',
      ].filter(Boolean).join('\n'),
      referenceTemplate
        ? `参考语感，不要照抄、不要复述、不要沿用里面的具体事实，只学习句子长短和口吻：\n${this.truncate(referenceTemplate, 260)}`
        : '',
      `本次口吻：${persona}`,
      avoidRepeat,
      [
        '要求：',
        '80-160字，短句，像随手分享。',
        '少用“我”，不要广告腔，不要写成攻略。',
        '必须有一句温和的小保留或轻微负面。',
        '不要虚构价格、地址、排队、排名、优惠。',
        '标签最多2个，可以没有。',
      ].join('\n'),
    ].filter(Boolean);

    const prompt = sections.join('\n\n');
    this.logPromptDebug('note', prompt, sections);
    return prompt;
  }

  private normalizeType(type: GenerateType): string {
    return type === 'note' ? 'note' : 'review';
  }

  private async getPromptTemplates(category: string, type: string) {
    const industries = Array.from(new Set(['general', category || 'general']));
    const styles = Array.from(new Set(['common', type]));

    const templates = await this.promptRepository.find({
      where: {
        industry: In(industries),
        style: In(styles),
        isActive: true,
      },
      order: { id: 'ASC' },
    });

    return {
      common: templates.filter(t => t.industry === 'general' && t.style === 'common'),
      scene: templates.filter(t => t.industry === 'general' && t.style === type),
      industry: templates.filter(t => t.industry === category && t.style === type),
    };
  }

  private async getReferenceNoteTemplate(
    tenantId: string,
    variationSeed?: string,
  ): Promise<string> {
    const references = await this.referenceRepository.find({
      where: { tenantId, type: 'note' },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    if (!references.length) return '';
    if (references.length === 1 || !variationSeed) {
      return references[0].content || '';
    }

    const index = this.hashSeed(`${tenantId}:${variationSeed}`) % references.length;
    return references[index].content || '';
  }

  private async getActiveRiskRules(): Promise<SensitiveWord[]> {
    const rules = await this.sensitiveWordRepository.find({
      where: { active: true },
      order: { level: 'DESC', id: 'ASC' },
    });

    return rules.filter(rule => Boolean((rule.rule || '').trim()));
  }

  private getMerchantPreset(
    merchant: Merchant,
    type: string,
    options: BuildPromptOptions,
  ): string {
    const values = [
      type === 'note' ? merchant.notePromptExt : merchant.aiPromptExt,
      options.preset_requirements,
      options.extraRequirements,
    ];

    if (type === 'note' && options.topics?.length) {
      values.push(`参考话题：${options.topics.join(' ')}`);
    }

    if (type === 'note' && merchant.noteTopic) {
      values.push(`商家笔记话题：${merchant.noteTopic}`);
    }

    if (type === 'note' && merchant.noteCopy) {
      values.push(`商家笔记文案参考：${merchant.noteCopy}`);
    }

    if (merchant.incentive) {
      values.push(`商家活动/激励信息：${merchant.incentive}`);
    }

    return values
      .map(value => (value || '').trim())
      .filter(Boolean)
      .join('\n');
  }

  private pickNotePersona(merchant: Merchant, options: BuildPromptOptions): string {
    const seed = `${merchant.merchantId}:${options.personaSeed || ''}:${options.variationSeed || Date.now()}`;
    const personas = [
      '顺路体验型，轻松一点，不用力夸。',
      '朋友聊天型，像发给朋友看的短分享。',
      '轻微挑剔型，整体认可但会带一句小保留。',
      '拍照记录型，关注第一眼感觉和现场观感，但不写成拍照攻略。',
      '附近生活型，语气像本地人简单记一笔。',
    ];

    return personas[this.hashSeed(seed) % personas.length];
  }

  private renderCompactAvoidRepeat(recentOutputs?: string[]): string {
    if (!recentOutputs?.length) return '';

    const recent = recentOutputs
      .map(text => (text || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .slice(0, 3)
      .map((text, index) => `${index + 1}. ${this.truncate(text, 80)}`)
      .join('\n');

    if (!recent) return '';

    return [
      '避免重复下面最近生成过的开头、句式和负面点：',
      recent,
    ].join('\n');
  }

  private renderTemplateSection(title: string, templates: PromptTemplate[]): string {
    const content = templates
      .map(template => (template.content || '').trim())
      .filter(Boolean)
      .join('\n');

    return this.renderTextSection(title, content);
  }

  private renderMerchantInfo(merchant: Merchant, includeProducts: boolean): string {
    const products = this.renderList(merchant.products);
    const features = this.renderList(merchant.features);
    const lines = [
      '【商家信息】',
      `商家名：${merchant.name || '未填写'}`,
    ];

    if (includeProducts) {
      lines.push(`商家产品：${products || '未填写'}`);
    }

    lines.push(`特色宣传点：${features || '未填写'}`);
    return lines.join('\n');
  }

  private renderTextSection(title: string, content: string): string {
    if (!content?.trim()) return '';
    return `【${title}】\n${content.trim()}`;
  }

  private renderOutputLimits(type: string): string {
    const commonLimits = [
      '只输出最终正文，不要输出解释、Markdown、编号或多余说明。',
      '不要虚构未提供的价格、地址、营业时间、优惠活动或荣誉信息。',
      '避免绝对化和夸张表达，内容要真实自然、符合平台社区规范。',
    ];

    if (type === 'note') {
      return [
        '【输出限制】',
        '生成一条适合小红书发布的中文短笔记。',
        '字数严格控制在80-160字。',
        '必须自然带一句轻微负面评价或保留意见。',
        ...commonLimits,
      ].join('\n');
    }

    return [
      '【输出限制】',
      '生成一条适合大众点评/美团发布的中文商家点评，语气像真实顾客，不要像广告。',
      '字数严格控制在80-180字。',
      ...commonLimits,
    ].join('\n');
  }

  private renderList(values?: string[]): string {
    if (!Array.isArray(values)) return '';
    return values.map(value => (value || '').trim()).filter(Boolean).join('、');
  }

  private truncate(value: string, maxLength: number): string {
    const text = (value || '').trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  }

  private hashSeed(seed: string): number {
    return Array.from(seed).reduce((hash, char) => {
      return (hash * 31 + char.charCodeAt(0)) >>> 0;
    }, 2166136261);
  }

  private logPromptDebug(type: string, prompt: string, sections: string[]) {
    if (process.env.NODE_ENV === 'production') return;
    console.log('[PromptBuilder]', {
      type,
      length: prompt.length,
      sections: sections.length,
    });
  }
}
