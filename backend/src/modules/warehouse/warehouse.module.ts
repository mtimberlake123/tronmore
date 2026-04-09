import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { MerchantImage } from './merchant-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MerchantImage])],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService, TypeOrmModule],
})
export class WarehouseModule {}