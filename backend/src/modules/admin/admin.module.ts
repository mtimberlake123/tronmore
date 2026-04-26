import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Tenant } from '../auth/tenant.entity';
import { Merchant } from '../merchant/merchant.entity';
import { PromptTemplate } from './prompt-template.entity';
import { SensitiveWord } from './sensitive-word.entity';
import { AiAgentConfig } from './ai-agent-config.entity';
import { AiSkill } from './ai-skill.entity';
import { SystemSetting } from './system-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Merchant, PromptTemplate, SensitiveWord, AiAgentConfig, AiSkill, SystemSetting])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
