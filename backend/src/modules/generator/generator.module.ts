import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratorController } from './generator.controller';
import { GeneratorService } from './generator.service';
import { Generation } from './generation.entity';
import { Merchant } from '../merchant/merchant.entity';
import { MerchantImage } from '../warehouse/merchant-image.entity';
import { AnalyticsLog } from '../analytics/analytics-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Generation, Merchant, MerchantImage, AnalyticsLog])],
  controllers: [GeneratorController],
  providers: [GeneratorService],
  exports: [GeneratorService],
})
export class GeneratorModule {}