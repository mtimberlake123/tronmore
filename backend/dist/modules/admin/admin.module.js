"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const tenant_entity_1 = require("../auth/tenant.entity");
const merchant_entity_1 = require("../merchant/merchant.entity");
const prompt_template_entity_1 = require("./prompt-template.entity");
const sensitive_word_entity_1 = require("./sensitive-word.entity");
const ai_agent_config_entity_1 = require("./ai-agent-config.entity");
const ai_skill_entity_1 = require("./ai-skill.entity");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant, merchant_entity_1.Merchant, prompt_template_entity_1.PromptTemplate, sensitive_word_entity_1.SensitiveWord, ai_agent_config_entity_1.AiAgentConfig, ai_skill_entity_1.AiSkill])],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map