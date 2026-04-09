import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PosterTemplate } from './poster-template.entity';
import { Poster } from './poster.entity';
import { Draft } from './draft.entity';
import { Merchant } from '../merchant/merchant.entity';

@Injectable()
export class FactoryService {
  constructor(
    @InjectRepository(PosterTemplate)
    private templateRepository: Repository<PosterTemplate>,
    @InjectRepository(Poster)
    private posterRepository: Repository<Poster>,
    @InjectRepository(Draft)
    private draftRepository: Repository<Draft>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  /**
   * 海报模板列表
   */
  async getTemplates(params: {
    category?: string;
    scene?: string;
    page?: number;
    page_size?: number;
  }) {
    const { category, scene, page = 1, page_size = 20 } = params;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
    const safePageSize = Math.min(pageSizeNum || 20, 100);

    const query = this.templateRepository.createQueryBuilder('t')
      .where('t.isActive = :isActive', { isActive: true });

    if (category) {
      query.andWhere('t.category = :category', { category });
    }

    if (scene) {
      query.andWhere('t.scene = :scene', { scene });
    }

    query.orderBy('t.createdAt', 'DESC');
    query.skip((pageNum - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        scene: t.scene,
        thumbnail_url: t.thumbnailUrl,
        template_url: t.templateUrl,
      })),
      total,
    };
  }

  /**
   * 创建海报
   */
  async createPoster(data: {
    template_id: number;
    customizations: {
      text?: string;
      image?: string;
      background?: string;
    };
    merchant_id: string;
    tenantId: string;
  }) {
    const { template_id, customizations, merchant_id, tenantId } = data;

    // 检查模板是否存在
    const template = await this.templateRepository.findOne({ where: { id: template_id } });
    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    // 检查商家是否存在
    const merchant = await this.merchantRepository.findOne({ where: { merchantId: merchant_id } });
    if (!merchant) {
      throw new NotFoundException('商家不存在');
    }

    const posterId = uuidv4();

    // 创建海报记录
    const poster = this.posterRepository.create({
      posterId,
      templateId: template_id,
      merchantId: merchant_id,
      tenantId,
      customizations,
      status: 'generating',
    });
    await this.posterRepository.save(poster);

    // TODO: 调用图片合成服务生成海报
    // 模拟生成完成
    const imageUrl = await this.generatePosterImage(template, customizations, merchant);

    // 更新海报状态和URL
    poster.status = 'completed';
    poster.imageUrl = imageUrl;
    await this.posterRepository.save(poster);

    return {
      id: posterId,
      image_url: imageUrl,
    };
  }

  /**
   * 保存草稿
   */
  async saveDraft(data: {
    type: string;
    content: any;
    merchant_id: string;
    tenantId: string;
    template_id?: number;
  }) {
    const { type, content, merchant_id, tenantId, template_id } = data;

    const draftId = uuidv4();

    const draft = this.draftRepository.create({
      draftId,
      type,
      content,
      merchantId: merchant_id,
      tenantId,
      templateId: template_id,
    });
    await this.draftRepository.save(draft);

    return {
      id: draftId,
    };
  }

  /**
   * 草稿列表
   */
  async getDrafts(params: {
    tenantId: string;
    type?: string;
    merchant_id?: string;
    page?: number;
    page_size?: number;
  }) {
    const { tenantId, type, merchant_id, page = 1, page_size = 20 } = params;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
    const safePageSize = Math.min(pageSizeNum || 20, 100);

    const query = this.draftRepository.createQueryBuilder('d')
      .where('d.tenantId = :tenantId', { tenantId });

    if (type) {
      query.andWhere('d.type = :type', { type });
    }

    if (merchant_id) {
      query.andWhere('d.merchantId = :merchant_id', { merchant_id });
    }

    query.orderBy('d.updatedAt', 'DESC');
    query.skip((pageNum - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    // 获取商家名称
    const merchantIds = [...new Set(list.map(d => d.merchantId))];
    const merchants = merchantIds.length > 0 ? await this.merchantRepository
      .createQueryBuilder('m')
      .select(['m.merchantId', 'm.name'])
      .where('m.merchantId IN (:...ids)', { ids: merchantIds })
      .getRawMany() : [];
    const merchantMap = new Map(merchants.map(m => [m.merchantId, m.name]));

    return {
      list: list.map(d => ({
        id: d.draftId,
        type: d.type,
        merchant_id: d.merchantId,
        merchant_name: merchantMap.get(d.merchantId) || '',
        content: d.content,
        template_id: d.templateId,
        updated_at: d.updatedAt,
      })),
      total,
    };
  }

  /**
   * 获取草稿详情
   */
  async getDraft(draftId: string, tenantId: string) {
    const draft = await this.draftRepository.findOne({
      where: { draftId, tenantId },
    });
    if (!draft) {
      throw new NotFoundException('草稿不存在');
    }
    return {
      id: draft.draftId,
      type: draft.type,
      content: draft.content,
      merchant_id: draft.merchantId,
      template_id: draft.templateId,
      created_at: draft.createdAt,
      updated_at: draft.updatedAt,
    };
  }

  /**
   * 更新草稿
   */
  async updateDraft(draftId: string, tenantId: string, data: { content?: any; template_id?: number }) {
    const draft = await this.draftRepository.findOne({
      where: { draftId, tenantId },
    });
    if (!draft) {
      throw new NotFoundException('草稿不存在');
    }

    if (data.content) {
      draft.content = data.content;
    }
    if (data.template_id) {
      draft.templateId = data.template_id;
    }
    await this.draftRepository.save(draft);

    return { message: '更新成功' };
  }

  /**
   * 删除草稿
   */
  async deleteDraft(draftId: string, tenantId: string) {
    const draft = await this.draftRepository.findOne({
      where: { draftId, tenantId },
    });
    if (!draft) {
      throw new NotFoundException('草稿不存在');
    }

    await this.draftRepository.remove(draft);
    return { message: '删除成功' };
  }

  /**
   * 批量分发海报
   */
  async batchDistribute(data: {
    poster_id: string;
    merchant_ids: string[];
    tenantId: string;
  }) {
    const { poster_id, merchant_ids, tenantId } = data;

    // 检查海报是否存在
    const poster = await this.posterRepository.findOne({
      where: { posterId: poster_id, tenantId },
    });
    if (!poster) {
      throw new NotFoundException('海报不存在');
    }

    // TODO: 实际批量分发逻辑（如：生成每个商家的专属海报并发送通知）
    // 模拟返回分发结果
    const results = merchant_ids.map(merchantId => ({
      merchant_id: merchantId,
      status: 'pending',
    }));

    return {
      total: merchant_ids.length,
      results,
    };
  }

  /**
   * 生成海报图片（模拟）
   */
  private async generatePosterImage(template: PosterTemplate, customizations: any, merchant: Merchant): Promise<string> {
    // TODO: 集成图片合成服务
    // 当前返回占位图
    return `https://via.placeholder.com/${template.config?.width || 400}x${template.config?.height || 600}?text=${encodeURIComponent(merchant.name)}`;
  }
}
