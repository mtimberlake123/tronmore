<template>
  <div class="workflow-page">
    <div class="page-head">
      <div>
        <h2>AI工作流</h2>
        <p>配置营销视频每个步骤使用的 Agent 和 Skill。Agent 决定怎么思考，Skill 决定具体执行规范。</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-outline" @click="openSkillCreate">新增Skill</button>
        <button class="btn btn-primary" @click="openAgentCreate">新增Agent</button>
      </div>
    </div>

    <div class="workflow-grid">
      <section class="panel-card">
        <div class="section-head">
          <div>
            <strong>Agent配置</strong>
            <span>对应火宝里的剧本、分析、分镜等 Agent</span>
          </div>
        </div>

        <div class="card-list">
          <article v-for="item in agents" :key="item.id" class="config-card">
            <div class="card-top">
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ stepLabel(item.step_key) }} · {{ item.model || '默认模型' }}</p>
              </div>
              <span :class="['status', item.is_active !== false ? 'active' : 'inactive']">
                {{ item.is_active !== false ? '启用' : '禁用' }}
              </span>
            </div>
            <div class="content-preview">{{ item.system_prompt }}</div>
            <div class="card-foot">
              <button class="btn btn-outline btn-xs" @click="toggleAgent(item)">{{ item.is_active !== false ? '禁用' : '启用' }}</button>
              <button class="btn btn-outline btn-xs" @click="openAgentEdit(item)">编辑</button>
            </div>
          </article>
          <div v-if="!agents.length" class="empty">暂无 Agent 配置</div>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-head">
          <div>
            <strong>Skill技能库</strong>
            <span>类似火宝的剧本Skill、分镜Skill、分析Skill</span>
          </div>
        </div>

        <div class="card-list">
          <article v-for="item in skills" :key="item.id" class="config-card">
            <div class="card-top">
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ stepLabel(item.agent_type) }} · 版本 {{ item.version }}</p>
              </div>
              <span :class="['status', item.is_active !== false ? 'active' : 'inactive']">
                {{ item.is_active !== false ? '启用' : '禁用' }}
              </span>
            </div>
            <div class="content-preview">{{ item.content }}</div>
            <div class="card-foot">
              <button class="btn btn-outline btn-xs" @click="toggleSkill(item)">{{ item.is_active !== false ? '禁用' : '启用' }}</button>
              <button class="btn btn-outline btn-xs" @click="openSkillEdit(item)">编辑</button>
            </div>
          </article>
          <div v-if="!skills.length" class="empty">暂无 Skill 配置</div>
        </div>
      </section>
    </div>

    <div class="dialog-overlay" v-if="showAgentDialog" @click.self="showAgentDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <div>
            <h3>{{ editingAgent ? '编辑Agent' : '新增Agent' }}</h3>
            <p>Agent 是每个步骤的主提示词和循环策略，后续会和 Skill 一起注入生成。</p>
          </div>
          <button class="dialog-close" @click="showAgentDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label>名称<input v-model="agentForm.name" class="input" /></label>
            <label>绑定步骤
              <select v-model="agentForm.step_key" class="input">
                <option v-for="item in stepOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
              </select>
            </label>
          </div>
          <div class="form-row">
            <label>模型<input v-model="agentForm.model" class="input" /></label>
            <label>最大轮次<input v-model.number="agentForm.max_iterations" class="input" type="number" /></label>
          </div>
          <label>系统提示词<textarea v-model="agentForm.system_prompt" class="input textarea" rows="9"></textarea></label>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showAgentDialog = false">取消</button>
          <button class="btn btn-primary" @click="saveAgent">保存</button>
        </div>
      </div>
    </div>

    <div class="dialog-overlay" v-if="showSkillDialog" @click.self="showSkillDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <div>
            <h3>{{ editingSkill ? '编辑Skill' : '新增Skill' }}</h3>
            <p>Skill 用来沉淀可复用规范，比如剧本结构、分镜字段、平台风格。</p>
          </div>
          <button class="dialog-close" @click="showSkillDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label>名称<input v-model="skillForm.name" class="input" /></label>
            <label>适用Agent
              <select v-model="skillForm.agent_type" class="input">
                <option v-for="item in stepOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
              </select>
            </label>
          </div>
          <label>技能内容<textarea v-model="skillForm.content" class="input textarea" rows="11"></textarea></label>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showSkillDialog = false">取消</button>
          <button class="btn btn-primary" @click="saveSkill">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { admin } from '@/api'

const stepOptions = [
  { label: '短视频剧本编写', value: 'script' },
  { label: '产品参考生成', value: 'productReference' },
  { label: '短视频分镜生成', value: 'storyboard' },
  { label: '背景音乐，旁白音色生成', value: 'audio' },
  { label: '短视频合成', value: 'compose' }
]

const agents = ref([])
const skills = ref([])
const showAgentDialog = ref(false)
const showSkillDialog = ref(false)
const editingAgent = ref(null)
const editingSkill = ref(null)

const agentForm = reactive({ name: '', step_key: 'script', model: 'gpt-5.4', max_iterations: 3, system_prompt: '' })
const skillForm = reactive({ name: '', agent_type: 'script', content: '' })

const stepLabel = (value) => stepOptions.find(item => item.value === value)?.label || value

const load = async () => {
  const [agentRes, skillRes] = await Promise.all([
    admin.aiAgents.list(),
    admin.aiSkills.list()
  ])
  agents.value = agentRes.list || []
  skills.value = skillRes.list || []
}

const openAgentCreate = () => {
  editingAgent.value = null
  Object.assign(agentForm, { name: '', step_key: 'script', model: 'gpt-5.4', max_iterations: 3, system_prompt: '' })
  showAgentDialog.value = true
}

const openAgentEdit = (item) => {
  editingAgent.value = item
  Object.assign(agentForm, {
    name: item.name,
    step_key: item.step_key,
    model: item.model || 'gpt-5.4',
    max_iterations: item.max_iterations || 3,
    system_prompt: item.system_prompt || ''
  })
  showAgentDialog.value = true
}

const saveAgent = async () => {
  if (!agentForm.name || !agentForm.system_prompt) return ElMessage.warning('请填写Agent名称和系统提示词')
  if (editingAgent.value) await admin.aiAgents.update(editingAgent.value.id, agentForm)
  else await admin.aiAgents.create(agentForm)
  showAgentDialog.value = false
  ElMessage.success('保存成功')
  load()
}

const toggleAgent = async (item) => {
  await admin.aiAgents.update(item.id, { is_active: item.is_active === false })
  load()
}

const openSkillCreate = () => {
  editingSkill.value = null
  Object.assign(skillForm, { name: '', agent_type: 'script', content: '' })
  showSkillDialog.value = true
}

const openSkillEdit = (item) => {
  editingSkill.value = item
  Object.assign(skillForm, { name: item.name, agent_type: item.agent_type, content: item.content || '' })
  showSkillDialog.value = true
}

const saveSkill = async () => {
  if (!skillForm.name || !skillForm.content) return ElMessage.warning('请填写Skill名称和内容')
  if (editingSkill.value) await admin.aiSkills.update(editingSkill.value.id, skillForm)
  else await admin.aiSkills.create(skillForm)
  showSkillDialog.value = false
  ElMessage.success('保存成功')
  load()
}

const toggleSkill = async (item) => {
  await admin.aiSkills.update(item.id, { is_active: item.is_active === false })
  load()
}

onMounted(load)
</script>

<style scoped>
.workflow-page {
  display: grid;
  gap: 20px;
}

.page-head,
.section-head,
.card-top,
.card-foot,
.head-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.page-head h2 {
  margin: 0;
  color: var(--text);
}

.page-head p,
.section-head span,
.config-card p {
  color: var(--text-2);
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.panel-card,
.config-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
}

.panel-card {
  padding: 20px;
}

.card-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.config-card {
  padding: 16px;
}

.config-card strong {
  color: var(--text);
}

.config-card p {
  margin: 5px 0 0;
}

.content-preview {
  max-height: 96px;
  overflow: hidden;
  margin: 14px 0;
  padding: 12px;
  border-radius: 14px;
  background: var(--surface-2);
  color: var(--text-2);
  line-height: 1.7;
  white-space: pre-wrap;
}

.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status.active {
  background: rgba(34, 197, 94, 0.12);
  color: var(--success);
}

.status.inactive {
  background: var(--surface-2);
  color: var(--text-3);
}

.btn-xs {
  min-height: 30px;
  padding: 0 10px;
  font-size: 12px;
}

.empty {
  padding: 28px;
  border: 1px dashed var(--border);
  border-radius: 16px;
  color: var(--text-2);
  text-align: center;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.48);
}

.dialog {
  width: min(760px, 100%);
  max-height: 86vh;
  overflow: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 22px;
  box-shadow: var(--shadow-lg);
}

.dialog-header,
.dialog-body,
.dialog-footer {
  padding: 20px;
}

.dialog-header,
.dialog-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}

.dialog-footer {
  border-top: 1px solid var(--border);
  border-bottom: 0;
}

.dialog-header h3 {
  margin: 0;
}

.dialog-header p {
  color: var(--text-2);
}

.dialog-close {
  border: 0;
  background: transparent;
  color: var(--text-2);
  font-size: 24px;
  cursor: pointer;
}

.dialog-body {
  display: grid;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

label {
  display: grid;
  gap: 7px;
  color: var(--text);
  font-weight: 800;
}

.textarea {
  resize: vertical;
}

@media (max-width: 980px) {
  .workflow-grid,
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
