import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { H5Service } from './h5.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('h5')
export class H5Controller {
  constructor(private h5Service: H5Service) {}

  /**
   * 获取商家H5配置
   * GET /h5/merchants/{id}/config
   */
  @Get('merchants/:id/config')
  async getMerchantConfig(@Param('id') merchantId: string) {
    const data = await this.h5Service.getMerchantConfig(merchantId);
    return {
      code: 200,
      data,
    };
  }

  /**
   * H5端AI生成
   * POST /h5/generate
   */
  @Post('generate')
  async generate(@Body() body: { merchant_id: string; type: string }) {
    const data = await this.h5Service.generateContent(body.merchant_id, body.type);
    return {
      code: 200,
      data,
    };
  }

  /**
   * 埋点上报
   * POST /h5/track
   */
  @Post('track')
  async track(@Body() body: {
    event: string;
    merchant_id: string;
    qr_id?: string;
    source?: string;
    type?: string;
    trace_id?: string;
    duration?: number;
    target_platform?: string;
    client_time?: string;
  }) {
    await this.h5Service.track(body);
    return {
      code: 200,
      message: 'ok',
    };
  }

  /**
   * 发布成功回调
   * POST /h5/publish-callback
   */
  @Post('publish-callback')
  async publishCallback(@Body() body: {
    trace_id: string;
    merchant_id: string;
    platform: string;
    publish_url?: string;
    client_time?: string;
  }) {
    await this.h5Service.publishCallback(body);
    return {
      code: 200,
      message: 'ok',
    };
  }
}