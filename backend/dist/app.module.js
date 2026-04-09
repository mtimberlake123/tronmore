"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./modules/auth/auth.module");
const merchant_module_1 = require("./modules/merchant/merchant.module");
const generator_module_1 = require("./modules/generator/generator.module");
const warehouse_module_1 = require("./modules/warehouse/warehouse.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const quota_module_1 = require("./modules/quota/quota.module");
const factory_module_1 = require("./modules/factory/factory.module");
const reference_module_1 = require("./modules/reference/reference.module");
const admin_module_1 = require("./modules/admin/admin.module");
const h5_module_1 = require("./modules/h5/h5.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const ai_module_1 = require("./modules/ai/ai.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: process.env.DB_PATH || 'tronmore.db',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
            }),
            ai_module_1.AiModule,
            auth_module_1.AuthModule,
            merchant_module_1.MerchantModule,
            generator_module_1.GeneratorModule,
            warehouse_module_1.WarehouseModule,
            dashboard_module_1.DashboardModule,
            quota_module_1.QuotaModule,
            factory_module_1.FactoryModule,
            reference_module_1.ReferenceModule,
            admin_module_1.AdminModule,
            h5_module_1.H5Module,
            analytics_module_1.AnalyticsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map