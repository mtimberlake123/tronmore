import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Tenant } from '../auth/tenant.entity';
import { PromptTemplate } from './prompt-template.entity';
import { SensitiveWord } from './sensitive-word.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, PromptTemplate, SensitiveWord])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}