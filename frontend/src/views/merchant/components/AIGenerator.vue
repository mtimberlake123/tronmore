<template>
  <div class="ai-generator">
    <!-- 顶部标题区 -->
    <div class="generator-header">
      <div class="header-left">
        <h2 class="title">AI智能生成</h2>
        <p class="subtitle">基于商家特色智能生成营销内容</p>
      </div>
      <div class="header-right">
        <el-tag :type="generating ? 'warning' : 'success'" size="large">
          {{ generating ? '生成中...' : '就绪' }}
        </el-tag>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="generator-content">
      <!-- 左侧：配置面板 -->
      <div class="config-panel glass-card">
        <div class="config-section">
          <label class="config-label">内容类型</label>
          <div class="type-selector">
            <button
              v-for="t in contentTypes"
              :key="t.value"
              :class="['type-btn', { active: formData.type === t.value }]"
              @click="formData.type = t.value"
            >
              <span class="type-icon">{{ t.icon }}</span>
              <span class="type-text">{{ t.label }}</span>
            </button>
          </div>
        </div>

        <div class="config-section" v-if="formData.type === 'note'">
          <label class="config-label">自定义话题</label>
          <el-input
            v-model="formData.topics"
            placeholder="输入话题，用逗号分隔，如：#美食探店 #周末好去处"
            size="large"
          />
        </div>

        <div class="config-section">
          <label class="config-label">跳转平台</label>
          <div class="platform-selector">
            <el-checkbox-group v-model="formData.jumpTargets">
              <el-checkbox value="dianping">大众点评</el-checkbox>
              <el-checkbox value="xhs">小红书</el-checkbox>
              <el-checkbox value="meituan">美团</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <div class="config-section">
          <label class="config-label">图片数量</label>
          <div class="image-count">
            <el-slider v-model="formData.imageCount" :min="3" :max="9" :step="1" show-stops />
            <span class="count-value">{{ formData.imageCount }} 张</span>
          </div>
        </div>

        <div class="config-actions">
          <el-button size="large" @click="resetConfig">重置</el-button>
          <el-button
            type="primary"
            size="large"
            :loading="generating"
            @click="handleGenerate"
            :disabled="!canGenerate"
          >
            <span v-if="!generating">✨ 立即生成</span>
            <span v-else>生成中...</span>
          </el-button>
        </div>
      </div>

      <!-- 右侧：预览面板 -->
      <div class="preview-panel">
        <!-- 空状态 -->
        <div v-if="!result && !generating" class="preview-empty glass-card">
          <div class="empty-illustration">
            <svg viewBox="0 0 200 200" class="empty-svg">
              <defs>
                <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.3" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="url(#emptyGrad)" />
              <path d="M70 100 L90 120 L130 80" stroke="#667eea" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5" />
            </svg>
          </div>
          <h3>配置参数后点击生成</h3>
          <p>AI将根据商家特色和参考库生成内容</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="generating" class="preview-loading glass-card">
          <div class="loading-animation">
            <div class="loading-orb"></div>
            <div class="loading-orb delay-1"></div>
            <div class="loading-orb delay-2"></div>
          </div>
          <p class="loading-text">
            <span class="typing">AI正在创作中</span>
            <span class="dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </p>
          <p class="loading-hint">预计耗时 {{ estimatedTime }} 秒</p>
        </div>

        <!-- 结果预览 -->
        <div v-if="result && !generating" class="preview-result">
          <!-- 图片墙 -->
          <div class="image-wall glass-card">
            <div class="image-grid">
              <div
                v-for="(img, idx) in result.images"
                :key="idx"
                class="image-item"
                :style="{ animationDelay: `${idx * 0.1}s` }"
              >
                <el-image :src="img.url" fit="cover" :preview-src-list="result.images.map(i => i.url)" />
                <div class="image-tag">{{ img.source === 'product' ? '产品图' : '环境图' }}</div>
              </div>
            </div>
            <div class="image-actions">
              <el-button @click="regenerateImages">
                <RefreshRight class="mr-1" /> 换一批
              </el-button>
            </div>
          </div>

          <!-- 文案区 -->
          <div class="content-wall glass-card">
            <div class="content-header">
              <span class="content-type-badge">{{ formData.type === 'review' ? '评价' : '笔记' }}</span>
              <el-button text @click="editContent = true" v-if="!editContent">
                <Edit class="mr-1" /> 编辑
              </el-button>
            </div>

            <div v-if="!editContent" class="content-text" @click="editContent = true">
              <p v-for="(line, idx) in result.text.split('\n')" :key="idx">{{ line }}</p>
            </div>

            <el-input
              v-else
              v-model="result.text"
              type="textarea"
              :rows="6"
              @blur="editContent = false"
              class="content-editor"
            />

            <div class="content-actions">
              <el-button @click="copyContent">
                <CopyDocument class="mr-1" /> 复制文案
              </el-button>
              <el-button type="primary" @click="handleJump">
                <Position class="mr-1" /> 一键跳转发布
              </el-button>
            </div>
          </div>

          <!-- 再次生成 -->
          <div class="regenerate-section">
            <el-button @click="handleRegenerate" :loading="generating">
              <RefreshRight class="mr-1" /> 重新生成
            </el-button>
            <span class="regenerate-hint">生成满意的内容后可点击跳转发布</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 跳转确认弹窗 -->
    <el-dialog v-model="showJumpDialog" title="确认跳转" width="500px" class="jump-dialog">
      <div class="jump-content">
        <p class="jump-text">即将跳转至以下平台发布内容：</p>
        <div class="jump-platforms">
          <div
            v-for="platform in formData.jumpTargets"
            :key="platform"
            class="platform-item"
          >
            <span class="platform-icon">{{ getPlatformIcon(platform) }}</span>
            <span class="platform-name">{{ getPlatformName(platform) }}</span>
          </div>
        </div>
        <div class="jump-tips">
          <p>📋 已自动复制文案到剪贴板</p>
          <p>📸 图片已准备就绪，请选择上传</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showJumpDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmJump">确认跳转</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { generator, merchant } from '@/api'
import { ElMessage } from 'element-plus'
import { RefreshRight, CopyDocument, Position, Edit } from '@element-plus/icons-vue'

const props = defineProps({
  merchantId: String,
  merchantConfig: Object
})

const generating = ref(false)
const result = ref(null)
const editContent = ref(false)
const showJumpDialog = ref(false)
const estimatedTime = ref(3)

const contentTypes = [
  { value: 'review', label: '评价', icon: '⭐' },
  { value: 'note', label: '笔记', icon: '📝' }
]

const formData = reactive({
  type: 'review',
  topics: '',
  jumpTargets: ['dianping'],
  imageCount: 6
})

const canGenerate = computed(() => {
  return !generating.value && props.merchantId
})

const handleGenerate = async () => {
  if (!props.merchantConfig) {
    ElMessage.warning('请先保存商家配置')
    return
  }

  generating.value = true
  result.value = null

  try {
    const res = await generator.content({
      merchant_id: props.merchantId,
      type: formData.type,
      options: {
        preset_requirements: props.merchantConfig?.incentive || '',
        topics: formData.topics.split(',').filter(t => t.trim()),
        jump_targets: formData.jumpTargets,
        image_count: formData.imageCount
      }
    })

    result.value = {
      text: res.content.text,
      images: res.content.images,
      trace_id: res.trace_id
    }

    ElMessage.success('生成成功！')
  } catch (error) {
    console.error(error)
    if (error.code === 4003) {
      ElMessage.error('内容包含敏感词，正在重新生成...')
      // 可以添加自动重试逻辑
    } else if (error.code === 4001) {
      ElMessage.error('商家额度不足')
    }
  } finally {
    generating.value = false
  }
}

const regenerateImages = async () => {
  // 重新匹配图片
  ElMessage.info('正在重新匹配图片...')
}

const handleRegenerate = async () => {
  await handleGenerate()
}

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(result.value.text)
    ElMessage.success('文案已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动选择复制')
  }
}

const handleJump = () => {
  showJumpDialog.value = true
}

const confirmJump = async () => {
  // 复制文案
  await copyContent()

  // 获取跳转链接
  const target = formData.jumpTargets[0]
  const links = props.merchantConfig?.jumpLinks || {}

  // 唤起App或显示下载提示
  let scheme = ''
  if (target === 'dianping') {
    scheme = `dianping://shopinfo?id=${props.merchantConfig?.dianpingId || ''}`
  } else if (target === 'xhs') {
    scheme = `xhsdiscover://search/result?keyword=${props.merchantConfig?.name}`
  } else if (target === 'meituan') {
    scheme = `meituan://www.meituan.com/search?keyword=${props.merchantConfig?.name}`
  }

  // 尝试唤起
  window.location.href = scheme

  // 2秒后兜底
  setTimeout(() => {
    ElMessage.info('正在为您打开外部App...')
  }, 500)

  showJumpDialog.value = false
}

const resetConfig = () => {
  formData.type = 'review'
  formData.topics = ''
  formData.jumpTargets = ['dianping']
  formData.imageCount = 6
}

const getPlatformIcon = (platform) => {
  const icons = { dianping: '📍', xhs: '📕', meituan: '🍔' }
  return icons[platform] || '📱'
}

const getPlatformName = (platform) => {
  const names = { dianping: '大众点评', xhs: '小红书', meituan: '美团' }
  return names[platform] || platform
}
</script>

<style scoped>
.ai-generator {
  padding: 0;
}

/* 头部 */
.generator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left .title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* 玻璃卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
}

/* 主内容区 */
.generator-content {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
}

/* 配置面板 */
.config-panel {
  padding: 28px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.config-section {
  margin-bottom: 28px;
}

.config-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

/* 类型选择器 */
.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.type-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.type-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.type-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* 平台选择 */
.platform-selector {
  padding: 12px;
  background: #f9fafb;
  border-radius: 12px;
}

/* 图片数量 */
.image-count {
  display: flex;
  align-items: center;
  gap: 16px;
}

.image-count .el-slider {
  flex: 1;
}

.count-value {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  min-width: 50px;
}

/* 操作按钮 */
.config-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.config-actions .el-button {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
}

.config-actions .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

/* 预览面板 */
.preview-panel {
  min-height: 500px;
}

/* 空状态 */
.preview-empty {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.empty-illustration {
  width: 160px;
  height: 160px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

.empty-svg {
  width: 100%;
  height: 100%;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.preview-empty h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.preview-empty p {
  font-size: 14px;
  color: #9ca3af;
}

/* 加载状态 */
.preview-loading {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-animation {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
}

.loading-orb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  animation: pulse 1.4s ease-in-out infinite;
}

.loading-orb.delay-1 { animation-delay: 0.2s; }
.loading-orb.delay-2 { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}

.loading-text {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.typing::after {
  content: '';
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.dots span {
  animation: dotFade 1.4s infinite;
  opacity: 0;
}

.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotFade {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.loading-hint {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 12px;
}

/* 图片墙 */
.image-wall {
  padding: 24px;
  margin-bottom: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
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

.image-item :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.image-tag {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.image-actions {
  display: flex;
  justify-content: center;
}

/* 内容墙 */
.content-wall {
  padding: 24px;
  margin-bottom: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.content-type-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.content-text {
  font-size: 15px;
  line-height: 1.8;
  color: #374151;
  cursor: pointer;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  transition: background 0.2s;
}

.content-text:hover {
  background: #f3f4f6;
}

.content-text p {
  margin-bottom: 12px;
}

.content-text p:last-child {
  margin-bottom: 0;
}

.content-editor :deep(.el-textarea__inner) {
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  line-height: 1.8;
}

.content-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

/* 重新生成 */
.regenerate-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.regenerate-hint {
  font-size: 13px;
  color: #9ca3af;
}

/* 跳转弹窗 */
.jump-content {
  padding: 8px 0;
}

.jump-text {
  font-size: 15px;
  color: #374151;
  margin-bottom: 20px;
}

.jump-platforms {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.platform-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.platform-icon {
  font-size: 24px;
}

.platform-name {
  font-weight: 600;
  color: #374151;
}

.jump-tips {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 12px;
  padding: 16px;
}

.jump-tips p {
  font-size: 14px;
  color: #667eea;
  margin-bottom: 8px;
}

.jump-tips p:last-child {
  margin-bottom: 0;
}

/* 响应式 */
@media (max-width: 1024px) {
  .generator-content {
    grid-template-columns: 1fr;
  }

  .config-panel {
    position: static;
  }

  .image-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>