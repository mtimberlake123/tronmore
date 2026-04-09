<template>
  <div class="prompts-page">
    <div class="toolbar">
      <div class="filter-tabs">
        <button
          v-for="ind in industries"
          :key="ind.value"
          :class="['filter-tab', { active: activeIndustry === ind.value }]"
          @click="activeIndustry = ind.value; page = 1; fetchPrompts()"
        >{{ ind.label }}</button>
      </div>
      <button class="btn btn-primary" @click="showDialog = true; editTarget = null; form = { industry: '', style: '', content: '' }">
        <svg width="0.625rem" height="0.625rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        New Prompt
      </button>
    </div>

    <div class="prompt-grid">
      <div
        v-for="(p, i) in prompts"
        :key="p.id"
        class="prompt-card"
        :style="{ animationDelay: `${i * 35}ms` }"
      >
        <div class="prompt-top">
          <div class="prompt-tags">
            <span class="tag industry">{{ p.industry || 'General' }}</span>
            <span class="tag style">{{ p.style || 'Default' }}</span>
          </div>
          <span :class="['status-badge', p.is_active !== false ? 'active' : 'inactive']">
            {{ p.is_active !== false ? 'ON' : 'OFF' }}
          </span>
        </div>
        <div class="prompt-text">{{ p.content }}</div>
        <div class="prompt-footer">
          <button class="btn btn-outline btn-xs" @click="toggleActive(p)">
            {{ p.is_active !== false ? 'Disable' : 'Enable' }}
          </button>
          <button class="btn btn-outline btn-xs" @click="openEdit(p)">Edit</button>
        </div>
      </div>

      <div v-if="prompts.length === 0 && !loading" class="empty">
        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>No prompts found</p>
      </div>
    </div>

    <div class="pagination" v-if="pageCount > 1">
      <button
        v-for="p in pageCount"
        :key="p"
        :class="{ active: p === page }"
        @click="page = p; fetchPrompts()"
      >{{ p }}</button>
    </div>

    <!-- Dialog -->
    <div class="dialog-overlay" v-if="showDialog" @click.self="showDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <div class="section-header" style="margin-bottom:0">
            <div class="section-bar"></div>
            <span class="section-title">{{ editTarget ? 'Edit Prompt' : 'New Prompt' }}</span>
          </div>
          <button class="dialog-close" @click="showDialog = false">
            <svg width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <div class="form-item">
              <label>Industry</label>
              <select v-model="form.industry" class="input input-select">
                <option v-for="ind in industries.slice(1)" :key="ind.value" :value="ind.value">{{ ind.label }}</option>
              </select>
            </div>
            <div class="form-item">
              <label>Style</label>
              <select v-model="form.style" class="input input-select">
                <option v-for="s in styles" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>
          </div>
          <div class="form-item">
            <label>Content</label>
            <textarea v-model="form.content" class="input textarea" rows="6" placeholder="Enter prompt content..."></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showDialog = false">Cancel</button>
          <button class="btn btn-primary" :loading="saveLoading" @click="handleSave">{{ editTarget ? 'Save' : 'Create' }}</button>
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
const activeIndustry = ref('all')

const industries = [
  { label: 'All', value: 'all' },
  { label: 'Catering', value: 'catering' },
  { label: 'Retail', value: 'retail' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Education', value: 'education' },
  { label: 'General', value: 'general' }
]

const styles = [
  { label: 'Formal', value: 'formal' },
  { label: 'Playful', value: 'playful' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Premium', value: 'premium' }
]

const showDialog = ref(false)
const saveLoading = ref(false)
const editTarget = ref(null)
const form = ref({ industry: '', style: '', content: '' })

const pageCount = computed(() => Math.ceil(total.value / pageSize.value))

const fetchPrompts = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (activeIndustry.value !== 'all') params.industry = activeIndustry.value
    const data = await admin.prompts.list(params)
    prompts.value = data?.list || []
    total.value = data?.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleSave = async () => {
  if (!form.value.content) { ElMessage.warning('Enter prompt content'); return }
  saveLoading.value = true
  try {
    if (editTarget.value) {
      await admin.prompts.update(editTarget.value.id, form.value)
      ElMessage.success('Saved')
    } else {
      await admin.prompts.create(form.value)
      ElMessage.success('Created')
    }
    showDialog.value = false
    editTarget.value = null
    fetchPrompts()
  } catch (e) { console.error(e) }
  finally { saveLoading.value = false }
}

const openEdit = (p) => {
  editTarget.value = p
  form.value = { industry: p.industry || '', style: p.style || '', content: p.content || '' }
  showDialog.value = true
}

const toggleActive = async (p) => {
  try {
    await admin.prompts.update(p.id, { is_active: p.is_active === false ? true : false })
    ElMessage.success('Updated')
    fetchPrompts()
  } catch (e) { console.error(e) }
}

onMounted(() => { fetchPrompts() })
</script>

<style scoped>
.prompts-page { animation: fadeUp 0.4s ease-out; }

.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.75rem; gap: 0.75rem;
}
.filter-tabs { display: flex; gap: 3px; flex-wrap: wrap; }
.filter-tab {
  padding: 0.25rem 0.625rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-2);
  font-family: var(--font-mono);
  font-size: var(--font-xs); cursor: pointer; transition: all 0.12s;
  letter-spacing: 0.03em;
}
.filter-tab:hover { background: rgba(255,255,255,0.03); color: var(--text); }
.filter-tab.active {
  background: var(--accent-dim); border-color: var(--accent);
  color: var(--accent);
}

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 6px;
}
.prompt-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem;
  display: flex; flex-direction: column; gap: 0.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  transition: border-color 0.12s, box-shadow 0.12s;
  animation: fadeUp 0.3s ease-out both;
}
.prompt-card:hover {
  border-color: var(--border-bright);
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

.prompt-top {
  display: flex; align-items: center; justify-content: space-between;
}
.prompt-tags { display: flex; gap: 3px; flex-wrap: wrap; }
.tag {
  padding: 2px 6px; border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 0.55rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.tag.industry { background: var(--accent-dim); color: var(--accent); }
.tag.style { background: rgba(255,255,255,0.05); color: var(--text-2); }

.status-badge {
  font-family: var(--font-mono);
  font-size: 0.55rem; font-weight: 700;
  padding: 2px 6px; border-radius: 3px;
  letter-spacing: 0.05em;
}
.status-badge.active { background: rgba(0,212,170,0.12); color: #00d4aa; }
.status-badge.inactive { background: rgba(255,255,255,0.04); color: var(--text-3); }

.prompt-text {
  flex: 1;
  font-size: var(--font-xs); color: var(--text);
  line-height: 1.6;
  max-height: 3.5rem; overflow: hidden;
  position: relative;
}
.prompt-text::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 1.25rem;
  background: linear-gradient(transparent, var(--surface));
}

.prompt-footer { display: flex; gap: 3px; }
.btn-xs { padding: 0.2rem 0.375rem; font-size: var(--font-xs); }

/* 斑马纹 */
.prompt-card:nth-child(even) {
  background: rgba(255,255,255,0.008);
}

.pagination { display: flex; justify-content: center; gap: 4px; margin-top: 1rem; }
.pagination button {
  padding: 0.25rem 0.5rem;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-2);
  font-family: var(--font-mono); font-size: var(--font-xs); cursor: pointer;
  transition: all 0.12s;
}
.pagination button:hover { background: rgba(255,255,255,0.03); color: var(--text); }
.pagination button.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

/* Dialog */
.dialog-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(4px);
}
.dialog {
  background: var(--surface-2);
  border: 1px solid var(--border-bright);
  border-radius: var(--radius);
  width: 22rem; max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  animation: dialogIn 0.2s ease-out;
}
@keyframes dialogIn {
  from { opacity: 0; transform: scale(0.97) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1rem; border-bottom: 1px solid var(--border);
}
.dialog-close {
  width: 1.25rem; height: 1.25rem;
  border-radius: var(--radius);
  background: transparent; border: none; color: var(--text-2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.12s;
}
.dialog-close:hover { background: rgba(255,255,255,0.06); color: var(--text); }
.dialog-body { padding: 1rem; }
.dialog-footer {
  display: flex; justify-content: flex-end; gap: 0.375rem;
  padding: 0.625rem 1rem; border-top: 1px solid var(--border);
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.form-item { margin-bottom: 0.75rem; }
.form-item:last-child { margin-bottom: 0; }
.form-item label {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--font-xs); color: var(--text-2);
  margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.08em;
}
.form-item .input, .form-item select { width: 100%; }
.textarea { resize: vertical; min-height: 5rem; line-height: 1.6; }

.input-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='0.5rem' height='0.5rem' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 1.25rem;
  cursor: pointer;
}

.empty {
  grid-column: 1/-1;
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 2.5rem; color: var(--text-3);
}
.empty svg { opacity: 0.25; }
.empty p { font-family: var(--font-mono); font-size: var(--font-sm); }

/* Section header */
.section-header { display: flex; align-items: center; gap: 0.5rem; }
.section-bar { width: 20px; height: 2px; background: var(--accent); border-radius: 1px; flex-shrink: 0; }
.section-title {
  font-family: var(--font-mono);
  font-size: var(--font-xs); font-weight: 700; color: #fff;
  text-transform: uppercase; letter-spacing: 0.08em;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
