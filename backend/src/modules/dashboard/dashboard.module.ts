import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AnalyticsLog } from '../analytics/analytics-log.entity';
import { Generation } from '../generator/generation.entity';
import { Merchant } from '../merchant/merchant.entity';
import { Tenant } from '../auth/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsLog, Generation, Merchant, Tenant])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}