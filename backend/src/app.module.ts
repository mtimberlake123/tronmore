import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { GeneratorModule } from './modules/generator/generator.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { QuotaModule } from './modules/quota/quota.module';
import { FactoryModule } from './modules/factory/factory.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { AdminModule } from './modules/admin/admin.module';
import { H5Module } from './modules/h5/h5.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_PATH || 'tronmore.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 开发环境自动创建表
    }),
    AiModule,
    AuthModule,
    MerchantModule,
    GeneratorModule,
    WarehouseModule,
    DashboardModule,
    QuotaModule,
    FactoryModule,
    ReferenceModule,
    AdminModule,
    H5Module,
    AnalyticsModule,
  ],
})
export class AppModule {}