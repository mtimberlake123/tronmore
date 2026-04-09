import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  /**
   * 商家数据看板
   * GET /merchants/:id/dashboard
   */
  @Get('merchants/:id/dashboard')
  async getMerchantDashboard(@Param('id') id: string, @Query() query: any) {
    return {
      code: 200,
      data: await this.dashboardService.getMerchantDashboard(id, query),
    };
  }

  /**
   * 平台数据看板（系统后台）
   * GET /admin/dashboard
   */
  @Get('admin/dashboard')
  @UseGuards(AdminGuard)
  async getAdminDashboard() {
    return {
      code: 200,
      data: await this.dashboardService.getAdminDashboard(),
    };
  }
}