import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  /**
   * 营销公司列表
   * GET /admin/companies
   */
  @Get('companies')
  async getCompanies(@Query() query: {
    page?: number;
    page_size?: number;
    keyword?: string;
  }) {
    return {
      code: 200,
      data: await this.adminService.getCompanies(query),
    };
  }

  /**
   * 创建营销公司
   * POST /admin/companies
   */
  @Post('companies')
  async createCompany(@Body() body: {
    name: string;
    phone: string;
    password?: string;
  }) {
    return {
      code: 200,
      data: await this.adminService.createCompany(body),
    };
  }

  /**
   * 充值
   * POST /admin/companies/:id/recharge
   */
  @Post('companies/:id/recharge')
  async recharge(
    @Param('id') id: string,
    @Body() body: {
      amount: number;
      package?: string;
      package_name?: string;
    },
  ) {
    return {
      code: 200,
      data: await this.adminService.recharge(id, body),
    };
  }

  /**
   * Prompt模板列表
   * GET /admin/prompts
   */
  @Get('prompts')
  async getPromptTemplates(@Query() query: {
    industry?: string;
    style?: string;
    page?: number;
    page_size?: number;
  }) {
    return {
      code: 200,
      data: await this.adminService.getPromptTemplates(query),
    };
  }

  /**
   * 创建Prompt模板
   * POST /admin/prompts
   */
  @Post('prompts')
  async createPromptTemplate(@Body() body: {
    industry: string;
    style: string;
    content: string;
  }) {
    return {
      code: 200,
      data: await this.adminService.createPromptTemplate(body),
    };
  }

  /**
   * 更新Prompt模板
   * PUT /admin/prompts/:id
   */
  @Put('prompts/:id')
  async updatePromptTemplate(
    @Param('id') id: string,
    @Body() body: { content?: string; is_active?: boolean },
  ) {
    return {
      code: 200,
      data: await this.adminService.updatePromptTemplate(id, body),
    };
  }

  /**
   * 敏感词列表
   * GET /admin/sensitive-words
   */
  @Get('sensitive-words')
  async getSensitiveWords(@Query() query: {
    category?: string;
    level?: number;
    page?: number;
    page_size?: number;
  }) {
    return {
      code: 200,
      data: await this.adminService.getSensitiveWords(query),
    };
  }

  /**
   * 添加敏感词/风险规则
   * POST /admin/sensitive-words
   */
  @Post('sensitive-words')
  async createSensitiveWord(@Body() body: {
    word: string;
    category: string;
    level?: number;
    rule?: string;
    active?: boolean;
    paramName?: string;
  }) {
    return {
      code: 200,
      data: await this.adminService.createSensitiveWord(body),
    };
  }

  /**
   * 删除敏感词
   * DELETE /admin/sensitive-words/:id
   */
  @Delete('sensitive-words/:id')
  async deleteSensitiveWord(@Param('id') id: string) {
    return {
      code: 200,
      ...(await this.adminService.deleteSensitiveWord(parseInt(id))),
    };
  }

  /**
   * 更新敏感词/风险规则
   * PUT /admin/sensitive-words/:id
   */
  @Put('sensitive-words/:id')
  async updateSensitiveWord(
    @Param('id') id: string,
    @Body() body: {
      word?: string;
      category?: string;
      level?: number;
      rule?: string;
      active?: boolean;
      paramName?: string;
    },
  ) {
    return {
      code: 200,
      data: await this.adminService.updateSensitiveWord(parseInt(id), body),
    };
  }

  /**
   * 获取启用的风险规则
   * GET /admin/rules/active
   */
  @Get('rules/active')
  async getActiveRules() {
    return {
      code: 200,
      data: await this.adminService.getActiveRules(),
    };
  }

  /**
   * 创建子账号
   * POST /admin/companies/:id/sub-accounts
   */
  @Post('companies/:id/sub-accounts')
  async createSubAccount(
    @Param('id') id: string,
    @Body() body: {
      username: string;
      role: string;
      password?: string;
    },
  ) {
    return {
      code: 200,
      data: await this.adminService.createSubAccount(id, body),
    };
  }

  /**
   * 商家列表（支持按租户筛选）
   * GET /admin/merchants
   */
  @Get('merchants')
  async getMerchants(@Query() query: {
    tenantId?: string;
    page?: number;
    page_size?: number;
  }) {
    return {
      code: 200,
      data: await this.adminService.getMerchants(query),
    };
  }

  /**
   * 删除商家
   * DELETE /admin/merchants/:id
   */
  @Delete('merchants/:id')
  async deleteMerchant(@Param('id') id: string) {
    return {
      code: 200,
      ...(await this.adminService.deleteMerchant(id)),
    };
  }

  /**
   * 迁移商家
   * POST /admin/merchants/:id/transfer
   */
  @Post('merchants/:id/transfer')
  async transferMerchant(
    @Param('id') id: string,
    @Body() body: { targetTenantId: string },
  ) {
    return {
      code: 200,
      ...(await this.adminService.transferMerchant(id, body.targetTenantId)),
    };
  }
}
