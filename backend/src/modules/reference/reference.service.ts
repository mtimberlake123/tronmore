import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Reference } from './reference.entity';

@Injectable()
export class ReferenceService {
  constructor(
    @InjectRepository(Reference)
    private referenceRepository: Repository<Reference>,
  ) {}

  /**
   * 创建参考笔记
   */
  async createNote(data: {
    content: string;
    style?: string;
    source?: string;
    tags?: string[];
    tenantId: string;
  }) {
    const refId = uuidv4();

    const reference = this.referenceRepository.create({
      refId,
      type: 'note',
      content: data.content,
      style: data.style || 'friendly',
      source: data.source,
      tags: data.tags,
      tenantId: data.tenantId,
    });
    await this.referenceRepository.save(reference);

    return {
      id: refId,
      type: 'note',
      content: reference.content,
      style: reference.style,
      source: reference.source,
      tags: reference.tags,
      created_at: reference.createdAt,
    };
  }

  /**
   * 参考笔记列表
   */
  async getNotes(params: {
    tenantId: string;
    style?: string;
    page?: number;
    page_size?: number;
  }) {
    const { tenantId, style, page = 1, page_size = 20 } = params;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
    const safePageSize = Math.min(pageSizeNum || 20, 100);

    const query = this.referenceRepository.createQueryBuilder('r')
      .where('r.tenantId = :tenantId', { tenantId })
      .andWhere('r.type = :type', { type: 'note' });

    if (style) {
      query.andWhere('r.style = :style', { style });
    }

    query.orderBy('r.createdAt', 'DESC');
    query.skip((pageNum - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(r => ({
        id: r.refId,
        content: r.content,
        style: r.style,
        source: r.source,
        tags: r.tags,
        created_at: r.createdAt,
      })),
      total,
    };
  }

  /**
   * 创建参考评价
   */
  async createReview(data: {
    content: string;
    style?: string;
    source?: string;
    tenantId: string;
  }) {
    const refId = uuidv4();

    const reference = this.referenceRepository.create({
      refId,
      type: 'review',
      content: data.content,
      style: data.style || 'professional',
      source: data.source,
      tenantId: data.tenantId,
    });
    await this.referenceRepository.save(reference);

    return {
      id: refId,
      type: 'review',
      content: reference.content,
      style: reference.style,
      source: reference.source,
      created_at: reference.createdAt,
    };
  }

  /**
   * 参考评价列表
   */
  async getReviews(params: {
    tenantId: string;
    style?: string;
    page?: number;
    page_size?: number;
  }) {
    const { tenantId, style, page = 1, page_size = 20 } = params;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
    const safePageSize = Math.min(pageSizeNum || 20, 100);

    const query = this.referenceRepository.createQueryBuilder('r')
      .where('r.tenantId = :tenantId', { tenantId })
      .andWhere('r.type = :type', { type: 'review' });

    if (style) {
      query.andWhere('r.style = :style', { style });
    }

    query.orderBy('r.createdAt', 'DESC');
    query.skip((pageNum - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(r => ({
        id: r.refId,
        content: r.content,
        style: r.style,
        source: r.source,
        created_at: r.createdAt,
      })),
      total,
    };
  }
}
