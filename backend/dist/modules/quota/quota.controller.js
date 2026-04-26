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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotaController = void 0;
const common_1 = require("@nestjs/common");
const quota_service_1 = require("./quota.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const api_key_guard_1 = require("../auth/api-key.guard");
let QuotaController = class QuotaController {
    constructor(quotaService) {
        this.quotaService = quotaService;
    }
    async getBalance(req) {
        const balance = await this.quotaService.getBalance(req.user);
        return {
            code: 200,
            message: 'success',
            data: {
                balance: balance.balance,
                total_quota: balance.total_quota,
                used_quota: balance.used_quota,
            },
            timestamp: Math.floor(Date.now() / 1000),
            success: true,
        };
    }
    async getTenantBalance(req) {
        return {
            code: 200,
            data: await this.quotaService.getBalance(req.user),
        };
    }
    async allocate(id, body) {
        return {
            code: 200,
            ...(await this.quotaService.allocate(id, body.amount)),
        };
    }
    async getLogs(query) {
        return {
            code: 200,
            data: await this.quotaService.getLogs(query),
        };
    }
};
exports.QuotaController = QuotaController;
__decorate([
    (0, common_1.Get)('chatfire/balance'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('quota/balance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "getTenantBalance", null);
__decorate([
    (0, common_1.Post)('merchants/:id/quota/allocate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "allocate", null);
__decorate([
    (0, common_1.Get)('quota/logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuotaController.prototype, "getLogs", null);
exports.QuotaController = QuotaController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [quota_service_1.QuotaService])
], QuotaController);
//# sourceMappingURL=quota.controller.js.map