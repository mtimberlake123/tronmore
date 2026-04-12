"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.H5Module = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const h5_controller_1 = require("./h5.controller");
const h5_service_1 = require("./h5.service");
const merchant_entity_1 = require("../merchant/merchant.entity");
const generation_entity_1 = require("../generator/generation.entity");
const analytics_log_entity_1 = require("../analytics/analytics-log.entity");
const sensitive_word_entity_1 = require("../admin/sensitive-word.entity");
let H5Module = class H5Module {
};
exports.H5Module = H5Module;
exports.H5Module = H5Module = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([merchant_entity_1.Merchant, generation_entity_1.Generation, analytics_log_entity_1.AnalyticsLog, sensitive_word_entity_1.SensitiveWord])],
        controllers: [h5_controller_1.H5Controller],
        providers: [h5_service_1.H5Service],
        exports: [h5_service_1.H5Service],
    })
], H5Module);
//# sourceMappingURL=h5.module.js.map