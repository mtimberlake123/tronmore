import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Merchant } from '../merchant/merchant.entity';
import { Generation } from '../generator/generation.entity';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { AiService } from '../ai/ai.service';
import { BuildPromptOptions, PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { MerchantImage } from '../warehouse/merchant-image.entity';

@Injectable()
export class H5Service {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
    @InjectRepository(AnalyticsLog)
    private analyticsRepository: Repository<AnalyticsLog>,
    @InjectRepository(MerchantImage)
    private imageRepository: Repository<MerchantImage>,
    private aiService: AiService,
    private promptBuilder: PromptBuilderService,
  ) {}

  async getMerchantConfig(merchantId: string) {
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new BadRequestException('商家不存在');
    }

    const coverImage = await this.findCoverImage(merchant.merchantId);
    const productImages = await this.findProductImages(merchant.merchantId, 6);

    return {
      merchant_id: merchant.merchantId,
      name: merchant.name,
      logo: merchant.logo,
      cover_image: coverImage || merchant.logo || '',
      product_images: productImages,
      incentive: merchant.incentive,
      jump_targets: merchant.jumpLinks?.platforms || ['dianping'],
      dy_url: merchant.location?.dy_url || merchant.jumpLinks?.dy_url || '',
      wx_qr: merchant.location?.wx_url || merchant.jumpLinks?.wx_qr || '',
      address: merchant.location?.address || '',
    };
  }

  async generateContent(merchantId: string, type: string, options: BuildPromptOptions = {}) {
    const traceId = uuidv4();
    const startTime = Date.now();

    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new BadRequestException('商家不存在');
    }
    if (merchant.balance <= 0) {
      throw new BadRequestException('该商家额度已用完', '4001');
    }

    const prompt = await this.promptBuilder.buildMerchantPrompt(merchant, type, options);

    let content: string;
    try {
      content = await this.aiService.generate(prompt, type === 'note' ? 260 : 520);
    } catch (error) {
      console.error('AI生成失败:', error);
      throw new BadRequestException('AI服务异常', '4002');
    }

    if (await this.promptBuilder.containsSensitiveWords(content)) {
      throw new BadRequestException('内容优化中，请重试', '4003');
    }

    const images = await this.matchImages(merchantId, type, 6);

    merchant.balance -= 1;
    await this.merchantRepository.save(merchant);

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
        text: content,
        images,
      },
    };
  }

  async *generateContentStream(
    merchantId: string,
    type: string,
    options: BuildPromptOptions = {},
  ): AsyncGenerator<{ event: string; data: any }> {
    const traceId = uuidv4();
    const startTime = Date.now();

    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new BadRequestException('商家不存在');
    }
    if (merchant.balance <= 0) {
      throw new BadRequestException('该商家额度已用完', '4001');
    }

    const images = await this.matchImages(merchantId, type, 6);
    yield { event: 'start', data: { trace_id: traceId, images } };

    const prompt = await this.promptBuilder.buildMerchantPrompt(merchant, type, options);
    let content = '';

    try {
      for await (const chunk of this.aiService.generateStream(prompt, type === 'note' ? 260 : 520)) {
        content += chunk;
        yield { event: 'content', data: { text: chunk } };
      }
    } catch (error) {
      console.error('AI流式生成失败:', error);
      throw new BadRequestException('AI服务异常', '4002');
    }

    if (await this.promptBuilder.containsSensitiveWords(content)) {
      throw new BadRequestException('内容优化中，请重试', '4003');
    }

    merchant.balance -= 1;
    await this.merchantRepository.save(merchant);

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

    yield {
      event: 'done',
      data: {
        trace_id: traceId,
        content: {
          text: content,
          images,
        },
        duration: Date.now() - startTime,
      },
    };
  }

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

  async publishCallback(data: {
    trace_id: string;
    merchant_id: string;
    platform: string;
    publish_url?: string;
    client_time?: string;
  }) {
    const generation = await this.generationRepository.findOne({
      where: { traceId: data.trace_id },
    });

    if (generation) {
      generation.feedback = `发布成功|${data.platform}|${data.publish_url || ''}`;
      await this.generationRepository.save(generation);
    }

    const log = this.analyticsRepository.create({
      merchantId: data.merchant_id,
      eventType: 'jump',
      traceId: data.trace_id,
      targetPlatform: data.platform,
    });
    await this.analyticsRepository.save(log);
  }

  private async findCoverImage(merchantId: string) {
    const image = await this.imageRepository.createQueryBuilder('image')
      .where('image.merchantId = :merchantId', { merchantId })
      .andWhere('image.isDeleted = 0')
      .andWhere('image.url IS NOT NULL')
      .andWhere("image.url != ''")
      .orderBy(
        `CASE image.tab WHEN 'environment' THEN 1 WHEN 'product' THEN 2 WHEN 'other' THEN 3 ELSE 4 END`,
        'ASC',
      )
      .addOrderBy('image.createdAt', 'DESC')
      .getOne();

    return image?.url || '';
  }

  private async findProductImages(merchantId: string, count: number) {
    const images = await this.imageRepository.find({
      where: { merchantId, tab: 'product', isDeleted: 0 as any },
      order: { createdAt: 'DESC' },
      take: count,
    });

    return images
      .filter(image => image.url)
      .map(image => ({
        url: image.url,
        product_tag: image.productTag || '',
        source: 'product',
      }));
  }

  private async matchImages(merchantId: string, type: string, count: number) {
    const preferredTab = type === 'note' ? 'product' : 'environment';
    const primary = await this.imageRepository.find({
      where: { merchantId, tab: preferredTab, isDeleted: 0 as any },
      order: { createdAt: 'DESC' },
      take: count,
    });

    const images = primary
      .filter(image => image.url)
      .map(image => ({
        url: image.url,
        source: image.tab,
        product_tag: image.productTag || '',
      }));

    if (images.length < count) {
      const fallback = await this.imageRepository.find({
        where: { merchantId, isDeleted: 0 as any },
        order: { createdAt: 'DESC' },
        take: count,
      });

      fallback.forEach(image => {
        if (images.length >= count) return;
        if (!image.url || images.some(item => item.url === image.url)) return;
        images.push({
          url: image.url,
          source: image.tab,
          product_tag: image.productTag || '',
        });
      });
    }

    return images;
  }
}
