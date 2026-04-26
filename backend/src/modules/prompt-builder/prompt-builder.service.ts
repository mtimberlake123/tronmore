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
      this.renderPersonalitySection(normalizedType, merchant, options),
      this.renderVariationSection(normalizedType, merchant, options),
      this.renderAvoidRepeatSection(normalizedType, options),
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

  private renderPersonalitySection(type: string, merchant: Merchant, options: BuildPromptOptions): string {
    if (type !== 'note') return '';

    const seed = `${merchant.merchantId}:${options.personaSeed || Date.now()}`;
    const personas = [
      {
        name: '细节控但不夸张',
        voice: '说话克制，容易注意到口味、环境或服务里的小细节。',
        habit: '常用“还挺”“这点我会加分”“不过...”这类自然表达。',
      },
      {
        name: '附近顺路型',
        voice: '像住在附近或路过顺手体验的人，不端着，不写攻略。',
        habit: '常用“顺路”“附近”“简单吃一下”“下次可能还会来”。',
      },
      {
        name: '轻微挑剔型',
        voice: '整体认可，但会带一句不伤人的保留意见，显得更真实。',
        habit: '常用“但我觉得...”“如果...会更好”“不是那种特别惊艳，但挺舒服”。',
      },
      {
        name: '朋友安利型',
        voice: '像发给朋友看的短分享，语气轻松，不硬推。',
        habit: '常用“可以试试”“适合...的时候来”“我会更推荐...”。',
      },
      {
        name: '拍照记录型',
        voice: '更关注第一眼感觉、画面和氛围，但不写成网红模板。',
        habit: '常用“第一眼”“看着挺干净”“拍出来还行”“现场比想象中...”。',
      },
    ];
    const persona = personas[this.hashSeed(seed) % personas.length];

    return this.renderTextSection(
      '用户个性化口吻',
      [
        `本次笔记请使用“${persona.name}”口吻。`,
        persona.voice,
        persona.habit,
        '不要在正文里说出人设名称，不要解释自己是什么性格。',
        '必须包含一句轻微负面或保留意见，但语气要温和，例如“就是...稍微...”“如果...会更好”“不是特别...但...”。',
        '尽量不要使用第一人称“我”，可以改成“这家”“整体”“个人感觉”“朋友会喜欢这种”。',
      ].join('\n'),
    );
  }

  private renderVariationSection(type: string, merchant: Merchant, options: BuildPromptOptions): string {
    if (type !== 'note') return '';

    const seed = `${merchant.merchantId}:${options.variationSeed || Date.now()}`;
    const angles = [
      '这次只写“顺路试了一下”的感觉，重点放在第一印象。',
      '这次只写“适合什么场景来”的感觉，不要写成全面介绍。',
      '这次只写一个产品或口味记忆点，其他信息少带。',
      '这次从“有一点小遗憾但整体还行”的角度写。',
      '这次写得像发给朋友看的短消息，少修饰，直接一点。',
      '这次从图片/门店观感切入，但不要写成拍照攻略。',
    ];
    const openings = [
      '开头不要用“今天发现宝藏店”。',
      '开头不要用“姐妹们”。',
      '开头不要用“真的被惊艳到”。',
      '开头可以平一点，不要强行抓马。',
      '开头像随手记录，不要像标题党。',
    ];
    const negatives = [
      '轻微负面优先写“不是特别惊艳”。',
      '轻微负面优先写“如果选择再多点会更好”。',
      '轻微负面优先写“口味/体验会更适合特定人群”。',
      '轻微负面优先写“环境或包装不是特别出片”。',
      '轻微负面优先写“饭点可能会有点热闹”。',
    ];

    const hash = this.hashSeed(seed);
    return this.renderTextSection(
      '本次变化要求',
      [
        angles[hash % angles.length],
        openings[Math.floor(hash / 7) % openings.length],
        negatives[Math.floor(hash / 13) % negatives.length],
        '这次的句式、开头和负面点要和上一条明显不同，不要复用同一套表达。',
        '可以自然带1个网络热门词或轻梗，例如“松弛感”“有点东西”“稳稳的”“狠狠拿捏”，但不要堆梗。',
      ].join('\n'),
    );
  }

  private renderAvoidRepeatSection(type: string, options: BuildPromptOptions): string {
    if (type !== 'note' || !options.recentOutputs?.length) return '';

    const recent = options.recentOutputs
      .map(text => (text || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .slice(0, 3)
      .map((text, index) => `${index + 1}. ${text.slice(0, 120)}`)
      .join('\n');

    if (!recent) return '';

    return this.renderTextSection(
      '避免重复',
      [
        '下面是该用户最近生成过的笔记片段，本次不要复用相同开头、句式、评价角度或轻微负面点：',
        recent,
        '本次请换一个表达路径，像同一个人又随手写了另一条，而不是改写上一条。',
      ].join('\n'),
    );
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
        '请生成一条适合小红书发布的短笔记，像普通人随手分享，不要像AI作文或商家广告。',
        '字数严格控制在60-160字，宁可短一点，不要写满。',
        '最多3个短段落，每段1-2句话；可以有标题，但标题也要像真人随手写的。',
        '必须自然带一句轻微负面评价或保留意见，不能全篇只夸；不要恶意差评。',
        '尽量少用“我”，全文最多出现1次；可适量带网络热门词汇或轻梗，但不要油腻、不要堆梗。',
        '标签最多3个，可不要标签；不要堆emoji、感叹号、排比句和万能模板句。',
        ...commonLimits,
      ].join('\n');
    }

    return [
      '【输出限制】',
      '请生成一条适合大众点评/美团发布的中文商家点评，语气像真实顾客，不要像广告。',
      '字数严格控制在80-180字。',
      ...commonLimits,
    ].join('\n');
  }

  private renderList(values?: string[]): string {
    if (!Array.isArray(values)) return '';
    return values.map(value => (value || '').trim()).filter(Boolean).join('、');
  }

  private hashSeed(seed: string): number {
    return Array.from(seed).reduce((hash, char) => {
      return (hash * 31 + char.charCodeAt(0)) >>> 0;
    }, 2166136261);
  }
}
