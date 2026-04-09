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
exports.Merchant = void 0;
const typeorm_1 = require("typeorm");
let Merchant = class Merchant {
};
exports.Merchant = Merchant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Merchant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_id', unique: true }),
    __metadata("design:type", String)
], Merchant.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], Merchant.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Merchant.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Merchant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Merchant.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], Merchant.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], Merchant.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_prompt_ext', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Merchant.prototype, "aiPromptExt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note_prompt_ext', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Merchant.prototype, "notePromptExt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note_topic', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Merchant.prototype, "noteTopic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note_copy', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Merchant.prototype, "noteCopy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'review_image_count', default: 9 }),
    __metadata("design:type", Number)
], Merchant.prototype, "reviewImageCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note_image_count', default: 9 }),
    __metadata("design:type", Number)
], Merchant.prototype, "noteImageCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_image_count', default: 9 }),
    __metadata("design:type", Number)
], Merchant.prototype, "productImageCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'jump_links', nullable: true, type: 'json' }),
    __metadata("design:type", Object)
], Merchant.prototype, "jumpLinks", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Merchant.prototype, "incentive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    __metadata("design:type", Object)
], Merchant.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Merchant.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'storage_used', default: 0 }),
    __metadata("design:type", Number)
], Merchant.prototype, "storageUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'storage_limit', default: 200 }),
    __metadata("design:type", Number)
], Merchant.prototype, "storageLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_index', default: 0 }),
    __metadata("design:type", Number)
], Merchant.prototype, "sortIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expire_date', nullable: true }),
    __metadata("design:type", Date)
], Merchant.prototype, "expireDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Merchant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Merchant.prototype, "updatedAt", void 0);
exports.Merchant = Merchant = __decorate([
    (0, typeorm_1.Entity)('merchants')
], Merchant);
//# sourceMappingURL=merchant.entity.js.map