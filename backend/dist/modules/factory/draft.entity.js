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
exports.Draft = void 0;
const typeorm_1 = require("typeorm");
let Draft = class Draft {
};
exports.Draft = Draft;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Draft.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'draft_id', unique: true }),
    __metadata("design:type", String)
], Draft.prototype, "draftId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Draft.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_id' }),
    __metadata("design:type", String)
], Draft.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], Draft.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Object)
], Draft.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'template_id', nullable: true }),
    __metadata("design:type", Number)
], Draft.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Draft.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Draft.prototype, "createdAt", void 0);
exports.Draft = Draft = __decorate([
    (0, typeorm_1.Entity)('drafts')
], Draft);
//# sourceMappingURL=draft.entity.js.map