<template>
  <div class="dashboard-panel">
    <div class="panel-header">
      <h3 class="panel-title">数据看板</h3>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value primary">{{ stats.generation_count }}</div>
        <div class="stat-label">生成数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value success">{{ stats.daily_active }}</div>
        <div class="stat-label">日活数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value info">{{ stats.click_jump_count }}</div>
        <div class="stat-label">跳转数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value purple">{{ stats.conversion_rate }}%</div>
        <div class="stat-label">转化率</div>
      </div>
    </div>

    <!-- 趋势图 -->
    <div class="chart-section">
      <h4 class="chart-title">生成趋势</h4>
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      generation_count: 0,
      daily_active: 0,
      click_jump_count: 0,
      conversion_rate: 0,
      daily_trend: []
    })
  }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const dates = props.stats.daily_trend?.map(t => t.date) || []
  const values = props.stats.daily_trend?.map(t => t.generation) || []

  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'var(--text-3)', fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: 'var(--text-3)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisTick: { show: false }
    },
    series: [{
      data: values,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#3b82f6',
        width: 2
      },
      itemStyle: {
        color: '#3b82f6',
        borderColor: '#fff',
        borderWidth: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }
        ])
      }
    }]
  }

  chartInstance.setOption(option)
}

watch(() => props.stats, () => {
  if (chartInstance) {
    initChart()
  }
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chartInstance?.resize())
})
</script>

<style scoped>
.dashboard-panel {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
}

.panel-header {
  margin-bottom: 20px;
}

.panel-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: var(--text);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  text-align: center;
}

.stat-value {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 24px;
  margin-bottom: 4px;
}

.stat-value.primary { color: #3b82f6; }
.stat-value.success { color: #22c55e; }
.stat-value.info { color: #06b6d4; }
.stat-value.purple { color: #a855f7; }

.stat-label {
  font-size: 12px;
  color: var(--text-3);
}

.chart-section {
  padding: 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.chart-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-2);
  margin-bottom: 16px;
}

.chart-container {
  height: 200px;
}

html.light-theme .stat-card {
  background: var(--surface-3);
}

html.light-theme .chart-section {
  background: var(--surface-3);
}
</style>
