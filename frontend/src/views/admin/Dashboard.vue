<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="section-header">
      <div class="section-bar"></div>
      <span class="section-title">Overview</span>
    </div>
    <div class="stats-grid">
      <div
        class="stat-card"
        v-for="(stat, i) in stats"
        :key="i"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <div class="stat-icon-wrap">
          <component :is="stat.icon" :weight="200" :size="'0.875rem'" />
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 图表 + 排名 -->
    <div class="overview-row">
      <div class="card chart-card" :style="{ animationDelay: '240ms' }">
        <div class="card-header">
          <div class="section-header" style="margin-bottom:0">
            <div class="section-bar"></div>
            <span class="section-title" style="font-size:var(--font-xs)">Trend</span>
          </div>
          <div class="time-filters">
            <button
              v-for="t in timeFilters"
              :key="t.value"
              :class="['time-btn', { active: timeRange === t.value }]"
              @click="timeRange = t.value"
            >{{ t.label }}</button>
          </div>
        </div>
        <div class="chart-bars">
          <div v-for="(bar, i) in chartData" :key="i" class="bar-wrap">
            <div class="bar-fill" :style="{ height: `${bar.value}%` }"></div>
            <span class="bar-label">{{ bar.label }}</span>
          </div>
        </div>
        <div class="chart-legend">
          <span class="legend-item">
            <span class="legend-dot" style="background:#3B82F6"></span>
            <span>Generations</span>
          </span>
          <span class="legend-item">
            <span class="legend-dot" style="background:#FF6B35"></span>
            <span>Clicks</span>
          </span>
        </div>
      </div>

      <div class="card ranking-card" :style="{ animationDelay: '300ms' }">
        <div class="card-header">
          <div class="section-header" style="margin-bottom:0">
            <div class="section-bar"></div>
            <span class="section-title" style="font-size:var(--font-xs)">Top Balance</span>
          </div>
        </div>
        <div class="ranking-list">
          <div v-for="(item, i) in companyRanking" :key="i" class="ranking-item">
            <span :class="['rank-num', `rank-${i+1}`]">{{ String(i+1).padStart(2,'0') }}</span>
            <span class="rank-name">{{ item.company_name }}</span>
            <span class="rank-val">{{ item.balance.toLocaleString() }}</span>
          </div>
          <div v-if="companyRanking.length === 0" class="empty">No data</div>
        </div>
      </div>
    </div>

    <!-- 热门商家 -->
    <div class="card merchant-card" :style="{ animationDelay: '360ms' }">
      <div class="card-header">
        <div class="section-header" style="margin-bottom:0">
          <div class="section-bar"></div>
          <span class="section-title" style="font-size:var(--font-xs)">Top Merchants</span>
        </div>
      </div>
      <div class="merchant-list">
        <div v-for="(m, i) in topMerchants" :key="i" class="merchant-item">
          <span class="merchant-index">{{ String(i+1).padStart(2,'0') }}</span>
          <div class="merchant-avatar">{{ m.name?.charAt(0) || '?' }}</div>
          <span class="merchant-name">{{ m.name }}</span>
          <span class="merchant-gen">{{ m.generations || 0 }}</span>
          <span class="merchant-unit">times</span>
        </div>
        <div v-if="topMerchants.length === 0" class="empty">No data</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { OfficeBuilding, DataBoard, TrendCharts, Wallet } from '@element-plus/icons-vue'
import { admin } from '@/api'

const timeRange = ref('7d')
const timeFilters = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' }
]

const stats = ref([
  { label: 'Companies', value: '—', icon: OfficeBuilding },
  { label: 'Merchants', value: '—', icon: DataBoard },
  { label: 'Generations', value: '—', icon: TrendCharts },
  { label: 'Balance', value: '—', icon: Wallet }
])

const chartData = ref([
  { label: 'Mon', value: 0 }, { label: 'Tue', value: 0 },
  { label: 'Wed', value: 0 }, { label: 'Thu', value: 0 },
  { label: 'Fri', value: 0 }, { label: 'Sat', value: 0 },
  { label: 'Sun', value: 0 }
])

const companyRanking = ref([])
const topMerchants = ref([])

onMounted(async () => {
  try {
    const data = await admin.companies.list({ page: 1, page_size: 100 })
    if (data) {
      stats.value[0].value = (data.total || 0).toLocaleString()
      const totalBalance = data.list?.reduce((sum, m) => sum + (m.balance || 0), 0) || 0
      stats.value[3].value = totalBalance.toLocaleString()

      companyRanking.value = (data.list || [])
        .map(m => ({
          company_name: m.company_name || m.name || 'Unknown',
          balance: m.balance || 0
        }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5)
    }
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
.dashboard {
  animation: fadeUp 0.4s ease-out;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.4);
  transition: border-color 0.12s, box-shadow 0.12s;
  animation: fadeUp 0.35s ease-out both;
}
.stat-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-glow), 0 2px 8px rgba(0,0,0,0.4);
}

.stat-icon-wrap {
  width: 1.75rem; height: 1.75rem;
  border-radius: var(--radius);
  background: var(--accent-dim);
  border: 1px solid rgba(59,130,246,0.15);
  display: flex; align-items: center; justify-content: center;
  color: var(--accent); flex-shrink: 0;
}

.stat-body { min-width: 0; }
.stat-value {
  font-family: var(--font-mono);
  font-size: 1.125rem; font-weight: 700; color: #fff;
  line-height: 1; letter-spacing: -0.02em;
}
.stat-label {
  font-size: var(--font-xs); color: var(--text-2);
  margin-top: 0.2rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

/* Overview Row */
.overview-row {
  display: grid;
  grid-template-columns: 1fr 14rem;
  gap: 6px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.875rem 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.4);
  animation: fadeUp 0.35s ease-out both;
}

.card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.875rem;
}

.time-filters { display: flex; gap: 4px; }
.time-btn {
  padding: 0.2rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-2);
  font-family: var(--font-mono);
  font-size: var(--font-xs); cursor: pointer;
  transition: all 0.12s;
  letter-spacing: 0.05em;
}
.time-btn:hover { background: rgba(255,255,255,0.03); color: var(--text); }
.time-btn.active {
  background: var(--accent-dim); border-color: var(--accent);
  color: var(--accent);
}

/* Chart Bars */
.chart-bars {
  display: flex; align-items: flex-end; gap: 6px;
  height: 5rem; padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}
.bar-wrap {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 4px; height: 100%; justify-content: flex-end;
}
.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #3B82F6 0%, rgba(59,130,246,0.08) 100%);
  border-radius: 2px 2px 0 0;
  transition: height 0.5s ease;
  min-height: 2px;
}
.bar-label {
  font-family: var(--font-mono);
  font-size: 0.55rem; color: var(--text-3); letter-spacing: 0.03em;
}

.chart-legend { display: flex; gap: 1rem; padding-top: 0.5rem; }
.legend-item {
  display: flex; align-items: center; gap: 0.25rem;
  font-family: var(--font-mono);
  font-size: var(--font-xs); color: var(--text-2);
}
.legend-dot { width: 6px; height: 6px; border-radius: 50%; }

/* Ranking */
.ranking-list { display: flex; flex-direction: column; gap: 3px; }
.ranking-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid var(--border);
  animation: fadeIn 0.3s ease-out both;
}
.ranking-item:last-child { border-bottom: none; }
.rank-num {
  font-family: var(--font-mono);
  font-size: var(--font-xs); font-weight: 700;
  width: 1.25rem; flex-shrink: 0;
}
.rank-1 { color: #FFD700; }
.rank-2 { color: #aaaaaa; }
.rank-3 { color: #CD7F32; }
.rank-4, .rank-5 { color: var(--text-3); }

.rank-name {
  flex: 1; color: var(--text);
  font-size: var(--font-xs); white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.rank-val {
  font-family: var(--font-mono);
  font-size: var(--font-xs); font-weight: 600;
  color: var(--accent); flex-shrink: 0;
}

/* Merchants */
.merchant-list { display: flex; flex-direction: column; gap: 3px; }
.merchant-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid var(--border);
  animation: fadeIn 0.3s ease-out both;
}
.merchant-item:last-child { border-bottom: none; }
.merchant-index {
  font-family: var(--font-mono);
  font-size: var(--font-xs); color: var(--text-3);
  width: 1.25rem; flex-shrink: 0; text-align: center;
}
.merchant-avatar {
  width: 1.375rem; height: 1.375rem;
  border-radius: var(--radius);
  background: var(--accent-dim);
  border: 1px solid rgba(59,130,246,0.15);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.6rem; font-weight: 700; color: var(--accent); flex-shrink: 0;
}
.merchant-name { flex: 1; font-size: var(--font-xs); color: var(--text); }
.merchant-gen {
  font-family: var(--font-mono);
  font-size: var(--font-xs); font-weight: 600; color: var(--text);
}
.merchant-unit {
  font-family: var(--font-mono);
  font-size: 0.55rem; color: var(--text-3);
}

.empty { text-align: center; padding: 1.5rem; color: var(--text-3); font-size: var(--font-sm); }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 1366px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .overview-row { grid-template-columns: 1fr; }
}
</style>
