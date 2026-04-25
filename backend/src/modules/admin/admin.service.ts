import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Tenant } from '../auth/tenant.entity';
import { Merchant } from '../merchant/merchant.entity';
import { PromptTemplate } from './prompt-template.entity';
import { SensitiveWord } from './sensitive-word.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(PromptTemplate)
    private promptRepository: Repository<PromptTemplate>,
    @InjectRepository(SensitiveWord)
    private sensitiveRepository: Repository<SensitiveWord>,
  ) {}

  /**
   * 营销公司列表
   */
  async getCompanies(params: {
    page?: number;
    page_size?: number;
    keyword?: string;
  }) {
    const { page = 1, page_size = 20, keyword } = params;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
    const safePageSize = Math.min(pageSizeNum || 20, 100);

    const query = this.tenantRepository.createQueryBuilder('t');

    if (keyword) {
      query.where('t.name LIKE :keyword OR t.phone LIKE :keyword', { keyword: `%${keyword}%` });
    }

    query.orderBy('t.createdAt', 'DESC');
    query.skip((pageNum - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    // Query merchant counts and remaining merchant quota per tenant.
    const tenantIds = list.map(t => t.tenantId);
    let countMap: Record<string, number> = {};
    let merchantBalanceMap: Record<string, number> = {};
    if (tenantIds.length > 0) {
      const merchantCounts = await this.merchantRepository
        .createQueryBuilder('m')
        .select('m.tenantId', 'tenantId')
        .addSelect('COUNT(*)', 'count')
        .addSelect('COALESCE(SUM(m.balance), 0)', 'merchantBalance')
        .where('m.tenantId IN (:...tenantIds)', { tenantIds })
        .groupBy('m.tenantId')
        .getRawMany();

      merchantCounts.forEach(mc => {
        countMap[mc.tenantId] = parseInt(mc.count);
        merchantBalanceMap[mc.tenantId] = Number(mc.merchantBalance || 0);
      });
    }

    return {
      list: list.map(t => ({
        company_id: t.tenantId,
        name: t.name,
        phone: t.phone,
        balance: t.balance,
        company_balance: t.balance,
        merchant_balance: merchantBalanceMap[t.tenantId] || 0,
        total_remaining: t.balance + (merchantBalanceMap[t.tenantId] || 0),
        total_quota: t.totalQuota,
        used_quota: t.usedQuota,
        allocated_quota: t.usedQuota,
        unallocated_quota: t.balance,
        status: t.status,
        created_at: t.createdAt,
        merchants: countMap[t.tenantId] || 0,
      })),
      total,
    };
  }

  /**
   * 创建营销公司
   */
  async createCompany(data: {
    name: string;
    phone: string;
    password?: string;
  }) {
    // 检查手机号是否已存在
    const exists = await this.tenantRepository.findOne({ where: { phone: data.phone } });
    if (exists) {
      throw new BadRequestException('该手机号已注册');
    }

    const tenantId = uuidv4();

    const tenant = this.tenantRepository.create({
      tenantId,
      name: data.name,
      phone: data.phone,
      password: data.password, // 实际应该加密
      balance: 0,
      totalQuota: 0,
      usedQuota: 0,
      status: 1,
    });
    await this.tenantRepository.save(tenant);

    return {
      company_id: tenantId,
      name: tenant.name,
    };
  }

  /**
   * 充值
   */
  async recharge(companyId: string, data: {
    amount: number;
    package?: string;
    package_name?: string;
  }) {
    const tenant = await this.tenantRepository.findOne({
      where: [
        { tenantId: companyId },
        ...(Number.isInteger(Number(companyId)) ? [{ id: Number(companyId) }] : []),
      ],
    });
    if (!tenant) {
      throw new NotFoundException('营销公司不存在');
    }

    if (data.amount <= 0) {
      throw new BadRequestException('充值金额必须大于0');
    }

    const before = tenant.balance;
    tenant.balance += data.amount;
    tenant.totalQuota += data.amount;
    await this.tenantRepository.save(tenant);

    return {
      company_id: tenant.tenantId,
      before,
      after: tenant.balance,
      amount: data.amount,
      package: data.package,
    };
  }

  /**
   * 获取Prompt模板列表
   */
  async getPromptTemplates(params: {
    industry?: string;
    style?: string;
    page?: number;
    page_size?: number;
  }) {
    const { industry, style, page = 1, page_size = 20 } = params;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
    const safePageSize = Math.min(pageSizeNum || 20, 100);

    const query = this.promptRepository.createQueryBuilder('p');

    if (industry) {
      query.andWhere('p.industry = :industry', { industry });
    }

    if (style) {
      query.andWhere('p.style = :style', { style });
    }

    query.orderBy('p.createdAt', 'DESC');
    query.skip((pageNum - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(p => ({
        id: p.templateId,
        industry: p.industry,
        style: p.style,
        content: p.content,
        version: p.version,
        is_active: p.isActive,
      })),
      total,
    };
  }

  /**
   * 创建Prompt模板
   */
  async createPromptTemplate(data: {
    industry: string;
    style: string;
    content: string;
  }) {
    const templateId = uuidv4();

    const template = this.promptRepository.create({
      templateId,
      industry: data.industry,
      style: data.style,
      content: data.content,
      version: 1,
      isActive: true,
    });
    await this.promptRepository.save(template);

    return {
      id: templateId,
      industry: template.industry,
      style: template.style,
      content: template.content,
      version: template.version,
    };
  }

  /**
   * 更新Prompt模板
   */
  async updatePromptTemplate(templateId: string, data: {
    content?: string;
    is_active?: boolean;
  }) {
    const template = await this.promptRepository.findOne({ where: { templateId } });
    if (!template) {
      throw new NotFoundException('模板不存在');
    }

    if (data.content) {
      template.content = data.content;
      template.version += 1;
    }
    if (data.is_active !== undefined) {
      template.isActive = data.is_active;
    }
    await this.promptRepository.save(template);

    return {
      id: template.templateId,
      content: template.content,
      version: template.version,
      is_active: template.isActive,
    };
  }

  /**
   * 获取启用的风险规则
   */
  async getActiveRules(): Promise<SensitiveWord[]> {
    return this.sensitiveRepository.find({ where: { active: true } });
  }

  /**
   * 获取敏感词列表
   */
  async getSensitiveWords(params: {
    category?: string;
    level?: number;
    page?: number;
    page_size?: number;
  }) {
    const { category, level, page = 1, page_size = 20 } = params;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
    const safePageSize = Math.min(pageSizeNum || 20, 100);

    const query = this.sensitiveRepository.createQueryBuilder('s');

    if (category) {
      query.andWhere('s.category = :category', { category });
    }

    if (level) {
      query.andWhere('s.level = :level', { level });
    }

    query.orderBy('s.createdAt', 'DESC');
    query.skip((pageNum - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    return {
      list: list.map(s => ({
        id: s.id,
        word: s.word,
        category: s.category,
        level: s.level,
        rule: s.rule || '',
        active: s.active !== false,
        paramName: s.paramName || '',
        created_at: s.createdAt,
      })),
      total,
    };
  }

  /**
   * 添加敏感词/风险规则
   */
  async createSensitiveWord(data: {
    word: string;
    category: string;
    level?: number;
    rule?: string;
    active?: boolean;
    paramName?: string;
  }) {
    // 检查是否已存在
    const exists = await this.sensitiveRepository.findOne({ where: { word: data.word } });
    if (exists) {
      throw new BadRequestException('该敏感词已存在');
    }

    const word = this.sensitiveRepository.create({
      word: data.word,
      category: data.category,
      level: data.level || 1,
      rule: data.rule || '',
      active: data.active !== false,
      paramName: data.paramName || '',
    });
    await this.sensitiveRepository.save(word);

    return {
      id: word.id,
      word: word.word,
      category: word.category,
      level: word.level,
      rule: word.rule || '',
      active: word.active,
      paramName: word.paramName || '',
    };
  }

  /**
   * 删除敏感词
   */
  async deleteSensitiveWord(id: number) {
    const word = await this.sensitiveRepository.findOne({ where: { id } });
    if (!word) {
      throw new NotFoundException('敏感词不存在');
    }

    await this.sensitiveRepository.remove(word);
    return { message: '删除成功' };
  }

  /**
   * 更新敏感词/风险规则
   */
  async updateSensitiveWord(id: number, data: {
    word?: string;
    category?: string;
    level?: number;
    rule?: string;
    active?: boolean;
    paramName?: string;
  }) {
    const word = await this.sensitiveRepository.findOne({ where: { id } });
    if (!word) {
      throw new NotFoundException('规则不存在');
    }

    if (data.word !== undefined) word.word = data.word;
    if (data.category !== undefined) word.category = data.category;
    if (data.level !== undefined) word.level = data.level;
    if (data.rule !== undefined) word.rule = data.rule;
    if (data.active !== undefined) word.active = data.active;
    if (data.paramName !== undefined) word.paramName = data.paramName;

    await this.sensitiveRepository.save(word);

    return {
      id: word.id,
      word: word.word,
      category: word.category,
      level: word.level,
      rule: word.rule || '',
      active: word.active,
      paramName: word.paramName || '',
    };
  }

  /**
   * 创建子账号
   */
  async createSubAccount(companyId: string, data: {
    username: string;
    role: string;
    password?: string;
  }) {
    // TODO: 实现子账号创建逻辑
    // 需要创建 admin_users 表来存储子账号
    // 当前返回占位响应
    return {
      message: '子账号功能待实现',
      company_id: companyId,
      username: data.username,
      role: data.role,
    };
  }

  /**
   * 获取商家列表
   */
  async getMerchants(params: {
    tenantId?: string;
    page?: number;
    page_size?: number;
  }) {
    const { tenantId, page = 1, page_size = 20 } = params;
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
    const safePageSize = Math.min(pageSizeNum || 20, 100);

    const query = this.merchantRepository.createQueryBuilder('m');

    if (tenantId) {
      query.where('m.tenantId = :tenantId', { tenantId });
    }

    query.orderBy('m.createdAt', 'DESC');
    query.skip((pageNum - 1) * safePageSize).take(safePageSize);

    const [list, total] = await query.getManyAndCount();

    // 获取公司名称
    const tenantIds = [...new Set(list.map(m => m.tenantId))];
    let tenantMap: Record<string, string> = {};
    if (tenantIds.length > 0) {
      const tenants = await this.tenantRepository
        .createQueryBuilder('t')
        .select(['t.tenantId', 't.name'])
        .where('t.tenantId IN (:...ids)', { ids: tenantIds })
        .getRawMany();
      tenants.forEach(t => { tenantMap[t.tenantId] = t.name; });
    }

    return {
      list: list.map(m => ({
        id: m.merchantId,
        name: m.name,
        tenantId: m.tenantId,
        companyName: tenantMap[m.tenantId] || '',
        balance: m.balance,
        created_at: m.createdAt,
      })),
      total,
    };
  }

  /**
   * 删除商家
   */
  async deleteMerchant(merchantId: string) {
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new NotFoundException('商家不存在');
    }
    await this.merchantRepository.remove(merchant);
    return { message: '删除成功' };
  }

  /**
   * 迁移商家
   */
  async transferMerchant(merchantId: string, targetTenantId: string) {
    const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
    if (!merchant) {
      throw new NotFoundException('商家不存在');
    }

    const targetTenant = await this.tenantRepository.findOne({ where: { tenantId: targetTenantId } });
    if (!targetTenant) {
      throw new NotFoundException('目标公司不存在');
    }

    merchant.tenantId = targetTenantId;
    await this.merchantRepository.save(merchant);

    return {
      message: '迁移成功',
      merchant_id: merchantId,
      from_tenant: merchant.tenantId,
      to_tenant: targetTenantId,
    };
  }
}
