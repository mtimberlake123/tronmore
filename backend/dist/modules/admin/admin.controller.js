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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getCompanies(query) {
        return {
            code: 200,
            data: await this.adminService.getCompanies(query),
        };
    }
    async createCompany(body) {
        return {
            code: 200,
            data: await this.adminService.createCompany(body),
        };
    }
    async recharge(id, body) {
        return {
            code: 200,
            data: await this.adminService.recharge(id, body),
        };
    }
    async getPromptTemplates(query) {
        return {
            code: 200,
            data: await this.adminService.getPromptTemplates(query),
        };
    }
    async createPromptTemplate(body) {
        return {
            code: 200,
            data: await this.adminService.createPromptTemplate(body),
        };
    }
    async updatePromptTemplate(id, body) {
        return {
            code: 200,
            data: await this.adminService.updatePromptTemplate(id, body),
        };
    }
    async getSensitiveWords(query) {
        return {
            code: 200,
            data: await this.adminService.getSensitiveWords(query),
        };
    }
    async createSensitiveWord(body) {
        return {
            code: 200,
            data: await this.adminService.createSensitiveWord(body),
        };
    }
    async deleteSensitiveWord(id) {
        return {
            code: 200,
            ...(await this.adminService.deleteSensitiveWord(parseInt(id))),
        };
    }
    async updateSensitiveWord(id, body) {
        return {
            code: 200,
            data: await this.adminService.updateSensitiveWord(parseInt(id), body),
        };
    }
    async getActiveRules() {
        return {
            code: 200,
            data: await this.adminService.getActiveRules(),
        };
    }
    async createSubAccount(id, body) {
        return {
            code: 200,
            data: await this.adminService.createSubAccount(id, body),
        };
    }
    async getMerchants(query) {
        return {
            code: 200,
            data: await this.adminService.getMerchants(query),
        };
    }
    async deleteMerchant(id) {
        return {
            code: 200,
            ...(await this.adminService.deleteMerchant(id)),
        };
    }
    async transferMerchant(id, body) {
        return {
            code: 200,
            ...(await this.adminService.transferMerchant(id, body.targetTenantId)),
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('companies'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getCompanies", null);
__decorate([
    (0, common_1.Post)('companies'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createCompany", null);
__decorate([
    (0, common_1.Post)('companies/:id/recharge'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "recharge", null);
__decorate([
    (0, common_1.Get)('prompts'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPromptTemplates", null);
__decorate([
    (0, common_1.Post)('prompts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createPromptTemplate", null);
__decorate([
    (0, common_1.Put)('prompts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updatePromptTemplate", null);
__decorate([
    (0, common_1.Get)('sensitive-words'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSensitiveWords", null);
__decorate([
    (0, common_1.Post)('sensitive-words'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSensitiveWord", null);
__decorate([
    (0, common_1.Delete)('sensitive-words/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteSensitiveWord", null);
__decorate([
    (0, common_1.Put)('sensitive-words/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSensitiveWord", null);
__decorate([
    (0, common_1.Get)('rules/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getActiveRules", null);
__decorate([
    (0, common_1.Post)('companies/:id/sub-accounts'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSubAccount", null);
__decorate([
    (0, common_1.Get)('merchants'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getMerchants", null);
__decorate([
    (0, common_1.Delete)('merchants/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteMerchant", null);
__decorate([
    (0, common_1.Post)('merchants/:id/transfer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "transferMerchant", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map