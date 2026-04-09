<template>
  <div class="admin-layout">
    <div class="junction-line"></div>

    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">
          <svg width="0.875rem" height="0.875rem" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="logo-text">Admin</span>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-item', { active: $route.path.startsWith(item.path) }]"
        >
          <div class="nav-icon">
            <component :is="item.icon" :weight="200" :size="'0.75rem'" />
          </div>
          <span class="nav-label">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/merchants" class="back-link">
          <svg width="0.7rem" height="0.7rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back</span>
        </router-link>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <h1 class="topbar-title">{{ currentTitle }}</h1>
        <div class="topbar-right">
          <button class="ai-btn" @click="toggleAI">
            <svg width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2a7 7 0 0 1 7 7v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a7 7 0 0 1 7-7z"/>
              <path d="M9 21h6M10 17v4M14 17v4"/>
            </svg>
            <span>AI Assistant</span>
          </button>
          <div class="admin-badge">
            <span class="badge-dot"></span>
            <span>Admin</span>
          </div>
        </div>
      </header>

      <div class="content">
        <router-view />
      </div>
    </main>

    <!-- AI Assistant Dialog -->
    <div class="dialog-overlay" v-if="showAI" @click.self="showAI = false">
      <div class="dialog ai-dialog">
        <div class="dialog-header">
          <div class="section-header" style="margin-bottom:0">
            <div class="section-bar" style="background:#a855f7"></div>
            <span class="section-title">AI Assistant</span>
          </div>
          <button class="dialog-close" @click="showAI = false">
            <svg width="0.75rem" height="0.75rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="ai-messages" ref="aiMessagesEl">
            <div v-for="(msg, i) in aiMessages" :key="i" :class="['ai-msg', msg.role]">
              <div class="ai-msg-avatar">
                <svg v-if="msg.role === 'user'" width="0.625rem" height="0.625rem" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <svg v-else width="0.625rem" height="0.625rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2a7 7 0 0 1 7 7v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a7 7 0 0 1 7-7z"/>
                  <path d="M9 21h6M10 17v4M14 17v4"/>
                </svg>
              </div>
              <div class="ai-msg-content">{{ msg.content }}</div>
            </div>
            <div v-if="aiLoading" class="ai-msg assistant">
              <div class="ai-msg-avatar">
                <svg width="0.625rem" height="0.625rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2a7 7 0 0 1 7 7v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a7 7 0 0 1 7-7z"/>
                  <path d="M9 21h6M10 17v4M14 17v4"/>
                </svg>
              </div>
              <div class="ai-msg-content">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer ai-footer">
          <input
            v-model="aiInput"
            class="input ai-input"
            placeholder="Ask AI anything..."
            @keyup.enter="sendAI"
          />
          <button class="btn btn-primary ai-send-btn" @click="sendAI" :disabled="aiLoading">
            <svg width="0.625rem" height="0.625rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Grid, OfficeBuilding, Document, Warning } from '@element-plus/icons-vue'

const route = useRoute()

const menuItems = [
  { path: '/admin', name: 'Dashboard', icon: Grid },
  { path: '/admin/companies', name: 'Companies', icon: OfficeBuilding },
  { path: '/admin/prompts', name: 'Prompts', icon: Document },
  { path: '/admin/sensitive', name: 'Sensitive', icon: Warning }
]

const currentTitle = computed(() => {
  const item = menuItems.find(m => route.path.startsWith(m.path))
  return item?.name || 'Admin'
})

// AI Assistant
const showAI = ref(false)
const aiInput = ref('')
const aiMessages = ref([
  { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you manage this platform?' }
])
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
  aiMessagesEl.value.scrollTop = aiMessagesEl.value.scrollHeight

  // Simulate AI response
  setTimeout(() => {
    aiMessages.value.push({ role: 'assistant', content: `You asked: "${userMsg}". This is a demo response. In production, this would connect to your AI backend.` })
    aiLoading.value = false
    nextTick(() => {
      aiMessagesEl.value.scrollTop = aiMessagesEl.value.scrollHeight
    })
  }, 1200)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&family=Geist:wght@400;500;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg: #0c0c0e;
  --surface: #141416;
  --surface-2: #1a1a1d;
  --border: rgba(255,255,255,0.04);
  --border-bright: rgba(255,255,255,0.08);
  --text: #eeeeee;
  --text-2: #666666;
  --text-3: #3a3a3a;
  --accent: #3B82F6;
  --accent-dim: rgba(59, 130, 246, 0.1);
  --accent-glow: rgba(59, 130, 246, 0.2);
  --ai-color: #a855f7;
  --ai-dim: rgba(168, 85, 247, 0.1);
  --radius: 0.25rem;
  --sidebar: 11rem;
  --topbar: 2.25rem;
  --font-xs: 0.65rem;
  --font-sm: 0.7rem;
  --font-md: 0.75rem;
  --font-lg: 0.8rem;
  --font-mono: 'Geist Mono', monospace;
  --font-ui: 'Geist', -apple-system, sans-serif;
}

html { font-size: 16px; }

body {
  font-family: var(--font-ui);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  font-size: var(--font-md);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.admin-layout { display: flex; min-height: 100vh; }

.junction-line {
  position: fixed;
  top: 0;
  left: var(--sidebar);
  right: 0;
  height: 1px;
  background: var(--border-bright);
  z-index: 200;
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: 0; top: 0; height: 100vh;
  width: var(--sidebar);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  z-index: 100;
  overflow: hidden;
  box-shadow: 1px 0 0 var(--border-bright);
}

.sidebar-logo {
  height: var(--topbar);
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0 0.75rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.logo-mark {
  width: 1.25rem; height: 1.25rem;
  display: flex; align-items: center; justify-content: center;
  color: var(--accent); flex-shrink: 0;
}
.logo-text {
  font-family: var(--font-mono);
  font-size: var(--font-sm); font-weight: 700; color: #fff;
  white-space: nowrap; letter-spacing: 0.08em; text-transform: uppercase;
}

.sidebar-nav {
  flex: 1; padding: 0.75rem 0.5rem;
  display: flex; flex-direction: column; gap: 2px;
  overflow-y: auto;
}
.nav-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.4rem 0.625rem;
  color: var(--text-2); text-decoration: none;
  transition: all 0.12s ease;
  position: relative; overflow: hidden;
  white-space: nowrap;
  border-radius: var(--radius);
}
.nav-item:hover { background: rgba(255,255,255,0.03); color: var(--text); }
.nav-item.active { background: var(--accent-dim); color: var(--accent); }
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 2px; height: 60%;
  background: var(--accent);
  border-radius: 0 1px 1px 0;
}
.nav-icon { width: 0.75rem; height: 0.75rem; flex-shrink: 0; }
.nav-label { font-size: var(--font-sm); font-weight: 500; white-space: nowrap; }

.sidebar-footer {
  padding: 0.5rem; border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.back-link {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.375rem 0.5rem; border-radius: var(--radius);
  color: var(--text-2); text-decoration: none;
  transition: all 0.12s; font-size: var(--font-xs);
}
.back-link:hover { background: rgba(255,255,255,0.03); color: var(--text); }

.main {
  flex: 1; margin-left: var(--sidebar);
  min-width: 0;
}

.topbar {
  height: var(--topbar);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1.25rem;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 50;
}
.topbar-title {
  font-family: var(--font-mono);
  font-size: var(--font-sm); font-weight: 700; color: #fff;
  letter-spacing: 0.05em; text-transform: uppercase;
}
.topbar-right { display: flex; align-items: center; gap: 0.75rem; }

/* AI Button */
.ai-btn {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.3rem 0.625rem;
  background: var(--ai-dim);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: var(--radius);
  color: var(--ai-color);
  font-family: var(--font-ui);
  font-size: var(--font-xs); font-weight: 500;
  cursor: pointer; transition: all 0.12s;
  letter-spacing: 0.02em;
}
.ai-btn:hover { background: rgba(168,85,247,0.15); border-color: rgba(168,85,247,0.4); }

/* Admin Badge */
.admin-badge {
  display: flex; align-items: center; gap: 0.375rem;
  font-family: var(--font-mono);
  font-size: var(--font-xs); font-weight: 500;
  color: var(--text-2); letter-spacing: 0.03em;
}
.badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 4px var(--accent);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.content { padding: 1rem 1.25rem; }

/* ─── Common Components ─── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.875rem 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.4);
}
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.25rem;
  padding: 0.3rem 0.625rem;
  border-radius: var(--radius);
  font-family: var(--font-ui);
  font-size: var(--font-xs); font-weight: 500;
  cursor: pointer; transition: all 0.12s;
  border: 1px solid transparent; white-space: nowrap;
  letter-spacing: 0.02em;
}
.btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn-primary:hover { background: #5b9aff; box-shadow: 0 0 8px var(--accent-glow); }
.btn-outline { background: transparent; border-color: var(--border-bright); color: var(--text-2); }
.btn-outline:hover { background: rgba(255,255,255,0.03); color: var(--text); }

.input {
  padding: 0.3rem 0.5rem;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text); font-family: var(--font-ui);
  font-size: var(--font-xs); outline: none;
  transition: border-color 0.12s; width: 100%;
}
.input:focus { border-color: var(--accent); }
.input::placeholder { color: var(--text-3); }

.section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
.section-bar { width: 20px; height: 2px; background: var(--accent); border-radius: 1px; flex-shrink: 0; }
.section-title {
  font-family: var(--font-mono);
  font-size: var(--font-xs); font-weight: 700; color: #fff;
  text-transform: uppercase; letter-spacing: 0.08em;
}

.pagination { display: flex; justify-content: center; gap: 4px; margin-top: 1rem; }
.pagination button {
  padding: 0.25rem 0.5rem;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-2);
  font-family: var(--font-mono); font-size: var(--font-xs); cursor: pointer; transition: all 0.12s;
}
.pagination button:hover { background: rgba(255,255,255,0.03); color: var(--text); }
.pagination button.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

.empty { text-align: center; padding: 2.5rem; color: var(--text-3); font-size: var(--font-sm); }

/* ─── AI Dialog ─── */
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
  width: 22rem; max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  animation: dialogIn 0.2s ease-out;
}
.ai-dialog { width: 26rem; height: 22rem; display: flex; flex-direction: column; }
@keyframes dialogIn {
  from { opacity: 0; transform: scale(0.97) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.dialog-close {
  width: 1.25rem; height: 1.25rem;
  border-radius: var(--radius);
  background: transparent; border: none; color: var(--text-2);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.12s;
}
.dialog-close:hover { background: rgba(255,255,255,0.06); color: var(--text); }
.dialog-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.dialog-footer { padding: 0.625rem 1rem; border-top: 1px solid var(--border); flex-shrink: 0; }

/* AI Messages */
.ai-messages {
  flex: 1; overflow-y: auto; padding: 0.75rem 1rem;
  display: flex; flex-direction: column; gap: 0.75rem;
}
.ai-messages::-webkit-scrollbar { width: 3px; }
.ai-messages::-webkit-scrollbar-track { background: transparent; }
.ai-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.ai-msg { display: flex; gap: 0.5rem; align-items: flex-start; }
.ai-msg.user { flex-direction: row-reverse; }
.ai-msg-avatar {
  width: 1.25rem; height: 1.25rem; border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ai-msg.user .ai-msg-avatar {
  background: var(--accent-dim); color: var(--accent);
}
.ai-msg.assistant .ai-msg-avatar {
  background: var(--ai-dim); color: var(--ai-color);
}
.ai-msg-content {
  max-width: 75%;
  padding: 0.375rem 0.625rem;
  border-radius: var(--radius);
  font-size: var(--font-xs); line-height: 1.5;
  background: rgba(255,255,255,0.04);
  color: var(--text);
}
.ai-msg.user .ai-msg-content {
  background: var(--accent-dim); color: var(--accent);
}

/* Typing dots */
.typing-dot {
  display: inline-block; width: 4px; height: 4px;
  border-radius: 50%; background: var(--ai-color);
  animation: typingBounce 1.2s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-3px); opacity: 1; }
}

/* AI Footer */
.ai-footer {
  display: flex; gap: 0.375rem; padding: 0.625rem 1rem;
}
.ai-input { flex: 1; }
.ai-send-btn { padding: 0.3rem 0.5rem; flex-shrink: 0; }
.ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive */
@media (max-width: 1366px) {
  :root { --sidebar: 9rem; }
  .content { padding: 0.75rem 1rem; }
}
@media (max-width: 1024px) {
  :root { --sidebar: 7rem; }
  .content { padding: 0.625rem 0.75rem; }
  .topbar { padding: 0 0.75rem; }
}
@media (max-width: 768px) {
  :root { --sidebar: 5rem; }
  .content { padding: 0.5rem; }
}
</style>
