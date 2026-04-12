<template>
  <div class="admin-layout">
    <!-- 背景装饰 -->
    <div class="bg-glow"></div>
    <div class="bg-grid"></div>

    <!-- 侧边栏 -->
    <aside class="sidebar">
      <!-- Logo区 -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-title">创码</span>
            <span class="logo-sub">管理系统</span>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-title">主菜单</span>
          <router-link
            v-for="(item, i) in menuItems"
            :key="item.path"
            :to="item.path"
            :class="['nav-item', { active: $route.path.startsWith(item.path) }]"
            :style="{ animationDelay: `${i * 50}ms` }"
          >
            <div class="nav-item-inner">
              <div class="nav-icon-wrap">
                <component :is="item.icon" :weight="300" :size="20" />
              </div>
              <span class="nav-label">{{ item.name }}</span>
              <div class="nav-indicator"></div>
            </div>
          </router-link>
        </div>
      </nav>

      <!-- 底部信息 -->
      <div class="sidebar-footer">
        <div class="footer-stats">
          <div class="stat-item">
            <span class="stat-value">9</span>
            <span class="stat-label">在线</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">24</span>
            <span class="stat-label">任务</span>
          </div>
        </div>
        <router-link to="/merchants" class="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>返回商家中心</span>
        </router-link>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main">
      <!-- 顶栏 -->
      <header class="topbar">
        <div class="topbar-left">
          <div class="breadcrumb">
            <span class="breadcrumb-item">控制台</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current">{{ currentTitle }}</span>
          </div>
        </div>
        <div class="topbar-right">
          <button class="action-btn ai-btn" @click="toggleAI">
            <div class="btn-glow"></div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>AI 助手</span>
          </button>
          <div class="balance-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span class="balance-value">{{ balance }}</span>
            <span class="balance-unit">元</span>
            <a class="balance-recharge" href="https://api.chatfire.site/login" target="_blank">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              充值
            </a>
          </div>
          <div class="user-info">
            <div class="user-avatar">
              <span>A</span>
            </div>
            <div class="user-meta">
              <span class="user-name">管理员</span>
              <span class="user-role">Administrator</span>
            </div>
          </div>
        </div>
      </header>

      <!-- 内容区 -->
      <div class="content">
        <router-view />
      </div>
    </main>

    <!-- AI 助手弹窗 -->
    <Teleport to="body">
      <div class="ai-overlay" v-if="showAI" @click.self="toggleAI">
        <div class="ai-dialog">
          <div class="ai-dialog-header">
            <div class="ai-header-left">
              <div class="ai-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <div class="ai-header-text">
                <span class="ai-title">AI 助手</span>
                <span class="ai-status">在线</span>
              </div>
            </div>
            <button class="ai-close" @click="toggleAI">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="ai-dialog-body">
            <div class="ai-messages" ref="aiMessagesEl">
              <div class="ai-welcome">
                <div class="welcome-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                    <path d="M12 8v4M12 16h.01"/>
                  </svg>
                </div>
                <p class="welcome-text">您好！我是您的 AI 助手，可以帮您管理平台数据、分析趋势和解答问题。</p>
              </div>
              <div
                v-for="(msg, i) in aiMessages"
                :key="i"
                :class="['ai-message', msg.role]"
              >
                <div class="message-avatar">
                  <span v-if="msg.role === 'user'">U</span>
                  <span v-else>AI</span>
                </div>
                <div class="message-content">
                  <p>{{ msg.content }}</p>
                </div>
              </div>
              <div v-if="aiLoading" class="ai-message assistant">
                <div class="message-avatar"><span>AI</span></div>
                <div class="message-content typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="ai-dialog-footer">
            <input
              v-model="aiInput"
              class="ai-input"
              placeholder="输入您的问题..."
              @keyup.enter="sendAI"
            />
            <button class="ai-send" @click="sendAI" :disabled="aiLoading || !aiInput.trim()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Grid, OfficeBuilding, Document, Warning } from '@element-plus/icons-vue'
import { quota } from '@/api'

const route = useRoute()

// 剩余额度
const balance = ref('—')
let balanceTimer = null

const fetchBalance = async () => {
  try {
    const res = await quota.balance()
    if (res && res.data && res.data.availableBalance !== undefined) {
      balance.value = res.data.availableBalance.toLocaleString()
    }
  } catch (e) {
    console.error('额度查询失败', e)
  }
}

onMounted(() => {
  fetchBalance()
  balanceTimer = setInterval(fetchBalance, 3000)
})

onUnmounted(() => {
  if (balanceTimer) clearInterval(balanceTimer)
})

const menuItems = [
  { path: '/admin', name: '数据看板', icon: Grid },
  { path: '/admin/companies', name: '公司管理', icon: OfficeBuilding },
  { path: '/admin/prompts', name: '提示词库', icon: Document },
  { path: '/admin/sensitive', name: '敏感词库', icon: Warning }
]

const currentTitle = computed(() => {
  const item = menuItems.find(m => route.path.startsWith(m.path))
  return item?.name || '数据看板'
})

// AI Assistant
const showAI = ref(false)
const aiInput = ref('')
const aiMessages = ref([])
const aiLoading = ref(false)
const aiMessagesEl = ref(null)

const toggleAI = () => {
  showAI.value = !showAI.value
}

const sendAI = async () => {
  if (!aiInput.value.trim() || aiLoading.value) return
  const userMsg = aiInput.value.trim()
  aiMessages.value.push({ role: 'user', content: userMsg })
  aiInput.value = ''
  aiLoading.value = true
  await nextTick()
  if (aiMessagesEl.value) {
    aiMessagesEl.value.scrollTop = aiMessagesEl.value.scrollHeight
  }

  setTimeout(() => {
    aiMessages.value.push({ role: 'assistant', content: `您的问题是："${userMsg}"。作为演示，我会根据您的问题提供帮助。在生产环境中，这会连接到您的 AI 后端服务。` })
    aiLoading.value = false
    nextTick(() => {
      if (aiMessagesEl.value) {
        aiMessagesEl.value.scrollTop = aiMessagesEl.value.scrollHeight
      }
    })
  }, 1200)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

/* CSS Variables */
:root {
  --bg: #09090b;
  --surface: #18181b;
  --surface-2: #27272a;
  --surface-3: #3f3f46;
  --border: rgba(255,255,255,0.06);
  --border-bright: rgba(255,255,255,0.12);
  --text: #fafafa;
  --text-2: #a1a1aa;
  --text-3: #71717a;
  --accent: #f59e0b;
  --accent-hover: #fbbf24;
  --accent-dim: rgba(245, 158, 11, 0.12);
  --accent-glow: rgba(245, 158, 11, 0.25);
  --ai-color: #8b5cf6;
  --ai-dim: rgba(139, 92, 246, 0.12);
  --radius: 12px;
  --radius-sm: 8px;
  --sidebar: 260px;
  --topbar: 64px;
  --font-display: 'Space Grotesk', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-body: 'Noto Sans SC', -apple-system, sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
  position: relative;
  overflow-x: hidden;
}

/* 背景装饰 */
.bg-glow {
  position: fixed;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(245,158,11,0.03) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

/* Sidebar */
.sidebar {
  width: var(--sidebar);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--accent) 0%, #d97706 100%);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  box-shadow: 0 4px 12px var(--accent-glow);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.logo-sub {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--text-3);
  letter-spacing: 0.05em;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  overflow-y: auto;
}

.nav-section-title {
  display: block;
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0 12px;
  margin-bottom: 12px;
}

.nav-item {
  display: block;
  text-decoration: none;
  margin-bottom: 4px;
  animation: slideIn 0.3s ease-out both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-item-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.nav-item:hover .nav-item-inner {
  background: rgba(255,255,255,0.04);
  color: var(--text);
}

.nav-item.active .nav-item-inner {
  background: var(--accent-dim);
  color: var(--accent);
}

.nav-icon-wrap {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-item:hover .nav-icon-wrap {
  border-color: var(--border-bright);
}

.nav-item.active .nav-icon-wrap {
  background: var(--accent);
  border-color: var(--accent);
  color: #000;
}

.nav-label {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  flex: 1;
}

.nav-indicator {
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  transition: all 0.2s ease;
}

.nav-item.active .nav-indicator {
  opacity: 1;
  transform: scale(1);
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.footer-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-family: var(--font-body);
  font-size: 10px;
  color: var(--text-3);
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: var(--border);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255,255,255,0.04);
  border-color: var(--border-bright);
  color: var(--text);
}

/* Main */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  z-index: 1;
}

/* Topbar */
.topbar {
  height: var(--topbar);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar-left {
  display: flex;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 13px;
}

.breadcrumb-item {
  color: var(--text-3);
}

.breadcrumb-sep {
  color: var(--text-3);
}

.breadcrumb-current {
  color: var(--text);
  font-weight: 500;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--accent-dim);
  border: 1px solid rgba(245,158,11,0.2);
  border-radius: var(--radius-sm);
  color: var(--accent);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.ai-btn:hover {
  background: rgba(245,158,11,0.18);
  border-color: var(--accent);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent);
  animation: btnSweep 3s infinite;
}

@keyframes btnSweep {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.user-info {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: 24px;
  flex-shrink: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent) 0%, #d97706 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: #000;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.user-name {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

.user-role {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
}

.balance-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--accent-dim);
  border: 1px solid rgba(245,158,11,0.2);
  border-radius: var(--radius-sm);
  color: var(--accent);
  flex-shrink: 0;
}

.balance-value {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  white-space: nowrap;
}

.balance-value {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
}

.balance-recharge {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  padding: 4px 10px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: var(--radius-sm);
  color: #000;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.balance-recharge:hover {
  background: rgba(255,255,255,1);
  border-color: var(--accent);
  transform: scale(1.05);
}

.balance-unit {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--text-2);
}

/* Content */
.content {
  flex: 1;
  padding: 24px;
}

/* AI Dialog */
.ai-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ai-dialog {
  width: 480px;
  max-width: 90vw;
  max-height: 70vh;
  background: var(--surface);
  border: 1px solid var(--border-bright);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(0,0,0,0.5);
  animation: dialogIn 0.3s ease;
}

@keyframes dialogIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.ai-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.ai-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-icon {
  width: 40px;
  height: 40px;
  background: var(--ai-dim);
  border: 1px solid rgba(139,92,246,0.2);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ai-color);
}

.ai-header-text {
  display: flex;
  flex-direction: column;
}

.ai-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.ai-status {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #22c55e;
}

.ai-close {
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ai-close:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text);
}

.ai-dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.ai-messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.welcome-icon {
  width: 56px;
  height: 56px;
  background: var(--ai-dim);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ai-color);
  margin-bottom: 16px;
}

.welcome-text {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.6;
  max-width: 300px;
}

.ai-message {
  display: flex;
  gap: 12px;
  animation: msgIn 0.3s ease;
}

@keyframes msgIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.ai-message.user .message-avatar {
  background: var(--accent-dim);
  color: var(--accent);
}

.ai-message.assistant .message-avatar {
  background: var(--ai-dim);
  color: var(--ai-color);
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
}

.ai-message.user .message-content {
  background: var(--accent-dim);
  border-color: rgba(245,158,11,0.2);
}

.message-content p {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text);
  line-height: 1.5;
}

.message-content.typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}

.message-content.typing span {
  width: 8px;
  height: 8px;
  background: var(--ai-color);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite;
}

.message-content.typing span:nth-child(2) { animation-delay: 0.2s; }
.message-content.typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

.ai-dialog-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.ai-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.ai-input:focus {
  border-color: var(--ai-color);
}

.ai-input::placeholder {
  color: var(--text-3);
}

.ai-send {
  width: 44px;
  height: 44px;
  background: var(--ai-color);
  border: none;
  border-radius: var(--radius-sm);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ai-send:hover:not(:disabled) {
  background: #7c3aed;
  transform: scale(1.05);
}

.ai-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-bright);
}

/* Responsive */
@media (max-width: 1024px) {
  :root {
    --sidebar: 220px;
    --topbar: 56px;
  }
  .content { padding: 20px; }
}

@media (max-width: 768px) {
  :root {
    --sidebar: 72px;
  }
  .logo-text, .nav-label, .nav-section-title, .footer-stats, .back-btn span {
    display: none;
  }
  .logo-container {
    justify-content: center;
  }
  .nav-item-inner {
    justify-content: center;
    padding: 12px;
  }
  .topbar-right {
    gap: 8px;
  }
  .user-info {
    padding: 4px;
  }
  .user-meta {
    display: none;
  }
}
</style>
