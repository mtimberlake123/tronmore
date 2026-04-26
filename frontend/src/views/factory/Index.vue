<template>
  <div class="factory-page">
    <section class="workspace">
      <aside class="scene-panel panel-card">
        <div class="panel-title">
          <h2>物料设计</h2>
          <p>选择本次物料的使用场景</p>
        </div>

        <button
          v-for="item in modules"
          :key="item.key"
          type="button"
          :class="['scene-card', { active: form.module_key === item.key }]"
          @click="selectModule(item)"
        >
          <span class="scene-mark">{{ sceneMarkMap[item.key] || '宣' }}</span>
          <span class="scene-info">
            <strong>{{ item.name }}</strong>
            <small>{{ item.description }}</small>
            <em>{{ mediaTypeLabel(item.mediaType) }} · {{ goalLabel(item.goal) }}</em>
          </span>
        </button>
      </aside>

      <main class="editor-panel panel-card">
        <div class="panel-title">
          <h2>{{ activeModule?.name || '内容制作' }}</h2>
          <p>填写得越具体，生成结果越贴近实际经营场景。</p>
        </div>

        <el-form label-position="top" class="factory-form">
          <el-form-item label="选择宣传商家">
            <el-select v-model="form.merchant_id" placeholder="请选择要制作物料的商家" filterable>
              <el-option
                v-for="item in merchants"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="图片比例">
            <div class="pill-group">
              <button
                v-for="item in availableRatioOptions"
                :key="item.value"
                type="button"
                :class="['pill', { active: form.ratio === item.value }]"
                @click="form.ratio = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </el-form-item>

          <el-form-item label="文案">
            <el-input
              v-model="form.copywriting"
              type="textarea"
              :rows="4"
              placeholder="例如：主推周末双人套餐，突出牛肉面分量足、门店干净、到店立减。"
            />
          </el-form-item>

          <el-form-item label="风格">
            <el-select v-model="form.style" placeholder="请选择画面风格">
              <el-option v-for="style in styleOptions" :key="style" :label="style" :value="style" />
            </el-select>
          </el-form-item>

          <el-form-item label="其他要求">
            <el-input
              v-model="form.other_requirements"
              type="textarea"
              :rows="3"
              placeholder="例如：不要太花、标题要大、适合朋友圈转发、不要出现价格和英文占位字。"
            />
          </el-form-item>

          <el-form-item label="参考图">
            <ImageUploader v-model="referenceImage" />
            <p class="hint-text">暂时只支持上传一张门店、菜品或活动图作为视觉参考；不上传也可以生成。</p>
          </el-form-item>

          <div class="submit-row">
            <el-button type="primary" size="large" :loading="submitting" @click="submitGenerate">
              {{ submitting ? '正在提交' : '开始生成' }}
            </el-button>
            <el-button size="large" @click="resetForm">清空重填</el-button>
          </div>
        </el-form>
      </main>

      <aside class="preview-panel panel-card">
        <div class="panel-title">
          <h2>生成结果</h2>
          <p>{{ currentJob ? statusLabel(currentJob.status) : '提交后在这里查看进度' }}</p>
        </div>

        <div v-if="!currentJob" class="state-card">
          <span class="state-mark">待</span>
          <strong>还没有生成任务</strong>
          <p>选择功能并提交后，系统会在后台生成，完成后自动展示。</p>
        </div>

        <div v-else-if="currentJob.status === 'generating'" class="state-card">
          <span class="loading-ring"></span>
          <strong>正在后台生成</strong>
          <p>可以先处理其他内容，完成后这里会自动刷新。</p>
        </div>

        <div v-else-if="currentJob.status === 'failed'" class="state-card error">
          <span class="state-mark">错</span>
          <strong>生成失败</strong>
          <p>{{ currentJob.error_message || '请稍后重新提交' }}</p>
        </div>

        <div v-else class="result-card">
          <img :src="currentJob.image_url" alt="宣传物料预览" class="result-image" />
          <div class="result-text">
            <strong>{{ currentJob.module_name || '宣传物料' }}</strong>
            <p>{{ currentJob.ai_text || '暂无文案' }}</p>
          </div>
          <div class="result-actions">
            <el-button type="primary" @click="downloadImage(currentJob)">下载图片</el-button>
            <el-button @click="copyText(currentJob.ai_text)">复制文案</el-button>
          </div>
        </div>
      </aside>
    </section>

    <section class="history-panel panel-card">
      <div class="history-head">
        <div class="panel-title">
          <h2>历史生成参考</h2>
          <p>点击历史记录，可以复用上次的功能、比例、风格和要求。</p>
        </div>
        <el-button @click="fetchHistory">刷新</el-button>
      </div>

      <div v-if="historyList.length" class="history-grid">
        <article v-for="item in historyList" :key="item.id" class="history-card" @click="useHistory(item)">
          <div class="history-image">
            <img v-if="item.image_url" :src="item.image_url" alt="历史物料" />
            <span v-else>图</span>
          </div>
          <div class="history-info">
            <strong>{{ item.module_name || '宣传物料' }}</strong>
            <p>{{ item.prompt || '未填写制作要求' }}</p>
            <small>{{ ratioName(item.ratio) }} · {{ item.style || '默认风格' }} · {{ statusLabel(item.status) }}</small>
          </div>
        </article>
      </div>

      <div v-else class="history-empty">
        <span>暂无历史生成</span>
        <p>完成一次生成后，会自动出现在这里。</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { factory, merchant } from '@/api'
import ImageUploader from '@/components/ImageUploader.vue'

const modules = ref([])
const merchants = ref([])
const historyList = ref([])
const currentJob = ref(null)
const submitting = ref(false)
const pollTimer = ref(null)
const referenceImage = ref('')

const sceneMarkMap = {
  'product-display': '展',
  'promo-campaign': '促',
  'platform-cover': '封',
}

const legacyModuleMap = {
  storefront: 'product-display',
  dish: 'product-display',
  'promo-poster': 'promo-campaign',
  'social-cover': 'platform-cover',
}

const ratioOptions = [
  { value: '1:1', label: '1:1' },
  { value: '3:4', label: '3:4' },
  { value: '4:3', label: '4:3' },
  { value: '9:16', label: '9:16' },
  { value: '16:9', label: '16:9' },
]

const styleOptions = ['简约高级', '烟火真实', '清爽明亮', '国潮醒目', '黑金质感', '小红书风']

const form = reactive({
  merchant_id: '',
  module_key: 'product-display',
  ratio: '1:1',
  style: '简约高级',
  copywriting: '',
  other_requirements: '',
})

const activeModule = computed(() => modules.value.find(item => item.key === form.module_key))
const moduleKeys = computed(() => modules.value.map(item => item.key))
const availableRatioOptions = computed(() => {
  const supportedRatios = activeModule.value?.supportedRatios
  if (!Array.isArray(supportedRatios) || !supportedRatios.length) return ratioOptions
  return ratioOptions.filter(item => supportedRatios.includes(item.value))
})

const selectModule = (item) => {
  form.module_key = item.key
  if (Array.isArray(item.supportedRatios) && item.supportedRatios.length && !item.supportedRatios.includes(form.ratio)) {
    form.ratio = item.supportedRatios[0]
  }
}

const normalizeModuleKey = (key) => {
  const mappedKey = legacyModuleMap[key] || key
  if (moduleKeys.value.includes(mappedKey)) return mappedKey
  return modules.value[0]?.key || 'product-display'
}

const mediaTypeLabel = (mediaType) => {
  const map = {
    image: '图片',
    video: '视频',
    script: '脚本',
  }
  return map[mediaType] || '内容'
}

const goalLabel = (goal) => {
  const map = {
    display: '展示型',
    conversion: '转化型',
    traffic: '引流型',
  }
  return map[goal] || '通用'
}

const resetForm = () => {
  form.ratio = '1:1'
  form.style = '简约高级'
  form.copywriting = ''
  form.other_requirements = ''
  referenceImage.value = ''
}

const stripFieldLabel = (text, label) => {
  return text.trim().replace(new RegExp(`^${label}\\s*[：:]\\s*`), '')
}

const buildGeneratePrompt = () => {
  const copywriting = stripFieldLabel(form.copywriting, '文案')
  const otherRequirements = stripFieldLabel(form.other_requirements, '其他要求')
  return [
    copywriting ? `文案：${copywriting}` : '',
    otherRequirements ? `其他要求：${otherRequirements}` : '',
  ].filter(Boolean).join('\n')
}

const submitGenerate = async () => {
  if (!form.merchant_id) {
    ElMessage.warning('请先选择商家')
    return
  }
  const prompt = buildGeneratePrompt()
  if (!prompt) {
    ElMessage.warning('请填写文案或其他要求')
    return
  }

  submitting.value = true
  try {
    const task = await factory.generate({
      merchant_id: form.merchant_id,
      module_key: form.module_key,
      ratio: form.ratio,
      style: form.style,
      prompt,
      reference_images: referenceImage.value ? [referenceImage.value] : [],
    })
    currentJob.value = task
    ElMessage.success('任务已提交，正在后台生成')
    startPolling(task.id)
    await fetchHistory()
  } catch (error) {
    console.error(error)
    const message = error?.message || error?.response?.data?.message || ''
    if (message.includes('额度不足')) {
      await ElMessageBox.alert(
        '当前营销公司的可用额度不足，请先到系统后台为营销公司充值，再继续生成宣传物料。',
        '额度不足',
        {
          confirmButtonText: '我知道了',
          type: 'warning',
        },
      )
    }
  } finally {
    submitting.value = false
  }
}

const startPolling = (id) => {
  stopPolling()
  pollTimer.value = setInterval(async () => {
    try {
      const task = await factory.detail(id)
      currentJob.value = task
      if (task.status === 'completed') {
        ElMessage.success('宣传物料已生成')
        stopPolling()
        await fetchHistory()
      }
      if (task.status === 'failed') {
        ElMessage.error(task.error_message || '生成失败')
        stopPolling()
        await fetchHistory()
      }
    } catch (error) {
      console.error(error)
      stopPolling()
    }
  }, 3000)
}

const stopPolling = () => {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

const fetchModules = async () => {
  modules.value = await factory.modules()
  form.module_key = normalizeModuleKey(form.module_key)
  const currentModule = modules.value.find(item => item.key === form.module_key)
  if (currentModule) selectModule(currentModule)
}

const fetchMerchants = async () => {
  const res = await merchant.list({ page: 1, page_size: 100 })
  merchants.value = res.list || []
  if (!form.merchant_id && merchants.value[0]) {
    form.merchant_id = merchants.value[0].id
  }
}

const fetchHistory = async () => {
  const res = await factory.history({ page: 1, page_size: 12 })
  historyList.value = res.list || []
}

const useHistory = (item) => {
  form.module_key = normalizeModuleKey(item.module_key || form.module_key)
  const currentModule = modules.value.find(moduleItem => moduleItem.key === form.module_key)
  if (currentModule) selectModule(currentModule)
  const nextRatio = item.ratio || form.ratio
  if (!currentModule?.supportedRatios || currentModule.supportedRatios.includes(nextRatio)) {
    form.ratio = nextRatio
  }
  form.style = item.style || form.style
  form.copywriting = item.prompt || ''
  form.other_requirements = ''
  referenceImage.value = item.reference_images?.[0] || ''
  currentJob.value = item
}

const statusLabel = (status) => {
  const map = {
    generating: '生成中',
    completed: '已完成',
    failed: '失败',
    pending: '排队中',
  }
  return map[status] || '未知状态'
}

const ratioName = (value) => {
  return ratioOptions.find(item => item.value === value)?.label || '默认比例'
}

const downloadImage = (task) => {
  if (!task?.image_url) return
  const link = document.createElement('a')
  link.href = task.image_url
  link.download = `${task.module_name || '宣传物料'}-${task.id}.svg`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const copyText = async (text) => {
  if (!text) return
  await navigator.clipboard.writeText(text)
  ElMessage.success('文案已复制')
}

onMounted(async () => {
  await Promise.all([fetchModules(), fetchMerchants(), fetchHistory()])
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.factory-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.panel-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
}

.panel-title p,
.hint-text {
  margin: 0;
  color: var(--text-2);
  line-height: 1.75;
}

.workspace {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 360px;
  gap: 18px;
  align-items: start;
}

.scene-panel,
.editor-panel,
.preview-panel,
.history-panel {
  padding: 22px;
}

.panel-title {
  margin-bottom: 18px;
}

.panel-title h2 {
  margin: 0 0 6px;
  color: var(--text);
  font-size: 21px;
  font-weight: 850;
}

.scene-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scene-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 18px;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scene-card:hover,
.scene-card.active {
  background: var(--accent-dim);
  border-color: var(--accent);
  transform: translateY(-1px);
}

.scene-mark,
.state-mark {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: var(--accent);
  color: #fff;
  font-weight: 900;
}

.scene-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.scene-info strong {
  font-size: 16px;
  font-weight: 850;
}

.scene-info small {
  color: var(--text-2);
  line-height: 1.55;
}

.scene-info em {
  width: fit-content;
  margin-top: 2px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-3);
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
}

.scene-card.active .scene-info em {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.factory-form :deep(.el-form-item__label) {
  color: var(--text-2);
  font-weight: 800;
}

.choice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  min-height: 36px;
  padding: 0 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-2);
  cursor: pointer;
}

.pill.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 800;
}

.submit-row {
  display: flex;
  gap: 12px;
}

.state-card {
  min-height: 430px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  padding: 24px;
  background: var(--surface-2);
  border-radius: 18px;
  color: var(--text-2);
  text-align: center;
}

.state-card strong {
  color: var(--text);
  font-size: 18px;
}

.state-card.error .state-mark {
  background: var(--danger);
}

.loading-ring {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 4px solid var(--accent-dim);
  border-top-color: var(--accent);
  animation: rotate 0.9s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.result-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.result-image {
  width: 100%;
  max-height: 430px;
  object-fit: contain;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 18px;
}

.result-text {
  padding: 14px;
  background: var(--surface-2);
  border-radius: 16px;
}

.result-text strong {
  color: var(--text);
}

.result-text p {
  max-height: 180px;
  overflow: auto;
  color: var(--text-2);
  line-height: 1.75;
  white-space: pre-wrap;
}

.result-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.history-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.history-card {
  display: grid;
  grid-template-columns: 86px 1fr;
  gap: 12px;
  padding: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-card:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.history-image {
  width: 86px;
  height: 86px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 14px;
  background: var(--surface-3);
  color: var(--text-3);
  font-weight: 800;
}

.history-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-info strong {
  color: var(--text);
}

.history-info p {
  margin: 6px 0;
  color: var(--text-2);
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-info small {
  color: var(--text-3);
}

.history-empty {
  padding: 44px;
  color: var(--text-3);
  text-align: center;
}

.history-empty span {
  color: var(--text-2);
  font-weight: 800;
}

@media (max-width: 1180px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .scene-panel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .scene-panel .panel-title {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .history-head {
    flex-direction: column;
    align-items: stretch;
  }

  .choice-grid,
  .scene-panel {
    grid-template-columns: 1fr;
  }
}
</style>
