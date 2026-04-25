<template>
  <div class="rules-page">
    <div class="page-head">
      <div>
        <h2>风控规则</h2>
        <p>用于敏感词检测和合规约束。普通写作风格请放到“提示词库”。</p>
      </div>
      <button class="btn btn-primary" @click="openDialog">
        <span class="plus">+</span>
        添加规则
      </button>
    </div>

    <div class="toolbar">
      <span class="filter-label">规则分类</span>
      <button
        v-for="category in categories"
        :key="category.value"
        :class="['filter-tab', { active: activeCategory === category.value }]"
        @click="activeCategory = category.value; page = 1; fetchRules()"
      >
        {{ category.label }}
      </button>
    </div>

    <div class="rules-table">
      <div class="table-head">
        <span>检测关键词</span>
        <span>合规约束</span>
        <span>分类</span>
        <span>等级</span>
        <span>状态</span>
        <span>操作</span>
      </div>

      <div
        v-for="(rule, index) in rules"
        :key="rule.id"
        class="table-row"
        :style="{ animationDelay: `${index * 30}ms` }"
      >
        <span class="keyword">{{ rule.word || '-' }}</span>
        <span class="rule-content">{{ rule.rule || '仅做关键词检测' }}</span>
        <span class="cat-badge">{{ getCategoryLabel(rule.category) }}</span>
        <span class="level-dots">
          <span v-for="item in 3" :key="item" :class="['dot', { active: item <= (rule.level || 1) }]"></span>
        </span>
        <span :class="['status-badge', rule.active !== false ? 'active' : 'inactive']">
          {{ rule.active !== false ? '启用' : '禁用' }}
        </span>
        <div class="action-btns">
          <button class="btn btn-outline btn-xs" @click="toggleActive(rule)">
            {{ rule.active !== false ? '禁用' : '启用' }}
          </button>
          <button class="btn btn-outline btn-xs" @click="openEdit(rule)">编辑</button>
          <button class="btn btn-danger btn-xs" @click="handleDelete(rule)">删除</button>
        </div>
      </div>

      <div v-if="rules.length === 0 && !loading" class="empty">
        暂无风控规则
      </div>
    </div>

    <div class="pagination" v-if="pageCount > 1">
      <button
        v-for="item in pageCount"
        :key="item"
        :class="{ active: item === page }"
        @click="page = item; fetchRules()"
      >
        {{ item }}
      </button>
    </div>

    <div class="dialog-overlay" v-if="showDialog" @click.self="showDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <div>
            <h3>{{ editTarget ? '编辑风控规则' : '添加风控规则' }}</h3>
            <p>关键词用于生成后检测，合规约束会作为“不能写什么”注入 AI Prompt。</p>
          </div>
          <button class="dialog-close" @click="showDialog = false">×</button>
        </div>

        <div class="dialog-body">
          <div class="form-item">
            <label>检测关键词</label>
            <input v-model="form.word" class="input" placeholder="例如：最有效、全网第一、医疗功效" />
          </div>

          <div class="form-item">
            <label>合规约束</label>
            <textarea
              v-model="form.rule"
              class="input textarea"
              rows="4"
              placeholder="例如：不得使用绝对化、承诺效果或无法验证的夸张表达。"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label>分类</label>
              <select v-model="form.category" class="input input-select">
                <option v-for="category in categories.slice(1)" :key="category.value" :value="category.value">
                  {{ category.label }}
                </option>
              </select>
            </div>
            <div class="form-item">
              <label>参数名称</label>
              <input v-model="form.paramName" class="input" placeholder="例如：prohibited_content" />
            </div>
          </div>

          <div class="form-item">
            <label>风险等级</label>
            <div class="level-selector">
              <button
                v-for="item in levelOptions"
                :key="item.value"
                :class="['level-btn', { active: form.level === item.value }]"
                type="button"
                @click="form.level = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <label class="toggle-label">
            <span>启用规则</span>
            <button :class="['toggle', { active: form.active }]" type="button" @click="form.active = !form.active">
              <span class="toggle-knob"></span>
            </button>
          </label>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showDialog = false">取消</button>
          <button class="btn btn-primary" :disabled="saveLoading" @click="handleSave">
            {{ saveLoading ? '保存中...' : editTarget ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { admin } from '@/api'

const rules = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const activeCategory = ref('all')

const categories = [
  { label: '全部', value: 'all' },
  { label: '广告违规', value: 'ads' },
  { label: '政治敏感', value: 'political' },
  { label: '低俗色情', value: 'porn' },
  { label: '暴力血腥', value: 'violence' },
  { label: '其他违规', value: 'other' }
]

const levelOptions = [
  { label: '轻微', value: 1 },
  { label: '中度', value: 2 },
  { label: '严重', value: 3 }
]

const showDialog = ref(false)
const saveLoading = ref(false)
const editTarget = ref(null)
const form = ref({ word: '', rule: '', category: 'other', level: 1, active: true, paramName: '' })

const pageCount = computed(() => Math.ceil(total.value / pageSize.value))

const getCategoryLabel = (value) => categories.find(item => item.value === value)?.label || '其他违规'

const fetchRules = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (activeCategory.value !== 'all') params.category = activeCategory.value
    const data = await admin.sensitiveWords.list(params)
    rules.value = data?.list || []
    total.value = data?.total || 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  editTarget.value = null
  form.value = { word: '', rule: '', category: 'other', level: 1, active: true, paramName: '' }
  showDialog.value = true
}

const openEdit = (rule) => {
  editTarget.value = rule
  form.value = {
    word: rule.word || '',
    rule: rule.rule || '',
    category: rule.category || 'other',
    level: rule.level || 1,
    active: rule.active !== false,
    paramName: rule.paramName || ''
  }
  showDialog.value = true
}

const handleSave = async () => {
  if (!form.value.word.trim()) {
    ElMessage.warning('请输入检测关键词')
    return
  }

  saveLoading.value = true
  try {
    if (editTarget.value) {
      await admin.sensitiveWords.update(editTarget.value.id, form.value)
      ElMessage.success('保存成功')
    } else {
      await admin.sensitiveWords.create(form.value)
      ElMessage.success('添加成功')
    }
    showDialog.value = false
    editTarget.value = null
    fetchRules()
  } catch (error) {
    console.error(error)
  } finally {
    saveLoading.value = false
  }
}

const toggleActive = async (rule) => {
  try {
    await admin.sensitiveWords.update(rule.id, { active: rule.active === false })
    ElMessage.success('状态已更新')
    fetchRules()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = async (rule) => {
  try {
    await ElMessageBox.confirm(`确定删除规则「${rule.word}」？`, '删除确认', { type: 'warning' })
    await admin.sensitiveWords.delete(rule.id)
    ElMessage.success('删除成功')
    fetchRules()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

onMounted(fetchRules)
</script>

<style scoped>
.rules-page {
  animation: fadeUp 0.4s ease-out;
}

.page-head,
.toolbar,
.rules-table,
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.875rem 1rem;
  margin-bottom: 1rem;
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

.btn-danger {
  color: #b91c1c;
  background: #fee2e2;
  border-color: #fecaca;
}

.btn-xs {
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
}

.plus {
  margin-right: 0.25rem;
}

.rules-table {
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 0.8fr 0.7fr 0.7fr 1.3fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.85rem 1rem;
}

.table-head {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
}

.table-row {
  border-top: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-primary, #111827);
}

.keyword {
  font-weight: 700;
}

.rule-content {
  color: var(--text-secondary, #4b5563);
  line-height: 1.6;
}

.cat-badge,
.status-badge {
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.75rem;
  width: fit-content;
}

.cat-badge {
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

.level-dots,
.action-btns,
.dialog-header,
.dialog-footer,
.form-row,
.level-selector,
.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: #cbd5e1;
}

.dot.active {
  background: #f97316;
}

.empty {
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

.dialog-header,
.dialog-footer {
  justify-content: space-between;
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

.form-item label,
.toggle-label {
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

.level-btn {
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 999px;
  background: transparent;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}

.level-btn.active {
  background: #fff7ed;
  border-color: #fb923c;
  color: #c2410c;
}

.toggle-label {
  justify-content: space-between;
}

.toggle {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: none;
  padding: 2px;
  background: #cbd5e1;
  cursor: pointer;
}

.toggle.active {
  background: #16a34a;
}

.toggle-knob {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #fff;
  transition: transform 0.18s ease;
}

.toggle.active .toggle-knob {
  transform: translateX(20px);
}

@media (max-width: 980px) {
  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
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
