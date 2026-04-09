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
exports.AnalyticsLog = void 0;
const typeorm_1 = require("typeorm");
let AnalyticsLog = class AnalyticsLog {
};
exports.AnalyticsLog = AnalyticsLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AnalyticsLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_id' }),
    __metadata("design:type", String)
], AnalyticsLog.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_id', nullable: true }),
    __metadata("design:type", String)
], AnalyticsLog.prototype, "qrId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_type' }),
    __metadata("design:type", String)
], AnalyticsLog.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'device_fingerprint', nullable: true }),
    __metadata("design:type", String)
], AnalyticsLog.prototype, "deviceFingerprint", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalyticsLog.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalyticsLog.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_platform', nullable: true }),
    __metadata("design:type", String)
], AnalyticsLog.prototype, "targetPlatform", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trace_id', nullable: true }),
    __metadata("design:type", String)
], AnalyticsLog.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], AnalyticsLog.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_time', nullable: true }),
    __metadata("design:type", Date)
], AnalyticsLog.prototype, "clientTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AnalyticsLog.prototype, "createdAt", void 0);
exports.AnalyticsLog = AnalyticsLog = __decorate([
    (0, typeorm_1.Entity)('analytics_logs')
], AnalyticsLog);
//# sourceMappingURL=analytics-log.entity.js.map