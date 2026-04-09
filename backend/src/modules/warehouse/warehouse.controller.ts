import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('merchants/:merchantId')
@UseGuards(JwtAuthGuard)
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Get('storage/check')
  async checkStorage(@Param('merchantId') merchantId: string) {
    return {
      code: 200,
      data: await this.warehouseService.checkStorage(merchantId),
    };
  }

  @Post('images')
  async upload(
    @Param('merchantId') merchantId: string,
    @Body() body: { url: string; tab: string; product_tag?: string }
  ) {
    return {
      code: 200,
      data: await this.warehouseService.upload(merchantId, body.url, body.tab, body.product_tag),
    };
  }

  @Get('images')
  async list(@Param('merchantId') merchantId: string, @Query() query: any) {
    return {
      code: 200,
      data: await this.warehouseService.list(merchantId, query),
    };
  }

  @Delete('images/:imageId')
  async delete(@Param('merchantId') merchantId: string, @Param('imageId') imageId: string) {
    return {
      code: 200,
      ...(await this.warehouseService.delete(merchantId, parseInt(imageId))),
    };
  }

  @Post('images/batch-check')
  async batchCheck(@Param('merchantId') merchantId: string) {
    return {
      code: 200,
      data: await this.warehouseService.batchCheck(merchantId),
    };
  }

  @Put('image-settings')
  async settings(@Param('merchantId') merchantId: string, @Body() body: any) {
    // TODO: 保存图片设置
    return { code: 200, message: '设置已保存' };
  }
}