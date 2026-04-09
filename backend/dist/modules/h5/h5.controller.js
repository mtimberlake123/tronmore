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
exports.H5Controller = void 0;
const common_1 = require("@nestjs/common");
const h5_service_1 = require("./h5.service");
let H5Controller = class H5Controller {
    constructor(h5Service) {
        this.h5Service = h5Service;
    }
    async getMerchantConfig(merchantId) {
        const data = await this.h5Service.getMerchantConfig(merchantId);
        return {
            code: 200,
            data,
        };
    }
    async generate(body) {
        const data = await this.h5Service.generateContent(body.merchant_id, body.type);
        return {
            code: 200,
            data,
        };
    }
    async track(body) {
        await this.h5Service.track(body);
        return {
            code: 200,
            message: 'ok',
        };
    }
    async publishCallback(body) {
        await this.h5Service.publishCallback(body);
        return {
            code: 200,
            message: 'ok',
        };
    }
};
exports.H5Controller = H5Controller;
__decorate([
    (0, common_1.Get)('merchants/:id/config'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], H5Controller.prototype, "getMerchantConfig", null);
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], H5Controller.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('track'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], H5Controller.prototype, "track", null);
__decorate([
    (0, common_1.Post)('publish-callback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], H5Controller.prototype, "publishCallback", null);
exports.H5Controller = H5Controller = __decorate([
    (0, common_1.Controller)('h5'),
    __metadata("design:paramtypes", [h5_service_1.H5Service])
], H5Controller);
//# sourceMappingURL=h5.controller.js.map