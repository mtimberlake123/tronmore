<template>
  <div class="note-page">
    <div v-if="loading" class="loading-screen">
      <div class="loader"></div>
      <p>正在准备小红书笔记...</p>
    </div>

    <template v-else>
      <header class="topbar">
        <button class="back-btn" type="button" @click="goBack">
          <ArrowLeft />
        </button>
        <div>
          <strong>小红书笔记</strong>
          <span>图片配笔记，一键发布</span>
        </div>
        <button class="refresh-btn" type="button" :disabled="generating" @click="generateNote">
          换一篇
        </button>
      </header>

      <main class="note-shell">
        <section class="image-section">
          <div v-if="displayImages.length" class="product-gallery">
            <button
              v-for="(image, index) in displayImages"
              :key="image.url || index"
              type="button"
              :class="['product-image', { active: selectedImageIndex === index }]"
              @click="selectedImageIndex = index"
            >
              <img :src="image.url" alt="" />
              <span v-if="image.product_tag">{{ image.product_tag }}</span>
            </button>
            <label class="upload-card">
              <input type="file" accept="image/*" multiple @change="handleUpload" />
              <strong>上传图片</strong>
              <small>支持多张</small>
            </label>
          </div>

          <div v-else class="empty-image" :style="coverStyle">
            <label>
              <input type="file" accept="image/*" multiple @change="handleUpload" />
              <span>上传要发布的图片</span>
            </label>
          </div>
        </section>

        <section class="note-result">
          <div class="result-head">
            <div>
              <h2>笔记评价</h2>
            </div>
            <div v-if="generating" class="mini-loading">生成中</div>
          </div>

          <div class="note-content" @click="copyText">
            <template v-if="result?.text">
              <p v-for="(line, index) in result.text.split('\n')" :key="index">{{ line }}</p>
            </template>
            <p v-else class="placeholder">AI 正在生成适合小红书发布的笔记评价...</p>
          </div>

          <div class="action-row">
            <button class="primary-action" type="button" :disabled="!result?.text" @click="copyText">复制笔记</button>
            <button class="secondary-action" type="button" :disabled="!result?.text" @click="openXhs">发布到小红书</button>
          </div>
        </section>

        <p class="tips">提示：发布前可按自己的真实体验微调文案，图片可使用商家图或自己上传的图片。</p>
      </main>

      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
      </Transition>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { h5 } from '@/api'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const visitorId = getOrCreateVisitorId()

const loading = ref(true)
const generating = ref(false)
const selectedImageIndex = ref(0)
const result = ref(null)
const uploadedImages = ref([])
const toast = reactive({ show: false, message: '', type: 'success' })

const config = reactive({
  merchant_id: '',
  name: '',
  logo: '',
  cover_image: '',
  address: '',
  product_images: [],
})

const productImages = computed(() => {
  if (config.product_images?.length) return config.product_images
  const fallback = config.cover_image || config.logo
  return fallback ? [{ url: fallback, source: 'cover' }] : []
})

const displayImages = computed(() => [...uploadedImages.value, ...productImages.value].slice(0, 12))

const coverStyle = computed(() => {
  const image = displayImages.value[selectedImageIndex.value]?.url || config.cover_image || config.logo
  if (image) return { backgroundImage: `url("${image}")` }
  return { backgroundImage: 'linear-gradient(135deg, #ff2442 0%, #ff8a65 48%, #201314 100%)' }
})

function getOrCreateVisitorId() {
  const key = 'tronmore_h5_visitor_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing

  const id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
  localStorage.setItem(key, id)
  return id
}

function createGenerationId() {
  return crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getRecentNoteOutputs(merchantId) {
  try {
    const raw = localStorage.getItem(getNoteHistoryKey(merchantId))
    const list = JSON.parse(raw || '[]')
    return Array.isArray(list) ? list.slice(0, 3) : []
  } catch {
    return []
  }
}

function rememberNoteOutput(merchantId, text) {
  if (!text?.trim()) return
  const next = [text.trim(), ...getRecentNoteOutputs(merchantId)]
    .filter((item, index, arr) => item && arr.indexOf(item) === index)
    .slice(0, 3)
  localStorage.setItem(getNoteHistoryKey(merchantId), JSON.stringify(next))
}

function getNoteHistoryKey(merchantId) {
  return `tronmore_h5_note_history_${merchantId}`
}

onMounted(async () => {
  const merchantId = route.params.merchantId
  if (!merchantId) {
    showToast('缺少商家参数', 'error')
    loading.value = false
    return
  }

  try {
    const data = await h5.config(merchantId)
    Object.assign(config, data)
    await h5.track({
      event: 'page_note_view',
      merchant_id: merchantId,
      qr_id: route.query.qr_id,
      source: route.query.source || '',
      type: 'note',
    })
    loading.value = false
    const recentOutputs = getRecentNoteOutputs(merchantId)
    if (recentOutputs.length) {
      result.value = {
        text: recentOutputs[0],
        images: displayImages.value.slice(0, 6),
      }
    } else {
      await generateNote()
    }
  } catch (error) {
    console.error(error)
    showToast('加载失败，请刷新重试', 'error')
    loading.value = false
  }
})

const generateNote = async () => {
  if (generating.value || !config.merchant_id) return
  generating.value = true
  result.value = { text: '', images: displayImages.value.slice(0, 6) }
  try {
    await streamGenerate({
      merchant_id: config.merchant_id,
      type: 'note',
      visitor_id: visitorId,
      generation_id: createGenerationId(),
      recent_outputs: getRecentNoteOutputs(config.merchant_id),
    })
  } catch (error) {
    console.error(error)
    if (error.message?.includes('4001') || error.message?.includes('额度')) showToast('该商家额度已用完', 'error')
    else showToast('生成失败，请稍后重试', 'error')
  } finally {
    generating.value = false
  }
}

const streamGenerate = async (payload) => {
  const response = await fetch('/api/v1/h5/generate-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok || !response.body) {
    throw new Error(`生成失败 ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() || ''

    for (const block of blocks) {
      const lines = block.split('\n')
      let eventName = 'message'
      let dataText = ''
      lines.forEach((line) => {
        if (line.startsWith('event: ')) eventName = line.slice(7).trim()
        if (line.startsWith('data: ')) dataText += line.slice(6)
      })
      if (!dataText) continue
      const data = JSON.parse(dataText)
      if (eventName === 'start') {
        result.value.images = displayImages.value.length ? displayImages.value.slice(0, 6) : (data.images || [])
      }
      if (eventName === 'content') {
        result.value.text += data.text || ''
      }
      if (eventName === 'done') {
        result.value = {
          ...data.content,
          images: displayImages.value.length ? displayImages.value.slice(0, 6) : (data.content?.images || []),
        }
        rememberNoteOutput(config.merchant_id, result.value.text)
        await h5.track({
          event: 'gen_success',
          merchant_id: config.merchant_id,
          trace_id: data.trace_id,
          type: 'note',
        })
        showToast('笔记已生成，点击正文可复制')
      }
      if (eventName === 'error') {
        throw new Error(data.message || '生成失败')
      }
    }
  }
}

const handleUpload = async (event) => {
  const files = Array.from(event.target.files || [])
  if (!files.length) return
  const images = await Promise.all(files.map(fileToDataUrl))
  uploadedImages.value.unshift(...images.map((url, index) => ({
    url,
    source: 'upload',
    product_tag: files[index]?.name?.replace(/\.[^.]+$/, '') || '用户上传',
  })))
  selectedImageIndex.value = 0
  event.target.value = ''
}

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const copyText = async () => {
  if (!result.value?.text) return
  try {
    await navigator.clipboard.writeText(result.value.text)
    showToast('笔记已复制')
  } catch {
    showToast('复制失败，请长按正文复制', 'warning')
  }
}

const openXhs = async () => {
  await copyText()
  await h5.track({
    event: 'click_jump',
    merchant_id: config.merchant_id,
    target_platform: 'xhs',
    type: 'note',
  })
  const keyword = encodeURIComponent(config.name)
  window.location.href = `xhsdiscover://search/result?keyword=${keyword}`
  setTimeout(() => showToast('正在为您打开小红书'), 500)
}

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push(`/h5/${config.merchant_id || route.params.merchantId}`)
}

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 2800)
}
</script>

<style scoped>
.note-page {
  min-height: 100vh;
  background: #f7f3ef;
  color: #161616;
}

.loading-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 18px;
  color: #666;
}

.loader {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid #ddd;
  border-top-color: #ff2442;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 18px;
  background: rgba(247, 243, 239, 0.86);
  backdrop-filter: blur(16px);
}

.topbar strong,
.topbar span {
  display: block;
}

.topbar strong {
  font-size: 18px;
}

.topbar span {
  margin-top: 2px;
  color: #8a817a;
  font-size: 12px;
}

.back-btn,
.refresh-btn {
  border: none;
  background: #fff;
  color: #161616;
  box-shadow: 0 8px 22px rgba(30, 20, 15, 0.08);
}

.back-btn {
  width: 44px;
  height: 44px;
  border-radius: 999px;
}

.back-btn :deep(svg) {
  width: 22px;
  height: 22px;
}

.refresh-btn {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 800;
}

.note-shell {
  display: grid;
  gap: 16px;
  padding: 8px 18px 28px;
}

.image-section,
.note-result {
  overflow: hidden;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 18px 46px rgba(40, 24, 18, 0.08);
}

.result-head h2 {
  margin: 0;
}

.image-section,
.note-result {
  padding: 18px;
}

.result-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.product-gallery {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 138px;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.product-image {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
  border: 3px solid transparent;
  border-radius: 20px;
  padding: 0;
  background: #eee;
}

.product-image.active {
  border-color: #ff2442;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image span {
  position: absolute;
  left: 8px;
  bottom: 8px;
  max-width: calc(100% - 16px);
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.56);
  color: #fff;
  font-size: 11px;
}

.upload-card {
  aspect-ratio: 1;
  border: 2px dashed #f1b7c0;
  border-radius: 20px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  color: #ff2442;
  background: #fff8f9;
  font-weight: 900;
}

.upload-card input,
.empty-image input {
  display: none;
}

.upload-card small {
  color: #b9858e;
  font-size: 12px;
}

.empty-image {
  min-height: 150px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  color: #fff;
  font-weight: 900;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
}

.empty-image label {
  width: 100%;
  min-height: 150px;
  display: grid;
  place-items: center;
}

.mini-loading {
  padding: 5px 10px;
  border-radius: 999px;
  background: #fff1f2;
  color: #ff2442;
  font-size: 12px;
  font-weight: 900;
}

.note-content {
  min-height: 210px;
  padding: 18px;
  border-radius: 20px;
  background: #fbfaf8;
  color: #24211f;
  line-height: 1.9;
  font-size: 16px;
  white-space: pre-wrap;
}

.note-content p {
  margin: 0 0 10px;
}

.note-content p:last-child {
  margin-bottom: 0;
}

.placeholder {
  color: #9b918b;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.primary-action,
.secondary-action {
  min-height: 50px;
  border: none;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 900;
}

.primary-action {
  background: #ff2442;
  color: #fff;
}

.secondary-action {
  background: #111;
  color: #fff;
}

.primary-action:disabled,
.secondary-action:disabled,
.refresh-btn:disabled {
  opacity: 0.55;
}

.tips {
  margin: 0;
  color: #9b918b;
  font-size: 13px;
  line-height: 1.7;
  text-align: center;
}

.toast {
  position: fixed;
  top: 18px;
  left: 50%;
  z-index: 99;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
}

.toast.error {
  background: #ef4444;
}

.toast.warning {
  background: #f59e0b;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-14px);
}

@media (min-width: 640px) {
  .note-page {
    max-width: 520px;
    margin: 0 auto;
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.12);
  }
}

@media (max-width: 380px) {
  .note-shell {
    padding-left: 14px;
    padding-right: 14px;
  }

  .product-gallery {
    grid-auto-columns: 118px;
  }
}
</style>
