"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const factory_controller_1 = require("./factory.controller");
const factory_service_1 = require("./factory.service");
const poster_template_entity_1 = require("./poster-template.entity");
const poster_entity_1 = require("./poster.entity");
const draft_entity_1 = require("./draft.entity");
const merchant_entity_1 = require("../merchant/merchant.entity");
const tenant_entity_1 = require("../auth/tenant.entity");
let FactoryModule = class FactoryModule {
};
exports.FactoryModule = FactoryModule;
exports.FactoryModule = FactoryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([poster_template_entity_1.PosterTemplate, poster_entity_1.Poster, draft_entity_1.Draft, merchant_entity_1.Merchant, tenant_entity_1.Tenant])],
        controllers: [factory_controller_1.FactoryController],
        providers: [factory_service_1.FactoryService],
        exports: [factory_service_1.FactoryService],
    })
], FactoryModule);
//# sourceMappingURL=factory.module.js.map