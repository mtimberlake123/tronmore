import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Generation } from './generation.entity';
import { Merchant } from '../merchant/merchant.entity';
import { MerchantImage } from '../warehouse/merchant-image.entity';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class GeneratorService {
  constructor(
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(MerchantImage)
    private imageRepository: Repository<MerchantImage>,
    @InjectRepository(AnalyticsLog)
    private analyticsRepository: Repository<AnalyticsLog>,
    private aiService: AiService,
  ) {}

  async generate(tenantId: string, merchantId: string, type: string, options: any) {
    const startTime = Date.now();
    const traceId = uuidv4();

    // 1. 检查商家余额
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new BadRequestException('商家不存在');
    }
    if (merchant.balance <= 0) {
      throw new BadRequestException('商家额度不足', '4001');
    }

    // 2. 获取Prompt模板
    const prompt = await this.buildPrompt(merchant, type, options);

    // 3. 调用AI服务生成内容
    let generatedContent: any;
    try {
      generatedContent = await this.callAIService(prompt, type);
    } catch (error) {
      console.error('AI服务调用失败:', error);
      throw new BadRequestException('AI服务异常', '4002');
    }

    // 4. 检查内容是否包含敏感词（这里简化处理，实际应该调用敏感词检测服务）
    if (this.containsSensitiveWords(generatedContent.text)) {
      throw new BadRequestException('内容包含敏感词', '4003');
    }

    // 5. 匹配图片
    const { images, imageIds } = await this.matchImages(merchantId, type, options.imageCount || 6);

    // 6. 扣除额度
    merchant.balance -= 1;
    await this.merchantRepository.save(merchant);

    // 7. 标记图片为已使用
    if (imageIds.length > 0) {
      await this.imageRepository
        .createQueryBuilder()
        .update()
        .set({ isUsed: 1, usedAt: new Date() })
        .whereInIds(imageIds)
        .execute();
    }

    // 8. 保存生成记录
    const generation = this.generationRepository.create({
      merchantId,
      tenantId,
      type,
      content: generatedContent.text,
      images,
      traceId,
      duration: Date.now() - startTime,
    });
    await this.generationRepository.save(generation);

    // 9. 记录埋点
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
        text: generatedContent.text,
        images,
      },
      duration: Date.now() - startTime,
    };
  }

  private async buildPrompt(merchant: Merchant, type: string, options: any): Promise<string> {
    const industryPrompts = {
      catering: '你是一个专业的餐饮营销文案专家，文风活泼、接地气，擅长写吸引人的评价和笔记。',
      beauty: '你是一个专业的美业营销文案专家，文风精致、专业，擅长写高端感的评价和笔记。',
      general: '你是一个专业的营销文案专家，擅长写各类评价和笔记。',
    };

    const typeInstructions = {
      review: '请生成一条大众点评/美团风格的评价，内容要真实自然，突出商家特色，避免过于营销化的表述。',
      note: '请生成一条小红书风格的笔记，内容要有分享感，可以使用emoji，文风自然亲切。',
    };

    const basePrompt = industryPrompts[merchant.category] || industryPrompts.general;
    const typePrompt = typeInstructions[type];

    let prompt = `${basePrompt}\n\n${typePrompt}\n\n`;

    // 添加商家特色
    if (merchant.features && merchant.features.length > 0) {
      prompt += `商家特色：${merchant.features.join('、')}\n`;
    }

    // 添加产品
    if (merchant.products && merchant.products.length > 0) {
      prompt += `主要产品：${merchant.products.join('、')}\n`;
    }

    // 添加激励
    if (options.preset_requirements) {
      prompt += `\n营销要求：${options.preset_requirements}\n`;
    }

    // 添加话题（仅笔记）
    if (type === 'note' && options.topics && options.topics.length > 0) {
      prompt += `\n添加话题：${options.topics.join(' ')}\n`;
    }

    // 添加安全约束
    prompt += `\n\n【重要】请确保内容：\n1. 不包含任何敏感词\n2. 不夸大宣传\n3. 文风自然，避免AI味\n4. 符合平台社区规范`;

    return prompt;
  }

  private async callAIService(prompt: string, type: string): Promise<any> {
    // 调用真实的AI服务
    const text = await this.aiService.generate(prompt);
    return { text };
  }

  private containsSensitiveWords(text: string): boolean {
    // TODO: 集成真实的敏感词检测服务
    // 这里简化处理，实际应该调用敏感词库
    const sensitiveWords = ['敏感词1', '敏感词2', '测试敏感词']; // 示例
    return sensitiveWords.some(word => text.includes(word));
  }

  private async matchImages(merchantId: string, type: string, count: number): Promise<{ images: any[], imageIds: number[] }> {
    // 优先获取产品图，不够则用环境图补位
    const productImages = await this.imageRepository.find({
      where: { merchantId, tab: 'product', isUsed: 0 as any, isDeleted: 0 as any },
      take: count,
    });

    const imageIds: number[] = [];
    const images = productImages.map(img => {
      imageIds.push(img.id);
      return {
        url: img.url,
        source: 'product',
      };
    });

    if (images.length < count) {
      const needMore = count - images.length;
      const envImages = await this.imageRepository.find({
        where: { merchantId, tab: 'environment', isUsed: 0 as any, isDeleted: 0 as any },
        take: needMore,
      });
      envImages.forEach(img => {
        imageIds.push(img.id);
        images.push({
          url: img.url,
          source: 'environment',
        });
      });
    }

    // 如果还不够，用占位图
    while (images.length < count) {
      images.push({
        url: `https://via.placeholder.com/300x300?text=Image${images.length + 1}`,
        source: 'placeholder',
      });
    }

    return { images, imageIds };
  }

  async getGenerations(tenantId: string, merchantId: string, params: any) {
    const { type, page = 1, page_size = 20 } = params;

    // 限制 page_size 最大值
    const safePageSize = Math.min(parseInt(page_size) || 20, 100);

    const query = this.generationRepository.createQueryBuilder('g')
      .where('g.merchantId = :merchantId', { merchantId })
      .andWhere('g.tenantId = :tenantId', { tenantId }); // 添加租户隔离

    if (type) {
      query.andWhere('g.type = :type', { type });
    }

    query.orderBy('g.createdAt', 'DESC');
    query.skip((parseInt(page) - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list,
      total,
    };
  }

  async feedback(generationId: number, data: any) {
    const generation = await this.generationRepository.findOne({ where: { id: generationId } });
    if (!generation) {
      throw new BadRequestException('生成记录不存在');
    }

    generation.rating = data.rating;
    generation.feedback = data.feedback;
    await this.generationRepository.save(generation);

    return { message: '反馈已提交' };
  }
}