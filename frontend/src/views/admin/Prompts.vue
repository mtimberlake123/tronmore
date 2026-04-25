<template>
  <div class="prompts-page">
    <div class="page-head">
      <div>
        <h2>提示词库</h2>
        <p>配置 AI 的写作规则。通用规则会注入所有生成，点评/笔记规则只影响对应场景。</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <span class="plus">+</span>
        新建提示词
      </button>
    </div>

    <div class="toolbar">
      <div class="filter-group">
        <span class="filter-label">适用范围</span>
        <button
          v-for="item in scopes"
          :key="item.value"
          :class="['filter-tab', { active: activeScope === item.value }]"
          @click="activeScope = item.value; page = 1; fetchPrompts()"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="prompt-grid">
      <div
        v-for="(prompt, index) in prompts"
        :key="prompt.id"
        class="prompt-card"
        :style="{ animationDelay: `${index * 35}ms` }"
      >
        <div class="prompt-top">
          <div class="prompt-tags">
            <span class="tag industry">{{ getScopeLabel(prompt.industry) }}</span>
            <span class="tag style">{{ getSceneLabel(prompt.style) }}</span>
          </div>
          <span :class="['status-badge', prompt.is_active !== false ? 'active' : 'inactive']">
            {{ prompt.is_active !== false ? '启用' : '禁用' }}
          </span>
        </div>

        <div class="prompt-text">{{ prompt.content }}</div>

        <div class="prompt-footer">
          <button class="btn btn-outline btn-xs" @click="toggleActive(prompt)">
            {{ prompt.is_active !== false ? '禁用' : '启用' }}
          </button>
          <button class="btn btn-outline btn-xs" @click="openEdit(prompt)">编辑</button>
        </div>
      </div>

      <div v-if="prompts.length === 0 && !loading" class="empty">
        <p>暂无提示词</p>
      </div>
    </div>

    <div class="pagination" v-if="pageCount > 1">
      <button
        v-for="item in pageCount"
        :key="item"
        :class="{ active: item === page }"
        @click="page = item; fetchPrompts()"
      >
        {{ item }}
      </button>
    </div>

    <div class="dialog-overlay" v-if="showDialog" @click.self="showDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <div>
            <h3>{{ editTarget ? '编辑提示词' : '新建提示词' }}</h3>
            <p>推荐使用“通用 + 场景 + 行业”的层级配置，生成时会按这个顺序注入。</p>
          </div>
          <button class="dialog-close" @click="showDialog = false">×</button>
        </div>

        <div class="dialog-body">
          <div class="form-row">
            <div class="form-item">
              <label>适用范围</label>
              <select v-model="form.industry" class="input input-select" :disabled="Boolean(editTarget)">
                <option v-for="item in scopes.slice(1)" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>
            <div class="form-item">
              <label>生成场景</label>
              <select v-model="form.style" class="input input-select" :disabled="Boolean(editTarget)">
                <option v-for="item in scenes" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="helper-card">
            <strong>当前规则含义：</strong>
            <span>{{ getRuleHint(form.industry, form.style) }}</span>
          </div>

          <div class="form-item">
            <label>提示词内容</label>
            <textarea
              v-model="form.content"
              class="input textarea"
              rows="8"
              placeholder="例如：内容必须真实自然，像真实顾客表达；不要虚构价格、地址、营业时间。"
            ></textarea>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showDialog = false">取消</button>
          <button class="btn btn-primary" :disabled="saveLoading" @click="handleSave">
            {{ saveLoading ? '保存中...' : editTarget ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { admin } from '@/api'

const prompts = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)
const activeScope = ref('all')

const scopes = [
  { label: '全部', value: 'all' },
  { label: '通用', value: 'general' },
  { label: '餐饮', value: 'catering' },
  { label: '美业', value: 'beauty' },
  { label: '零售', value: 'retail' },
  { label: '教育', value: 'education' },
  { label: '其他', value: 'other' }
]

const scenes = [
  { label: '通用规则', value: 'common' },
  { label: '点评生成', value: 'review' },
  { label: '小红书笔记', value: 'note' }
]

const showDialog = ref(false)
const saveLoading = ref(false)
const editTarget = ref(null)
const form = ref({ industry: 'general', style: 'common', content: '' })

const pageCount = computed(() => Math.ceil(total.value / pageSize.value))

const getScopeLabel = (value) => scopes.find(item => item.value === value)?.label || '其他'
const getSceneLabel = (value) => scenes.find(item => item.value === value)?.label || '通用规则'

const getRuleHint = (industry, style) => {
  if (industry === 'general' && style === 'common') return '系统通用提示词规则，会注入点评、笔记和 H5 生成。'
  if (industry === 'general' && style === 'review') return '点评生成通用规则，只影响大众点评/美团风格内容。'
  if (industry === 'general' && style === 'note') return '小红书笔记通用规则，只影响笔记内容。'
  return '行业场景规则，只在商家行业和生成场景同时匹配时注入。'
}

const fetchPrompts = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (activeScope.value !== 'all') params.industry = activeScope.value
    const data = await admin.prompts.list(params)
    prompts.value = data?.list || []
    total.value = data?.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editTarget.value = null
  form.value = { industry: 'general', style: 'common', content: '' }
  showDialog.value = true
}

const openEdit = (prompt) => {
  editTarget.value = prompt
  form.value = {
    industry: prompt.industry || 'general',
    style: prompt.style || 'common',
    content: prompt.content || ''
  }
  showDialog.value = true
}

const handleSave = async () => {
  if (!form.value.content.trim()) {
    ElMessage.warning('请输入提示词内容')
    return
  }

  saveLoading.value = true
  try {
    if (editTarget.value) {
      await admin.prompts.update(editTarget.value.id, { content: form.value.content })
      ElMessage.success('保存成功')
    } else {
      await admin.prompts.create(form.value)
      ElMessage.success('创建成功')
    }
    showDialog.value = false
    editTarget.value = null
    fetchPrompts()
  } catch (error) {
    console.error(error)
  } finally {
    saveLoading.value = false
  }
}

const toggleActive = async (prompt) => {
  try {
    await admin.prompts.update(prompt.id, { is_active: prompt.is_active === false })
    ElMessage.success('状态已更新')
    fetchPrompts()
  } catch (error) {
    console.error(error)
  }
}

onMounted(fetchPrompts)
</script>

<style scoped>
.prompts-page {
  animation: fadeUp 0.4s ease-out;
}

.page-head,
.toolbar,
.prompt-card,
.dialog {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.page-head h2,
.dialog h3 {
  margin: 0;
  color: var(--text-primary, #111827);
}

.page-head p,
.dialog p {
  margin: 0.35rem 0 0;
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
}

.toolbar {
  padding: 0.875rem 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-label {
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
}

.filter-tab,
.btn,
.pagination button {
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--surface-bg, #f8fafc);
  color: var(--text-primary, #111827);
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

.filter-tab.active,
.btn-primary,
.pagination .active {
  background: #1f2937;
  color: #fff;
  border-color: #1f2937;
}

.btn-outline {
  background: transparent;
}

.btn-xs {
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
}

.plus {
  margin-right: 0.25rem;
}

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.prompt-card {
  padding: 1rem;
}

.prompt-top,
.prompt-footer,
.dialog-header,
.dialog-footer,
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.prompt-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag,
.status-badge {
  font-size: 0.75rem;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
}

.tag {
  background: #eef2ff;
  color: #3730a3;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.prompt-text {
  color: var(--text-primary, #111827);
  line-height: 1.7;
  min-height: 7rem;
  margin: 1rem 0;
  white-space: pre-wrap;
}

.empty {
  grid-column: 1 / -1;
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary, #6b7280);
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.dialog {
  width: min(680px, calc(100vw - 2rem));
  padding: 1rem;
}

.dialog-close {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary, #6b7280);
}

.dialog-body {
  display: grid;
  gap: 1rem;
  margin: 1rem 0;
}

.form-row {
  align-items: flex-start;
}

.form-item {
  display: grid;
  gap: 0.4rem;
  flex: 1;
}

.form-item label {
  color: var(--text-primary, #111827);
  font-weight: 600;
  font-size: 0.875rem;
}

.input {
  width: 100%;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 0.7rem 0.8rem;
  background: var(--surface-bg, #fff);
  color: var(--text-primary, #111827);
}

.textarea {
  resize: vertical;
  line-height: 1.6;
}

.helper-card {
  background: #f8fafc;
  color: #334155;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  padding: 0.75rem 0.9rem;
  line-height: 1.6;
}

@media (max-width: 720px) {
  .page-head,
  .form-row,
  .dialog-header,
  .dialog-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
