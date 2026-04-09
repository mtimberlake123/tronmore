import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotaController } from './quota.controller';
import { QuotaService } from './quota.service';
import { QuotaLog } from './quota-log.entity';
import { Merchant } from '../merchant/merchant.entity';
import { Tenant } from '../auth/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuotaLog, Merchant, Tenant])],
  controllers: [QuotaController],
  providers: [QuotaService],
  exports: [QuotaService],
})
export class QuotaModule {}