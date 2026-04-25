import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptTemplate } from '../admin/prompt-template.entity';
import { SensitiveWord } from '../admin/sensitive-word.entity';
import { PromptBuilderService } from './prompt-builder.service';

@Module({
  imports: [TypeOrmModule.forFeature([PromptTemplate, SensitiveWord])],
  providers: [PromptBuilderService],
  exports: [PromptBuilderService],
})
export class PromptBuilderModule {}
