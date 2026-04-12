import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Merchant } from '../merchant/merchant.entity';
import { Generation } from '../generator/generation.entity';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { SensitiveWord } from '../admin/sensitive-word.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class H5Service {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
    @InjectRepository(AnalyticsLog)
    private analyticsRepository: Repository<AnalyticsLog>,
    @InjectRepository(SensitiveWord)
    private sensitiveWordRepository: Repository<SensitiveWord>,
    private aiService: AiService,
  ) {}

  /**
   * 获取商家H5配置
   */
  async getMerchantConfig(merchantId: string) {
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new BadRequestException('商家不存在');
    }

    return {
      merchant_id: merchant.merchantId,
      name: merchant.name,
      logo: merchant.logo,
      incentive: merchant.incentive,
      jump_targets: merchant.jumpLinks?.platforms || ['dianping'],
      dy_url: merchant.jumpLinks?.dy_url || '',
      wx_qr: merchant.jumpLinks?.wx_qr || '',
    };
  }

  /**
   * H5端AI生成内容
   */
  async generateContent(merchantId: string, type: string) {
    const traceId = uuidv4();
    const startTime = Date.now();

    // 1. 检查商家余额
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new BadRequestException('商家不存在');
    }
    if (merchant.balance <= 0) {
      throw new BadRequestException('该商家额度已用完', '4001');
    }

    // 2. 构建Prompt
    const prompt = await this.buildPrompt(merchant, type);

    // 3. 调用AI生成
    let content: string;
    try {
      content = await this.callAI(prompt, type);
    } catch (error) {
      console.error('AI生成失败:', error);
      throw new BadRequestException('AI服务异常', '4002');
    }

    // 4. 检查敏感词
    if (await this.containsSensitiveWords(content)) {
      throw new BadRequestException('内容优化中，请重试', '4003');
    }

    // 5. 匹配图片（简化处理，用模拟数据）
    const images = this.mockImages(6);

    // 6. 扣除额度
    merchant.balance -= 1;
    await this.merchantRepository.save(merchant);

    // 7. 保存生成记录
    const generation = this.generationRepository.create({
      merchantId,
      tenantId: merchant.tenantId,
      type,
      content,
      images,
      traceId,
      duration: Date.now() - startTime,
    });
    await this.generationRepository.save(generation);

    // 8. 记录埋点
    try {
      await this.analyticsRepository.save({
        merchantId,
        traceId,
        eventType: 'gen',
        type,
      });
    } catch (e) {
      console.error('埋点记录失败:', e);
    }

    return {
      trace_id: traceId,
      content: {
        text: content,
        images,
      },
    };
  }

  /**
   * 埋点上报
   */
  async track(data: {
    event: string;
    merchant_id: string;
    qr_id?: string;
    source?: string;
    type?: string;
    trace_id?: string;
    duration?: number;
    target_platform?: string;
    client_time?: string;
  }) {
    const log = this.analyticsRepository.create({
      merchantId: data.merchant_id,
      qrId: data.qr_id,
      eventType: data.event,
      source: data.source,
      type: data.type,
      traceId: data.trace_id,
      duration: data.duration,
      targetPlatform: data.target_platform,
      clientTime: data.client_time ? new Date(data.client_time) : new Date(),
    });
    await this.analyticsRepository.save(log);
  }

  /**
   * 发布回调
   */
  async publishCallback(data: {
    trace_id: string;
    merchant_id: string;
    platform: string;
    publish_url?: string;
    client_time?: string;
  }) {
    // 查找对应的生成记录
    const generation = await this.generationRepository.findOne({
      where: { traceId: data.trace_id },
    });

    if (generation) {
      // 更新为已发布状态
      generation.feedback = `发布成功|${data.platform}|${data.publish_url || ''}`;
      await this.generationRepository.save(generation);
    }

    // 记录跳转埋点
    const log = this.analyticsRepository.create({
      merchantId: data.merchant_id,
      eventType: 'jump',
      traceId: data.trace_id,
      targetPlatform: data.platform,
    });
    await this.analyticsRepository.save(log);
  }

  /**
   * 构建Prompt
   */
  private async buildPrompt(merchant: Merchant, type: string): Promise<string> {
    const industryPrompts = {
      catering: '你是一个专业的餐饮营销文案专家，文风活泼、接地气，擅长写吸引人的评价。',
      beauty: '你是一个专业的美业营销文案专家，文风精致，擅长写高端感的评价。',
      general: '你是一个专业的营销文案专家，擅长写各类评价。',
    };

    const typeInstructions = {
      review: '请生成一条大众点评/美团风格的评价，内容要真实自然，突出商家特色。',
      note: '请生成一条小红书风格的笔记，内容要有分享感，可以使用emoji。',
    };

    let prompt = `${industryPrompts[merchant.category] || industryPrompts.general}\n`;
    prompt += `${typeInstructions[type] || typeInstructions.review}\n`;

    if (merchant.features?.length) {
      prompt += `商家特色：${merchant.features.join('、')}\n`;
    }
    if (merchant.products?.length) {
      prompt += `主要产品：${merchant.products.join('、')}\n`;
    }
    if (merchant.incentive) {
      prompt += `激励活动：${merchant.incentive}\n`;
    }

    // 注入风险规则
    const activeRules = await this.sensitiveWordRepository.find({ where: { active: true } });
    if (activeRules.length > 0) {
      const ruleConstraints = activeRules
        .filter(r => r.rule)
        .map(r => `- ${r.rule}`)
        .join('\n');
      if (ruleConstraints) {
        prompt += `\n\n【合规要求】请严格遵守以下规则：\n${ruleConstraints}`;
      }
    }

    prompt += '\n\n【重要】请确保内容符合平台规范，文风自然，避免AI味。';

    return prompt;
  }

  /**
   * 调用AI服务
   */
  private async callAI(prompt: string, type: string): Promise<string> {
    return await this.aiService.generate(prompt);
  }

  /**
   * 敏感词检测（使用数据库规则）
   */
  private async containsSensitiveWords(text: string): Promise<boolean> {
    const rules = await this.sensitiveWordRepository.find({ where: { active: true } });
    if (!rules.length) return false;
    return rules.some(r => r.word && text.includes(r.word));
  }

  /**
   * 模拟图片
   */
  private mockImages(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      url: `https://via.placeholder.com/300x300?text=Image${i + 1}`,
      width: 300,
      height: 300,
    }));
  }
}