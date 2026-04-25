import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PromptTemplate } from '../admin/prompt-template.entity';
import { SensitiveWord } from '../admin/sensitive-word.entity';
import { Merchant } from '../merchant/merchant.entity';

export type GenerateType = 'review' | 'note' | string;

export interface BuildPromptOptions {
  preset_requirements?: string;
  topics?: string[];
  extraRequirements?: string;
}

@Injectable()
export class PromptBuilderService {
  constructor(
    @InjectRepository(PromptTemplate)
    private promptRepository: Repository<PromptTemplate>,
    @InjectRepository(SensitiveWord)
    private sensitiveWordRepository: Repository<SensitiveWord>,
  ) {}

  async buildMerchantPrompt(
    merchant: Merchant,
    type: GenerateType,
    options: BuildPromptOptions = {},
  ): Promise<string> {
    const normalizedType = this.normalizeType(type);
    const promptTemplates = await this.getPromptTemplates(merchant.category, normalizedType);
    const riskRules = await this.getActiveRiskRules();
    const merchantPreset = this.getMerchantPreset(merchant, normalizedType, options);

    const sections = [
      this.renderTemplateSection('系统通用规则', promptTemplates.common),
      this.renderTemplateSection('场景生成规则', promptTemplates.scene),
      this.renderTemplateSection('行业补充规则', promptTemplates.industry),
      this.renderMerchantInfo(merchant),
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

  private renderTemplateSection(title: string, templates: PromptTemplate[]): string {
    const content = templates
      .map(template => (template.content || '').trim())
      .filter(Boolean)
      .join('\n');

    return this.renderTextSection(title, content);
  }

  private renderMerchantInfo(merchant: Merchant): string {
    const products = this.renderList(merchant.products);
    const features = this.renderList(merchant.features);

    return [
      '【商家信息】',
      `商家名：${merchant.name || '未填写'}`,
      `商家产品：${products || '未填写'}`,
      `特色宣传点：${features || '未填写'}`,
    ].join('\n');
  }

  private renderTextSection(title: string, content: string): string {
    if (!content?.trim()) return '';
    return `【${title}】\n${content.trim()}`;
  }

  private renderOutputLimits(type: string): string {
    const task =
      type === 'note'
        ? '请生成一篇适合小红书发布的中文笔记，包含自然种草感，可以包含标题、正文和标签。'
        : '请生成一条适合大众点评/美团发布的中文商家点评，语气像真实顾客，不要像广告。';

    return [
      '【输出限制】',
      task,
      '字数控制在100-500字。',
      '只输出最终正文，不要输出解释、Markdown、编号或多余说明。',
      '不要虚构未提供的价格、地址、营业时间、优惠活动或荣誉信息。',
      '避免绝对化和夸张表达，内容要真实自然、符合平台社区规范。',
    ].join('\n');
  }

  private renderList(values?: string[]): string {
    if (!Array.isArray(values)) return '';
    return values.map(value => (value || '').trim()).filter(Boolean).join('、');
  }
}
