import { Controller, Post, Get, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { QuotaService } from './quota.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Controller()
export class QuotaController {
  constructor(private quotaService: QuotaService) {}

  @Get('chatfire/balance')
  @UseGuards(ApiKeyGuard)
  async getBalance(@Req() req: any) {
    const balance = await this.quotaService.getBalance(req.user);
    return {
      code: 200,
      message: 'success',
      data: {
        balance: balance.balance,
        total_quota: balance.total_quota,
        used_quota: balance.used_quota,
      },
      timestamp: Math.floor(Date.now() / 1000),
      success: true,
    };
  }

  @Post('merchants/:id/quota/allocate')
  @UseGuards(JwtAuthGuard)
  async allocate(@Param('id') id: string, @Body() body: { amount: number }) {
    return {
      code: 200,
      ...(await this.quotaService.allocate(id, body.amount)),
    };
  }

  @Get('quota/logs')
  @UseGuards(JwtAuthGuard)
  async getLogs(@Query() query: any) {
    return {
      code: 200,
      data: await this.quotaService.getLogs(query),
    };
  }
}