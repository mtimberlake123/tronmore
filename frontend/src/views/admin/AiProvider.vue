<template>
  <div class="ai-provider-page">
    <section class="panel hero-panel">
      <div>
        <p class="eyebrow">AI 接口配置</p>
        <h2>火宝 AI 接入参数</h2>
        <p>这里配置后，H5 笔记生成、点评生成、物料设计生图都会优先使用后台保存的密钥。</p>
      </div>
      <div class="key-status" :class="{ active: form.has_api_key }">
        <span>{{ form.has_api_key ? '已配置' : '未配置' }}</span>
        <strong>{{ form.api_key_masked || '暂无密钥' }}</strong>
      </div>
    </section>

    <section class="panel form-panel">
      <div class="form-grid">
        <label>
          <span>接口地址</span>
          <input v-model="form.base_url" class="input" placeholder="https://api.chatfire.site/v1" />
        </label>

        <label>
          <span>文本模型</span>
          <input v-model="form.model" class="input" placeholder="gpt-5.4" />
        </label>

        <label>
          <span>图片模型</span>
          <input v-model="form.image_model" class="input" placeholder="gpt-image-2" />
        </label>

        <label>
          <span>生成温度</span>
          <input v-model.number="form.temperature" class="input" type="number" min="0" max="2" step="0.1" />
        </label>

        <label class="full">
          <span>API Key</span>
          <input
            v-model="apiKeyInput"
            class="input"
            type="password"
            autocomplete="new-password"
            placeholder="留空则保持当前密钥不变"
          />
          <small>保存后只展示脱敏结果，不会在页面回显完整密钥。</small>
        </label>
      </div>

      <div class="actions">
        <button class="btn btn-outline" type="button" :disabled="loading" @click="loadConfig">重新读取</button>
        <button class="btn btn-outline" type="button" :disabled="checking" @click="checkBalance">检查余额</button>
        <button class="btn btn-primary" type="button" :disabled="saving" @click="saveConfig">
          {{ saving ? '保存中...' : '保存配置' }}
        </button>
      </div>

      <div v-if="balanceText" class="notice success">{{ balanceText }}</div>
      <div v-if="errorText" class="notice error">{{ errorText }}</div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { admin } from '@/api'

const loading = ref(false)
const saving = ref(false)
const checking = ref(false)
const apiKeyInput = ref('')
const balanceText = ref('')
const errorText = ref('')

const form = reactive({
  base_url: 'https://api.chatfire.site/v1',
  model: 'gpt-5.4',
  image_model: 'gpt-image-2',
  temperature: 0.7,
  has_api_key: false,
  api_key_masked: ''
})

const loadConfig = async () => {
  loading.value = true
  errorText.value = ''
  try {
    const data = await admin.aiProvider.get()
    Object.assign(form, data)
    apiKeyInput.value = ''
  } catch (error) {
    errorText.value = error.response?.data?.message || error.message || '读取配置失败'
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  errorText.value = ''
  balanceText.value = ''
  try {
    const payload = {
      base_url: form.base_url,
      model: form.model,
      image_model: form.image_model,
      temperature: form.temperature
    }
    if (apiKeyInput.value.trim()) {
      payload.api_key = apiKeyInput.value.trim()
    }
    const data = await admin.aiProvider.update(payload)
    Object.assign(form, data)
    apiKeyInput.value = ''
    ElMessage.success('AI 接口配置已保存')
  } catch (error) {
    errorText.value = error.response?.data?.message || error.message || '保存配置失败'
  } finally {
    saving.value = false
  }
}

const checkBalance = async () => {
  checking.value = true
  errorText.value = ''
  balanceText.value = ''
  try {
    const data = await admin.aiProvider.balance()
    const available = data?.data?.availableBalance ?? data?.data?.balance
    balanceText.value = available !== undefined ? `火宝账户可用余额：${available}` : '接口连接正常'
  } catch (error) {
    errorText.value = error.response?.data?.message || error.message || '余额检查失败'
  } finally {
    checking.value = false
  }
}

onMounted(loadConfig)
</script>

<style scoped>
.ai-provider-page {
  display: grid;
  gap: 18px;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
}

.hero-panel {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  padding: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-panel h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.hero-panel p {
  margin: 0;
  color: var(--text-3);
  line-height: 1.7;
}

.key-status {
  min-width: 180px;
  padding: 16px;
  border-radius: 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.key-status.active {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.08);
}

.key-status span {
  display: block;
  margin-bottom: 6px;
  color: var(--text-3);
  font-size: 12px;
}

.key-status strong {
  font-family: var(--font-mono);
}

.form-panel {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

label {
  display: grid;
  gap: 8px;
}

label.full {
  grid-column: 1 / -1;
}

label span {
  color: var(--text-2);
  font-size: 13px;
  font-weight: 700;
}

small {
  color: var(--text-3);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.notice {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  line-height: 1.6;
}

.notice.success {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.notice.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

@media (max-width: 760px) {
  .hero-panel,
  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
