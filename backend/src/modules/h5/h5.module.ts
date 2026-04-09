import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { H5Controller } from './h5.controller';
import { H5Service } from './h5.service';
import { Merchant } from '../merchant/merchant.entity';
import { Generation } from '../generator/generation.entity';
import { AnalyticsLog } from '../analytics/analytics-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant, Generation, AnalyticsLog])],
  controllers: [H5Controller],
  providers: [H5Service],
  exports: [H5Service],
})
export class H5Module {}