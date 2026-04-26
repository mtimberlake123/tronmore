<template>
  <div class="qr-sticker-generator">
    <div class="generator-layout">
      <div class="preview-section">
        <div class="preview-title">预览</div>
        <div class="sticker-preview" :class="stickerShape">
          <div class="sticker-content" :style="stickerStyle">
            <div class="sticker-inner">
              <div class="merchant-logo" v-if="options.showLogo && merchantLogo">
                <img :src="merchantLogo" alt="商家标识" />
              </div>
              <div class="qr-wrapper" :style="qrWrapperStyle">
                <img :src="qrImage" alt="二维码" class="qr-image" />
              </div>
              <div class="merchant-name" v-if="options.showName" :style="{ color: options.themeColor }">
                {{ merchantName }}
              </div>
              <div class="prompt-text" v-if="options.showPrompt" :style="{ color: options.themeColor }">
                {{ options.promptText }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-title">贴纸设置</div>

        <div class="setting-group">
          <div class="setting-label">贴纸比例</div>
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
            <el-checkbox v-model="options.showLogo">商家标识</el-checkbox>
            <el-checkbox v-model="options.showName">商家名称</el-checkbox>
            <el-checkbox v-model="options.showPrompt">提示语</el-checkbox>
          </div>
        </div>

        <div class="setting-group" v-if="options.showPrompt">
          <div class="setting-label">提示语</div>
          <el-input v-model="options.promptText" size="small" class="prompt-input" />
        </div>

        <div class="action-buttons">
          <el-button @click="downloadSticker" :disabled="!qrImage" :loading="generating">下载贴纸</el-button>
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
  ratio: '3:4'
})

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
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '9:16', value: '9:16' }
]

const validRatios = ratioOptions.map(item => item.value)

const stickerShape = computed(() => ({
  'shape-rounded': true
}))

const stickerStyle = computed(() => {
  const { width, height } = getPreviewSize()
  const metrics = getStickerMetrics({
    width,
    height,
    hasLogo: Boolean(options.showLogo && props.merchantLogo)
  })

  return {
    background: options.bgColor,
    width: `${width}px`,
    height: `${height}px`,
    '--sticker-pad': `${metrics.padding}px`,
    '--sticker-gap': `${metrics.gap}px`,
    '--logo-size': `${metrics.logoSize}px`,
    '--qr-box': `${metrics.qrBoxSize}px`,
    '--qr-pad': `${metrics.qrPadding}px`,
    '--name-font': `${metrics.nameFont}px`,
    '--prompt-font': `${metrics.promptFont}px`
  }
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

const downloadSticker = async () => {
  if (!qrImage.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { width, height } = getExportSize()
  canvas.width = width
  canvas.height = height

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = options.bgColor

  if (options.shape === 'circle') {
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.clip()
  } else if (options.shape === 'rounded_rect') {
    roundRect(ctx, 0, 0, width, height, Math.round(Math.min(width, height) * 0.08))
    ctx.fill()
    ctx.clip()
  } else {
    ctx.fillRect(0, 0, width, height)
  }

  try {
    const qrImg = await loadImage(qrImage.value)
    const logoImg = options.showLogo && props.merchantLogo
      ? await loadImage(props.merchantLogo).catch(() => null)
      : null

    drawStickerContent(ctx, { width, height, qrImg, logoImg })

    const link = document.createElement('a')
    link.download = `贴纸-${props.merchantName || '商家'}-${options.shape === 'circle' ? '1:1' : options.ratio}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (e) {
    console.error(e)
  }
}

function getRatioParts() {
  if (!validRatios.includes(options.ratio)) {
    options.ratio = '1:1'
  }
  const [rawW, rawH] = String(options.ratio || '1:1').split(':')
  const w = Number.parseInt(rawW, 10) || 1
  const h = Number.parseInt(rawH, 10) || 1
  return { w, h }
}

function getExportSize() {
  if (options.shape === 'circle') {
    return { width: 1200, height: 1200 }
  }

  const ratio = getRatioParts()
  if (ratio.w >= ratio.h) {
    return { width: 1200, height: Math.round(1200 * ratio.h / ratio.w) }
  }
  return { width: Math.round(1200 * ratio.w / ratio.h), height: 1200 }
}

function getPreviewSize() {
  if (options.shape === 'circle' || options.shape === 'square') {
    return { width: 280, height: 280 }
  }

  const ratio = getRatioParts()
  if (ratio.w >= ratio.h) {
    return { width: 280, height: Math.round(280 * ratio.h / ratio.w) }
  }
  return { width: 280, height: Math.round(280 * ratio.h / ratio.w) }
}

function getStickerMetrics({ width, height, hasLogo }) {
  const minSide = Math.min(width, height)
  const padding = Math.round(minSide * (options.shape === 'circle' ? 0.12 : 0.08))
  const gap = Math.round(minSide * 0.035)
  const logoSize = hasLogo ? Math.round(minSide * 0.13) : 0
  const nameFont = Math.round(minSide * 0.055)
  const promptFont = Math.round(minSide * 0.034)
  const nameHeight = options.showName && props.merchantName ? Math.round(nameFont * 1.35) : 0
  const promptHeight = options.showPrompt && options.promptText ? Math.round(promptFont * 1.35) : 0
  const textGap = nameHeight && promptHeight ? Math.round(gap * 0.45) : 0
  const textHeight = nameHeight + promptHeight + textGap
  const logoBlock = logoSize ? logoSize + gap : 0
  const availableQrHeight = height - padding * 2 - logoBlock - textHeight - gap
  const qrBoxSize = Math.max(
    Math.round(minSide * 0.32),
    Math.min(width - padding * 2, availableQrHeight)
  )
  const qrPadding = Math.round(qrBoxSize * 0.075)

  return {
    padding,
    gap,
    logoSize,
    nameFont,
    promptFont,
    qrBoxSize,
    qrPadding
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawStickerContent(ctx, { width, height, qrImg, logoImg }) {
  const metrics = getStickerMetrics({ width, height, hasLogo: Boolean(logoImg) })
  const { padding, gap, logoSize, nameFont, promptFont, qrBoxSize, qrPadding } = metrics
  const nameHeight = options.showName && props.merchantName ? Math.round(nameFont * 1.35) : 0
  const promptHeight = options.showPrompt && options.promptText ? Math.round(promptFont * 1.35) : 0
  const textGap = nameHeight && promptHeight ? Math.round(gap * 0.45) : 0
  const textHeight = nameHeight + promptHeight + textGap
  const logoBlock = logoSize ? logoSize + gap : 0

  let y = Math.max(padding, Math.round((height - logoBlock - qrBoxSize - textHeight - gap) / 2))

  if (logoImg) {
    drawRoundedImage(ctx, logoImg, (width - logoSize) / 2, y, logoSize, logoSize, Math.round(logoSize * 0.2))
    y += logoSize + gap
  }

  const qrX = (width - qrBoxSize) / 2
  const qrRadius = Math.round(qrBoxSize * 0.06)
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, qrX, y, qrBoxSize, qrBoxSize, qrRadius)
  ctx.fill()

  ctx.drawImage(qrImg, qrX + qrPadding, y + qrPadding, qrBoxSize - qrPadding * 2, qrBoxSize - qrPadding * 2)
  y += qrBoxSize + gap

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  if (options.showName && props.merchantName) {
    ctx.fillStyle = options.themeColor || '#111111'
    ctx.font = `700 ${nameFont}px sans-serif`
    drawSingleLineText(ctx, props.merchantName, width / 2, y, width - padding * 2)
    y += nameHeight
  }

  if (options.showPrompt && options.promptText) {
    if (nameHeight) y += textGap
    ctx.fillStyle = options.themeColor || '#555555'
    ctx.globalAlpha = 0.78
    ctx.font = `400 ${promptFont}px sans-serif`
    drawSingleLineText(ctx, options.promptText, width / 2, y, width - padding * 2)
    ctx.globalAlpha = 1
  }
}

function drawRoundedImage(ctx, img, x, y, width, height, radius) {
  ctx.save()
  roundRect(ctx, x, y, width, height, radius)
  ctx.clip()
  ctx.drawImage(img, x, y, width, height)
  ctx.restore()
}

function drawSingleLineText(ctx, text, x, y, maxWidth) {
  const content = String(text || '')
  if (ctx.measureText(content).width <= maxWidth) {
    ctx.fillText(content, x, y)
    return
  }

  let output = content
  while (output.length > 1 && ctx.measureText(`${output}...`).width > maxWidth) {
    output = output.slice(0, -1)
  }
  ctx.fillText(`${output}...`, x, y)
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
  min-height: 380px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.sticker-content {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sticker-pad);
  overflow: hidden;
}

.sticker-preview.shape-rounded .sticker-content {
  border-radius: 24px;
}

.sticker-preview.shape-circle .sticker-content {
  border-radius: 50%;
}

.sticker-preview.shape-square .sticker-content {
  border-radius: 8px;
}

.sticker-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sticker-gap);
}

.merchant-logo {
  width: var(--logo-size);
  height: var(--logo-size);
  border-radius: max(6px, calc(var(--logo-size) * 0.2));
  overflow: hidden;
  flex-shrink: 0;
}

.merchant-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qr-wrapper {
  background: #ffffff;
  width: var(--qr-box);
  height: var(--qr-box);
  padding: var(--qr-pad);
  box-sizing: border-box;
  border-radius: 8px;
  flex-shrink: 0;
}

.qr-image {
  width: 100%;
  height: 100%;
  display: block;
}

.merchant-name {
  max-width: 100%;
  font-size: var(--name-font);
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prompt-text {
  max-width: 100%;
  font-size: var(--prompt-font);
  line-height: 1.2;
  text-align: center;
  opacity: 0.78;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-section {
  flex: 1;
  max-width: 400px;
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
