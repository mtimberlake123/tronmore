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
const merchant_entity_1 = require("../merchant/merchant.entity");
const prompt_template_entity_1 = require("./prompt-template.entity");
const sensitive_word_entity_1 = require("./sensitive-word.entity");
const ai_agent_config_entity_1 = require("./ai-agent-config.entity");
const ai_skill_entity_1 = require("./ai-skill.entity");
let AdminService = class AdminService {
    constructor(tenantRepository, merchantRepository, promptRepository, sensitiveRepository, agentConfigRepository, skillRepository) {
        this.tenantRepository = tenantRepository;
        this.merchantRepository = merchantRepository;
        this.promptRepository = promptRepository;
        this.sensitiveRepository = sensitiveRepository;
        this.agentConfigRepository = agentConfigRepository;
        this.skillRepository = skillRepository;
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
        const tenantIds = list.map(t => t.tenantId);
        let countMap = {};
        let merchantBalanceMap = {};
        if (tenantIds.length > 0) {
            const merchantCounts = await this.merchantRepository
                .createQueryBuilder('m')
                .select('m.tenantId', 'tenantId')
                .addSelect('COUNT(*)', 'count')
                .addSelect('COALESCE(SUM(m.balance), 0)', 'merchantBalance')
                .where('m.tenantId IN (:...tenantIds)', { tenantIds })
                .groupBy('m.tenantId')
                .getRawMany();
            merchantCounts.forEach(mc => {
                countMap[mc.tenantId] = parseInt(mc.count);
                merchantBalanceMap[mc.tenantId] = Number(mc.merchantBalance || 0);
            });
        }
        return {
            list: list.map(t => ({
                company_id: t.tenantId,
                name: t.name,
                phone: t.phone,
                balance: t.balance,
                company_balance: t.balance,
                merchant_balance: merchantBalanceMap[t.tenantId] || 0,
                total_remaining: t.balance + (merchantBalanceMap[t.tenantId] || 0),
                total_quota: t.totalQuota,
                used_quota: t.usedQuota,
                allocated_quota: t.usedQuota,
                unallocated_quota: t.balance,
                status: t.status,
                created_at: t.createdAt,
                merchants: countMap[t.tenantId] || 0,
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
        const tenant = await this.tenantRepository.findOne({
            where: [
                { tenantId: companyId },
                ...(Number.isInteger(Number(companyId)) ? [{ id: Number(companyId) }] : []),
            ],
        });
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
            company_id: tenant.tenantId,
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
    async getActiveRules() {
        return this.sensitiveRepository.find({ where: { active: true } });
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
                rule: s.rule || '',
                active: s.active !== false,
                paramName: s.paramName || '',
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
            rule: data.rule || '',
            active: data.active !== false,
            paramName: data.paramName || '',
        });
        await this.sensitiveRepository.save(word);
        return {
            id: word.id,
            word: word.word,
            category: word.category,
            level: word.level,
            rule: word.rule || '',
            active: word.active,
            paramName: word.paramName || '',
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
    async updateSensitiveWord(id, data) {
        const word = await this.sensitiveRepository.findOne({ where: { id } });
        if (!word) {
            throw new common_1.NotFoundException('规则不存在');
        }
        if (data.word !== undefined)
            word.word = data.word;
        if (data.category !== undefined)
            word.category = data.category;
        if (data.level !== undefined)
            word.level = data.level;
        if (data.rule !== undefined)
            word.rule = data.rule;
        if (data.active !== undefined)
            word.active = data.active;
        if (data.paramName !== undefined)
            word.paramName = data.paramName;
        await this.sensitiveRepository.save(word);
        return {
            id: word.id,
            word: word.word,
            category: word.category,
            level: word.level,
            rule: word.rule || '',
            active: word.active,
            paramName: word.paramName || '',
        };
    }
    async createSubAccount(companyId, data) {
        return {
            message: '子账号功能待实现',
            company_id: companyId,
            username: data.username,
            role: data.role,
        };
    }
    async getMerchants(params) {
        const { tenantId, page = 1, page_size = 20 } = params;
        const pageNum = typeof page === 'string' ? parseInt(page) : page;
        const pageSizeNum = typeof page_size === 'string' ? parseInt(page_size) : page_size;
        const safePageSize = Math.min(pageSizeNum || 20, 100);
        const query = this.merchantRepository.createQueryBuilder('m');
        if (tenantId) {
            query.where('m.tenantId = :tenantId', { tenantId });
        }
        query.orderBy('m.createdAt', 'DESC');
        query.skip((pageNum - 1) * safePageSize).take(safePageSize);
        const [list, total] = await query.getManyAndCount();
        const tenantIds = [...new Set(list.map(m => m.tenantId))];
        let tenantMap = {};
        if (tenantIds.length > 0) {
            const tenants = await this.tenantRepository
                .createQueryBuilder('t')
                .select(['t.tenantId', 't.name'])
                .where('t.tenantId IN (:...ids)', { ids: tenantIds })
                .getRawMany();
            tenants.forEach(t => { tenantMap[t.tenantId] = t.name; });
        }
        return {
            list: list.map(m => ({
                id: m.merchantId,
                name: m.name,
                tenantId: m.tenantId,
                companyName: tenantMap[m.tenantId] || '',
                balance: m.balance,
                created_at: m.createdAt,
            })),
            total,
        };
    }
    async deleteMerchant(merchantId) {
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.NotFoundException('商家不存在');
        }
        await this.merchantRepository.remove(merchant);
        return { message: '删除成功' };
    }
    async transferMerchant(merchantId, targetTenantId) {
        const merchant = await this.merchantRepository.findOne({ where: { merchantId } });
        if (!merchant) {
            throw new common_1.NotFoundException('商家不存在');
        }
        const targetTenant = await this.tenantRepository.findOne({ where: { tenantId: targetTenantId } });
        if (!targetTenant) {
            throw new common_1.NotFoundException('目标公司不存在');
        }
        merchant.tenantId = targetTenantId;
        await this.merchantRepository.save(merchant);
        return {
            message: '迁移成功',
            merchant_id: merchantId,
            from_tenant: merchant.tenantId,
            to_tenant: targetTenantId,
        };
    }
    async getAiAgents(params) {
        const query = this.agentConfigRepository.createQueryBuilder('a');
        if (params.step_key) {
            query.where('a.stepKey = :stepKey', { stepKey: params.step_key });
        }
        query.orderBy('a.createdAt', 'DESC');
        const list = await query.getMany();
        return {
            list: list.map(item => ({
                id: item.agentId,
                name: item.name,
                step_key: item.stepKey,
                model: item.model,
                temperature: item.temperature,
                max_iterations: item.maxIterations,
                system_prompt: item.systemPrompt,
                is_active: item.isActive,
                created_at: item.createdAt,
            })),
            total: list.length,
        };
    }
    async createAiAgent(data) {
        const agent = this.agentConfigRepository.create({
            agentId: (0, uuid_1.v4)(),
            name: data.name,
            stepKey: data.step_key,
            model: data.model || 'gpt-5.4',
            temperature: data.temperature ?? 0.7,
            maxIterations: data.max_iterations || 3,
            systemPrompt: data.system_prompt,
            isActive: true,
        });
        await this.agentConfigRepository.save(agent);
        return { id: agent.agentId };
    }
    async updateAiAgent(agentId, data) {
        const agent = await this.agentConfigRepository.findOne({ where: { agentId } });
        if (!agent)
            throw new common_1.NotFoundException('Agent配置不存在');
        if (data.name !== undefined)
            agent.name = data.name;
        if (data.step_key !== undefined)
            agent.stepKey = data.step_key;
        if (data.model !== undefined)
            agent.model = data.model;
        if (data.temperature !== undefined)
            agent.temperature = data.temperature;
        if (data.max_iterations !== undefined)
            agent.maxIterations = data.max_iterations;
        if (data.system_prompt !== undefined)
            agent.systemPrompt = data.system_prompt;
        if (data.is_active !== undefined)
            agent.isActive = data.is_active;
        await this.agentConfigRepository.save(agent);
        return { id: agent.agentId };
    }
    async getAiSkills(params) {
        const query = this.skillRepository.createQueryBuilder('s');
        if (params.agent_type) {
            query.where('s.agentType = :agentType', { agentType: params.agent_type });
        }
        query.orderBy('s.createdAt', 'DESC');
        const list = await query.getMany();
        return {
            list: list.map(item => ({
                id: item.skillId,
                name: item.name,
                agent_type: item.agentType,
                content: item.content,
                version: item.version,
                is_active: item.isActive,
                created_at: item.createdAt,
            })),
            total: list.length,
        };
    }
    async createAiSkill(data) {
        const skill = this.skillRepository.create({
            skillId: (0, uuid_1.v4)(),
            name: data.name,
            agentType: data.agent_type,
            content: data.content,
            version: 1,
            isActive: true,
        });
        await this.skillRepository.save(skill);
        return { id: skill.skillId };
    }
    async updateAiSkill(skillId, data) {
        const skill = await this.skillRepository.findOne({ where: { skillId } });
        if (!skill)
            throw new common_1.NotFoundException('Skill不存在');
        if (data.name !== undefined)
            skill.name = data.name;
        if (data.agent_type !== undefined)
            skill.agentType = data.agent_type;
        if (data.content !== undefined) {
            skill.content = data.content;
            skill.version += 1;
        }
        if (data.is_active !== undefined)
            skill.isActive = data.is_active;
        await this.skillRepository.save(skill);
        return { id: skill.skillId, version: skill.version };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(merchant_entity_1.Merchant)),
    __param(2, (0, typeorm_1.InjectRepository)(prompt_template_entity_1.PromptTemplate)),
    __param(3, (0, typeorm_1.InjectRepository)(sensitive_word_entity_1.SensitiveWord)),
    __param(4, (0, typeorm_1.InjectRepository)(ai_agent_config_entity_1.AiAgentConfig)),
    __param(5, (0, typeorm_1.InjectRepository)(ai_skill_entity_1.AiSkill)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map