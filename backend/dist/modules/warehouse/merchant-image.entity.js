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
exports.MerchantImage = void 0;
const typeorm_1 = require("typeorm");
let MerchantImage = class MerchantImage {
};
exports.MerchantImage = MerchantImage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MerchantImage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_id' }),
    __metadata("design:type", String)
], MerchantImage.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MerchantImage.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MerchantImage.prototype, "tab", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_tag', nullable: true }),
    __metadata("design:type", String)
], MerchantImage.prototype, "productTag", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_used', default: 0 }),
    __metadata("design:type", Number)
], MerchantImage.prototype, "isUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_at', nullable: true }),
    __metadata("design:type", Date)
], MerchantImage.prototype, "usedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_deleted', default: 0 }),
    __metadata("design:type", Number)
], MerchantImage.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MerchantImage.prototype, "createdAt", void 0);
exports.MerchantImage = MerchantImage = __decorate([
    (0, typeorm_1.Entity)('merchant_images')
], MerchantImage);
//# sourceMappingURL=merchant-image.entity.js.map