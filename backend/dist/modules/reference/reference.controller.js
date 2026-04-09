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
exports.ReferenceController = void 0;
const common_1 = require("@nestjs/common");
const reference_service_1 = require("./reference.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let ReferenceController = class ReferenceController {
    constructor(referenceService) {
        this.referenceService = referenceService;
    }
    async createNote(body, user) {
        return {
            code: 200,
            data: await this.referenceService.createNote({
                ...body,
                tenantId: user.tenantId,
            }),
        };
    }
    async getNotes(query, user) {
        return {
            code: 200,
            data: await this.referenceService.getNotes({
                ...query,
                tenantId: user.tenantId,
            }),
        };
    }
    async createReview(body, user) {
        return {
            code: 200,
            data: await this.referenceService.createReview({
                ...body,
                tenantId: user.tenantId,
            }),
        };
    }
    async getReviews(query, user) {
        return {
            code: 200,
            data: await this.referenceService.getReviews({
                ...query,
                tenantId: user.tenantId,
            }),
        };
    }
};
exports.ReferenceController = ReferenceController;
__decorate([
    (0, common_1.Post)('notes'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReferenceController.prototype, "createNote", null);
__decorate([
    (0, common_1.Get)('notes'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReferenceController.prototype, "getNotes", null);
__decorate([
    (0, common_1.Post)('reviews'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReferenceController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)('reviews'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReferenceController.prototype, "getReviews", null);
exports.ReferenceController = ReferenceController = __decorate([
    (0, common_1.Controller)('references'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reference_service_1.ReferenceService])
], ReferenceController);
//# sourceMappingURL=reference.controller.js.map