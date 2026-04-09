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
exports.QuotaLog = void 0;
const typeorm_1 = require("typeorm");
let QuotaLog = class QuotaLog {
};
exports.QuotaLog = QuotaLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], QuotaLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], QuotaLog.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_id', nullable: true }),
    __metadata("design:type", String)
], QuotaLog.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], QuotaLog.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QuotaLog.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QuotaLog.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QuotaLog.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'operator_id', nullable: true }),
    __metadata("design:type", String)
], QuotaLog.prototype, "operatorId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], QuotaLog.prototype, "createdAt", void 0);
exports.QuotaLog = QuotaLog = __decorate([
    (0, typeorm_1.Entity)('quota_logs')
], QuotaLog);
//# sourceMappingURL=quota-log.entity.js.map