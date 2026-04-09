import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferenceController } from './reference.controller';
import { ReferenceService } from './reference.service';
import { Reference } from './reference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reference])],
  controllers: [ReferenceController],
  providers: [ReferenceService],
  exports: [ReferenceService],
})
export class ReferenceModule {}