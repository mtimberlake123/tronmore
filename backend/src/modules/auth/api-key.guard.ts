import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少认证信息');
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    // Look up tenant by API key
    const tenant = await this.tenantRepository.findOne({
      where: { apiKey: token },
    });

    if (!tenant) {
      throw new UnauthorizedException('API Key无效');
    }

    if (tenant.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // Attach tenant info to request
    request.user = {
      id: tenant.id,
      tenantId: tenant.tenantId,
      name: tenant.name,
      role: tenant.role,
      isAdmin: tenant.isAdmin,
    };

    return true;
  }
}
