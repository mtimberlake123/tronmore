import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantImage } from './merchant-image.entity';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(MerchantImage)
    private imageRepository: Repository<MerchantImage>,
  ) {}

  async checkStorage(merchantId: string) {
    const count = await this.imageRepository.count({
      where: { merchantId, isDeleted: 0 },
    });

    return {
      used: count,
      limit: 200,
      can_upload: count < 200,
    };
  }

  async upload(merchantId: string, url: string, tab: string, productTag?: string) {
    const image = this.imageRepository.create({
      merchantId,
      url,
      tab,
      productTag,
    });
    await this.imageRepository.save(image);

    return {
      id: image.id,
      url: image.url,
      tab: image.tab,
      product_tag: image.productTag,
    };
  }

  async list(merchantId: string, params: any) {
    const { tab, page = 1, page_size = 20 } = params;

    const query = this.imageRepository.createQueryBuilder('i')
      .where('i.merchantId = :merchantId', { merchantId })
      .andWhere('i.isDeleted = 0');

    if (tab) {
      query.andWhere('i.tab = :tab', { tab });
    }

    query.orderBy('i.createdAt', 'DESC');
    query.skip((page - 1) * page_size).take(page_size);

    const [list, total] = await query.getManyAndCount();

    return { list, total };
  }

  async delete(merchantId: string, imageId: number) {
    await this.imageRepository.update({ id: imageId, merchantId }, { isDeleted: 1 });
    return { message: '删除成功' };
  }

  async markAsUsed(imageIds: number[]) {
    await this.imageRepository
      .createQueryBuilder()
      .update()
      .set({ isUsed: 1, usedAt: new Date() })
      .whereInIds(imageIds)
      .execute();

    return { message: '已标记为使用' };
  }

  async batchCheck(merchantId: string) {
    // TODO: 集成图片检测服务（清晰度、水印检测）
    // 暂时返回空结果
    return { issues: [] };
  }
}