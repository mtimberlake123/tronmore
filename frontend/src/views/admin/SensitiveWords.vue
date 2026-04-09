<template>
  <div class="sensitive-page">
    <div class="toolbar">
      <div class="filter-tabs">
        <button
          v-for="cat in categories"
          :key="cat.value"
          :class="['filter-tab', { active: activeCategory === cat.value }]"
          @click="activeCategory = cat.value; page = 1; fetchWords()"
        >{{ cat.label }}</button>
      </div>
      <button class="btn btn-primary" @click="showDialog = true; form = { word: '', category: 'other', level: 1 }">
        <svg width="0.625rem" height="0.625rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Add Word
      </button>
    </div>

    <!-- 表格 -->
    <div class="words-table">
      <div class="table-head">
        <span>Word</span>
        <span>Category</span>
        <span>Level</span>
        <span>Action</span>
      </div>
      <div
        v-for="(w, i) in words"
        :key="w.id"
        class="table-row"
        :style="{ animationDelay: `${i * 30}ms` }"
      >
        <span class="word-tag" :class="`level-${w.level || 1}`">{{ w.word }}</span>
        <span class="cat-badge">{{ w.category || 'General' }}</span>
        <span class="level-dots">
          <span v-for="n in 3" :key="n" :class="['dot', { active: n <= (w.level || 1) }]"></span>
        </span>
        <button class="btn btn-outline btn-xs" @click="handleDelete(w)">Delete</button>
      </div>
      <div v-if="words.length === 0 && !loading" class="empty">
        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 0 0 1.75-2.97L13.75 4a2 2 0 0 0-3.5 0L3.32 16.03A2 2 0 0 0 5.07 19z"/>
        </svg>
        <p>No sensitive words</p>
      </div>
    </div>

    <div class="pagination" v-if="pageCount > 1">
      <button
        v-for="p in pageCount"
        :key="p"
        :class="{ active: p === page }"
        @click="page = p; fetchWords()"
      >{{ p }}</button>
    </div>

    <!-- 添加弹窗 -->
    <div class="dialog-overlay" v-if="showDialog" @click.self="showDialog = false">
      <div class="dialog dialog-sm">
        <div class="dialog-header">
          <div class="section-header" style="margin-bottom:0">
            <div class="section-bar" style="background:#FF6B35"></div>
            <span class="section-title">Add Word</span>
          </div>
          <button class="dialog-close" @click="showDialog = false">
            <svg width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label>Word</label>
            <input v-model="form.word" class="input" placeholder="Enter word" />
          </div>
          <div class="form-item">
            <label>Category</label>
            <select v-model="form.category" class="input input-select">
              <option v-for="cat in categories.slice(1)" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </select>
          </div>
          <div class="form-item">
            <label>Level</label>
            <div class="level-selector">
              <button
                v-for="n in 3"
                :key="n"
                :class="['level-btn', { active: form.level === n }]"
                @click="form.level = n"
                type="button"
              >
                <span class="level-dots-sm">
                  <span v-for="k in 3" :key="k" :class="['dot', { active: k <= n }]"></span>
                </span>
                {{ n === 1 ? 'Low' : n === 2 ? 'Medium' : 'High' }}
              </button>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showDialog = false">Cancel</button>
          <button class="btn btn-primary" :loading="saveLoading" @click="handleAdd">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { admin } from '@/api'

const words = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const activeCategory = ref('all')

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Ads', value: 'ads' },
  { label: 'Political', value: 'political' },
  { label: 'Adult', value: 'porn' },
  { label: 'Violence', value: 'violence' },
  { label: 'Other', value: 'other' }
]

const showDialog = ref(false)
const saveLoading = ref(false)
const form = ref({ word: '', category: 'other', level: 1 })

const pageCount = computed(() => Math.ceil(total.value / pageSize.value))

const fetchWords = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (activeCategory.value !== 'all') params.category = activeCategory.value
    const data = await admin.sensitiveWords.list(params)
    words.value = data?.list || []
    total.value = data?.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleAdd = async () => {
  if (!form.value.word) { ElMessage.warning('Enter word'); return }
  saveLoading.value = true
  try {
    await admin.sensitiveWords.create(form.value)
    ElMessage.success('Added')
    showDialog.value = false
    form.value = { word: '', category: 'other', level: 1 }
    fetchWords()
  } catch (e) { console.error(e) }
  finally { saveLoading.value = false }
}

const handleDelete = async (w) => {
  try {
    await ElMessageBox.confirm(`Delete word "${w.word}"?`, 'Confirm', { type: 'warning' })
    await admin.sensitiveWords.delete(w.id)
    ElMessage.success('Deleted')
    fetchWords()
  } catch (e) { if (e !== 'cancel') console.error(e) }
}

onMounted(() => { fetchWords() })
</script>

<style scoped>
.sensitive-page { animation: fadeUp 0.4s ease-out; }

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
  background: rgba(255,107,53,0.12); border-color: rgba(255,107,53,0.4);
  color: #FF6B35;
}

/* Table */
.words-table {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.table-head {
  display: grid;
  grid-template-columns: 1fr 7rem 5rem 4rem;
  padding: 0.5rem 0.875rem;
  background: rgba(255,255,255,0.015);
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-3); font-weight: 600;
}
.table-row {
  display: grid;
  grid-template-columns: 1fr 7rem 5rem 4rem;
  padding: 0.5rem 0.875rem; align-items: center;
  border-bottom: 1px solid var(--border);
  transition: background 0.12s;
  animation: fadeIn 0.3s ease-out both;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(255,255,255,0.015); }

/* 斑马纹 */
.table-row:nth-child(even) { background: rgba(255,255,255,0.006); }
.table-row:nth-child(even):hover { background: rgba(255,255,255,0.015); }

.word-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: var(--font-xs); font-weight: 600;
  letter-spacing: 0.02em;
}
.word-tag.level-1 { background: rgba(255,193,7,0.12); color: #FFC107; }
.word-tag.level-2 { background: rgba(255,152,0,0.12); color: #FF9800; }
.word-tag.level-3 { background: rgba(255,107,53,0.15); color: #FF6B35; }

.cat-badge {
  display: inline-block;
  padding: 2px 6px;
  background: rgba(255,255,255,0.04);
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 0.55rem; color: var(--text-2);
  text-transform: uppercase; letter-spacing: 0.05em;
}

.level-dots { display: flex; gap: 4px; align-items: center; }
.level-dots .dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(255,255,255,0.08); transition: background 0.12s;
}
.level-dots .dot.active { background: #FF6B35; }

.btn-xs { padding: 0.2rem 0.375rem; font-size: var(--font-xs); }

.pagination { display: flex; justify-content: center; gap: 4px; margin-top: 1rem; }
.pagination button {
  padding: 0.25rem 0.5rem;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-2);
  font-family: var(--font-mono); font-size: var(--font-xs); cursor: pointer;
  transition: all 0.12s;
}
.pagination button:hover { background: rgba(255,255,255,0.03); color: var(--text); }
.pagination button.active {
  background: rgba(255,107,53,0.12); border-color: rgba(255,107,53,0.4); color: #FF6B35;
}

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
  width: 18rem; max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  animation: dialogIn 0.2s ease-out;
}
.dialog-sm { width: 16rem; }
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

.form-item { margin-bottom: 0.75rem; }
.form-item:last-child { margin-bottom: 0; }
.form-item label {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--font-xs); color: var(--text-2);
  margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.08em;
}
.form-item .input, .form-item select { width: 100%; }

.input-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='0.5rem' height='0.5rem' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  padding-right: 1.25rem;
  cursor: pointer;
}

.level-selector { display: flex; gap: 4px; }
.level-btn {
  flex: 1; padding: 0.375rem 0.25rem;
  background: rgba(255,255,255,0.02); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-2);
  font-family: var(--font-mono);
  font-size: 0.55rem; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  transition: all 0.12s;
  letter-spacing: 0.03em;
}
.level-btn:hover { background: rgba(255,255,255,0.04); }
.level-btn.active {
  border-color: #FF6B35; background: rgba(255,107,53,0.1);
  color: #FF6B35;
}
.level-dots-sm { display: flex; gap: 3px; }
.level-dots-sm .dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(255,255,255,0.08);
}
.level-dots-sm .dot.active { background: #FF6B35; }

.empty {
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
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
