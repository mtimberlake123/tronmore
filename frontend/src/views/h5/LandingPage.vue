<template>
  <div class="h5-landing">
    <div v-if="loading" class="loading-screen">
      <div class="loader"></div>
      <p>正在加载商家信息...</p>
    </div>

    <template v-else>
      <section class="hero" :style="heroStyle">
        <div class="hero-mask"></div>
        <div class="mini-nav">
          <button class="nav-icon" type="button" @click="goBack">
            <ArrowLeft />
          </button>
          <button class="nav-icon" type="button">
            <House />
          </button>
          <div class="nav-spacer"></div>
          <button class="nav-icon soft" type="button">
            <Star />
          </button>
          <div class="capsule">
            <MoreFilled />
            <span class="capsule-dot"></span>
          </div>
        </div>

        <div class="hero-content">
          <h1>{{ config.name || '商家名称' }}</h1>
          <p>
            <LocationFilled />
            <span>{{ config.address || '到店体验后，一键生成优质分享内容' }}</span>
          </p>
        </div>
      </section>

      <main class="action-panel">
        <div class="panel-title">
          <strong>选择要做的事</strong>
          <span>生成内容或领取商家福利</span>
        </div>
        <div class="action-grid">
          <button
            v-for="item in actionCards"
            :key="item.key"
            class="action-card"
            type="button"
            :disabled="generating && item.generating"
            @click="handleAction(item)"
          >
            <span :class="['app-mark', item.tone]">{{ item.mark }}</span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.desc }}</small>
          </button>
        </div>

        <div v-if="config.incentive" class="gift-strip">
          <span>商家福利</span>
          <p>{{ config.incentive }}</p>
        </div>

        <section v-if="result" class="result-card">
          <div class="result-header">
            <div>
              <span class="section-kicker">{{ contentTypeLabel }}</span>
              <h2>内容已生成</h2>
            </div>
            <button class="text-btn" type="button" @click="regenerate" :disabled="generating">
              换一换
            </button>
          </div>

          <div class="content-text" @click="copyText">
            <p v-for="(line, index) in result.text.split('\n')" :key="index">{{ line }}</p>
          </div>

          <div v-if="result.images?.length" class="images-grid">
            <button
              v-for="(img, index) in result.images"
              :key="index"
              class="image-item"
              type="button"
              @click="previewImage(img.url)"
            >
              <img :src="img.url" alt="" />
            </button>
          </div>

          <div class="result-actions">
            <button class="primary-action" type="button" @click="copyText">复制文案</button>
            <button class="secondary-action" type="button" @click="showJumpDialog = true">去发布</button>
          </div>
        </section>

      </main>

      <el-dialog v-model="showJumpDialog" title="确认跳转" width="90%" class="jump-dialog">
        <div class="dialog-content">
          <p class="dialog-text">即将跳转至：<strong>{{ jumpPlatformName }}</strong></p>
          <div class="dialog-tips">
            <p>文案会先复制到剪贴板。</p>
            <p>发布时可选择生成结果中的配图。</p>
            <p>发布完成后可回到商家页面领取福利。</p>
          </div>
        </div>
        <template #footer>
          <el-button @click="showJumpDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmJump">确认跳转</el-button>
        </template>
      </el-dialog>

      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { h5 } from '@/api'
import {
  ArrowLeft,
  House,
  LocationFilled,
  MoreFilled,
  Star
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const generating = ref(false)
const lastGenerateType = ref('review')
const config = reactive({
  merchant_id: '',
  name: '',
  logo: '',
  cover_image: '',
  incentive: '',
  jump_targets: ['dianping'],
  dy_url: '',
  wx_qr: '',
  address: '',
  product_images: [],
})
const result = ref(null)
const showJumpDialog = ref(false)
const selectedPlatform = ref('dianping')
const toast = reactive({ show: false, message: '', type: 'success' })

const heroStyle = computed(() => {
  const backgroundImage = config.cover_image || config.logo
  if (backgroundImage) {
    return { backgroundImage: `url("${backgroundImage}")` }
  }

  return {
    backgroundImage:
      'linear-gradient(135deg, #d7c0a0 0%, #9d7550 48%, #4d3728 100%)'
  }
})

const actionCards = computed(() => [
  ...[
    {
    key: 'xhs-note',
    mark: '小红书',
    title: '小红书笔记',
    desc: '生成可发布笔记',
    tone: 'red',
    type: 'note',
    generating: true,
  },
  {
    key: 'dianping-review',
    mark: '点评',
    title: '大众点评',
    desc: generating.value && lastGenerateType.value === 'review' ? '正在生成' : '生成点评文案',
    tone: 'orange',
    type: 'review',
    generating: true,
  },
  ],
  ...(config.dy_url ? [{
    key: 'douyin-follow',
    mark: '抖音',
    title: '商家抖音',
    desc: '查看商家主页',
    tone: 'black',
    platform: 'douyin',
  }] : []),
  ...(config.wx_qr ? [{
    key: 'wechat-add',
    mark: '微信',
    title: '商家微信',
    desc: '添加微信咨询',
    tone: 'green',
    platform: 'wechat',
  }] : []),
])

const contentTypeLabel = computed(() => (
  lastGenerateType.value === 'note' ? '小红书笔记' : '点评内容'
))

const jumpPlatformName = computed(() => getPlatformName(selectedPlatform.value))

onMounted(async () => {
  const merchantId = route.params.merchantId || route.params.merchant_id || route.query.merchant_id
  if (!merchantId) {
    showToast('缺少商家参数', 'error')
    loading.value = false
    return
  }

  try {
    const data = await h5.config(merchantId)
    Object.assign(config, data)

    await h5.track({
      event: 'page_view',
      merchant_id: merchantId,
      qr_id: route.query.qr_id,
      source: route.query.source || '',
    })
  } catch (error) {
    console.error('获取配置失败:', error)
    showToast('加载失败，请刷新重试', 'error')
  } finally {
    loading.value = false
  }
})

const handleAction = async (item) => {
  if (item.type) {
    if (item.type === 'note') {
      router.push({
        path: `/h5/${config.merchant_id}/note`,
        query: {
          qr_id: route.query.qr_id,
          source: route.query.source || '',
        },
      })
      return
    }
    await generateContent(item.type)
    return
  }

  if (item.platform === 'douyin') {
    await trackJump('douyin')
    if (config.dy_url) {
      window.location.href = config.dy_url
    } else {
      showToast('商家暂未配置抖音主页', 'warning')
    }
    return
  }

  if (item.platform === 'wechat') {
    await trackJump('wechat')
    if (config.wx_qr) {
      previewImage(config.wx_qr)
    } else {
      showToast('商家暂未配置微信', 'warning')
    }
    return
  }

  jumpToPlatform(item.platform)
}

const generateContent = async (type = 'review') => {
  if (generating.value) return

  generating.value = true
  lastGenerateType.value = type

  try {
    await h5.track({
      event: 'btn_generate',
      merchant_id: config.merchant_id,
      qr_id: route.query.qr_id,
      type,
    })

    const data = await h5.generate({
      merchant_id: config.merchant_id,
      type,
    })

    result.value = data.content

    await h5.track({
      event: 'gen_success',
      merchant_id: config.merchant_id,
      trace_id: data.trace_id,
      duration: 0,
      type,
    })

    showToast('生成成功，点击文案可复制')
  } catch (error) {
    console.error('生成失败:', error)
    if (error.message?.includes('4001')) {
      showToast('该商家额度已用完', 'error')
    } else if (error.message?.includes('4003')) {
      showToast('内容优化中，请重试', 'error')
    } else {
      showToast('生成失败，请重试', 'error')
    }
  } finally {
    generating.value = false
  }
}

const regenerate = async () => {
  await generateContent(lastGenerateType.value)
}

const copyText = async () => {
  if (!result.value?.text) return

  try {
    await navigator.clipboard.writeText(result.value.text)
    showToast('文案已复制到剪贴板')
  } catch {
    showToast('复制失败，请长按选择复制', 'warning')
  }
}

const previewImage = (url) => {
  window.open(url, '_blank')
}

const jumpToPlatform = (platform) => {
  selectedPlatform.value = platform || 'dianping'
  showJumpDialog.value = true
}

const confirmJump = async () => {
  showJumpDialog.value = false
  await copyText()
  await trackJump(selectedPlatform.value)

  const name = encodeURIComponent(config.name)
  const schemes = {
    dianping: `dianping://search?keyword=${name}`,
    xhs: `xhsdiscover://search/result?keyword=${name}`,
    meituan: `meituan://www.meituan.com/search?keyword=${name}`,
  }

  window.location.href = schemes[selectedPlatform.value] || schemes.dianping
  setTimeout(() => {
    showToast('正在为您打开应用...')
  }, 500)
}

const trackJump = async (platform) => {
  await h5.track({
    event: 'click_jump',
    merchant_id: config.merchant_id,
    target_platform: platform,
  })
}

const getPlatformName = (platform) => {
  const names = {
    dianping: '大众点评',
    xhs: '小红书',
    meituan: '美团',
    douyin: '抖音',
  }
  return names[platform] || platform
}

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  }
}

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}
</script>

<style scoped>
.h5-landing {
  min-height: 100vh;
  background: #fff;
  color: #111;
  overflow-x: hidden;
}

.loading-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 18px;
  background: #f7f7f7;
  color: #666;
}

.loader {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid #ddd;
  border-top-color: #111;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hero {
  position: relative;
  min-height: 42vh;
  padding: 18px 18px 26px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-size: cover;
  background-position: center;
}

.hero-mask {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.58)),
    linear-gradient(90deg, rgba(0, 0, 0, 0.34), transparent 70%);
}

.mini-nav,
.hero-content {
  position: relative;
  z-index: 1;
}

.mini-nav {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.92);
}

.nav-spacer {
  flex: 1;
}

.nav-icon,
.capsule {
  height: 46px;
  min-width: 46px;
  border: none;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.92);
  background: transparent;
}

.nav-icon :deep(svg),
.capsule :deep(svg) {
  width: 26px;
  height: 26px;
}

.nav-icon.soft,
.capsule {
  background: rgba(255, 255, 255, 0.34);
  backdrop-filter: blur(12px);
}

.capsule {
  gap: 18px;
  min-width: 116px;
  padding: 0 18px;
}

.capsule-dot {
  width: 24px;
  height: 24px;
  border: 4px solid currentColor;
  border-radius: 50%;
}

.hero-content {
  color: #fff;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
}

.hero-content h1 {
  margin: 0 0 12px;
  font-size: clamp(30px, 8vw, 44px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.hero-content p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 17px;
  font-weight: 600;
}

.hero-content :deep(svg) {
  width: 24px;
  height: 24px;
}

.action-panel {
  position: relative;
  z-index: 2;
  margin-top: -24px;
  min-height: 58vh;
  padding: 28px 22px 28px;
  background: #fff;
  border-radius: 36px 36px 0 0;
}

.panel-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.panel-title strong {
  color: #111;
  font-size: 22px;
  line-height: 1.2;
}

.panel-title span {
  color: #999;
  font-size: 13px;
  white-space: nowrap;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.action-card {
  min-height: 146px;
  padding: 18px;
  border: none;
  border-radius: 22px;
  background: #f8f8f8;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.action-card:active {
  transform: scale(0.98);
}

.action-card:disabled {
  opacity: 0.72;
}

.app-mark {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.08em;
}

.app-mark.red {
  background: #ff2442;
}

.app-mark.orange {
  background: #ff6a2a;
}

.app-mark.black {
  background: #050505;
}

.app-mark.green {
  background: #10b981;
}

.action-card strong {
  margin-top: auto;
  color: #111;
  font-size: clamp(20px, 5vw, 25px);
  line-height: 1.12;
  font-weight: 800;
}

.action-card small {
  color: #999;
  font-size: clamp(14px, 4vw, 19px);
  line-height: 1.2;
}

.gift-strip {
  margin-top: 22px;
  padding: 16px 18px;
  border-radius: 18px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.gift-strip span {
  display: block;
  color: #c2410c;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 4px;
}

.gift-strip p {
  margin: 0;
  color: #7c2d12;
  line-height: 1.6;
}

.result-card {
  margin-top: 24px;
  padding: 20px;
  border-radius: 24px;
  background: #f7f7f7;
  animation: riseIn 0.28s ease-out both;
}

@keyframes riseIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

.section-kicker {
  color: #ff6a2a;
  font-size: 12px;
  font-weight: 800;
}

.result-header h2 {
  margin: 4px 0 0;
  font-size: 22px;
}

.text-btn {
  border: none;
  background: transparent;
  color: #ff6a2a;
  font-weight: 800;
}

.content-text {
  padding: 16px;
  border-radius: 18px;
  background: #fff;
  color: #222;
  line-height: 1.85;
  font-size: 15px;
}

.content-text p {
  margin: 0 0 8px;
}

.content-text p:last-child {
  margin-bottom: 0;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 14px;
}

.image-item {
  border: none;
  padding: 0;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  background: #eee;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.primary-action,
.secondary-action {
  min-height: 48px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 800;
  border: none;
}

.primary-action {
  color: #fff;
  background: #111;
}

.secondary-action {
  color: #111;
  background: #fff;
  border: 1px solid #e5e5e5;
}

.dialog-content {
  padding: 8px 0;
}

.dialog-text {
  font-size: 16px;
  color: #111;
  margin-bottom: 20px;
}

.dialog-tips {
  background: #f7f7f7;
  border-radius: 16px;
  padding: 16px;
}

.dialog-tips p {
  margin: 0 0 8px;
  color: #555;
}

.dialog-tips p:last-child {
  margin-bottom: 0;
}

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 22px;
  border-radius: 999px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  z-index: 9999;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
}

.toast.success {
  background: #111;
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
  transform: translateX(-50%) translateY(-16px);
}

@media (min-width: 640px) {
  .h5-landing {
    max-width: 520px;
    margin: 0 auto;
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.12);
  }
}

@media (max-width: 380px) {
  .action-panel {
    padding-left: 18px;
    padding-right: 18px;
  }

  .action-grid {
    gap: 16px 14px;
  }

  .action-card {
    min-height: 158px;
    padding: 22px 18px 18px;
  }
}
</style>
