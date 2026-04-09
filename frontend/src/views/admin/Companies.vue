<template>
  <div class="companies-page">
    <!-- 标题栏 -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="keyword"
          placeholder="Search company..."
          class="input search-input"
          @input="debounceSearch"
        />
      </div>
      <button class="btn btn-primary" @click="showCreateDialog = true">
        <svg width="0.625rem" height="0.625rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        New
      </button>
    </div>

    <!-- 公司列表 -->
    <div class="company-list">
      <div
        v-for="(c, i) in companies"
        :key="c.id"
        class="company-row"
        :style="{ animationDelay: `${i * 40}ms` }"
      >
        <div class="company-main">
          <div class="company-avatar">{{ c.name?.charAt(0) || '?' }}</div>
          <div class="company-info">
            <div class="company-name">{{ c.name }}</div>
            <div class="company-meta mono">{{ c.phone || 'No phone' }}</div>
          </div>
        </div>
        <div class="company-stats">
          <div class="stat">
            <span class="stat-val mono">{{ c.merchants || 0 }}</span>
            <span class="stat-key">MER</span>
          </div>
          <div class="stat">
            <span class="stat-val mono" :class="{ 'accent': c.balance > 0 }">{{ c.balance?.toLocaleString() || 0 }}</span>
            <span class="stat-key">QUOTA</span>
          </div>
          <div class="stat">
            <span class="stat-val mono">{{ c.created_at ? formatDate(c.created_at) : '—' }}</span>
            <span class="stat-key">DATE</span>
          </div>
        </div>
        <div class="company-actions">
          <button class="btn btn-outline btn-sm" @click="openRecharge(c)">Recharge</button>
          <button class="btn btn-outline btn-sm" @click="openDetail(c)">Detail</button>
        </div>
      </div>

      <div v-if="companies.length === 0 && !loading" class="empty">
        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 9h6M9 13h4"/>
        </svg>
        <p>No companies found</p>
      </div>
    </div>

    <div class="pagination" v-if="total > 0">
      <button
        v-for="p in pageCount"
        :key="p"
        :class="{ active: p === page }"
        @click="page = p; fetchCompanies()"
      >{{ p }}</button>
    </div>

    <!-- 创建公司弹窗 -->
    <div class="dialog-overlay" v-if="showCreateDialog" @click.self="showCreateDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <div class="section-header" style="margin-bottom:0">
            <div class="section-bar"></div>
            <span class="section-title">New Company</span>
          </div>
          <button class="dialog-close" @click="showCreateDialog = false">
            <svg width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label>Company Name</label>
            <input v-model="createForm.name" class="input" placeholder="Enter name" />
          </div>
          <div class="form-item">
            <label>Phone</label>
            <input v-model="createForm.phone" class="input" placeholder="Enter phone" />
          </div>
          <div class="form-item">
            <label>Password</label>
            <input v-model="createForm.password" type="password" class="input" placeholder="Initial password" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showCreateDialog = false">Cancel</button>
          <button class="btn btn-primary" :loading="createLoading" @click="handleCreate">Create</button>
        </div>
      </div>
    </div>

    <!-- 充值弹窗 -->
    <div class="dialog-overlay" v-if="showRechargeDialog" @click.self="showRechargeDialog = false">
      <div class="dialog dialog-sm">
        <div class="dialog-header">
          <div class="section-header" style="margin-bottom:0">
            <div class="section-bar" style="background:#FF6B35"></div>
            <span class="section-title">Recharge</span>
          </div>
          <button class="dialog-close" @click="showRechargeDialog = false">
            <svg width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="recharge-info" v-if="rechargeTarget">
            <span class="recharge-name">{{ rechargeTarget.name }}</span>
            <span class="recharge-balance mono">Current: {{ rechargeTarget.balance || 0 }}</span>
          </div>
          <div class="form-item">
            <label>Amount</label>
            <input v-model.number="rechargeForm.amount" type="number" class="input" min="1" />
          </div>
          <div class="form-item">
            <label>Package</label>
            <input v-model="rechargeForm.package_name" class="input" placeholder="e.g. Annual Plan" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showRechargeDialog = false">Cancel</button>
          <button class="btn btn-primary" :loading="rechargeLoading" @click="handleRecharge">Confirm</button>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div class="dialog-overlay" v-if="showDetailDialog" @click.self="showDetailDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <div class="section-header" style="margin-bottom:0">
            <div class="section-bar"></div>
            <span class="section-title">{{ detailTarget?.name || 'Detail' }}</span>
          </div>
          <button class="dialog-close" @click="showDetailDialog = false">
            <svg width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body" v-if="detailTarget">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Company</span>
              <span class="detail-value">{{ detailTarget.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Phone</span>
              <span class="detail-value mono">{{ detailTarget.phone || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Quota</span>
              <span class="detail-value accent mono">{{ detailTarget.balance?.toLocaleString() || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Merchants</span>
              <span class="detail-value mono">{{ detailTarget.merchants || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { admin } from '@/api'

const companies = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const showCreateDialog = ref(false)
const createLoading = ref(false)
const createForm = ref({ name: '', phone: '', password: '' })

const showRechargeDialog = ref(false)
const rechargeLoading = ref(false)
const rechargeTarget = ref(null)
const rechargeForm = ref({ amount: 100, package_name: '' })

const showDetailDialog = ref(false)
const detailTarget = ref(null)

const pageCount = computed(() => Math.ceil(total.value / pageSize.value))

let searchTimer = null
const debounceSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; fetchCompanies() }, 300)
}

const fetchCompanies = async () => {
  loading.value = true
  try {
    const data = await admin.companies.list({
      page: page.value,
      page_size: pageSize.value,
      keyword: keyword.value || undefined
    })
    companies.value = data?.list || []
    total.value = data?.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleCreate = async () => {
  if (!createForm.value.name || !createForm.value.phone) {
    ElMessage.warning('Please fill in name and phone'); return
  }
  createLoading.value = true
  try {
    await admin.companies.create(createForm.value)
    ElMessage.success('Created')
    showCreateDialog.value = false
    createForm.value = { name: '', phone: '', password: '' }
    fetchCompanies()
  } catch (e) { console.error(e) }
  finally { createLoading.value = false }
}

const openRecharge = (c) => {
  rechargeTarget.value = c
  rechargeForm.value = { amount: 100, package_name: '' }
  showRechargeDialog.value = true
}

const handleRecharge = async () => {
  if (!rechargeForm.value.amount) { ElMessage.warning('Enter amount'); return }
  rechargeLoading.value = true
  try {
    await admin.companies.recharge(rechargeTarget.value.id, rechargeForm.value)
    ElMessage.success('Recharged')
    showRechargeDialog.value = false
    fetchCompanies()
  } catch (e) { console.error(e) }
  finally { rechargeLoading.value = false }
}

const openDetail = (c) => {
  detailTarget.value = c
  showDetailDialog.value = true
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })

onMounted(() => { fetchCompanies() })
</script>

<style scoped>
.companies-page { animation: fadeUp 0.4s ease-out; }

.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.75rem; gap: 0.75rem;
}
.search-wrap { position: relative; flex: 1; max-width: 16rem; }
.search-icon {
  position: absolute; left: 0.5rem; top: 50%; transform: translateY(-50%);
  color: var(--text-3); pointer-events: none;
}
.search-input { width: 100%; padding-left: 1.75rem; }

.company-list { display: flex; flex-direction: column; gap: 3px; }
.company-row {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.625rem 0.875rem;
  display: flex; align-items: center; gap: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  transition: border-color 0.12s, box-shadow 0.12s;
  animation: fadeUp 0.3s ease-out both;
}
.company-row:hover {
  border-color: var(--border-bright);
  box-shadow: 0 1px 4px rgba(0,0,0,0.4);
}

.company-main { display: flex; align-items: center; gap: 0.625rem; flex: 1; min-width: 0; }
.company-avatar {
  width: 1.75rem; height: 1.75rem;
  border-radius: var(--radius);
  background: var(--accent-dim);
  border: 1px solid rgba(59,130,246,0.15);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.625rem; font-weight: 700; color: var(--accent); flex-shrink: 0;
}
.company-name {
  font-family: var(--font-ui);
  font-size: var(--font-sm); font-weight: 600; color: #fff;
}
.company-meta { font-size: var(--font-xs); color: var(--text-3); margin-top: 2px; }

.company-stats { display: flex; gap: 1.25rem; }
.stat { text-align: center; }
.stat-val {
  font-family: var(--font-mono);
  font-size: var(--font-sm); font-weight: 700; color: var(--text);
  display: block; letter-spacing: -0.02em;
}
.stat-val.accent { color: var(--accent); }
.stat-key {
  font-size: 0.55rem; color: var(--text-3);
  letter-spacing: 0.08em; text-transform: uppercase;
  display: block; margin-top: 2px;
}

.company-actions { display: flex; gap: 4px; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: var(--font-xs); }

/* 斑马纹 */
.company-row:nth-child(even) {
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
  width: 18rem; max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  animation: dialogIn 0.2s ease-out;
}
.dialog-sm { width: 15rem; }
@keyframes dialogIn {
  from { opacity: 0; transform: scale(0.97) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
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
.form-item .input { width: 100%; }

.recharge-info {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--accent-dim);
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: var(--radius);
  padding: 0.5rem 0.625rem; margin-bottom: 0.75rem;
}
.recharge-name { font-size: var(--font-sm); font-weight: 600; color: #fff; }
.recharge-balance { font-size: var(--font-xs); color: var(--accent); }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.detail-label {
  font-family: var(--font-mono);
  font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-3); margin-bottom: 3px; display: block;
}
.detail-value {
  font-size: var(--font-sm); font-weight: 600; color: var(--text); display: block;
}
.detail-value.accent { color: var(--accent); }

.empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 2.5rem; color: var(--text-3);
}
.empty svg { opacity: 0.25; }
.empty p { font-family: var(--font-mono); font-size: var(--font-sm); }

/* Section header shared */
.section-header { display: flex; align-items: center; gap: 0.5rem; }
.section-bar { width: 20px; height: 2px; background: var(--accent); border-radius: 1px; flex-shrink: 0; }
.section-title {
  font-family: var(--font-mono);
  font-size: var(--font-xs); font-weight: 700; color: #fff;
  text-transform: uppercase; letter-spacing: 0.08em;
}

.mono { font-family: var(--font-mono); }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
