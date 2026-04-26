import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingVideoController } from './marketing-video.controller';
import { MarketingVideoService } from './marketing-video.service';
import { MarketingVideoProject } from './marketing-video-project.entity';
import { MarketingVideoStep } from './marketing-video-step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarketingVideoProject, MarketingVideoStep])],
  controllers: [MarketingVideoController],
  providers: [MarketingVideoService],
  exports: [MarketingVideoService],
})
export class MarketingVideoModule {}
