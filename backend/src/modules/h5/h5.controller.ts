import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { H5Service } from './h5.service';

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
  async generate(@Body() body: {
    merchant_id: string;
    type: string;
    visitor_id?: string;
    generation_id?: string;
    recent_outputs?: string[];
  }) {
    const data = await this.h5Service.generateContent(body.merchant_id, body.type, {
      personaSeed: body.visitor_id,
      variationSeed: body.generation_id,
      recentOutputs: body.recent_outputs,
    });
    return {
      code: 200,
      data,
    };
  }

  /**
   * H5端AI流式生成
   * POST /h5/generate-stream
   */
  @Post('generate-stream')
  async generateStream(
    @Body() body: {
      merchant_id: string;
      type: string;
      visitor_id?: string;
      generation_id?: string;
      recent_outputs?: string[];
    },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      for await (const chunk of this.h5Service.generateContentStream(body.merchant_id, body.type, {
        personaSeed: body.visitor_id,
        variationSeed: body.generation_id,
        recentOutputs: body.recent_outputs,
      })) {
        send(chunk.event, chunk.data);
      }
    } catch (error) {
      const response = typeof error.getResponse === 'function' ? error.getResponse() : null;
      const message = typeof response === 'object' && response?.message
        ? response.message
        : error.message || '生成失败';
      send('error', {
        message,
        statusCode: error.status || response?.statusCode,
        code: message.includes('额度') ? '4001' : undefined,
      });
    } finally {
      res.end();
    }
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
