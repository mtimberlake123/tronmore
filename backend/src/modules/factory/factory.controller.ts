import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FactoryService } from './factory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class FactoryController {
  constructor(private factoryService: FactoryService) {}

  /**
   * 海报模板列表
   * GET /poster/templates
   */
  @Get('poster/templates')
  async getTemplates(@Query() query: {
    category?: string;
    scene?: string;
    page?: number;
    page_size?: number;
  }) {
    return {
      code: 200,
      data: await this.factoryService.getTemplates(query),
    };
  }

  /**
   * 创建海报
   * POST /posters
   */
  @Post('posters')
  async createPoster(
    @Body() body: {
      template_id: number;
      customizations: { text?: string; image?: string; background?: string };
      merchant_id: string;
    },
    @CurrentUser() user: any,
  ) {
    const data = await this.factoryService.createPoster({
      ...body,
      tenantId: user.tenantId,
    });
    return { code: 200, data };
  }

  /**
   * 保存草稿
   * POST /drafts
   */
  @Post('drafts')
  async saveDraft(
    @Body() body: {
      type: string;
      content: any;
      merchant_id: string;
      template_id?: number;
    },
    @CurrentUser() user: any,
  ) {
    const data = await this.factoryService.saveDraft({
      ...body,
      tenantId: user.tenantId,
    });
    return { code: 200, data };
  }

  /**
   * 草稿列表
   * GET /drafts
   */
  @Get('drafts')
  async getDrafts(@Query() query: {
    type?: string;
    merchant_id?: string;
    page?: number;
    page_size?: number;
  }, @CurrentUser() user: any) {
    return {
      code: 200,
      data: await this.factoryService.getDrafts({
        ...query,
        tenantId: user.tenantId,
      }),
    };
  }

  /**
   * 获取草稿详情
   * GET /drafts/:id
   */
  @Get('drafts/:id')
  async getDraft(@Param('id') id: string, @CurrentUser() user: any) {
    return {
      code: 200,
      data: await this.factoryService.getDraft(id, user.tenantId),
    };
  }

  /**
   * 更新草稿
   * PUT /drafts/:id
   */
  @Put('drafts/:id')
  async updateDraft(
    @Param('id') id: string,
    @Body() body: { content?: any; template_id?: number },
    @CurrentUser() user: any,
  ) {
    return {
      code: 200,
      ...(await this.factoryService.updateDraft(id, user.tenantId, body)),
    };
  }

  /**
   * 删除草稿
   * DELETE /drafts/:id
   */
  @Delete('drafts/:id')
  async deleteDraft(@Param('id') id: string, @CurrentUser() user: any) {
    return {
      code: 200,
      ...(await this.factoryService.deleteDraft(id, user.tenantId)),
    };
  }

  /**
   * 批量分发
   * POST /posters/batch-distribute
   */
  @Post('posters/batch-distribute')
  async batchDistribute(
    @Body() body: {
      poster_id: string;
      merchant_ids: string[];
    },
    @CurrentUser() user: any,
  ) {
    return {
      code: 200,
      data: await this.factoryService.batchDistribute({
        ...body,
        tenantId: user.tenantId,
      }),
    };
  }
}
