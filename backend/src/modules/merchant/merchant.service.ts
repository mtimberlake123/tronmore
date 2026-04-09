import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Merchant } from './merchant.entity';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  async findAll(tenantId: string, params: any) {
    const { page = 1, page_size = 20, sort_by = 'created_at', order = 'desc' } = params;

    const query = this.merchantRepository.createQueryBuilder('m')
      .where('m.tenantId = :tenantId', { tenantId });

    // 排序
    const sortFieldMap: Record<string, string> = {
      created: 'createdAt',
      created_at: 'createdAt',
      daily_active: 'createdAt',
      balance: 'balance',
      updated_at: 'updatedAt',
    };
    const sortField = sortFieldMap[sort_by] || 'createdAt';
    query.orderBy(`m.${sortField}`, order.toUpperCase() as 'ASC' | 'DESC');

    // 分页
    query.skip((page - 1) * page_size).take(page_size);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(m => this.formatMerchant(m)),
      total,
      page: Number(page),
      page_size: Number(page_size),
    };
  }

  async findOne(merchantId: string) {
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new NotFoundException('商家不存在');
    }
    return this.formatMerchant(merchant);
  }

  async create(tenantId: string, data: any) {
    const merchant = new Merchant();
    merchant.merchantId = uuidv4();
    merchant.tenantId = tenantId;
    Object.assign(merchant, data);
    await this.merchantRepository.save(merchant);
    return { id: merchant.merchantId };
  }

  async update(merchantId: string, data: any) {
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new NotFoundException('商家不存在');
    }

    // 处理location字段
    const { dy_url, wx_url, address, review_image_count, note_image_count, product_image_count, ...otherData } = data;
    if (dy_url !== undefined || wx_url !== undefined || address !== undefined) {
      merchant.location = {
        ...(merchant.location || {}),
        dy_url: dy_url || merchant.location?.dy_url || '',
        wx_url: wx_url || merchant.location?.wx_url || '',
        address: address || merchant.location?.address || '',
      };
    }

    // 处理图片数量设置
    if (review_image_count !== undefined) merchant.reviewImageCount = review_image_count;
    if (note_image_count !== undefined) merchant.noteImageCount = note_image_count;
    if (product_image_count !== undefined) merchant.productImageCount = product_image_count;

    Object.assign(merchant, otherData);
    await this.merchantRepository.save(merchant);
    return { message: '更新成功' };
  }

  async delete(merchantId: string) {
    await this.merchantRepository.delete({ merchantId });
    return { message: '删除成功' };
  }

  async transfer(merchantId: string, targetTenantId: string) {
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new NotFoundException('商家不存在');
    }
    merchant.tenantId = targetTenantId;
    await this.merchantRepository.save(merchant);
    return { message: '迁移成功' };
  }

  async copy(merchantId: string) {
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new NotFoundException('商家不存在');
    }
    const newMerchant = this.merchantRepository.create({
      ...merchant,
      id: undefined,
      merchantId: uuidv4(),
      name: `${merchant.name} (副本)`,
      createdAt: undefined,
      updatedAt: undefined,
    });
    await this.merchantRepository.save(newMerchant);
    return { id: newMerchant.merchantId };
  }

  async sort(sorts: { id: string; sort_index: number }[]) {
    for (const item of sorts) {
      await this.merchantRepository.update({ merchantId: item.id }, { sortIndex: item.sort_index });
    }
    return { message: '排序成功' };
  }

  async getBalance(merchantId: string) {
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new NotFoundException('商家不存在');
    }
    return {
      balance: merchant.balance,
      can_generate: merchant.balance > 0,
    };
  }

  private formatMerchant(m: Merchant) {
    const now = new Date();
    const createdDiff = now.getTime() - new Date(m.createdAt).getTime();
    const daysRemaining = m.expireDate
      ? Math.ceil((new Date(m.expireDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 365;

    let statusTag = 'normal';
    if (createdDiff < 24 * 60 * 60 * 1000) {
      statusTag = 'new';
    } else if (m.balance > 0 && m.balance < 10) {
      statusTag = 'low_balance';
    }

    return {
      id: m.merchantId,
      logo: m.logo,
      name: m.name,
      products: m.products || [],
      features: m.features || [],
      ai_prompt_ext: m.aiPromptExt || '',
      note_prompt_ext: m.notePromptExt || '',
      note_topic: m.noteTopic || '',
      note_copy: m.noteCopy || '',
      review_image_count: m.reviewImageCount,
      note_image_count: m.noteImageCount,
      product_image_count: m.productImageCount,
      dy_url: m.location?.dy_url || '',
      wx_url: m.location?.wx_url || '',
      address: m.location?.address || '',
      expire_date: m.expireDate,
      days_remaining: daysRemaining,
      balance: m.balance,
      balance_percent: m.balance > 0 ? Math.min(100, m.balance / 10) : 0,
      storage_used: m.storageUsed,
      storage_limit: m.storageLimit,
      status_tag: statusTag,
      created_at: m.createdAt,
    };
  }
}