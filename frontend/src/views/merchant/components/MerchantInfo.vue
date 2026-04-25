<template>
  <div class="merchant-info-panel">
    <div class="panel-header">
      <h3 class="panel-title">商家信息</h3>
    </div>

    <div class="info-section">
      <div class="merchant-header">
        <el-avatar :size="56" :src="merchant.logo" class="merchant-logo">
          <span class="material-symbols-outlined text-2xl">storefront</span>
        </el-avatar>
        <div class="merchant-details">
          <h2 class="merchant-name">{{ merchant.name || '未命名商家' }}</h2>
          <div class="quota-badge">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 1.5Z"/>
            </svg>
            <span>剩余 {{ merchant.balance || 0 }} 次</span>
          </div>
        </div>
      </div>
    </div>

    <button class="recharge-btn-full" @click="$emit('recharge')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
      </svg>
      <span>充值额度</span>
    </button>

    <div class="modules-section">
      <h4 class="section-title">模块管理</h4>
      <div class="module-list">
        <button
          v-for="module in modules"
          :key="module.key"
          :class="['module-btn', { active: activeModule === module.key }]"
          @click="$emit('module-click', module.key)"
        >
          <component :is="module.icon" class="icon-20" />
          <span>{{ module.name }}</span>
          <svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6l6 6-6 6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChatLineRound, Picture, Files, Ticket, Tools, DataBoard } from '@element-plus/icons-vue'

const props = defineProps({
  merchant: {
    type: Object,
    default: () => ({})
  },
  activeModule: {
    type: String,
    default: null
  }
})

defineEmits(['module-click', 'recharge'])

const modules = [
  { key: 'dashboard', name: '数据看板', icon: DataBoard },
  { key: 'config', name: '商家配置', icon: Tools },
  { key: 'review-generator', name: '点评生成', icon: ChatLineRound },
  { key: 'warehouse', name: '图库管理', icon: Picture },
  { key: 'reference', name: '资料管理', icon: Files },
  { key: 'generator', name: '贴纸生成', icon: Ticket },
]

const currentModuleName = computed(() => {
  return modules.find(m => m.key === props.activeModule)?.name || ''
})
</script>

<style scoped>
.merchant-info-panel {
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

.info-section {
  margin-bottom: 24px;
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--surface-2);
  border-radius: 14px;
}

.merchant-logo {
  background: var(--surface-3);
  border: 2px solid var(--border);
  flex-shrink: 0;
}

.merchant-details {
  flex: 1;
  min-width: 0;
}

.merchant-name {
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--text);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quota-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

.recharge-btn-full {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: var(--accent);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recharge-btn-full:hover {
  background: var(--accent-hover, #2563eb);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.modules-section {
  margin-bottom: 16px;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 12px;
  color: var(--text-3);
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.module-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-2);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.module-btn:hover {
  background: var(--surface-3);
  border-color: var(--border-strong);
  color: var(--text);
}

.module-btn.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--accent);
}

.module-btn span {
  flex: 1;
  text-align: left;
}

.arrow-icon {
  opacity: 0.5;
  transition: transform 0.2s ease;
}

.icon-20 {
  width: 20px;
  height: 20px;
}

.module-btn:hover .arrow-icon {
  transform: translateX(4px);
  opacity: 1;
}

html.light-theme .merchant-header,
html.light-theme .module-btn {
  background: var(--surface-3);
}
</style>

