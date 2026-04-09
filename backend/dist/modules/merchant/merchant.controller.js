"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantController = void 0;
const common_1 = require("@nestjs/common");
const merchant_service_1 = require("./merchant.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const QRCode = __importStar(require("qrcode"));
let MerchantController = class MerchantController {
    constructor(merchantService) {
        this.merchantService = merchantService;
    }
    async list(req, query) {
        return {
            code: 200,
            data: await this.merchantService.findAll(req.user.tenantId, query),
        };
    }
    async detail(id) {
        return {
            code: 200,
            data: await this.merchantService.findOne(id),
        };
    }
    async create(req, body) {
        return {
            code: 200,
            data: await this.merchantService.create(req.user.tenantId, body),
        };
    }
    async update(id, body) {
        return {
            code: 200,
            ...(await this.merchantService.update(id, body)),
        };
    }
    async delete(id) {
        return {
            code: 200,
            ...(await this.merchantService.delete(id)),
        };
    }
    async transfer(id, body) {
        return {
            code: 200,
            ...(await this.merchantService.transfer(id, body.target_company_id)),
        };
    }
    async copy(id) {
        return {
            code: 200,
            data: await this.merchantService.copy(id),
        };
    }
    async sort(body) {
        return {
            code: 200,
            ...(await this.merchantService.sort(body.sorts)),
        };
    }
    async balance(id) {
        return {
            code: 200,
            data: await this.merchantService.getBalance(id),
        };
    }
    async generations(id, query) {
        return {
            code: 200,
            data: { list: [], total: 0 },
        };
    }
    async generateQrcode(id, body) {
        const merchant = await this.merchantService.findOne(id);
        if (!merchant) {
            return { code: 404, message: '商家不存在' };
        }
        const baseUrl = process.env.H5_BASE_URL || 'https://example.com/h5';
        const jumpUrl = `${baseUrl}/${id}`;
        const qrOptions = {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        };
        const qrImage = await QRCode.toDataURL(jumpUrl, qrOptions);
        return {
            code: 200,
            data: {
                qr_image: qrImage,
                jump_url: jumpUrl,
            },
        };
    }
};
exports.MerchantController = MerchantController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/transfer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)(':id/copy'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "copy", null);
__decorate([
    (0, common_1.Put)('sort'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "sort", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "balance", null);
__decorate([
    (0, common_1.Get)(':id/generations'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "generations", null);
__decorate([
    (0, common_1.Post)(':id/qrcode'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MerchantController.prototype, "generateQrcode", null);
exports.MerchantController = MerchantController = __decorate([
    (0, common_1.Controller)('merchants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [merchant_service_1.MerchantService])
], MerchantController);
//# sourceMappingURL=merchant.controller.js.map