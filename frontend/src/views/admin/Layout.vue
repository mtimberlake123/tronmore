<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-mark">管</div>
        <div>
          <strong>创码后台</strong>
          <span>系统运营中心</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-item', { active: $route.path.startsWith(item.path) }]"
        >
          <component :is="item.icon" class="nav-icon" />
          <span>{{ item.name }}</span>
        </router-link>
      </nav>

      <router-link to="/merchants" class="back-link">返回商家中心</router-link>
    </aside>

    <main class="main-panel">
      <header class="admin-topbar">
        <div>
          <p class="topbar-caption">系统后台</p>
          <h1 class="topbar-title">{{ currentTitle }}</h1>
        </div>

        <div class="topbar-actions">
          <button class="btn btn-outline" type="button" @click="toggleTheme">
            <component :is="isDark ? Sunny : Moon" class="icon-16" />
            {{ isDark ? '日间模式' : '夜间模式' }}
          </button>

          <button class="btn btn-primary" type="button" @click="showAssistant = true">
            <Promotion class="icon-16" />
            智能助手
          </button>

          <div class="balance-card">
            <span class="balance-label">可用额度</span>
            <strong class="balance-value">{{ balance }}</strong>
          </div>

          <div class="admin-user">
            <span class="user-dot">管</span>
            <div>
              <strong>系统管理员</strong>
              <span>后台账号</span>
            </div>
          </div>
        </div>
      </header>

      <div class="content">
        <router-view />
      </div>
    </main>

    <Teleport to="body">
      <div v-if="showAssistant" class="assistant-mask" @click.self="showAssistant = false">
        <div class="assistant-panel">
          <div class="assistant-header">
            <div>
              <strong>智能助手</strong>
              <span>帮助查看数据与整理运营思路</span>
            </div>
            <button class="assistant-close" type="button" @click="showAssistant = false">关闭</button>
          </div>

          <div class="assistant-body">
            <div class="assistant-welcome">你好，我可以协助你梳理平台数据、业务问题和投放建议。</div>

            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['assistant-msg', msg.role]"
            >
              <span class="msg-badge">{{ msg.role === 'user' ? '我' : '助' }}</span>
              <div class="msg-content">{{ msg.content }}</div>
            </div>

            <div v-if="assistantLoading" class="assistant-msg assistant">
              <span class="msg-badge">助</span>
              <div class="msg-content">正在整理回复，请稍候...</div>
            </div>
          </div>

          <div class="assistant-footer">
            <input v-model="assistantInput" class="input" placeholder="请输入你的问题" @keyup.enter="sendAssistant" />
            <button class="btn btn-primary" type="button" :disabled="assistantLoading || !assistantInput.trim()" @click="sendAssistant">
              发送
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Grid, OfficeBuilding, Document, Warning, Moon, Sunny, Promotion } from '@element-plus/icons-vue'
import { quota } from '@/api'

const route = useRoute()

const menuItems = [
  { path: '/admin', name: '数据看板', icon: Grid },
  { path: '/admin/companies', name: '公司管理', icon: OfficeBuilding },
  { path: '/admin/prompts', name: '提示词库', icon: Document },
  { path: '/admin/sensitive', name: '风控规则', icon: Warning }
]

const currentTitle = computed(() => {
  const current = menuItems.find(item => route.path.startsWith(item.path))
  return current?.name || '数据看板'
})

const balance = ref('--')
const isDark = ref(localStorage.getItem('theme') === 'dark')
const showAssistant = ref(false)
const assistantInput = ref('')
const assistantLoading = ref(false)
const messages = ref([])
let balanceTimer = null

const applyTheme = () => {
  document.documentElement.classList.toggle('dark-theme', isDark.value)
  document.documentElement.classList.toggle('light-theme', !isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
}

const fetchBalance = async () => {
  try {
    const res = await quota.balance()
    if (res?.data?.availableBalance !== undefined) {
      balance.value = res.data.availableBalance.toLocaleString()
    }
  } catch (error) {
    console.error(error)
  }
}

const sendAssistant = async () => {
  if (!assistantInput.value.trim() || assistantLoading.value) return

  const text = assistantInput.value.trim()
  messages.value.push({ role: 'user', content: text })
  assistantInput.value = ''
  assistantLoading.value = true
  await nextTick()

  setTimeout(() => {
    messages.value.push({
      role: 'assistant',
      content: `已收到你的问题：“${text}”。当前这里仍是演示回复，你可以继续接入真实智能分析服务。`
    })
    assistantLoading.value = false
  }, 900)
}

onMounted(() => {
  applyTheme()
  fetchBalance()
  balanceTimer = setInterval(fetchBalance, 3000)
})

onUnmounted(() => {
  if (balanceTimer) clearInterval(balanceTimer)
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  padding: 20px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 22px;
  box-shadow: var(--shadow-sm);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: var(--accent);
  color: #fff;
  font-weight: 800;
}

.sidebar-brand strong {
  display: block;
  font-family: var(--font-display);
}

.sidebar-brand span {
  color: var(--text-3);
  font-size: 12px;
}

.sidebar-nav {
  display: grid;
  gap: 8px;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  color: var(--text-2);
}

.nav-item:hover {
  background: var(--surface-2);
  color: var(--text);
}

.nav-item.active {
  background: var(--accent-dim);
  color: var(--accent);
  font-weight: 700;
}

.nav-icon,
.icon-16 {
  width: 16px;
  height: 16px;
}

.back-link {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
}

.main-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 8px;
}

.topbar-caption {
  margin: 0 0 6px;
  color: var(--text-3);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.topbar-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 28px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.balance-card,
.admin-user {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.balance-card {
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 14px;
}

.balance-label,
.admin-user span {
  color: var(--text-3);
  font-size: 12px;
}

.balance-value {
  font-family: var(--font-mono);
  font-size: 18px;
}

.user-dot {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
}

.admin-user strong {
  display: block;
  font-size: 14px;
}

.content {
  padding: 16px 24px 24px;
}

.assistant-mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 36, 0.34);
  backdrop-filter: blur(6px);
}

.assistant-panel {
  width: min(560px, calc(100vw - 32px));
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
}

.assistant-header,
.assistant-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
}

.assistant-header span {
  display: block;
  margin-top: 4px;
  color: var(--text-3);
  font-size: 12px;
}

.assistant-close {
  border: none;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
}

.assistant-body {
  max-height: 420px;
  overflow: auto;
  padding: 20px;
  display: grid;
  gap: 12px;
}

.assistant-welcome,
.msg-content {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  line-height: 1.7;
}

.assistant-msg {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
}

.assistant-msg.user .msg-content {
  background: var(--accent-dim);
}

.msg-badge {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--surface-3);
  font-size: 12px;
  font-weight: 700;
}

.assistant-footer {
  border-top: 1px solid var(--border);
  border-bottom: none;
}

@media (max-width: 960px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    padding: 16px;
  }

  .sidebar-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .admin-layout {
    padding: 12px;
    gap: 12px;
  }

  .sidebar-nav,
  .topbar-actions {
    grid-template-columns: 1fr;
  }

  .admin-topbar,
  .content {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
