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
exports.WarehouseController = void 0;
const common_1 = require("@nestjs/common");
const warehouse_service_1 = require("./warehouse.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WarehouseController = class WarehouseController {
    constructor(warehouseService) {
        this.warehouseService = warehouseService;
    }
    async checkStorage(merchantId) {
        return {
            code: 200,
            data: await this.warehouseService.checkStorage(merchantId),
        };
    }
    async upload(merchantId, body) {
        return {
            code: 200,
            data: await this.warehouseService.upload(merchantId, body.url, body.tab, body.product_tag),
        };
    }
    async list(merchantId, query) {
        return {
            code: 200,
            data: await this.warehouseService.list(merchantId, query),
        };
    }
    async delete(merchantId, imageId) {
        return {
            code: 200,
            ...(await this.warehouseService.delete(merchantId, parseInt(imageId))),
        };
    }
    async batchCheck(merchantId) {
        return {
            code: 200,
            data: await this.warehouseService.batchCheck(merchantId),
        };
    }
    async settings(merchantId, body) {
        return { code: 200, message: '设置已保存' };
    }
};
exports.WarehouseController = WarehouseController;
__decorate([
    (0, common_1.Get)('storage/check'),
    __param(0, (0, common_1.Param)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "checkStorage", null);
__decorate([
    (0, common_1.Post)('images'),
    __param(0, (0, common_1.Param)('merchantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('images'),
    __param(0, (0, common_1.Param)('merchantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)('images/:imageId'),
    __param(0, (0, common_1.Param)('merchantId')),
    __param(1, (0, common_1.Param)('imageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('images/batch-check'),
    __param(0, (0, common_1.Param)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "batchCheck", null);
__decorate([
    (0, common_1.Put)('image-settings'),
    __param(0, (0, common_1.Param)('merchantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "settings", null);
exports.WarehouseController = WarehouseController = __decorate([
    (0, common_1.Controller)('merchants/:merchantId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [warehouse_service_1.WarehouseService])
], WarehouseController);
//# sourceMappingURL=warehouse.controller.js.map