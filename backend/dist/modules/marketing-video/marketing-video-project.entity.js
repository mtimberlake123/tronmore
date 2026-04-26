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
exports.MarketingVideoProject = void 0;
const typeorm_1 = require("typeorm");
let MarketingVideoProject = class MarketingVideoProject {
};
exports.MarketingVideoProject = MarketingVideoProject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MarketingVideoProject.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'project_id', unique: true }),
    __metadata("design:type", String)
], MarketingVideoProject.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], MarketingVideoProject.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_id', nullable: true }),
    __metadata("design:type", String)
], MarketingVideoProject.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MarketingVideoProject.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MarketingVideoProject.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_name' }),
    __metadata("design:type", String)
], MarketingVideoProject.prototype, "typeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '项' }),
    __metadata("design:type", String)
], MarketingVideoProject.prototype, "mark", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_step', default: 'script' }),
    __metadata("design:type", String)
], MarketingVideoProject.prototype, "currentStep", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'draft' }),
    __metadata("design:type", String)
], MarketingVideoProject.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], MarketingVideoProject.prototype, "progress", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MarketingVideoProject.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MarketingVideoProject.prototype, "updatedAt", void 0);
exports.MarketingVideoProject = MarketingVideoProject = __decorate([
    (0, typeorm_1.Entity)('marketing_video_projects')
], MarketingVideoProject);
//# sourceMappingURL=marketing-video-project.entity.js.map