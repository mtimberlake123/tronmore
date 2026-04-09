import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // TODO: 完善角色权限系统
    // 当前实现：平台管理员使用独立的admin租户体系
    // 后续需要添加role字段到租户或创建独立的admin_users表
    if (user?.role === 'admin' || user?.isAdmin) {
      return true;
    }

    // 临时方案：检查是否是平台方管理员（通过特殊标记）
    // isAdmin flag will be added to tenant for platform admins
    if (user && (user.isAdmin === true || user.isPlatformAdmin === true)) {
      return true;
    }

    throw new ForbiddenException('需要管理员权限');
  }
}
