import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuotaLog } from './quota-log.entity';
import { Merchant } from '../merchant/merchant.entity';
import { Tenant } from '../auth/tenant.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuotaService {
  constructor(
    @InjectRepository(QuotaLog)
    private quotaLogRepository: Repository<QuotaLog>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * 额度分配（营销公司 → 商家）
   */
  async allocate(merchantId: string, amount: number, operatorId?: string) {
    // 1. 检查商家是否存在
    const merchant = await this.merchantRepository.findOne({
      where: { merchantId },
    });
    if (!merchant) {
      throw new BadRequestException('商家不存在');
    }

    // 2. 检查营销公司余额
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId: merchant.tenantId },
    });
    if (!tenant) {
      throw new BadRequestException('营销公司不存在');
    }

    if (tenant.balance < amount) {
      throw new BadRequestException('营销公司额度不足');
    }

    // 3. 记录操作事务
    const transactionId = uuidv4();
    const beforeMerchant = merchant.balance;
    const beforeTenant = tenant.balance;

    // 4. 扣除营销公司额度
    tenant.balance -= amount;
    tenant.usedQuota += amount;
    await this.tenantRepository.save(tenant);

    // 5. 增加商家额度
    merchant.balance += amount;
    await this.merchantRepository.save(merchant);

    // 6. 记录额度日志（租户侧）
    const tenantLog = this.quotaLogRepository.create({
      tenantId: merchant.tenantId,
      merchantId,
      type: 'allocate',
      amount: -amount,
      balance: tenant.balance,
      remark: `分配给商家 ${merchant.name}`,
      operatorId,
    });
    await this.quotaLogRepository.save(tenantLog);

    // 7. 记录额度日志（商家侧）
    const merchantLog = this.quotaLogRepository.create({
      tenantId: merchant.tenantId,
      merchantId,
      type: 'allocate',
      amount: amount,
      balance: merchant.balance,
      remark: `由营销公司 ${tenant.name} 分配`,
    });
    await this.quotaLogRepository.save(merchantLog);

    return {
      merchant_id: merchantId,
      before: beforeMerchant,
      after: merchant.balance,
      transaction_id: transactionId,
    };
  }

  /**
   * 额度记录查询
   */
  async getLogs(params: {
    merchant_id?: string;
    type?: string;
    page?: number;
    page_size?: number;
    tenantId?: string;
  }) {
    const { merchant_id, type, page = 1, page_size = 20, tenantId } = params;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;

    // 限制 page_size 最大值
    const safePageSize = Math.min(pageSizeNum || 20, 100);

    const query = this.quotaLogRepository.createQueryBuilder('log')
      .where('log.tenantId = :tenantId', { tenantId });

    if (merchant_id) {
      query.andWhere('log.merchantId = :merchant_id', { merchant_id });
    }

    if (type) {
      query.andWhere('log.type = :type', { type });
    }

    query.orderBy('log.createdAt', 'DESC');
    query.skip((pageNum - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    // 获取商家名称
    const merchantIds = [...new Set(list.filter(l => l.merchantId).map(l => l.merchantId))];
    const merchants = merchantIds.length > 0 ? await this.merchantRepository
      .createQueryBuilder('m')
      .select(['m.merchantId', 'm.name'])
      .where('m.merchantId IN (:...ids)', { ids: merchantIds })
      .getRawMany() : [];
    const merchantMap = new Map(merchants.map(m => [m.merchantId, m.name]));

    const formattedList = list.map(log => ({
      id: log.id.toString(),
      merchant_id: log.merchantId,
      merchant_name: merchantMap.get(log.merchantId) || '',
      type: log.type,
      amount: log.amount,
      balance: log.balance,
      created_at: log.createdAt,
    }));

    return {
      list: formattedList,
      total,
    };
  }

  /**
   * 获取租户余额
   */
  async getBalance(user: any) {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId: user.tenantId },
    });
    if (!tenant) {
      throw new BadRequestException('账号不存在');
    }

    return {
      balance: tenant.balance,
      total_quota: tenant.totalQuota,
      used_quota: tenant.usedQuota,
    };
  }

  /**
   * 消费额度（生成内容时调用）
   */
  async consume(merchantId: string, amount: number = 1) {
    const merchant = await this.merchantRepository.findOne({
      where: { merchantId },
    });
    if (!merchant) {
      throw new BadRequestException('商家不存在');
    }

    if (merchant.balance < amount) {
      throw new BadRequestException('商家额度不足');
    }

    const before = merchant.balance;
    merchant.balance -= amount;
    await this.merchantRepository.save(merchant);

    // 记录消费日志
    const log = this.quotaLogRepository.create({
      tenantId: merchant.tenantId,
      merchantId,
      type: 'consume',
      amount: -amount,
      balance: merchant.balance,
      remark: 'AI生成内容消耗',
    });
    await this.quotaLogRepository.save(log);

    return { before, after: merchant.balance };
  }
}