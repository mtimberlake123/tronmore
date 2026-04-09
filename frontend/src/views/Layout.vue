<template>
  <div class="app-layout">
    <!-- 顶栏 -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="logo-mark">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="6" stroke="currentColor" stroke-width="2"/>
            <rect x="7" y="7" width="6" height="6" rx="1.5" fill="currentColor"/>
            <rect x="15" y="7" width="6" height="6" rx="1.5" fill="currentColor"/>
            <rect x="7" y="15" width="6" height="6" rx="1.5" fill="currentColor"/>
            <rect x="17" y="17" width="2" height="2" rx="0.5" fill="currentColor"/>
          </svg>
        </div>
        <span class="logo-text">创码</span>
      </div>
      <div class="topbar-right">
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换日间模式' : '切换夜间模式'">
          <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3V1m0 22v-2M5.6 5.6L4.2 4.2m15.6 15.6l-1.4-1.4M1 12h2m18 0h2M5.6 18.4l-1.4 1.4M18.4 5.6l-1.4-1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z"/>
          </svg>
        </button>
        <div class="quota-badge">
          <span class="quota-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 1.5Z"/>
            </svg>
          </span>
          <span class="quota-text">{{ balance }} 次</span>
        </div>
        <div class="user-badge">
          <span class="user-avatar">{{ userInitial }}</span>
          <span class="user-name">{{ companyName }}</span>
        </div>
      </div>
    </header>

    <!-- 两列布局 -->
    <div class="body-layout">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="['nav-item', { active: $route.path.startsWith(item.path) }]"
          >
            <div class="nav-icon">
              <component :is="item.icon" :weight="200" :size="22" />
            </div>
            <span class="nav-label">{{ item.name }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- 内容区 -->
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth, merchant } from '@/api'
import { ElMessage } from 'element-plus'
import { House, Picture, Files } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const balance = ref(0)
const isDark = ref(true)
const companyName = localStorage.getItem('company_name') || ''

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.remove('light-theme')
  } else {
    document.documentElement.classList.add('light-theme')
  }
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const userInitial = computed(() => companyName ? companyName.charAt(0) : 'U')

const menuItems = [
  { path: '/merchants', name: '商家中心', icon: House },
  { path: '/factory', name: '宣传工厂', icon: Picture },
  { path: '/references', name: '资料管理', icon: Files }
]

const currentTitle = computed(() => {
  const item = menuItems.find(m => route.path.startsWith(m.path))
  return item?.name || '创码'
})

const handleCommand = async (cmd) => {
  if (cmd === 'logout') {
    try { await auth.logout() } catch (e) {}
    localStorage.removeItem('token')
    localStorage.removeItem('company_id')
    localStorage.removeItem('company_name')
    router.push('/login')
    ElMessage.success('已退出登录')
  }
}

onMounted(async () => {
  // 恢复主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.add('light-theme')
  }
  try {
    const res = await merchant.list({ page: 1, page_size: 1 })
    if (res.list?.length > 0) balance.value = res.list[0].balance
  } catch (e) {}
})
</script>

<style>
/* 基础重置 */
* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg: #0e0e0e;
  --surface: #131313;
  --surface-2: #1a1a1a;
  --border: rgba(255,255,255,0.06);
  --text: #e2e2e2;
  --text-2: #888;
  --text-3: #555;
  --accent: #007AFF;
  --radius: 16px;
  --sidebar: 240px;
}

/* 日间模式 */
.light-theme {
  --bg: #f5f7fa;
  --surface: #ffffff;
  --surface-2: #f0f2f5;
  --border: rgba(0,0,0,0.08);
  --text: #1a1a1a;
  --text-2: #666;
  --text-3: #999;
}

.light-theme .sidebar {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* 布局 */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 两列布局 */
.body-layout {
  display: flex;
  flex: 1;
  gap: 20px;
  padding: 20px;
  padding-top: 0;
}

/* 侧边栏 */
.sidebar {
  width: var(--sidebar);
  background: var(--surface);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* Logo */
.logo-mark {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

/* 导航 */
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius);
  color: var(--text-2);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.nav-item:hover {
  background: color-mix(in srgb, var(--text) 8%, transparent);
  color: var(--text);
}

.nav-item.active {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

/* 顶栏 */
.topbar {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background: var(--surface);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle:hover {
  background: rgba(255,255,255,0.1);
  color: var(--text);
}

.light-theme .theme-toggle {
  background: rgba(0,0,0,0.05);
  border-color: rgba(0,0,0,0.1);
  color: var(--text-2);
}

.light-theme .theme-toggle:hover {
  background: rgba(0,0,0,0.1);
  color: var(--text);
}

.quota-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 20px;
}

.quota-icon {
  color: var(--accent);
}

.quota-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  background: color-mix(in srgb, var(--text) 5%, transparent);
  border: 1px solid var(--border);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-badge:hover {
  background: color-mix(in srgb, var(--text) 10%, transparent);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent), #0055cc);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

/* 内容区 */
.content {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
}
</style>
