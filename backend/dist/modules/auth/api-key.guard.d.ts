import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
export declare class ApiKeyGuard implements CanActivate {
    private tenantRepository;
    constructor(tenantRepository: Repository<Tenant>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
