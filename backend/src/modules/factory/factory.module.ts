import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactoryController } from './factory.controller';
import { FactoryService } from './factory.service';
import { PosterTemplate } from './poster-template.entity';
import { Poster } from './poster.entity';
import { Draft } from './draft.entity';
import { Merchant } from '../merchant/merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PosterTemplate, Poster, Draft, Merchant])],
  controllers: [FactoryController],
  providers: [FactoryService],
  exports: [FactoryService],
})
export class FactoryModule {}