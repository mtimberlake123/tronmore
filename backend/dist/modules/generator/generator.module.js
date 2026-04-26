"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const generator_controller_1 = require("./generator.controller");
const generator_service_1 = require("./generator.service");
const generation_entity_1 = require("./generation.entity");
const merchant_entity_1 = require("../merchant/merchant.entity");
const merchant_image_entity_1 = require("../warehouse/merchant-image.entity");
const analytics_log_entity_1 = require("../analytics/analytics-log.entity");
const prompt_builder_module_1 = require("../prompt-builder/prompt-builder.module");
let GeneratorModule = class GeneratorModule {
};
exports.GeneratorModule = GeneratorModule;
exports.GeneratorModule = GeneratorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([generation_entity_1.Generation, merchant_entity_1.Merchant, merchant_image_entity_1.MerchantImage, analytics_log_entity_1.AnalyticsLog]),
            prompt_builder_module_1.PromptBuilderModule,
        ],
        controllers: [generator_controller_1.GeneratorController],
        providers: [generator_service_1.GeneratorService],
        exports: [generator_service_1.GeneratorService],
    })
], GeneratorModule);
//# sourceMappingURL=generator.module.js.map