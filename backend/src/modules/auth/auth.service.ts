import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Tenant } from './tenant.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private jwtService: JwtService,
  ) {}

  private async hashPassword(password?: string) {
    if (!password) {
      return null;
    }

    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(input: string, stored?: string | null) {
    if (!stored) {
      return false;
    }

    try {
      return await bcrypt.compare(input, stored);
    } catch {
      return input === stored;
    }
  }

  private buildLoginPayload(tenant: Tenant) {
    const token = this.jwtService.sign({ sub: tenant.id, tenantId: tenant.tenantId });

    return {
      token,
      company_id: tenant.tenantId,
      company_name: tenant.name,
      balance: tenant.balance,
      is_new: !tenant.password,
    };
  }

  async loginByPassword(account: string, password: string) {
    const tenant = await this.tenantRepository.findOne({
      where: [{ phone: account }, { name: account }],
    });

    if (!tenant || !await this.verifyPassword(password, tenant.password)) {
      throw new UnauthorizedException('账号或密码错误');
    }

    if (tenant.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    return this.buildLoginPayload(tenant);
  }

  async loginBySms(phone: string, code: string, isNew: boolean = false) {
    // TODO: 校验短信验证码
    void code;

    let tenant = await this.tenantRepository.findOne({ where: { phone } });

    if (!tenant && isNew) {
      tenant = this.tenantRepository.create({
        tenantId: uuidv4(),
        name: `用户${phone.slice(-4)}`,
        phone,
        password: null,
        balance: 0,
        status: 1,
      });
      await this.tenantRepository.save(tenant);
    }

    if (!tenant) {
      throw new UnauthorizedException('用户不存在');
    }

    return this.buildLoginPayload(tenant);
  }

  async register(data: {
    company_name: string;
    phone: string;
    password: string;
    code: string;
  }) {
    void data.code;

    if (!data.company_name?.trim()) {
      throw new BadRequestException('公司名称不能为空');
    }

    if (!data.phone?.trim()) {
      throw new BadRequestException('手机号不能为空');
    }

    if (!data.password || data.password.length < 6) {
      throw new BadRequestException('密码至少 6 位');
    }

    const exists = await this.tenantRepository.findOne({ where: { phone: data.phone.trim() } });
    if (exists) {
      throw new BadRequestException('该手机号已注册');
    }

    const tenant = this.tenantRepository.create({
      tenantId: uuidv4(),
      name: data.company_name.trim(),
      phone: data.phone.trim(),
      password: await this.hashPassword(data.password),
      balance: 0,
      totalQuota: 0,
      usedQuota: 0,
      status: 1,
      role: 'user',
      isAdmin: false,
    });

    await this.tenantRepository.save(tenant);

    return this.buildLoginPayload(tenant);
  }

  async sendSms(phone: string, type: string) {
    void phone;
    void type;
    return { message: '验证码已发送' };
  }

  async refresh(refreshToken: string) {
    void refreshToken;
    throw new BadRequestException('暂不支持');
  }

  async logout() {
    return { message: '退出成功' };
  }

  async validateToken(payload: any) {
    const tenant = await this.tenantRepository.findOne({ where: { id: payload.sub } });
    if (tenant) {
      return {
        id: tenant.id,
        tenantId: tenant.tenantId,
        name: tenant.name,
        role: tenant.role,
        isAdmin: tenant.isAdmin,
      };
    }

    return null;
  }
}
