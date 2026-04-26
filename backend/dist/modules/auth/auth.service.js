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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const tenant_entity_1 = require("./tenant.entity");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    constructor(tenantRepository, jwtService) {
        this.tenantRepository = tenantRepository;
        this.jwtService = jwtService;
    }
    async hashPassword(password) {
        if (!password) {
            return null;
        }
        return bcrypt.hash(password, 10);
    }
    async verifyPassword(input, stored) {
        if (!stored) {
            return false;
        }
        try {
            return await bcrypt.compare(input, stored);
        }
        catch {
            return input === stored;
        }
    }
    buildLoginPayload(tenant) {
        const token = this.jwtService.sign({ sub: tenant.id, tenantId: tenant.tenantId });
        return {
            token,
            company_id: tenant.tenantId,
            company_name: tenant.name,
            balance: tenant.balance,
            is_new: !tenant.password,
        };
    }
    async loginByPassword(account, password) {
        const tenant = await this.tenantRepository.findOne({
            where: [{ phone: account }, { name: account }],
        });
        if (!tenant || !await this.verifyPassword(password, tenant.password)) {
            throw new common_1.UnauthorizedException('账号或密码错误');
        }
        if (tenant.status !== 1) {
            throw new common_1.UnauthorizedException('账号已被禁用');
        }
        return this.buildLoginPayload(tenant);
    }
    async loginBySms(phone, code, isNew = false) {
        void code;
        let tenant = await this.tenantRepository.findOne({ where: { phone } });
        if (!tenant && isNew) {
            tenant = this.tenantRepository.create({
                tenantId: (0, uuid_1.v4)(),
                name: `用户${phone.slice(-4)}`,
                phone,
                password: null,
                balance: 0,
                status: 1,
            });
            await this.tenantRepository.save(tenant);
        }
        if (!tenant) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        return this.buildLoginPayload(tenant);
    }
    async register(data) {
        void data.code;
        if (!data.company_name?.trim()) {
            throw new common_1.BadRequestException('公司名称不能为空');
        }
        if (!data.phone?.trim()) {
            throw new common_1.BadRequestException('手机号不能为空');
        }
        if (!data.password || data.password.length < 6) {
            throw new common_1.BadRequestException('密码至少 6 位');
        }
        const exists = await this.tenantRepository.findOne({ where: { phone: data.phone.trim() } });
        if (exists) {
            throw new common_1.BadRequestException('该手机号已注册');
        }
        const tenant = this.tenantRepository.create({
            tenantId: (0, uuid_1.v4)(),
            name: data.company_name.trim(),
            phone: data.phone.trim(),
            password: await this.hashPassword(data.password),
            balance: 0,
            totalQuota: 0,
            usedQuota: 0,
            status: 1,
            role: 'user',
            isAdmin: false,
        });
        await this.tenantRepository.save(tenant);
        return this.buildLoginPayload(tenant);
    }
    async sendSms(phone, type) {
        void phone;
        void type;
        return { message: '验证码已发送' };
    }
    async refresh(refreshToken) {
        void refreshToken;
        throw new common_1.BadRequestException('暂不支持');
    }
    async logout() {
        return { message: '退出成功' };
    }
    async validateToken(payload) {
        const tenant = await this.tenantRepository.findOne({ where: { id: payload.sub } });
        if (tenant) {
            return {
                id: tenant.id,
                tenantId: tenant.tenantId,
                name: tenant.name,
                role: tenant.role,
                isAdmin: tenant.isAdmin,
            };
        }
        return null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map