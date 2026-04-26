import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { SystemSetting } from '../admin/system-setting.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting])],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
