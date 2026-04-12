<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">数据看板</h1>
        <p class="page-desc">实时监控平台运营数据</p>
      </div>
      <div class="header-actions">
        <button class="time-btn" :class="{ active: timeRange === '7d' }" @click="timeRange = '7d'">近7天</button>
        <button class="time-btn" :class="{ active: timeRange === '30d' }" @click="timeRange = '30d'">近30天</button>
        <button class="time-btn" @click="showSettings = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          API配置
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div
        class="stat-card"
        v-for="(stat, i) in stats"
        :key="i"
        :style="{ animationDelay: `${i * 80}ms` }"
      >
        <div class="stat-icon">
          <component :is="stat.icon" :weight="300" :size="24" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
        <div class="stat-trend" v-if="stat.trend">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l8 8H4z"/>
          </svg>
          <span>{{ stat.trend }}%</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-grid">
      <!-- 趋势图表 -->
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title">
            <div class="title-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 3v18h18"/>
                <path d="M18 9l-5 5-4-4-3 3"/>
              </svg>
            </div>
            <div class="title-text">
              <span class="title-main">生成趋势</span>
              <span class="title-sub">近7天数据</span>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background: var(--accent)"></span>
              <span>生成数</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: #f472b6"></span>
              <span>点击数</span>
            </div>
          </div>
        </div>
        <div class="chart-area">
          <div class="chart-bars">
            <div
              v-for="(bar, i) in chartData"
              :key="i"
              class="bar-item"
            >
              <div class="bar-group">
                <div class="bar-fill primary" :style="{ height: `${bar.generation}%` }"></div>
                <div class="bar-fill secondary" :style="{ height: `${bar.click}%` }"></div>
              </div>
              <span class="bar-label">{{ bar.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 排行榜 -->
      <div class="card ranking-card">
        <div class="card-header">
          <div class="card-title">
            <div class="title-icon gold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z"/>
              </svg>
            </div>
            <div class="title-text">
              <span class="title-main">额度排行</span>
              <span class="title-sub">Top 5 公司</span>
            </div>
          </div>
        </div>
        <div class="ranking-list">
          <div
            v-for="(item, i) in companyRanking"
            :key="i"
            class="ranking-item"
            :style="{ animationDelay: `${(i + 4) * 80}ms` }"
          >
            <div class="rank-badge" :class="`rank-${i+1}`">
              <span>{{ String(i+1).padStart(2, '0') }}</span>
            </div>
            <div class="rank-info">
              <span class="rank-name">{{ item.company_name }}</span>
              <span class="rank-meta">{{ item.merchants || 0 }} 个商家</span>
            </div>
            <div class="rank-value">
              <span class="value-num">{{ item.balance?.toLocaleString() || 0 }}</span>
              <span class="value-unit">次</span>
            </div>
          </div>
          <div v-if="companyRanking.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6M12 16h.01"/>
            </svg>
            <p>暂无数据</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门商家 -->
    <div class="card merchant-card">
      <div class="card-header">
        <div class="card-title">
          <div class="title-icon purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z"/>
            </svg>
          </div>
          <div class="title-text">
            <span class="title-main">热门商家</span>
            <span class="title-sub">生成次数最多的商家</span>
          </div>
        </div>
      </div>
      <div class="merchant-grid">
        <div
          v-for="(m, i) in topMerchants"
          :key="i"
          class="merchant-item"
          :style="{ animationDelay: `${(i + 9) * 60}ms` }"
        >
          <div class="merchant-rank">#{{ i + 1 }}</div>
          <div class="merchant-avatar">{{ m.name?.charAt(0) || '?' }}</div>
          <div class="merchant-info">
            <span class="merchant-name">{{ m.name }}</span>
            <span class="merchant-company">{{ m.company_name }}</span>
          </div>
          <div class="merchant-stats">
            <span class="stat-num">{{ m.generations || 0 }}</span>
            <span class="stat-unit">次生成</span>
          </div>
        </div>
        <div v-if="topMerchants.length === 0" class="empty-state full">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M8 12h8M12 8v8"/>
          </svg>
          <p>暂无热门商家</p>
        </div>
      </div>
    </div>

    <!-- API配置弹窗 -->
    <div class="dialog-overlay" v-if="showSettings" @click.self="showSettings = false">
      <div class="dialog">
        <div class="dialog-header">
          <div class="section-header" style="margin-bottom:0">
            <div class="section-bar"></div>
            <span class="section-title">API 配置</span>
          </div>
          <button class="dialog-close" @click="showSettings = false">
            <svg width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label>API Key</label>
            <input v-model="apiKeyForm" class="input" placeholder="输入 API Key" />
          </div>
          <div class="form-hint">用于查询外部额度接口，请妥善保管</div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showSettings = false">取消</button>
          <button class="btn btn-primary" @click="saveApiKey">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { OfficeBuilding, Shop, TrendCharts, Wallet } from '@element-plus/icons-vue'
import { admin, quota } from '@/api'

const timeRange = ref('7d')
const showSettings = ref(false)
const apiKeyForm = ref(localStorage.getItem('apiKey') || 'sk-MtssNtmuPIELmwWO5wY8bK3TOfGGofGjmOwmxCQEOXqZCVN1')

const saveApiKey = () => {
  localStorage.setItem('apiKey', apiKeyForm.value)
  showSettings.value = false
  ElMessage.success('API Key 已保存')
}

const stats = ref([
  { label: '公司总数', value: '—', icon: OfficeBuilding, trend: null },
  { label: '商家总数', value: '—', icon: Shop, trend: null },
  { label: '生成次数', value: '—', icon: TrendCharts, trend: null },
  { label: '剩余额度', value: '—', icon: Wallet, trend: null }
])

const chartData = ref([
  { label: '周一', generation: 0, click: 0 },
  { label: '周二', generation: 0, click: 0 },
  { label: '周三', generation: 0, click: 0 },
  { label: '周四', generation: 0, click: 0 },
  { label: '周五', generation: 0, click: 0 },
  { label: '周六', generation: 0, click: 0 },
  { label: '周日', generation: 0, click: 0 }
])

const companyRanking = ref([])
const topMerchants = ref([])

onMounted(async () => {
  try {
    const data = await admin.companies.list({ page: 1, page_size: 100 })
    if (data) {
      stats.value[0].value = (data.total || 0).toLocaleString()
      const totalMerchants = data.list?.reduce((sum, m) => sum + (m.merchants || 0), 0) || 0
      stats.value[1].value = totalMerchants.toLocaleString()

      // 排行榜
      companyRanking.value = (data.list || [])
        .map(m => ({
          company_name: m.company_name || m.name || '未知公司',
          balance: m.balance || 0,
          merchants: m.merchants || 0
        }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5)

      // 热门商家
      topMerchants.value = (data.list || [])
        .map(m => ({
          name: m.name,
          company_name: m.company_name || m.name || '',
          generations: m.generations || 0
        }))
        .filter(m => m.generations > 0)
        .sort((a, b) => b.generations - a.generations)
        .slice(0, 6)
    }

    // 从外部API获取剩余额度
    try {
      const res = await quota.balance()
      if (res && res.data && res.data.availableBalance !== undefined) {
        stats.value[3].value = res.data.availableBalance.toLocaleString()
      }
    } catch (e) {
      console.error('额度查询失败', e)
    }
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.dashboard {
  animation: fadeUp 0.5s ease-out;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.page-desc {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-3);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.time-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-btn:hover {
  border-color: var(--border-bright);
  color: var(--text);
}

.time-btn.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  color: var(--accent);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: fadeUp 0.4s ease-out both;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  border-color: var(--border-bright);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: var(--accent-dim);
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-label {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-3);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  background: rgba(34,197,94,0.1);
  border-radius: 12px;
  color: #22c55e;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  animation: fadeUp 0.4s ease-out both;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 40px;
  height: 40px;
  background: var(--accent-dim);
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.title-icon.gold {
  background: rgba(251,191,36,0.12);
  border-color: rgba(251,191,36,0.2);
  color: #fbbf24;
}

.title-icon.purple {
  background: var(--ai-dim);
  border-color: rgba(139,92,246,0.2);
  color: #8b5cf6;
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-main {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.title-sub {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text-3);
}

/* Chart */
.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text-2);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chart-area {
  height: 200px;
  padding-top: 20px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  gap: 12px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.bar-group {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  height: 100%;
  width: 100%;
}

.bar-fill {
  width: 12px;
  border-radius: 4px 4px 0 0;
  transition: height 0.6s ease;
  min-height: 4px;
}

.bar-fill.primary {
  background: linear-gradient(180deg, var(--accent) 0%, rgba(245,158,11,0.3) 100%);
}

.bar-fill.secondary {
  background: linear-gradient(180deg, #f472b6 0%, rgba(244,114,182,0.3) 100%);
}

.bar-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
}

/* Ranking */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  animation: fadeUp 0.4s ease-out both;
  transition: all 0.2s ease;
}

.ranking-item:hover {
  background: rgba(255,255,255,0.04);
  border-color: var(--border-bright);
}

.rank-badge {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #000;
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #a1a1aa 0%, #71717a 100%);
  color: #000;
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #a0522d 100%);
  color: #fff;
}

.rank-badge.rank-4, .rank-badge.rank-5 {
  background: rgba(255,255,255,0.05);
  color: var(--text-3);
}

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rank-name {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-meta {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--text-3);
}

.rank-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.value-num {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
}

.value-unit {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--text-3);
}

/* Merchants */
.merchant-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.merchant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  animation: fadeUp 0.4s ease-out both;
  transition: all 0.2s ease;
}

.merchant-item:hover {
  background: rgba(255,255,255,0.04);
  border-color: var(--border-bright);
  transform: translateY(-1px);
}

.merchant-rank {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-3);
  width: 28px;
}

.merchant-avatar {
  width: 40px;
  height: 40px;
  background: var(--accent-dim);
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
}

.merchant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.merchant-name {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.merchant-company {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--text-3);
}

.merchant-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.stat-num {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.stat-unit {
  font-family: var(--font-body);
  font-size: 10px;
  color: var(--text-3);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-3);
  gap: 12px;
}

.empty-state p {
  font-family: var(--font-body);
  font-size: 14px;
}

.empty-state.full {
  grid-column: 1 / -1;
}

/* Responsive */
@media (max-width: 1366px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .main-grid {
    grid-template-columns: 1fr;
  }
  .merchant-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .merchant-grid {
    grid-template-columns: 1fr;
  }
}

/* Dialog */
.dialog-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(4px);
}
.dialog {
  background: var(--surface);
  border: 1px solid var(--border-bright);
  border-radius: var(--radius);
  width: 18rem; max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  animation: dialogIn 0.2s ease-out;
}
.dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1rem; border-bottom: 1px solid var(--border);
}
.dialog-close {
  width: 1.25rem; height: 1.25rem;
  border-radius: var(--radius-sm);
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
.form-item label {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--font-xs); color: var(--text-2);
  margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.08em;
}
.form-item .input { width: 100%; }
.form-hint {
  font-family: var(--font-body);
  font-size: 11px; color: var(--text-3);
  margin-top: 4px;
}
@keyframes dialogIn {
  from { opacity: 0; transform: scale(0.97) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.section-header { display: flex; align-items: center; gap: 0.5rem; }
.section-bar { width: 20px; height: 2px; background: var(--accent); border-radius: 1px; flex-shrink: 0; }
.section-title {
  font-family: var(--font-mono);
  font-size: var(--font-xs); font-weight: 700; color: #fff;
  text-transform: uppercase; letter-spacing: 0.08em;
}
</style>
