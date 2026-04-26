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
exports.FactoryController = void 0;
const common_1 = require("@nestjs/common");
const factory_service_1 = require("./factory.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let FactoryController = class FactoryController {
    constructor(factoryService) {
        this.factoryService = factoryService;
    }
    async getFactoryModules() {
        return {
            code: 200,
            data: await this.factoryService.getFactoryModules(),
        };
    }
    async createFactoryGeneration(body, user) {
        return {
            code: 200,
            data: await this.factoryService.createFactoryGeneration({
                ...body,
                tenantId: user.tenantId,
            }),
        };
    }
    async getFactoryGeneration(id, user) {
        return {
            code: 200,
            data: await this.factoryService.getFactoryGeneration(id, user.tenantId),
        };
    }
    async getFactoryHistory(query, user) {
        return {
            code: 200,
            data: await this.factoryService.getFactoryHistory({
                ...query,
                tenantId: user.tenantId,
            }),
        };
    }
    async getTemplates(query) {
        return {
            code: 200,
            data: await this.factoryService.getTemplates(query),
        };
    }
    async createPoster(body, user) {
        const data = await this.factoryService.createPoster({
            ...body,
            tenantId: user.tenantId,
        });
        return { code: 200, data };
    }
    async saveDraft(body, user) {
        const data = await this.factoryService.saveDraft({
            ...body,
            tenantId: user.tenantId,
        });
        return { code: 200, data };
    }
    async getDrafts(query, user) {
        return {
            code: 200,
            data: await this.factoryService.getDrafts({
                ...query,
                tenantId: user.tenantId,
            }),
        };
    }
    async getDraft(id, user) {
        return {
            code: 200,
            data: await this.factoryService.getDraft(id, user.tenantId),
        };
    }
    async updateDraft(id, body, user) {
        return {
            code: 200,
            ...(await this.factoryService.updateDraft(id, user.tenantId, body)),
        };
    }
    async deleteDraft(id, user) {
        return {
            code: 200,
            ...(await this.factoryService.deleteDraft(id, user.tenantId)),
        };
    }
    async batchDistribute(body, user) {
        return {
            code: 200,
            data: await this.factoryService.batchDistribute({
                ...body,
                tenantId: user.tenantId,
            }),
        };
    }
};
exports.FactoryController = FactoryController;
__decorate([
    (0, common_1.Get)('factory/modules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "getFactoryModules", null);
__decorate([
    (0, common_1.Post)('factory/generations'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "createFactoryGeneration", null);
__decorate([
    (0, common_1.Get)('factory/generations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "getFactoryGeneration", null);
__decorate([
    (0, common_1.Get)('factory/history'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "getFactoryHistory", null);
__decorate([
    (0, common_1.Get)('poster/templates'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Post)('posters'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "createPoster", null);
__decorate([
    (0, common_1.Post)('drafts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "saveDraft", null);
__decorate([
    (0, common_1.Get)('drafts'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "getDrafts", null);
__decorate([
    (0, common_1.Get)('drafts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "getDraft", null);
__decorate([
    (0, common_1.Put)('drafts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "updateDraft", null);
__decorate([
    (0, common_1.Delete)('drafts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "deleteDraft", null);
__decorate([
    (0, common_1.Post)('posters/batch-distribute'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FactoryController.prototype, "batchDistribute", null);
exports.FactoryController = FactoryController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [factory_service_1.FactoryService])
], FactoryController);
//# sourceMappingURL=factory.controller.js.map