import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('generate')
@UseGuards(JwtAuthGuard)
export class GeneratorController {
  constructor(private generatorService: GeneratorService) {}

  @Post('content')
  async generate(@Request() req, @Body() body: {
    merchant_id: string;
    type: string;
    options: any;
  }) {
    const data = await this.generatorService.generate(
      req.user.tenantId,
      body.merchant_id,
      body.type,
      body.options || {}
    );

    return {
      code: 200,
      data,
    };
  }

  @Post('review-preview')
  async previewReview(@Request() req, @Body() body: {
    merchant_id: string;
    options?: any;
  }) {
    const data = await this.generatorService.previewReview(
      req.user.tenantId,
      body.merchant_id,
      body.options || {},
    );

    return {
      code: 200,
      data,
    };
  }

  @Get('generations')
  async getGenerations(@Request() req, @Query() query: any) {
    return {
      code: 200,
      data: await this.generatorService.getGenerations(req.user.tenantId, query.merchant_id, query),
    };
  }

  @Post('generations/:id/feedback')
  async feedback(@Param('id') id: string, @Body() body: any) {
    return {
      code: 200,
      ...(await this.generatorService.feedback(parseInt(id), body)),
    };
  }
}
