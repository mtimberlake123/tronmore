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

  async loginByPassword(account: string, password: string) {
    const tenant = await this.tenantRepository.findOne({
      where: [{ phone: account }, { name: account }],
    });

    if (!tenant || !await bcrypt.compare(password, tenant.password || '')) {
      throw new UnauthorizedException('账号或密码错误');
    }

    if (tenant.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const token = this.jwtService.sign({ sub: tenant.id, tenantId: tenant.tenantId });

    return {
      token,
      company_id: tenant.tenantId,
      company_name: tenant.name,
      balance: tenant.balance,
    };
  }

  async loginBySms(phone: string, code: string, isNew: boolean = false) {
    // TODO: 验证短信验证码
    // 暂时跳过验证码验证

    let tenant = await this.tenantRepository.findOne({ where: { phone } });

    if (!tenant && isNew) {
      // 创建新账号
      tenant = this.tenantRepository.create({
        tenantId: uuidv4(),
        name: `用户${phone.slice(-4)}`,
        phone,
        balance: 0,
        status: 1,
      });
      await this.tenantRepository.save(tenant);
    }

    if (!tenant) {
      throw new UnauthorizedException('用户不存在');
    }

    const token = this.jwtService.sign({ sub: tenant.id, tenantId: tenant.tenantId });

    return {
      token,
      company_id: tenant.tenantId,
      company_name: tenant.name,
      balance: tenant.balance,
      is_new: !tenant.password,
    };
  }

  async sendSms(phone: string, type: string) {
    // TODO: 集成短信服务
    // 暂时模拟发送成功
    return { message: '验证码已发送' };
  }

  async refresh(refreshToken: string) {
    // TODO: 实现token刷新
    throw new BadRequestException('暂不支持');
  }

  async logout() {
    // TODO: 实现登出逻辑（如将token加入黑名单）
    return { message: '登出成功' };
  }

  async validateToken(payload: any) {
    const tenant = await this.tenantRepository.findOne({ where: { id: payload.sub } });
    if (tenant) {
      // 返回用户信息，包含角色
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