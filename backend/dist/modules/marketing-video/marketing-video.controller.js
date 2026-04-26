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
exports.MarketingVideoController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const marketing_video_service_1 = require("./marketing-video.service");
let MarketingVideoController = class MarketingVideoController {
    constructor(marketingVideoService) {
        this.marketingVideoService = marketingVideoService;
    }
    async getTypes() {
        return { code: 200, data: await this.marketingVideoService.getTypes() };
    }
    async listProjects(user) {
        return {
            code: 200,
            data: await this.marketingVideoService.listProjects(user.tenantId),
        };
    }
    async createProject(body, user) {
        return {
            code: 200,
            data: await this.marketingVideoService.createProject({
                tenantId: user.tenantId,
                title: body.title,
                type: body.type,
                merchantId: body.merchant_id,
            }),
        };
    }
    async getProject(id, user) {
        return {
            code: 200,
            data: await this.marketingVideoService.getProject(id, user.tenantId),
        };
    }
    async updateStep(id, stepKey, body, user) {
        return {
            code: 200,
            data: await this.marketingVideoService.updateStep(id, stepKey, user.tenantId, body),
        };
    }
};
exports.MarketingVideoController = MarketingVideoController;
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketingVideoController.prototype, "getTypes", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketingVideoController.prototype, "listProjects", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MarketingVideoController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketingVideoController.prototype, "getProject", null);
__decorate([
    (0, common_1.Put)(':id/steps/:stepKey'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepKey')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], MarketingVideoController.prototype, "updateStep", null);
exports.MarketingVideoController = MarketingVideoController = __decorate([
    (0, common_1.Controller)('marketing-videos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [marketing_video_service_1.MarketingVideoService])
], MarketingVideoController);
//# sourceMappingURL=marketing-video.controller.js.map