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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const tenant_entity_1 = require("../auth/tenant.entity");
const prompt_template_entity_1 = require("./prompt-template.entity");
const sensitive_word_entity_1 = require("./sensitive-word.entity");
let AdminService = class AdminService {
    constructor(tenantRepository, promptRepository, sensitiveRepository) {
        this.tenantRepository = tenantRepository;
        this.promptRepository = promptRepository;
        this.sensitiveRepository = sensitiveRepository;
    }
    async getCompanies(params) {
        const { page = 1, page_size = 20, keyword } = params;
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
        const safePageSize = Math.min(pageSizeNum || 20, 100);
        const query = this.tenantRepository.createQueryBuilder('t');
        if (keyword) {
            query.where('t.name LIKE :keyword OR t.phone LIKE :keyword', { keyword: `%${keyword}%` });
        }
        query.orderBy('t.createdAt', 'DESC');
        query.skip((pageNum - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        return {
            list: list.map(t => ({
                company_id: t.tenantId,
                name: t.name,
                phone: t.phone,
                balance: t.balance,
                total_quota: t.totalQuota,
                used_quota: t.usedQuota,
                status: t.status,
                created_at: t.createdAt,
            })),
            total,
        };
    }
    async createCompany(data) {
        const exists = await this.tenantRepository.findOne({ where: { phone: data.phone } });
        if (exists) {
            throw new common_1.BadRequestException('该手机号已注册');
        }
        const tenantId = (0, uuid_1.v4)();
        const tenant = this.tenantRepository.create({
            tenantId,
            name: data.name,
            phone: data.phone,
            password: data.password,
            balance: 0,
            totalQuota: 0,
            usedQuota: 0,
            status: 1,
        });
        await this.tenantRepository.save(tenant);
        return {
            company_id: tenantId,
            name: tenant.name,
        };
    }
    async recharge(companyId, data) {
        const tenant = await this.tenantRepository.findOne({ where: { tenantId: companyId } });
        if (!tenant) {
            throw new common_1.NotFoundException('营销公司不存在');
        }
        if (data.amount <= 0) {
            throw new common_1.BadRequestException('充值金额必须大于0');
        }
        const before = tenant.balance;
        tenant.balance += data.amount;
        tenant.totalQuota += data.amount;
        await this.tenantRepository.save(tenant);
        return {
            company_id: companyId,
            before,
            after: tenant.balance,
            amount: data.amount,
            package: data.package,
        };
    }
    async getPromptTemplates(params) {
        const { industry, style, page = 1, page_size = 20 } = params;
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
        const safePageSize = Math.min(pageSizeNum || 20, 100);
        const query = this.promptRepository.createQueryBuilder('p');
        if (industry) {
            query.andWhere('p.industry = :industry', { industry });
        }
        if (style) {
            query.andWhere('p.style = :style', { style });
        }
        query.orderBy('p.createdAt', 'DESC');
        query.skip((pageNum - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        return {
            list: list.map(p => ({
                id: p.templateId,
                industry: p.industry,
                style: p.style,
                content: p.content,
                version: p.version,
                is_active: p.isActive,
            })),
            total,
        };
    }
    async createPromptTemplate(data) {
        const templateId = (0, uuid_1.v4)();
        const template = this.promptRepository.create({
            templateId,
            industry: data.industry,
            style: data.style,
            content: data.content,
            version: 1,
            isActive: true,
        });
        await this.promptRepository.save(template);
        return {
            id: templateId,
            industry: template.industry,
            style: template.style,
            content: template.content,
            version: template.version,
        };
    }
    async updatePromptTemplate(templateId, data) {
        const template = await this.promptRepository.findOne({ where: { templateId } });
        if (!template) {
            throw new common_1.NotFoundException('模板不存在');
        }
        if (data.content) {
            template.content = data.content;
            template.version += 1;
        }
        if (data.is_active !== undefined) {
            template.isActive = data.is_active;
        }
        await this.promptRepository.save(template);
        return {
            id: template.templateId,
            content: template.content,
            version: template.version,
            is_active: template.isActive,
        };
    }
    async getSensitiveWords(params) {
        const { category, level, page = 1, page_size = 20 } = params;
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
        const safePageSize = Math.min(pageSizeNum || 20, 100);
        const query = this.sensitiveRepository.createQueryBuilder('s');
        if (category) {
            query.andWhere('s.category = :category', { category });
        }
        if (level) {
            query.andWhere('s.level = :level', { level });
        }
        query.orderBy('s.createdAt', 'DESC');
        query.skip((pageNum - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        return {
            list: list.map(s => ({
                id: s.id,
                word: s.word,
                category: s.category,
                level: s.level,
                created_at: s.createdAt,
            })),
            total,
        };
    }
    async createSensitiveWord(data) {
        const exists = await this.sensitiveRepository.findOne({ where: { word: data.word } });
        if (exists) {
            throw new common_1.BadRequestException('该敏感词已存在');
        }
        const word = this.sensitiveRepository.create({
            word: data.word,
            category: data.category,
            level: data.level || 1,
        });
        await this.sensitiveRepository.save(word);
        return {
            id: word.id,
            word: word.word,
            category: word.category,
            level: word.level,
        };
    }
    async deleteSensitiveWord(id) {
        const word = await this.sensitiveRepository.findOne({ where: { id } });
        if (!word) {
            throw new common_1.NotFoundException('敏感词不存在');
        }
        await this.sensitiveRepository.remove(word);
        return { message: '删除成功' };
    }
    async createSubAccount(companyId, data) {
        return {
            message: '子账号功能待实现',
            company_id: companyId,
            username: data.username,
            role: data.role,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(prompt_template_entity_1.PromptTemplate)),
    __param(2, (0, typeorm_1.InjectRepository)(sensitive_word_entity_1.SensitiveWord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map