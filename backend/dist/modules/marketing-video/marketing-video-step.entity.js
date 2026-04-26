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
exports.MarketingVideoStep = void 0;
const typeorm_1 = require("typeorm");
let MarketingVideoStep = class MarketingVideoStep {
};
exports.MarketingVideoStep = MarketingVideoStep;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MarketingVideoStep.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'step_id', unique: true }),
    __metadata("design:type", String)
], MarketingVideoStep.prototype, "stepId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id' }),
    __metadata("design:type", String)
], MarketingVideoStep.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], MarketingVideoStep.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'step_key' }),
    __metadata("design:type", String)
], MarketingVideoStep.prototype, "stepKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MarketingVideoStep.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketingVideoStep.prototype, "input", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketingVideoStep.prototype, "output", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    __metadata("design:type", String)
], MarketingVideoStep.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], MarketingVideoStep.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketingVideoStep.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MarketingVideoStep.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MarketingVideoStep.prototype, "updatedAt", void 0);
exports.MarketingVideoStep = MarketingVideoStep = __decorate([
    (0, typeorm_1.Entity)('marketing_video_steps')
], MarketingVideoStep);
//# sourceMappingURL=marketing-video-step.entity.js.map