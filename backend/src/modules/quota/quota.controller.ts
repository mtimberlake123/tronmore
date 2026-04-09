import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { QuotaService } from './quota.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class QuotaController {
  constructor(private quotaService: QuotaService) {}

  @Post('merchants/:id/quota/allocate')
  async allocate(@Param('id') id: string, @Body() body: { amount: number }) {
    return {
      code: 200,
      ...(await this.quotaService.allocate(id, body.amount)),
    };
  }

  @Get('quota/logs')
  async getLogs(@Query() query: any) {
    return {
      code: 200,
      data: await this.quotaService.getLogs(query),
    };
  }
}