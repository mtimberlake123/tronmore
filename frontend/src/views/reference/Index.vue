<template>
  <div class="video-page">
    <section v-if="!activeProject" class="project-home panel-card">
      <div class="page-head">
        <div>
          <p class="eyebrow">营销视频</p>
          <h1>短视频项目</h1>
          <span>先创建视频项目，再进入项目内部按步骤完成剧本、参考、分镜、声音和合成。</span>
        </div>
        <el-button type="primary" size="large" @click="showCreateDialog = true">新增短视频</el-button>
      </div>

      <div v-if="loading" class="empty-panel">
        <strong>正在加载视频项目</strong>
        <p>正在同步后端项目和步骤进度。</p>
      </div>

      <div v-else-if="projects.length" class="project-grid">
        <article
          v-for="project in projects"
          :key="project.id"
          class="project-card"
          @click="openProject(project.id)"
        >
          <div class="project-top">
            <div class="project-mark">{{ project.mark }}</div>
            <div class="project-status">
              <span>{{ projectProgress(project) }}%</span>
              <small>{{ project.stepIndex + 1 }}/{{ workflowSteps.length }}</small>
            </div>
          </div>
          <div class="project-body">
            <strong>{{ project.title }}</strong>
            <p>{{ project.typeName }}</p>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${projectProgress(project)}%` }"></div>
          </div>
          <div class="project-foot">
            <span>当前步骤</span>
            <b>{{ workflowSteps[project.stepIndex]?.title }}</b>
          </div>
        </article>
      </div>

      <div v-else class="empty-panel">
        <strong>还没有短视频项目</strong>
        <p>点击右上角新增短视频，选择类型后再进入制作工作流。</p>
      </div>
    </section>

    <section v-else class="project-detail">
      <div class="detail-head panel-card">
        <div class="detail-title">
          <el-button plain @click="backToProjects">返回项目列表</el-button>
          <div>
            <p class="eyebrow">{{ activeProject.typeName }}</p>
            <h1>{{ activeProject.title }}</h1>
            <span>当前进度：{{ currentStep.title }}，已完成 {{ completedStepCount(activeProject) }} 个环节。</span>
          </div>
        </div>
        <el-button type="primary" @click="showCreateDialog = true">新增短视频</el-button>
      </div>

      <div class="workflow-shell">
        <aside class="workflow-nav panel-card">
          <div class="workflow-progress">
            <span>制作进度</span>
            <strong>{{ projectProgress(activeProject) }}%</strong>
          </div>
          <div class="progress-track large">
            <div class="progress-fill" :style="{ width: `${projectProgress(activeProject)}%` }"></div>
          </div>

          <div class="step-list">
            <button
              v-for="(step, index) in workflowSteps"
              :key="step.key"
              type="button"
              :class="['step-item', { active: activeProject.stepIndex === index, done: activeProject.stepIndex > index }]"
              @click="goStep(index)"
            >
              <span>{{ index + 1 }}</span>
              <div>
                <strong>{{ step.title }}</strong>
                <small>{{ step.desc }}</small>
              </div>
            </button>
          </div>
        </aside>

        <main class="workflow-editor panel-card">
          <div class="step-editor-head">
            <p class="step-label">当前制作环节</p>
            <h2>{{ currentStep.title }}</h2>
            <span>{{ currentStep.guide }}</span>
          </div>

          <el-input
            v-model="activeProject.notes[currentStep.key]"
            type="textarea"
            :rows="12"
            :placeholder="currentStep.placeholder"
          />

          <div class="step-summary">
            <div
              v-for="(step, index) in workflowSteps"
              :key="step.key"
              :class="['summary-chip', { active: activeProject.stepIndex === index, done: activeProject.notes[step.key]?.trim() }]"
            >
              <span>{{ step.title }}</span>
              <b>{{ activeProject.notes[step.key]?.trim() ? '已填写' : '待完善' }}</b>
            </div>
          </div>

          <div class="step-actions">
            <el-button :disabled="activeProject.stepIndex === 0" @click="goPrevStep">上一步</el-button>
            <el-button
              type="primary"
              :disabled="activeProject.stepIndex === workflowSteps.length - 1"
              @click="goNextStep"
            >
              下一步
            </el-button>
          </div>
        </main>
      </div>
    </section>

    <el-dialog v-model="showCreateDialog" title="选择短视频类型" width="680px" class="video-dialog">
      <div class="type-grid">
        <button
          v-for="item in videoTypes"
          :key="item.key"
          type="button"
          :class="['type-card', { active: createForm.type === item.key }]"
          @click="createForm.type = item.key"
        >
          <span>{{ item.mark }}</span>
          <strong>{{ item.name }}</strong>
          <small>{{ item.desc }}</small>
        </button>
      </div>
      <el-form label-position="top" class="create-form">
        <el-form-item label="项目名称">
          <el-input v-model="createForm.title" placeholder="例如：小马牛肉面周末套餐推广视频" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createProject">开始制作</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { marketingVideo } from '@/api'

const storageKey = 'marketing_video_projects'

const videoTypes = [
  {
    key: 'store-visit',
    name: '探店短视频',
    mark: '探',
    desc: '适合门店环境、到店体验、服务流程和真实探店内容。',
  },
  {
    key: 'product-seeding',
    name: '产品种草视频',
    mark: '种',
    desc: '适合菜品、服务、套餐、新品体验和细节展示。',
  },
  {
    key: 'promo-video',
    name: '促销短视频',
    mark: '促',
    desc: '适合团购活动、节日促销、限时福利和转化推广。',
  },
]

const workflowSteps = [
  {
    key: 'script',
    title: '短视频剧本编写',
    desc: '确定主题、结构和口播',
    guide: '先确定开场钩子、核心内容、用户利益点和结尾行动号召。',
    placeholder: '填写或生成短视频剧本，例如：开场3秒怎么吸引、每段口播说什么、结尾怎么引导到店。',
  },
  {
    key: 'productReference',
    title: '产品参考生成',
    desc: '整理产品与视觉参考',
    guide: '沉淀本条视频要展示的产品、场景、参考图和视觉关键词。',
    placeholder: '填写产品参考，例如：主推套餐、门店环境、菜品细节、参考画面、不要出现的元素。',
  },
  {
    key: 'storyboard',
    title: '短视频分镜生成',
    desc: '拆解镜头顺序和画面',
    guide: '把剧本拆成可执行的镜头，包括景别、运镜、字幕和时长。',
    placeholder: '填写分镜，例如：镜头1门头外景2秒，镜头2产品特写3秒，镜头3顾客体验4秒。',
  },
  {
    key: 'audio',
    title: '背景音乐，旁白音色生成',
    desc: '确定声音风格',
    guide: '确定背景音乐情绪、旁白人设、语速和字幕节奏。',
    placeholder: '填写声音要求，例如：轻快生活感背景音乐，年轻女声旁白，语速自然，字幕短句化。',
  },
  {
    key: 'compose',
    title: '短视频合成',
    desc: '汇总素材准备成片',
    guide: '汇总剧本、参考、分镜和声音配置，为后续接入视频合成接口做准备。',
    placeholder: '填写合成要求，例如：9:16竖版，15秒，带字幕，输出封面和成片。',
  },
]

const projects = ref([])
const activeProjectId = ref('')
const loading = ref(false)
const showCreateDialog = ref(false)
const createForm = reactive({
  type: 'store-visit',
  title: '',
})

const activeProject = computed(() => projects.value.find(item => item.id === activeProjectId.value))
const currentStep = computed(() => workflowSteps[activeProject.value?.stepIndex || 0])

watch(activeProjectId, (value) => {
  window.dispatchEvent(new CustomEvent('tronmore:layout-topbar', {
    detail: { hide: Boolean(value) },
  }))
})

watch(projects, (value) => {
  localStorage.setItem(storageKey, JSON.stringify(value))
}, { deep: true })

const completedStepCount = (project) => {
  if (!project) return 0
  return workflowSteps.filter(step => project.notes?.[step.key]?.trim()).length
}

const projectProgress = (project) => {
  if (!project) return 0
  const stepProgress = ((project.stepIndex + 1) / workflowSteps.length) * 70
  const contentProgress = (completedStepCount(project) / workflowSteps.length) * 30
  return Math.min(100, Math.round(stepProgress + contentProgress))
}

const openProject = (id) => {
  activeProjectId.value = id
}

const backToProjects = () => {
  activeProjectId.value = ''
}

const createProject = () => {
  const type = videoTypes.find(item => item.key === createForm.type) || videoTypes[0]
  const title = createForm.title.trim() || `${type.name}项目`
  marketingVideo.create({
    type: type.key,
    title,
  }).then((project) => {
    projects.value.unshift(normalizeProject(project))
    activeProjectId.value = project.id
    createForm.type = 'store-visit'
    createForm.title = ''
    showCreateDialog.value = false
    ElMessage.success('短视频项目已创建')
  })
}

const normalizeProject = (project) => ({
  ...project,
  typeName: project.typeName || project.type_name,
  stepIndex: project.stepIndex ?? workflowSteps.findIndex(step => step.key === project.current_step),
  notes: {
    script: '',
    productReference: '',
    storyboard: '',
    audio: '',
    compose: '',
    ...(project.notes || {}),
  },
})

const loadProjects = async () => {
  loading.value = true
  try {
    const res = await marketingVideo.list()
    projects.value = (res.list || []).map(normalizeProject)
  } catch (error) {
    try {
      projects.value = JSON.parse(localStorage.getItem(storageKey) || '[]')
    } catch {
      projects.value = []
    }
  } finally {
    loading.value = false
  }
}

const saveCurrentStep = async () => {
  if (!activeProject.value) return
  const step = currentStep.value
  await marketingVideo.updateStep(activeProject.value.id, step.key, {
    input: activeProject.value.notes[step.key] || '',
    status: activeProject.value.notes[step.key]?.trim() ? 'completed' : 'pending',
  })
}

const goPrevStep = async () => {
  await saveCurrentStep()
  activeProject.value.stepIndex -= 1
}

const goNextStep = async () => {
  await saveCurrentStep()
  activeProject.value.stepIndex += 1
}

const goStep = async (index) => {
  await saveCurrentStep()
  activeProject.value.stepIndex = index
}

onBeforeUnmount(() => {
  window.dispatchEvent(new CustomEvent('tronmore:layout-topbar', {
    detail: { hide: false },
  }))
})

onMounted(loadProjects)
</script>

<style scoped>
.video-page {
  display: block;
}

.panel-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
}

.project-home,
.detail-head,
.workflow-nav,
.workflow-editor {
  padding: 24px;
}

.page-head,
.detail-head,
.detail-title,
.project-top,
.project-foot,
.workflow-progress,
.step-actions {
  display: flex;
  align-items: flex-start;
}

.page-head,
.detail-head {
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.detail-head {
  align-items: center;
}

.detail-title {
  align-items: center;
  gap: 16px;
}

.eyebrow,
.step-label {
  margin: 0 0 6px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 900;
}

.page-head h1,
.detail-head h1,
.step-editor-head h2 {
  margin: 0;
  color: var(--text);
}

.page-head span,
.detail-head span,
.empty-panel p,
.step-editor-head span {
  color: var(--text-2);
  line-height: 1.7;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.project-card,
.type-card,
.step-item {
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.project-card {
  display: grid;
  gap: 18px;
  min-height: 230px;
  padding: 18px;
  border-radius: 22px;
}

.project-card:hover,
.type-card.active,
.step-item.active {
  border-color: var(--accent);
  background: var(--accent-dim);
  transform: translateY(-2px);
}

.project-top,
.project-foot,
.workflow-progress,
.step-actions {
  justify-content: space-between;
  gap: 12px;
}

.project-mark,
.type-card span,
.step-item > span {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  background: var(--accent);
  color: #fff;
  font-weight: 900;
}

.project-status {
  display: grid;
  justify-items: end;
  gap: 2px;
}

.project-status span,
.workflow-progress strong {
  color: var(--text);
  font-size: 24px;
  font-weight: 900;
}

.project-status small,
.project-body p,
.project-foot span,
.step-item small,
.type-card small,
.summary-chip b {
  color: var(--text-2);
}

.project-body strong {
  display: block;
  color: var(--text);
  font-size: 19px;
  line-height: 1.4;
}

.project-body p {
  margin: 8px 0 0;
}

.project-foot {
  align-items: center;
  padding-top: 2px;
}

.project-foot b {
  color: var(--accent);
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.progress-track.large {
  height: 10px;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--success));
  transition: width 0.2s ease;
}

.empty-panel {
  display: grid;
  place-items: center;
  align-content: center;
  min-height: 360px;
  padding: 28px;
  background: var(--surface-2);
  border: 1px dashed var(--border-strong);
  border-radius: 20px;
  text-align: center;
}

.project-detail {
  display: grid;
  gap: 20px;
}

.workflow-shell {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.workflow-nav {
  position: sticky;
  top: 18px;
}

.workflow-progress {
  align-items: center;
  margin-bottom: 10px;
}

.workflow-progress span {
  color: var(--text-2);
}

.step-list {
  display: grid;
  gap: 10px;
}

.step-item {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 12px;
  border-radius: 16px;
  text-align: left;
}

.step-item.done > span {
  background: var(--success);
}

.step-item strong {
  display: block;
  color: var(--text);
}

.step-item small {
  display: block;
  margin-top: 4px;
  line-height: 1.5;
}

.workflow-editor {
  display: grid;
  gap: 18px;
}

.step-editor-head {
  display: grid;
  gap: 4px;
}

.step-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.summary-chip {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface-2);
}

.summary-chip.active {
  border-color: var(--accent);
}

.summary-chip.done b {
  color: var(--success);
}

.summary-chip span {
  color: var(--text);
  font-weight: 800;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.type-card {
  min-height: 160px;
  display: grid;
  justify-items: start;
  gap: 8px;
  padding: 16px;
  border-radius: 18px;
  text-align: left;
}

.type-card strong {
  color: var(--text);
}

.create-form {
  margin-top: 18px;
}

@media (max-width: 1120px) {
  .workflow-shell {
    grid-template-columns: 1fr;
  }

  .workflow-nav {
    position: static;
  }
}

@media (max-width: 720px) {
  .page-head,
  .detail-head,
  .detail-title,
  .step-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .type-grid {
    grid-template-columns: 1fr;
  }
}
</style>
