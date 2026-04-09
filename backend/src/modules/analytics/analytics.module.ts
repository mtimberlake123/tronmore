import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsLog } from './analytics-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsLog])],
  exports: [TypeOrmModule],
})
export class AnalyticsModule {}