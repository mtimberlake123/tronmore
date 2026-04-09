<template>
  <div class="qr-sticker-generator">
    <div class="generator-layout">
      <!-- 左侧预览 -->
      <div class="preview-section">
        <div class="preview-title">预览</div>
        <div class="sticker-preview" :class="stickerShape">
          <div class="sticker-content" :style="stickerStyle">
            <div class="sticker-bg" :style="bgStyle"></div>
            <div class="sticker-inner">
              <div class="merchant-logo" v-if="options.showLogo && merchantLogo">
                <img :src="merchantLogo" alt="logo" />
              </div>
              <div class="qr-wrapper" :style="qrWrapperStyle">
                <img :src="qrImage" alt="qr" class="qr-image" />
              </div>
              <div class="merchant-name" v-if="options.showName" :style="{ color: options.themeColor }">{{ merchantName }}</div>
              <div class="prompt-text" v-if="options.showPrompt" :style="{ color: options.themeColor }">{{ options.promptText }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧设置 -->
      <div class="settings-section">
        <div class="settings-title">贴纸设置</div>

        <div class="setting-group">
          <div class="setting-label">贴纸形状</div>
          <div class="shape-options">
            <div
              v-for="shape in shapeOptions"
              :key="shape.value"
              class="shape-option"
              :class="{ active: options.shape === shape.value }"
              @click="options.shape = shape.value"
            >
              {{ shape.label }}
            </div>
          </div>
        </div>

        <div class="setting-group">
          <div class="setting-label">背景颜色</div>
          <div class="color-options">
            <div
              v-for="color in bgColorOptions"
              :key="color.value"
              class="color-option"
              :style="{ background: color.value }"
              :class="{ active: options.bgColor === color.value }"
              @click="options.bgColor = color.value"
            ></div>
          </div>
          <el-color-picker v-model="options.bgColor" size="small" class="color-picker" />
        </div>

        <div class="setting-group">
          <div class="setting-label">主题颜色</div>
          <div class="color-options">
            <div
              v-for="color in themeColorOptions"
              :key="color.value"
              class="color-option"
              :style="{ background: color.value }"
              :class="{ active: options.themeColor === color.value }"
              @click="options.themeColor = color.value"
            ></div>
          </div>
          <el-color-picker v-model="options.themeColor" size="small" class="color-picker" />
        </div>

        <div class="setting-group">
          <div class="setting-label">显示内容</div>
          <div class="checkbox-group">
            <el-checkbox v-model="options.showLogo">商家Logo</el-checkbox>
            <el-checkbox v-model="options.showName">商家名称</el-checkbox>
            <el-checkbox v-model="options.showPrompt">提示语</el-checkbox>
          </div>
        </div>

        <div class="setting-group" v-if="options.showPrompt">
          <div class="setting-label">提示语</div>
          <el-input v-model="options.promptText" size="small" class="prompt-input" />
        </div>

        <div class="setting-group">
          <div class="setting-label">尺寸比例</div>
          <div class="ratio-options">
            <div
              v-for="ratio in ratioOptions"
              :key="ratio.value"
              class="ratio-option"
              :class="{ active: options.ratio === ratio.value }"
              @click="options.ratio = ratio.value"
            >
              {{ ratio.label }}
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <el-button @click="downloadSticker" :disabled="!qrImage">下载贴纸</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { merchant } from '@/api'

const props = defineProps({
  merchantId: String,
  merchantName: String,
  merchantLogo: String
})

const qrImage = ref('')
const generating = ref(false)

const options = reactive({
  shape: 'rounded_rect',
  bgColor: '#ffffff',
  themeColor: '#007AFF',
  showLogo: true,
  showName: true,
  showPrompt: true,
  promptText: '扫一扫，即可发布评价/笔记',
  ratio: '4:3'
})

const shapeOptions = [
  { label: '圆角矩形', value: 'rounded_rect' },
  { label: '圆形', value: 'circle' },
  { label: '正方形', value: 'square' }
]

const bgColorOptions = [
  { value: '#ffffff' },
  { value: '#f5f5f5' },
  { value: '#e3f2fd' },
  { value: '#fff3e0' },
  { value: '#e8f5e9' },
  { value: '#f3e5f5' }
]

const themeColorOptions = [
  { value: '#007AFF' },
  { value: '#52c41a' },
  { value: '#ff4d4f' },
  { value: '#722ed1' },
  { value: '#faad14' },
  { value: '#13c2c2' }
]

const ratioOptions = [
  { label: '4:3', value: '4:3' },
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' }
]

const stickerShape = computed(() => {
  return {
    'shape-rounded': options.shape === 'rounded_rect',
    'shape-circle': options.shape === 'circle',
    'shape-square': options.shape === 'square'
  }
})

const stickerStyle = computed(() => {
  const padding = options.shape === 'circle' ? '20px' : '24px'
  return {
    padding,
    background: options.bgColor
  }
})

const bgStyle = computed(() => {
  if (options.shape === 'circle') {
    return {
      position: 'absolute',
      inset: '8px',
      borderRadius: '50%',
      background: options.bgColor
    }
  }
  return {}
})

const qrWrapperStyle = computed(() => ({
  borderRadius: options.shape === 'circle' ? '12px' : '8px'
}))

const generateQrcode = async () => {
  generating.value = true
  try {
    const res = await merchant.qrcode(props.merchantId, {
      shape: options.shape,
      ratio: options.ratio,
      show_logo: options.showLogo
    })
    qrImage.value = res.qr_image
  } catch (e) {
    console.error(e)
  } finally {
    generating.value = false
  }
}

onMounted(() => {
  generateQrcode()
})

watch([() => options.shape, () => options.ratio, () => options.showLogo], () => {
  generateQrcode()
})

const downloadSticker = () => {
  if (!qrImage.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const ratioParts = options.ratio.split(':')
  const ratioW = parseInt(ratioParts[0])
  const ratioH = parseInt(ratioParts[1])

  let baseWidth = 400
  let baseHeight = Math.round(baseWidth * ratioH / ratioW)

  if (options.shape === 'circle') {
    baseWidth = 360
    baseHeight = 360
  }

  canvas.width = baseWidth
  canvas.height = baseHeight + 120

  // Background
  ctx.fillStyle = options.bgColor
  if (options.shape === 'circle') {
    ctx.beginPath()
    ctx.arc(baseWidth / 2, baseHeight / 2, Math.min(baseWidth, baseHeight) / 2, 0, Math.PI * 2)
    ctx.fill()
  } else if (options.shape === 'rounded_rect') {
    roundRect(ctx, 0, 0, baseWidth, baseHeight, 24)
    ctx.fill()
  } else {
    ctx.fillRect(0, 0, baseWidth, baseHeight)
  }

  // QR Code
  const qrSize = options.shape === 'circle' ? baseWidth - 80 : baseWidth - 60
  const qrY = options.shape === 'circle' ? 40 : 30

  const qrImg = new Image()
  qrImg.crossOrigin = 'anonymous'
  qrImg.onload = () => {
    ctx.drawImage(qrImg, (baseWidth - qrSize) / 2, qrY, qrSize, qrSize)

    // Merchant Name
    if (options.showName && props.merchantName) {
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(props.merchantName, baseWidth / 2, baseHeight + 30)
    }

    // Prompt Text
    if (options.showPrompt && options.promptText) {
      ctx.fillStyle = '#666666'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(options.promptText, baseWidth / 2, baseHeight + 60)
    }

    // Logo
    if (options.showLogo && props.merchantLogo) {
      const logoSize = 50
      const logoX = baseWidth / 2 - logoSize / 2
      const logoY = qrY + qrSize - logoSize / 2 - 10

      ctx.save()
      ctx.beginPath()
      ctx.arc(baseWidth / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
      ctx.clip()
      const logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'
      logoImg.onload = () => {
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        ctx.restore()
        downloadCanvas()
      }
      logoImg.src = props.merchantLogo
    } else {
      downloadCanvas()
    }

    function downloadCanvas() {
      const link = document.createElement('a')
      link.download = `贴纸-${props.merchantName || '商家'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }
  qrImg.src = qrImage.value
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}
</script>

<style scoped>
.qr-sticker-generator {
  padding: 20px;
}

.generator-layout {
  display: flex;
  gap: 40px;
}

.preview-section {
  flex-shrink: 0;
}

.preview-title,
.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
}

.sticker-preview {
  width: 320px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.sticker-preview.shape-rounded .sticker-content {
  border-radius: 24px;
  overflow: hidden;
}

.sticker-preview.shape-circle .sticker-content {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.sticker-preview.shape-square .sticker-content {
  border-radius: 8px;
  overflow: hidden;
}

.sticker-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.sticker-bg {
  display: none;
}

.merchant-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
}

.merchant-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qr-wrapper {
  background: #ffffff;
  padding: 12px;
  border-radius: 8px;
}

.qr-image {
  width: 160px;
  height: 160px;
  display: block;
}

.merchant-name {
  font-size: 18px;
  font-weight: 600;
}

.prompt-text {
  font-size: 12px;
  text-align: center;
}

.settings-section {
  flex: 1;
  max-width: 400px;
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 24px;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-label {
  font-size: 13px;
  color: #919191;
  margin-bottom: 12px;
}

.shape-options,
.ratio-options {
  display: flex;
  gap: 8px;
}

.shape-option,
.ratio-option {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: #919191;
  cursor: pointer;
  transition: all 0.2s;
}

.shape-option:hover,
.ratio-option:hover,
.shape-option.active,
.ratio-option.active {
  background: rgba(0, 122, 255, 0.15);
  border-color: rgba(0, 122, 255, 0.3);
  color: #007AFF;
}

.color-options {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-option:hover,
.color-option.active {
  border-color: #007AFF;
  transform: scale(1.1);
}

.color-picker {
  margin-top: 8px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prompt-input {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}
</style>
