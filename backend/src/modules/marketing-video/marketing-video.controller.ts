import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MarketingVideoService } from './marketing-video.service';

@Controller('marketing-videos')
@UseGuards(JwtAuthGuard)
export class MarketingVideoController {
  constructor(private marketingVideoService: MarketingVideoService) {}

  @Get('types')
  async getTypes() {
    return { code: 200, data: await this.marketingVideoService.getTypes() };
  }

  @Get()
  async listProjects(@CurrentUser() user: any) {
    return {
      code: 200,
      data: await this.marketingVideoService.listProjects(user.tenantId),
    };
  }

  @Post()
  async createProject(
    @Body() body: { title?: string; type: string; merchant_id?: string },
    @CurrentUser() user: any,
  ) {
    return {
      code: 200,
      data: await this.marketingVideoService.createProject({
        tenantId: user.tenantId,
        title: body.title,
        type: body.type,
        merchantId: body.merchant_id,
      }),
    };
  }

  @Get(':id')
  async getProject(@Param('id') id: string, @CurrentUser() user: any) {
    return {
      code: 200,
      data: await this.marketingVideoService.getProject(id, user.tenantId),
    };
  }

  @Put(':id/steps/:stepKey')
  async updateStep(
    @Param('id') id: string,
    @Param('stepKey') stepKey: string,
    @Body() body: { input?: string; output?: string; status?: string },
    @CurrentUser() user: any,
  ) {
    return {
      code: 200,
      data: await this.marketingVideoService.updateStep(id, stepKey, user.tenantId, body),
    };
  }
}
