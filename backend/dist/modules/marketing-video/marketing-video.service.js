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
exports.MarketingVideoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const marketing_video_project_entity_1 = require("./marketing-video-project.entity");
const marketing_video_step_entity_1 = require("./marketing-video-step.entity");
const VIDEO_TYPES = [
    { key: 'store-visit', name: '探店短视频', mark: '探' },
    { key: 'product-seeding', name: '产品种草视频', mark: '种' },
    { key: 'promo-video', name: '促销短视频', mark: '促' },
];
const WORKFLOW_STEPS = [
    { key: 'script', title: '短视频剧本编写' },
    { key: 'productReference', title: '产品参考生成' },
    { key: 'storyboard', title: '短视频分镜生成' },
    { key: 'audio', title: '背景音乐，旁白音色生成' },
    { key: 'compose', title: '短视频合成' },
];
let MarketingVideoService = class MarketingVideoService {
    constructor(projectRepository, stepRepository) {
        this.projectRepository = projectRepository;
        this.stepRepository = stepRepository;
    }
    async getTypes() {
        return VIDEO_TYPES;
    }
    async listProjects(tenantId) {
        const list = await this.projectRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
        });
        const projectIds = list.map(item => item.projectId);
        const steps = projectIds.length
            ? await this.stepRepository.createQueryBuilder('s')
                .where('s.projectId IN (:...projectIds)', { projectIds })
                .getMany()
            : [];
        const stepMap = steps.reduce((map, step) => {
            map[step.projectId] = map[step.projectId] || [];
            map[step.projectId].push(step);
            return map;
        }, {});
        return {
            list: list.map(project => this.formatProject(project, stepMap[project.projectId] || [])),
            total: list.length,
        };
    }
    async createProject(data) {
        const type = VIDEO_TYPES.find(item => item.key === data.type) || VIDEO_TYPES[0];
        const projectId = (0, uuid_1.v4)();
        const project = this.projectRepository.create({
            projectId,
            tenantId: data.tenantId,
            merchantId: data.merchantId,
            title: data.title?.trim() || `${type.name}项目`,
            type: type.key,
            typeName: type.name,
            mark: type.mark,
            currentStep: WORKFLOW_STEPS[0].key,
            status: 'draft',
            progress: 0,
        });
        await this.projectRepository.save(project);
        const steps = WORKFLOW_STEPS.map(step => this.stepRepository.create({
            stepId: (0, uuid_1.v4)(),
            projectId,
            tenantId: data.tenantId,
            stepKey: step.key,
            title: step.title,
            status: 'pending',
        }));
        await this.stepRepository.save(steps);
        return this.formatProject(project, steps);
    }
    async getProject(projectId, tenantId) {
        const project = await this.projectRepository.findOne({ where: { projectId, tenantId } });
        if (!project)
            throw new common_1.NotFoundException('视频项目不存在');
        const steps = await this.stepRepository.find({
            where: { projectId, tenantId },
            order: { id: 'ASC' },
        });
        return this.formatProject(project, steps);
    }
    async updateStep(projectId, stepKey, tenantId, data) {
        const project = await this.projectRepository.findOne({ where: { projectId, tenantId } });
        if (!project)
            throw new common_1.NotFoundException('视频项目不存在');
        const step = await this.stepRepository.findOne({ where: { projectId, tenantId, stepKey } });
        if (!step)
            throw new common_1.NotFoundException('视频步骤不存在');
        if (data.input !== undefined)
            step.input = data.input;
        if (data.output !== undefined)
            step.output = data.output;
        if (data.status !== undefined)
            step.status = data.status;
        if ((step.input || step.output) && step.status === 'pending')
            step.status = 'completed';
        await this.stepRepository.save(step);
        project.currentStep = stepKey;
        project.progress = await this.calculateProgress(projectId, tenantId);
        project.status = project.progress >= 100 ? 'completed' : 'draft';
        await this.projectRepository.save(project);
        return this.getProject(projectId, tenantId);
    }
    async calculateProgress(projectId, tenantId) {
        const steps = await this.stepRepository.find({ where: { projectId, tenantId } });
        if (!steps.length)
            return 0;
        const completed = steps.filter(step => step.status === 'completed' || Boolean(step.input?.trim() || step.output?.trim())).length;
        return Math.round((completed / steps.length) * 100);
    }
    formatProject(project, steps) {
        const orderedSteps = WORKFLOW_STEPS.map(config => {
            const step = steps.find(item => item.stepKey === config.key);
            return {
                id: step?.stepId,
                key: config.key,
                title: config.title,
                input: step?.input || '',
                output: step?.output || '',
                status: step?.status || 'pending',
                error: step?.error || '',
            };
        });
        const currentStepIndex = Math.max(0, WORKFLOW_STEPS.findIndex(step => step.key === project.currentStep));
        const completedCount = orderedSteps.filter(step => step.status === 'completed' || step.input || step.output).length;
        const progress = project.progress || Math.round((completedCount / WORKFLOW_STEPS.length) * 100);
        return {
            id: project.projectId,
            title: project.title,
            type: project.type,
            typeName: project.typeName,
            mark: project.mark,
            merchant_id: project.merchantId,
            current_step: project.currentStep,
            stepIndex: currentStepIndex,
            status: project.status,
            progress,
            steps: orderedSteps,
            notes: orderedSteps.reduce((map, step) => {
                map[step.key] = step.input || step.output || '';
                return map;
            }, {}),
            created_at: project.createdAt,
            updated_at: project.updatedAt,
        };
    }
};
exports.MarketingVideoService = MarketingVideoService;
exports.MarketingVideoService = MarketingVideoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(marketing_video_project_entity_1.MarketingVideoProject)),
    __param(1, (0, typeorm_1.InjectRepository)(marketing_video_step_entity_1.MarketingVideoStep)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MarketingVideoService);
//# sourceMappingURL=marketing-video.service.js.map