"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAgentConfig = void 0;
const typeorm_1 = require("typeorm");
let AiAgentConfig = class AiAgentConfig {
};
exports.AiAgentConfig = AiAgentConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AiAgentConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agent_id', unique: true }),
    __metadata("design:type", String)
], AiAgentConfig.prototype, "agentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AiAgentConfig.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'step_key' }),
    __metadata("design:type", String)
], AiAgentConfig.prototype, "stepKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AiAgentConfig.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'temperature', default: 0.7 }),
    __metadata("design:type", Number)
], AiAgentConfig.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_iterations', default: 3 }),
    __metadata("design:type", Number)
], AiAgentConfig.prototype, "maxIterations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'system_prompt', type: 'text' }),
    __metadata("design:type", String)
], AiAgentConfig.prototype, "systemPrompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], AiAgentConfig.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AiAgentConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AiAgentConfig.prototype, "updatedAt", void 0);
exports.AiAgentConfig = AiAgentConfig = __decorate([
    (0, typeorm_1.Entity)('ai_agent_configs')
], AiAgentConfig);
//# sourceMappingURL=ai-agent-config.entity.js.map