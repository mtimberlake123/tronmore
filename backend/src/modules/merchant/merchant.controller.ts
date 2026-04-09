import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as QRCode from 'qrcode';

@Controller('merchants')
@UseGuards(JwtAuthGuard)
export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  @Get()
  async list(@Request() req, @Query() query) {
    return {
      code: 200,
      data: await this.merchantService.findAll(req.user.tenantId, query),
    };
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return {
      code: 200,
      data: await this.merchantService.findOne(id),
    };
  }

  @Post()
  async create(@Request() req, @Body() body) {
    return {
      code: 200,
      data: await this.merchantService.create(req.user.tenantId, body),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body) {
    return {
      code: 200,
      ...(await this.merchantService.update(id, body)),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return {
      code: 200,
      ...(await this.merchantService.delete(id)),
    };
  }

  @Post(':id/transfer')
  async transfer(@Param('id') id: string, @Body() body: { target_company_id: string }) {
    return {
      code: 200,
      ...(await this.merchantService.transfer(id, body.target_company_id)),
    };
  }

  @Post(':id/copy')
  async copy(@Param('id') id: string) {
    return {
      code: 200,
      data: await this.merchantService.copy(id),
    };
  }

  @Put('sort')
  async sort(@Body() body: { sorts: { id: string; sort_index: number }[] }) {
    return {
      code: 200,
      ...(await this.merchantService.sort(body.sorts)),
    };
  }

  @Get(':id/balance')
  async balance(@Param('id') id: string) {
    return {
      code: 200,
      data: await this.merchantService.getBalance(id),
    };
  }

  @Get(':id/generations')
  async generations(@Param('id') id: string, @Query() query: any) {
    // TODO: 调用 GeneratorService 获取生成记录
    return {
      code: 200,
      data: { list: [], total: 0 },
    };
  }

  @Post(':id/qrcode')
  async generateQrcode(
    @Param('id') id: string,
    @Body() body: { shape?: string; ratio?: string; show_logo?: boolean }
  ) {
    const merchant = await this.merchantService.findOne(id);
    if (!merchant) {
      return { code: 404, message: '商家不存在' };
    }

    // 构建跳转URL
    const baseUrl = process.env.H5_BASE_URL || 'https://example.com/h5';
    const jumpUrl = `${baseUrl}/${id}`;

    // 生成二维码
    const qrOptions: QRCode.QRCodeToDataURLOptions = {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    };

    const qrImage = await QRCode.toDataURL(jumpUrl, qrOptions);

    return {
      code: 200,
      data: {
        qr_image: qrImage,
        jump_url: jumpUrl,
      },
    };
  }
}