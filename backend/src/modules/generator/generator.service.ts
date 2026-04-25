import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Generation } from './generation.entity';
import { Merchant } from '../merchant/merchant.entity';
import { MerchantImage } from '../warehouse/merchant-image.entity';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { AiService } from '../ai/ai.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';

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
    private promptBuilder: PromptBuilderService,
  ) {}

  async generate(tenantId: string, merchantId: string, type: string, options: any) {
    const startTime = Date.now();
    const traceId = uuidv4();

    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new BadRequestException('商家不存在');
    }
    if (merchant.balance <= 0) {
      throw new BadRequestException('商家额度不足', '4001');
    }

    const prompt = await this.promptBuilder.buildMerchantPrompt(merchant, type, options || {});

    let generatedContent: any;
    try {
      generatedContent = await this.callAIService(prompt);
    } catch (error) {
      console.error('AI服务调用失败:', error);
      throw new BadRequestException('AI服务异常', '4002');
    }

    if (await this.promptBuilder.containsSensitiveWords(generatedContent.text)) {
      throw new BadRequestException('内容包含敏感词', '4003');
    }

    const { images, imageIds } = await this.matchImages(merchantId, type, options?.imageCount || 6);

    merchant.balance -= 1;
    await this.merchantRepository.save(merchant);

    if (imageIds.length > 0) {
      await this.imageRepository
        .createQueryBuilder()
        .update()
        .set({ isUsed: 1, usedAt: new Date() })
        .whereInIds(imageIds)
        .execute();
    }

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

    try {
      await this.analyticsRepository.save({
        merchantId,
        traceId,
        eventType: 'gen',
        type,
      });
    } catch (error) {
      console.error('埋点记录失败:', error);
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

  async previewReview(tenantId: string, merchantId: string, options: any = {}) {
    const startTime = Date.now();
    const traceId = uuidv4();

    const merchant = await this.merchantRepository.findOne({ where: { merchantId, tenantId } });
    if (!merchant) {
      throw new BadRequestException('商家不存在');
    }

    const prompt = await this.promptBuilder.buildMerchantPrompt(merchant, 'review', options || {});

    let generatedContent: { text: string };
    try {
      generatedContent = await this.callAIService(prompt);
    } catch (error) {
      console.error('AI预览生成失败:', error);
      throw new BadRequestException('AI服务异常', '4002');
    }

    if (await this.promptBuilder.containsSensitiveWords(generatedContent.text)) {
      throw new BadRequestException('内容包含敏感词', '4003');
    }

    return {
      trace_id: traceId,
      content: {
        text: generatedContent.text,
      },
      duration: Date.now() - startTime,
    };
  }

  private async callAIService(prompt: string): Promise<{ text: string }> {
    const text = await this.aiService.generate(prompt);
    return { text };
  }

  private async matchImages(
    merchantId: string,
    type: string,
    count: number,
  ): Promise<{ images: any[]; imageIds: number[] }> {
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
    const safePageSize = Math.min(parseInt(page_size) || 20, 100);

    const query = this.generationRepository
      .createQueryBuilder('g')
      .where('g.merchantId = :merchantId', { merchantId })
      .andWhere('g.tenantId = :tenantId', { tenantId });

    if (type) {
      query.andWhere('g.type = :type', { type });
    }

    query.orderBy('g.createdAt', 'DESC');
    query.skip((parseInt(page) - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    return { list, total };
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
