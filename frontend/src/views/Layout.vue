<template>
  <div class="app-layout">
    <header v-if="!hideTopbar" class="topbar">
      <div class="brand">
        <img src="@/assets/logo.png" alt="创码" class="logo-img" />
        <div class="brand-text">
          <strong>创码</strong>
          <span>商家工作台</span>
        </div>
      </div>

      <nav v-if="!hideTopbarMenu" class="nav-tabs">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-tab', { active: $route.path.startsWith(item.path) }]"
        >
          <component :is="item.icon" class="nav-icon" />
          <span>{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="topbar-actions">
        <div class="user-dropdown" @click="showDropdown = !showDropdown">
          <div class="user-badge">
            <span class="user-avatar">{{ userInitial }}</span>
            <div class="user-meta">
              <strong>{{ companyName || '企业账号' }}</strong>
              <span>公司额度 {{ balance }} 次</span>
            </div>
            <ArrowDown class="arrow-icon" />
          </div>

          <div v-show="showDropdown" class="dropdown-menu">
            <button class="dropdown-item" type="button" @click.stop="toggleTheme">
              <component :is="isDark ? Sunny : Moon" class="action-icon" />
              <span>{{ isDark ? '切换日间模式' : '切换夜间模式' }}</span>
            </button>
            <button class="dropdown-item danger" type="button" @click.stop="handleLogout">
              <SwitchButton class="action-icon" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, quota } from '@/api'
import { ElMessage } from 'element-plus'
import { House, Picture, Promotion, Moon, Sunny, ArrowDown, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const balance = ref(0)
const showDropdown = ref(false)
const companyName = localStorage.getItem('company_name') || ''
const isDark = ref(localStorage.getItem('theme') === 'dark')
const dynamicHideTopbar = ref(false)
const hideTopbar = computed(() => Boolean(route.meta.hideTopbar) || dynamicHideTopbar.value)
const hideTopbarMenu = computed(() => false)

const menuItems = [
  { path: '/merchants', name: '商家中心', icon: House },
  { path: '/factory', name: '物料设计', icon: Picture },
  { path: '/references', name: '营销视频', icon: Promotion }
]

const userInitial = computed(() => companyName ? companyName.charAt(0) : '企')

const applyTheme = () => {
  document.documentElement.classList.toggle('dark-theme', isDark.value)
  document.documentElement.classList.toggle('light-theme', !isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
}

const handleLogout = async () => {
  try {
    await auth.logout()
  } catch (error) {
    console.error(error)
  }

  localStorage.removeItem('token')
  localStorage.removeItem('company_id')
  localStorage.removeItem('company_name')
  showDropdown.value = false
  ElMessage.success('已退出登录')
  router.push('/login')
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.user-dropdown')) {
    showDropdown.value = false
  }
}

const handleTopbarVisibility = (event) => {
  dynamicHideTopbar.value = Boolean(event.detail?.hide)
}

onMounted(async () => {
  applyTheme()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('tronmore:layout-topbar', handleTopbarVisibility)

  try {
    const res = await quota.tenantBalance()
    balance.value = res.balance || 0
  } catch (error) {
    console.error(error)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('tronmore:layout-topbar', handleTopbarVisibility)
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(18px);
}

html.dark-theme .topbar {
  background: rgba(15, 23, 36, 0.82);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-text strong {
  font-family: var(--font-display);
  font-size: 18px;
}

.brand-text span {
  color: var(--text-3);
  font-size: 12px;
}

.nav-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  color: var(--text-2);
  transition: all 0.2s ease;
}

.nav-tab:hover {
  background: var(--surface-2);
  color: var(--text);
}

.nav-tab.active {
  background: var(--accent-dim);
  color: var(--accent);
  font-weight: 700;
}

.nav-icon,
.action-icon,
.arrow-icon {
  width: 16px;
  height: 16px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.user-dropdown {
  position: relative;
}

.user-avatar {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-meta strong {
  font-size: 14px;
}

.user-meta span {
  font-size: 12px;
  color: var(--text-3);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 200px;
  padding: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
}

.dropdown-item {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 0 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--surface-2);
}

.dropdown-item.danger {
  color: var(--danger);
}

.content {
  padding: 24px;
}

@media (max-width: 960px) {
  .topbar {
    grid-template-columns: 1fr;
  }

  .nav-tabs {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .topbar-actions {
    justify-content: space-between;
  }
}

@media (max-width: 640px) {
  .content {
    padding: 16px;
  }

  .user-meta {
    display: none;
  }
}
</style>

