"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quota_controller_1 = require("./quota.controller");
const quota_service_1 = require("./quota.service");
const quota_log_entity_1 = require("./quota-log.entity");
const merchant_entity_1 = require("../merchant/merchant.entity");
const tenant_entity_1 = require("../auth/tenant.entity");
const auth_module_1 = require("../auth/auth.module");
let QuotaModule = class QuotaModule {
};
exports.QuotaModule = QuotaModule;
exports.QuotaModule = QuotaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([quota_log_entity_1.QuotaLog, merchant_entity_1.Merchant, tenant_entity_1.Tenant]), auth_module_1.AuthModule],
        controllers: [quota_controller_1.QuotaController],
        providers: [quota_service_1.QuotaService],
        exports: [quota_service_1.QuotaService],
    })
], QuotaModule);
//# sourceMappingURL=quota.module.js.map