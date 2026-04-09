import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ReferenceService } from './reference.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('references')
@UseGuards(JwtAuthGuard)
export class ReferenceController {
  constructor(private referenceService: ReferenceService) {}

  /**
   * 添加参考笔记
   * POST /references/notes
   */
  @Post('notes')
  async createNote(
    @Body() body: {
      content: string;
      style?: string;
      source?: string;
      tags?: string[];
    },
    @CurrentUser() user: any,
  ) {
    return {
      code: 200,
      data: await this.referenceService.createNote({
        ...body,
        tenantId: user.tenantId,
      }),
    };
  }

  /**
   * 参考笔记列表
   * GET /references/notes
   */
  @Get('notes')
  async getNotes(
    @Query() query: { style?: string; page?: number; page_size?: number },
    @CurrentUser() user: any,
  ) {
    return {
      code: 200,
      data: await this.referenceService.getNotes({
        ...query,
        tenantId: user.tenantId,
      }),
    };
  }

  /**
   * 添加参考评价
   * POST /references/reviews
   */
  @Post('reviews')
  async createReview(
    @Body() body: {
      content: string;
      style?: string;
      source?: string;
    },
    @CurrentUser() user: any,
  ) {
    return {
      code: 200,
      data: await this.referenceService.createReview({
        ...body,
        tenantId: user.tenantId,
      }),
    };
  }

  /**
   * 参考评价列表
   * GET /references/reviews
   */
  @Get('reviews')
  async getReviews(
    @Query() query: { style?: string; page?: number; page_size?: number },
    @CurrentUser() user: any,
  ) {
    return {
      code: 200,
      data: await this.referenceService.getReviews({
        ...query,
        tenantId: user.tenantId,
      }),
    };
  }
}
