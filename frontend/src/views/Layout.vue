<template>
  <div class="app-layout">
    <!-- 顶栏 -->
    <header class="topbar">
      <div class="topbar-left">
        <div class="logo-wrapper">
          <img src="@/assets/logo.png" alt="logo" class="logo-img" />
        </div>
      </div>

      <!-- 圆角Tab导航 -->
      <nav class="topbar-tabs topbar-center">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="['tab-item', { active: $route.path.startsWith(item.path) }]"
        >
          <component :is="item.icon" :weight="500" :size="18" />
          <span class="tab-text">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="topbar-right">
        <div class="user-dropdown" :class="{ active: showDropdown }" @click="showDropdown = !showDropdown">
          <div class="user-badge">
            <span class="user-avatar">{{ userInitial }}</span>
            <span class="user-name">{{ companyName }}</span>
            <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>
          <div class="dropdown-menu" v-show="showDropdown">
            <div class="dropdown-item quota-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 1.5Z"/>
              </svg>
              <span>剩余 {{ balance }} 次</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" @click="toggleTheme">
              <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3V1m0 22v-2M5.6 5.6L4.2 4.2m15.6 15.6l-1.4-1.4M1 12h2m18 0h2M5.6 18.4l-1.4 1.4M18.4 5.6l-1.4-1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z"/>
              </svg>
              <span>{{ isDark ? '日间模式' : '夜间模式' }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item danger" @click="handleLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 内容区 -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth, merchant } from '@/api'
import { ElMessage } from 'element-plus'
import { House, Picture, Files } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const balance = ref(0)
const isDark = ref(true)
const showDropdown = ref(false)
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

const handleLogout = () => {
  showDropdown.value = false
  handleCommand('logout')
}

onMounted(async () => {
  // 点击外部关闭下拉菜单
  document.addEventListener('click', handleClickOutside)
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

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (e) => {
  if (!e.target.closest('.user-dropdown')) {
    showDropdown.value = false
  }
}
</script>

<style>
/* 基础重置 */
* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  /* 夜间模式 - 深色科技蓝 */
  --bg: #0f0f0f;
  --surface: #1a1a1a;
  --surface-2: #242424;
  --surface-3: #2e2e2e;
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.15);
  --text: #ffffff;
  --text-2: #b0b0b0;
  --text-3: #707070;
  --accent: #3b82f6;
  --accent-light: #60a5fa;
  --accent-dark: #2563eb;
  --accent-glow: rgba(59, 130, 246, 0.2);
  --radius: 14px;
  --sidebar: 158px;
}

/* 日间模式 - 明亮清晰 */
.light-theme {
  --bg: #f0f2f5;
  --surface: #ffffff;
  --surface-2: #f8f9fa;
  --surface-3: #e8eaed;
  --border: rgba(0, 0, 0, 0.1);
  --border-strong: rgba(0, 0, 0, 0.18);
  --text: #1a1a1a;
  --text-2: #5a5a5a;
  --text-3: #909090;
  --accent: #2563eb;
  --accent-light: #3b82f6;
  --accent-dark: #1d4ed8;
  --accent-glow: rgba(37, 99, 235, 0.12);
}

html.light-theme .logo-img {
  filter: brightness(0) sepia(1) hue-rotate(200deg) saturate(3) brightness(0.9);
}

/* Light Theme Tabs */
html.light-theme .topbar-tabs {
  background: rgba(0, 0, 0, 0.04);
  border-color: var(--border-strong);
}

html.light-theme .tab-item {
  color: var(--text-2);
}

html.light-theme .tab-item:hover {
  color: var(--text);
  background: rgba(0, 0, 0, 0.05);
}

html.light-theme .tab-item.active {
  color: var(--accent);
  background: rgba(37, 99, 235, 0.1);
}

html.light-theme .topbar {
  background: var(--surface);
  border-color: var(--border-strong);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* Element Plus Light Theme */
html.light-theme .el-input__wrapper {
  background: rgba(0, 0, 0, 0.04) !important;
  border-color: var(--border-strong) !important;
}

html.light-theme .el-input__inner {
  color: var(--text) !important;
}

html.light-theme .el-input__wrapper:hover {
  border-color: var(--accent) !important;
}

html.light-theme .el-input__wrapper.is-focus {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 2px var(--accent-glow) !important;
}

html.light-theme .el-button--primary {
  background: var(--accent) !important;
  border-color: var(--accent) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
}

html.light-theme .el-button--primary:hover {
  background: var(--accent-dark) !important;
  border-color: var(--accent-dark) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35) !important;
}

html.light-theme .el-button--default {
  background: rgba(37, 99, 235, 0.08) !important;
  border-color: rgba(37, 99, 235, 0.25) !important;
  color: var(--accent) !important;
}

html.light-theme .el-button--default:hover {
  background: rgba(37, 99, 235, 0.15) !important;
  border-color: rgba(37, 99, 235, 0.4) !important;
  color: var(--accent) !important;
}

html.light-theme .el-button--text {
  color: var(--accent) !important;
}

html.light-theme .el-button--text:hover {
  background: rgba(37, 99, 235, 0.08) !important;
  color: var(--accent-dark) !important;
}

html.light-theme .el-button--danger {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
}

html.light-theme .el-button--danger:hover {
  background: #b91c1c !important;
  border-color: #b91c1c !important;
}

html.light-theme .el-select__wrapper {
  background: rgba(0, 0, 0, 0.04) !important;
  border-color: var(--border-strong) !important;
}

html.light-theme .el-tag {
  background: rgba(37, 99, 235, 0.08) !important;
  border-color: rgba(37, 99, 235, 0.2) !important;
  color: var(--accent) !important;
}

html.light-theme .el-dialog {
  background: var(--surface) !important;
  border: 1px solid var(--border-strong) !important;
}

html.light-theme .el-dialog__title {
  color: var(--text) !important;
}

html.light-theme .el-tabs__item {
  color: var(--text-3) !important;
}

html.light-theme .el-tabs__item.is-active {
  color: var(--accent) !important;
}

html.light-theme .el-pagination {
  color: var(--text-2) !important;
}

html.light-theme .el-pagination button,
html.light-theme .el-pagination .el-pager li {
  background: var(--surface-2) !important;
  color: var(--text-2) !important;
  border-color: var(--border) !important;
}

html.light-theme .el-pager li.is-active {
  background: var(--accent) !important;
  color: #ffffff !important;
}

html.light-theme .el-message,
html.light-theme .el-notification {
  background: var(--surface) !important;
  border: 1px solid var(--border-strong) !important;
}

html.light-theme .el-message-box {
  background: var(--surface) !important;
  border: 1px solid var(--border-strong) !important;
}

html.light-theme .el-table th.el-table__cell {
  background: var(--surface-2) !important;
  color: var(--text-2) !important;
}

html.light-theme .el-table__row:hover > td.el-table__cell {
  background: rgba(37, 99, 235, 0.04) !important;
}

html.light-theme ::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}

html.light-theme ::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Merchant Card Light Mode */
html.light-theme .merchant-card {
  background: var(--surface);
  border-color: var(--border-strong);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

html.light-theme .merchant-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

html.light-theme .action-bar {
  background: var(--surface);
  border-color: var(--border-strong);
}

html.light-theme .quota-section {
  background: var(--surface-3);
}

html.light-theme .empty-state {
  background: var(--surface);
  border-color: var(--border-strong);
}

html.light-theme .more-btn {
  background: rgba(0, 0, 0, 0.05);
  border-color: var(--border-strong);
  color: var(--text-2);
}

html.light-theme .dropdown-menu {
  background: var(--surface);
  border-color: var(--border-strong);
}

html.light-theme .dropdown-item {
  color: var(--text);
}

html.light-theme .dropdown-item:hover {
  background: var(--accent-glow);
  color: var(--accent);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  background: radial-gradient(
    ellipse at center,
    rgba(59, 130, 246, 0.08) 0%,
    transparent 50%
  );
  pointer-events: none;
  z-index: 0;
}

.light-theme body::before {
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(37, 99, 235, 0.04) 0%,
    transparent 50%
  );
}

/* 布局 */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* 内容区布局 */
.body-layout {
  display: flex;
  flex: 1;
  padding: 24px 32px;
}

/* Logo */
.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.logo-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(37, 99, 235, 0.15) 0%,
    rgba(59, 130, 246, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  mix-blend-mode: overlay;
  pointer-events: none;
  border-radius: 8px;
}

.logo-img {
  width: auto;
  height: 30px;
  object-fit: contain;
  position: relative;
  z-index: 1;
  filter: brightness(0) invert(1);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

/* 顶栏 */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 40px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
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

/* 圆角Tab导航 */
.topbar-tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 24px;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  color: var(--text-2);
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
}

.tab-item::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: var(--accent-glow);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tab-item:hover::after {
  opacity: 0.5;
}

.tab-item.active::after {
  opacity: 1;
}

.tab-item .tab-text {
  position: relative;
  z-index: 1;
}

.tab-item:hover {
  color: var(--text);
  background: var(--surface-3);
}

.tab-item.active {
  color: var(--accent);
  background: var(--accent-glow);
  font-weight: 600;
}

.tab-item.active:hover {
  color: var(--accent);
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-badge:hover {
  background: var(--surface-2);
  border-color: var(--text-3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent-light), var(--accent-dark));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.dropdown-arrow {
  color: var(--text-3);
  transition: transform 0.2s ease;
}

.user-dropdown.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 8px;
  z-index: 100;
  animation: dropdownIn 0.2s ease;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: var(--accent-glow);
  color: var(--accent-light);
}

.dropdown-item.danger {
  color: #dc2626;
}

.dropdown-item.danger:hover {
  background: rgba(220, 38, 38, 0.1);
  color: #ef4444;
}

.dropdown-item svg {
  color: var(--text-2);
  flex-shrink: 0;
}

.dropdown-item:hover svg {
  color: var(--accent-light);
}

.dropdown-item.danger svg {
  color: #dc2626;
}

.dropdown-item.danger:hover svg {
  color: #ef4444;
}

.quota-item {
  color: var(--accent);
  font-weight: 600;
}

.quota-item svg {
  color: var(--accent);
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 6px 0;
}

/* 内容区 */
.content {
  flex: 1;
  padding: 28px 32px;
  overflow-y: auto;
}
</style>
