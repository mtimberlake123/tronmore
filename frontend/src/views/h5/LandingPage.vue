<template>
  <div class="h5-landing" :class="{ 'dark-mode': isDark }">
    <!-- 动态背景 -->
    <div class="bg-effects">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-screen">
      <div class="loader">
        <div class="loader-orb"></div>
        <div class="loader-orb delay-1"></div>
        <div class="loader-orb delay-2"></div>
      </div>
      <p class="loading-text">正在加载...</p>
    </div>

    <!-- 主内容 -->
    <div v-else class="content-wrapper">
      <!-- 顶部商家信息 -->
      <div class="merchant-header">
        <div class="merchant-logo">
          <img v-if="config.logo" :src="config.logo" :alt="config.name" />
          <div v-else class="logo-placeholder">
            <Shop />
          </div>
        </div>
        <h1 class="merchant-name">{{ config.name }}</h1>
        <div v-if="config.incentive" class="incentive-badge">
          <span class="icon">🎁</span>
          <span>{{ config.incentive }}</span>
        </div>
      </div>

      <!-- 主操作区 -->
      <div class="main-action">
        <!-- 激励卡片 -->
        <div class="motivation-card">
          <div class="motivation-icon">🎁</div>
          <p class="motivation-text">{{ config.incentive || '参与活动，发布好评即享优惠！' }}</p>
        </div>

        <!-- 生成按钮 -->
        <button
          v-if="!result"
          class="generate-btn"
          :class="{ loading: generating }"
          :disabled="generating || !canGenerate"
          @click="handleGenerate"
        >
          <span v-if="!generating" class="btn-content">
            <MagicStick class="btn-icon" />
            <span class="btn-text">生成内容</span>
          </span>
          <span v-else class="btn-loading">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </button>

        <!-- 余额不足提示 -->
        <div v-if="!canGenerate" class="balance-tip">
          该商家额度已用完，请联系商家充值
        </div>
      </div>

      <!-- 生成结果 -->
      <div v-if="result" class="result-section">
        <!-- 图片展示 -->
        <div class="images-wall">
          <h3 class="section-title">
            <Picture class="title-icon" />
            配套图片
          </h3>
          <div class="images-grid">
            <div
              v-for="(img, idx) in result.images"
              :key="idx"
              class="image-item"
              :style="{ animationDelay: `${idx * 0.1}s` }"
            >
              <img :src="img.url" alt="" />
              <div class="image-overlay">
                <el-button size="small" @click="previewImage(img.url)">预览</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 文案展示 -->
        <div class="content-card">
          <div class="content-header">
            <span class="content-type">{{ contentTypeLabel }}</span>
            <el-button text @click="regenerate" :loading="generating">
              <Refresh class="btn-icon-sm" /> 换一换
            </el-button>
          </div>
          <div class="content-text" @click="copyText">
            <p v-for="(line, idx) in result.text.split('\n')" :key="idx">{{ line }}</p>
          </div>
          <div class="content-actions">
            <el-button @click="copyText" type="primary" size="large">
              <DocumentCopy class="btn-icon-sm" />
              复制文案
            </el-button>
            <el-button @click="showJumpDialog = true" type="warning" size="large">
              <Promotion class="btn-icon-sm" />
              去发布
            </el-button>
          </div>
        </div>
      </div>

      <!-- 底部跳转平台 -->
      <div v-if="result" class="jump-section">
        <p class="jump-hint">跳转到以下平台发布</p>
        <div class="platform-list">
          <button
            v-for="platform in config.jump_targets"
            :key="platform"
            class="platform-btn"
            @click="jumpToPlatform(platform)"
          >
            <span class="platform-icon">{{ getPlatformIcon(platform) }}</span>
            <span class="platform-name">{{ getPlatformName(platform) }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 跳转确认弹窗 -->
    <el-dialog v-model="showJumpDialog" title="确认跳转" width="90%" class="jump-dialog">
      <div class="dialog-content">
        <p class="dialog-text">即将跳转至：<strong>{{ jumpPlatformName }}</strong></p>
        <div class="dialog-tips">
          <p>📋 文案已自动复制到剪贴板</p>
          <p>📸 图片已准备好，发布时选择上传</p>
          <p>✨ 发布成功后可返回领取奖励</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showJumpDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmJump">确认跳转</el-button>
      </template>
    </el-dialog>

    <!-- Toast提示 -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { h5 } from '@/api'
import { ElMessage } from 'element-plus'
import { Shop, MagicStick, Picture, Refresh, DocumentCopy, Promotion } from '@element-plus/icons-vue'

const route = useRoute()

// 状态
const loading = ref(true)
const generating = ref(false)
const config = reactive({
  merchant_id: '',
  name: '',
  logo: '',
  incentive: '',
  jump_targets: ['dianping'],
  dy_url: '',
  wx_qr: '',
})
const result = ref(null)
const showJumpDialog = ref(false)
const selectedPlatform = ref('')
const toast = reactive({ show: false, message: '', type: 'success' })

// 计算属性
const canGenerate = computed(() => true) // 前端不做校验，由后端返回
const contentTypeLabel = computed(() => {
  // 根据实际type显示
  return '评价内容'
})

// 初始化
onMounted(async () => {
  const merchantId = route.query.merchant_id || route.params.merchant_id
  if (!merchantId) {
    showToast('缺少商家参数', 'error')
    return
  }

  try {
    // 获取商家配置
    const data = await h5.config(merchantId)
    Object.assign(config, data)

    // 记录埋点 - page_view
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

// 生成内容
const handleGenerate = async () => {
  if (generating.value) return

  generating.value = true

  try {
    // 记录埋点 - btn_generate
    await h5.track({
      event: 'btn_generate',
      merchant_id: config.merchant_id,
      qr_id: route.query.qr_id,
      type: 'review',
    })

    // 调用生成接口
    const data = await h5.generate({
      merchant_id: config.merchant_id,
      type: 'review',
    })

    result.value = data.content

    // 记录埋点 - gen_success
    await h5.track({
      event: 'gen_success',
      merchant_id: config.merchant_id,
      trace_id: data.trace_id,
      duration: 0,
    })

    showToast('生成成功！', 'success')
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

// 重新生成
const regenerate = async () => {
  await handleGenerate()
}

// 复制文案
const copyText = async () => {
  try {
    await navigator.clipboard.writeText(result.value.text)
    showToast('文案已复制到剪贴板')
  } catch {
    showToast('复制失败，请长按选择复制', 'warning')
  }
}

// 预览图片
const previewImage = (url) => {
  window.open(url, '_blank')
}

// 选择跳转平台
const jumpToPlatform = (platform) => {
  selectedPlatform.value = platform
  showJumpDialog.value = true
}

// 确认跳转
const confirmJump = async () => {
  showJumpDialog.value = false

  // 复制文案
  await copyText()

  // 记录埋点 - click_jump
  await h5.track({
    event: 'click_jump',
    merchant_id: config.merchant_id,
    target_platform: selectedPlatform.value,
  })

  // 构建跳转URL
  let scheme = ''
  const name = encodeURIComponent(config.name)

  switch (selectedPlatform.value) {
    case 'dianping':
      scheme = `dianping://search?keyword=${name}`
      break
    case 'xhs':
      scheme = `xhsdiscover://search/result?keyword=${name}`
      break
    case 'meituan':
      scheme = `meituan://www.meituan.com/search?keyword=${name}`
      break
  }

  // 尝试唤起App
  window.location.href = scheme

  // 兜底处理
  setTimeout(() => {
    showToast('正在为您打开App...')
  }, 500)
}

// 获取平台信息
const getPlatformIcon = (platform) => {
  const icons = { dianping: '📍', xhs: '📕', meituan: '🍔' }
  return icons[platform] || '📱'
}

const getPlatformName = (platform) => {
  const names = { dianping: '大众点评', xhs: '小红书', meituan: '美团' }
  return names[platform] || platform
}

const jumpPlatformName = computed(() => getPlatformName(selectedPlatform.value))

// Toast提示
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
/* 基础变量 */
.h5-landing {
  --primary: #667eea;
  --primary-dark: #764ba2;
  --bg-glass: rgba(255, 255, 255, 0.85);
  --text-primary: #1f2937;
  --text-secondary: #6b7280;

  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

/* 背景动效 */
.bg-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: #fff;
  top: -100px;
  right: -50px;
  animation: float1 8s ease-in-out infinite;
}

.orb-2 {
  width: 200px;
  height: 200px;
  background: #ffd700;
  bottom: 20%;
  left: -80px;
  animation: float2 10s ease-in-out infinite;
}

.orb-3 {
  width: 150px;
  height: 150px;
  background: #ff6b6b;
  top: 40%;
  right: -40px;
  animation: float3 12s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-20px, 20px); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -20px); }
}

@keyframes float3 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-15px, -30px); }
}

/* 加载状态 */
.loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.loader {
  display: flex;
  gap: 8px;
}

.loader-orb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  animation: pulse 1.4s ease-in-out infinite;
}

.loader-orb.delay-1 { animation-delay: 0.2s; }
.loader-orb.delay-2 { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}

.loading-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

/* 内容包装 */
.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 24px 16px;
  max-width: 480px;
  margin: 0 auto;
}

/* 商家头部 */
.merchant-header {
  text-align: center;
  margin-bottom: 32px;
}

.merchant-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.merchant-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.merchant-name {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.incentive-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  padding: 8px 20px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
}

.incentive-badge .icon {
  font-size: 16px;
}

/* 主操作区 */
.main-action {
  margin-bottom: 24px;
}

.motivation-card {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  margin-bottom: 20px;
}

.motivation-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.motivation-text {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.6;
}

/* 生成按钮 */
.generate-btn {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #1f2937;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 215, 0, 0.5);
}

.generate-btn:active:not(:disabled) {
  transform: translateY(0);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.generate-btn.loading {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  font-size: 20px;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-loading .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1f2937;
  animation: dotPulse 1.4s ease-in-out infinite;
}

.btn-loading .dot:nth-child(2) { animation-delay: 0.2s; }
.btn-loading .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}

.balance-tip {
  text-align: center;
  color: #fef3c7;
  font-size: 13px;
  margin-top: 12px;
}

/* 结果区域 */
.result-section {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 图片墙 */
.images-wall {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.title-icon {
  color: #667eea;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  animation: fadeInUp 0.4s ease forwards;
  opacity: 0;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

/* 内容卡片 */
.content-card {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.content-type {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.content-text {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.content-text:hover {
  background: #f3f4f6;
}

.content-text p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.content-text p:last-child {
  margin-bottom: 0;
}

.content-actions {
  display: flex;
  gap: 12px;
}

.content-actions .el-button {
  flex: 1;
}

.btn-icon-sm {
  width: 16px;
  height: 16px;
}

/* 跳转区域 */
.jump-section {
  text-align: center;
  padding: 20px 0;
}

.jump-hint {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 16px;
}

.platform-list {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.platform-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.platform-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.platform-icon {
  font-size: 28px;
}

.platform-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 弹窗 */
.dialog-content {
  padding: 8px 0;
}

.dialog-text {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.dialog-tips {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 12px;
  padding: 16px;
}

.dialog-tips p {
  font-size: 14px;
  color: #667eea;
  margin-bottom: 8px;
}

.dialog-tips p:last-child {
  margin-bottom: 0;
}

/* Toast */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.toast.success {
  background: #10b981;
  color: white;
}

.toast.error {
  background: #ef4444;
  color: white;
}

.toast.warning {
  background: #f59e0b;
  color: white;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* 响应式 */
@media (max-width: 380px) {
  .images-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .platform-list {
    flex-direction: column;
  }

  .platform-btn {
    flex-direction: row;
    justify-content: center;
    gap: 12px;
  }
}
</style>