import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login/password')
  async loginByPassword(@Body() body: { account: string; password: string; agree_terms: boolean }) {
    if (!body.agree_terms) {
      throw new BadRequestException('请先同意用户协议');
    }

    return {
      code: 200,
      data: await this.authService.loginByPassword(body.account, body.password),
    };
  }

  @Post('login/sms')
  async loginBySms(@Body() body: { phone: string; code: string; agree_terms: boolean }) {
    if (!body.agree_terms) {
      throw new BadRequestException('请先同意用户协议');
    }

    return {
      code: 200,
      data: await this.authService.loginBySms(body.phone, body.code, true),
    };
  }

  @Post('register')
  async register(@Body() body: { company_name: string; phone: string; password: string; code: string; agree_terms: boolean }) {
    if (!body.agree_terms) {
      throw new BadRequestException('请先同意用户协议');
    }

    return {
      code: 200,
      data: await this.authService.register(body),
    };
  }

  @Post('sms/send')
  async sendSms(@Body() body: { phone: string; type: string }) {
    await this.authService.sendSms(body.phone, body.type);

    return {
      code: 200,
      message: '验证码已发送',
    };
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    await this.authService.refresh(body.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    return {
      code: 200,
      message: '退出成功',
    };
  }
}
