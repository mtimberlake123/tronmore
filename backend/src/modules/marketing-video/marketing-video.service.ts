import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MarketingVideoProject } from './marketing-video-project.entity';
import { MarketingVideoStep } from './marketing-video-step.entity';

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

@Injectable()
export class MarketingVideoService {
  constructor(
    @InjectRepository(MarketingVideoProject)
    private projectRepository: Repository<MarketingVideoProject>,
    @InjectRepository(MarketingVideoStep)
    private stepRepository: Repository<MarketingVideoStep>,
  ) {}

  async getTypes() {
    return VIDEO_TYPES;
  }

  async listProjects(tenantId: string) {
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
    const stepMap = steps.reduce<Record<string, MarketingVideoStep[]>>((map, step) => {
      map[step.projectId] = map[step.projectId] || [];
      map[step.projectId].push(step);
      return map;
    }, {});

    return {
      list: list.map(project => this.formatProject(project, stepMap[project.projectId] || [])),
      total: list.length,
    };
  }

  async createProject(data: {
    tenantId: string;
    title?: string;
    type: string;
    merchantId?: string;
  }) {
    const type = VIDEO_TYPES.find(item => item.key === data.type) || VIDEO_TYPES[0];
    const projectId = uuidv4();
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
      stepId: uuidv4(),
      projectId,
      tenantId: data.tenantId,
      stepKey: step.key,
      title: step.title,
      status: 'pending',
    }));
    await this.stepRepository.save(steps);

    return this.formatProject(project, steps);
  }

  async getProject(projectId: string, tenantId: string) {
    const project = await this.projectRepository.findOne({ where: { projectId, tenantId } });
    if (!project) throw new NotFoundException('视频项目不存在');
    const steps = await this.stepRepository.find({
      where: { projectId, tenantId },
      order: { id: 'ASC' },
    });
    return this.formatProject(project, steps);
  }

  async updateStep(projectId: string, stepKey: string, tenantId: string, data: {
    input?: string;
    output?: string;
    status?: string;
  }) {
    const project = await this.projectRepository.findOne({ where: { projectId, tenantId } });
    if (!project) throw new NotFoundException('视频项目不存在');

    const step = await this.stepRepository.findOne({ where: { projectId, tenantId, stepKey } });
    if (!step) throw new NotFoundException('视频步骤不存在');

    if (data.input !== undefined) step.input = data.input;
    if (data.output !== undefined) step.output = data.output;
    if (data.status !== undefined) step.status = data.status;
    if ((step.input || step.output) && step.status === 'pending') step.status = 'completed';
    await this.stepRepository.save(step);

    project.currentStep = stepKey;
    project.progress = await this.calculateProgress(projectId, tenantId);
    project.status = project.progress >= 100 ? 'completed' : 'draft';
    await this.projectRepository.save(project);

    return this.getProject(projectId, tenantId);
  }

  private async calculateProgress(projectId: string, tenantId: string) {
    const steps = await this.stepRepository.find({ where: { projectId, tenantId } });
    if (!steps.length) return 0;
    const completed = steps.filter(step => step.status === 'completed' || Boolean(step.input?.trim() || step.output?.trim())).length;
    return Math.round((completed / steps.length) * 100);
  }

  private formatProject(project: MarketingVideoProject, steps: MarketingVideoStep[]) {
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
      notes: orderedSteps.reduce<Record<string, string>>((map, step) => {
        map[step.key] = step.input || step.output || '';
        return map;
      }, {}),
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    };
  }
}
