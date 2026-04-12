<template>
  <div class="merchant-detail">
    <!-- 返回 -->
    <el-button text @click="router.push('/merchants')" class="mb-6 text-on-surface-variant hover:text-white transition-colors">
      <ArrowLeft class="w-4 h-4 mr-2" /> 返回商家列表
    </el-button>

    <!-- 两列布局：3:1 占比 -->
    <div class="detail-grid">
      <!-- 左侧：商家信息 (280px) -->
      <div class="side-content">
        <MerchantInfo :merchant="merchantInfo" :active-module="activeModule" @module-click="handleModuleClick" />
      </div>

      <!-- 右侧：主内容区 (3/4) -->
      <div class="main-content">
        <!-- 数据看板 -->
        <DataDashboard v-if="activeModule === 'dashboard'" :stats="dashboardData" />

        <!-- 模块编辑内容区 -->
        <div v-if="activeModule && activeModule !== 'dashboard'" class="module-edit-panel glass-card p-8 rounded-2xl">
          <!-- 商家配置 -->
          <template v-if="activeModule === 'config'">
            <el-form :model="merchantForm" label-width="120px" class="form-dark">
              <el-form-item label="Logo">
                <ImageUploader v-model="merchantForm.logo" :merchant-id="route.params.id" />
              </el-form-item>
              <el-form-item label="店铺名称">
                <el-input v-model="merchantForm.name" class="input-dark" />
              </el-form-item>
              <el-form-item label="服务/套餐/产品">
                <el-input v-model="merchantForm.productsText" type="textarea" placeholder="逗号分隔" class="input-dark" />
              </el-form-item>
              <el-form-item label="特色/宣传点">
                <el-input v-model="merchantForm.featuresText" type="textarea" placeholder="逗号分隔" class="input-dark" />
              </el-form-item>
              <el-form-item label="评价生成">
                <el-switch v-model="merchantForm.enableReview" class="mr-3" />
                <span class="switch-label">{{ merchantForm.enableReview ? '已启用' : '已禁用' }}</span>
              </el-form-item>
              <el-form-item v-if="merchantForm.enableReview" label="预设要求">
                <el-input v-model="merchantForm.aiPromptExt" type="textarea" placeholder="输入预设要求" class="input-dark" />
              </el-form-item>
              <el-form-item label="笔记生成">
                <el-switch v-model="merchantForm.enableNote" class="mr-3" />
                <span class="switch-label">{{ merchantForm.enableNote ? '已启用' : '已禁用' }}</span>
              </el-form-item>
              <template v-if="merchantForm.enableNote">
                <el-form-item label="预设要求">
                  <el-input v-model="merchantForm.notePromptExt" type="textarea" placeholder="输入预设要求" class="input-dark" />
                </el-form-item>
                <el-form-item label="自定义话题">
                  <el-input v-model="merchantForm.noteTopic" type="textarea" placeholder="输入自定义话题" class="input-dark" />
                </el-form-item>
                <el-form-item label="仿写笔记">
                  <el-input v-model="merchantForm.noteCopy" type="textarea" placeholder="输入仿写笔记" class="input-dark" />
                </el-form-item>
              </template>
              <el-form-item label="商家微信">
                <ImageUploader v-model="merchantForm.wx_url" />
              </el-form-item>
              <el-form-item label="商家抖音">
                <el-input v-model="merchantForm.dy_url" placeholder="输入抖音主页URL" class="input-dark" />
              </el-form-item>
              <el-form-item label="商家地址">
                <el-input v-model="merchantForm.address" placeholder="输入商家地址" class="input-dark" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveConfig" class="btn-primary">保存配置</el-button>
              </el-form-item>
            </el-form>
          </template>

          <!-- 图库管理 -->
          <template v-if="activeModule === 'warehouse'">
            <div class="flex justify-end mb-4">
              <el-button class="btn-tertiary" @click="showSettings = true">设置</el-button>
            </div>
            <el-tabs class="warehouse-tabs">
              <el-tab-pane label="产品图">
                <div v-if="productList.length === 0" class="empty-tip">
                  暂无服务/套餐/产品
                </div>
                <div v-else class="product-gallery">
                  <div v-for="product in productList" :key="product" class="product-section">
                    <div class="product-title">{{ product }}</div>
                    <div class="product-upload-area">
                      <ImageUploader
                        :model-value="getProductImages(product)"
                        @update:model-value="setProductImages(product, $event)"
                        :multiple="true"
                        :max-count="merchantForm.productImageCount"
                      />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="门店环境">
                <div class="store-gallery">
                  <div v-for="type in storeTypes" :key="type" class="store-section">
                    <div class="store-title">{{ type }}</div>
                    <ImageUploader
                      :model-value="getStoreImages(type)"
                      @update:model-value="setStoreImages(type, $event)"
                      :multiple="true"
                      :max-count="merchantForm.productImageCount"
                    />
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="其他">
                <div class="upload-section">
                  <ImageUploader v-model="otherImages" :multiple="true" :max-count="merchantForm.productImageCount" />
                </div>
              </el-tab-pane>
              <el-tab-pane label="已使用">
                <div class="used-gallery">
                  <div v-if="usedImages.length === 0" class="empty-tip">
                    暂无已使用的图片
                  </div>
                  <div v-else class="image-grid">
                    <div v-for="(img, index) in usedImages" :key="index" class="image-item">
                      <img :src="img" alt="used" class="preview-img" />
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
            <div class="storage-info">
              <span class="text-sm text-on-surface-variant">存储：{{ storageUsed }}/200</span>
            </div>
          </template>

          <!-- 数据看板 -->
          <template v-if="activeModule === 'dashboard'">
            <div class="dashboard-fullscreen">
              <DataDashboard :stats="dashboardData" />
            </div>
          </template>

          <!-- 资料管理 -->
          <template v-if="activeModule === 'reference'">
            <el-tabs class="reference-tabs">
              <el-tab-pane label="图文笔记">
                <div class="template-section">
                  <div class="flex justify-end mb-4">
                    <el-button class="btn-tertiary" @click="showNoteTemplateDialog = true">添加笔记模板</el-button>
                  </div>
                  <div v-if="noteTemplates.length === 0" class="empty-tip">
                    暂无笔记模板
                  </div>
                  <div v-else class="template-list">
                    <div v-for="(template, index) in noteTemplates" :key="index" class="template-item">
                      <div class="template-content">{{ template.content }}</div>
                      <div class="template-actions">
                        <el-button size="small" text @click="deleteNoteTemplate(template.id)">删除</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="评价模板">
                <div class="template-section">
                  <div class="flex justify-end mb-4">
                    <el-button class="btn-tertiary" @click="showReviewTemplateDialog = true">添加评价模板</el-button>
                  </div>
                  <div v-if="reviewTemplates.length === 0" class="empty-tip">
                    暂无评价模板
                  </div>
                  <div v-else class="template-list">
                    <div v-for="(template, index) in reviewTemplates" :key="index" class="template-item">
                      <div class="template-content">{{ template.content }}</div>
                      <div class="template-actions">
                        <el-button size="small" text @click="deleteReviewTemplate(template.id)">删除</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>

            <!-- 笔记模板弹窗 -->
            <el-dialog v-model="showNoteTemplateDialog" title="添加笔记模板" width="500px" class="dialog-dark">
              <el-form :model="noteTemplateForm" label-width="80px">
                <el-form-item label="内容">
                  <el-input v-model="noteTemplateForm.content" type="textarea" :rows="4" placeholder="输入笔记模板内容" />
                </el-form-item>
              </el-form>
              <template #footer>
                <el-button @click="showNoteTemplateDialog = false">取消</el-button>
                <el-button type="primary" class="btn-primary" @click="addNoteTemplate">确定</el-button>
              </template>
            </el-dialog>

            <!-- 评价模板弹窗 -->
            <el-dialog v-model="showReviewTemplateDialog" title="添加评价模板" width="500px" class="dialog-dark">
              <el-form :model="reviewTemplateForm" label-width="80px">
                <el-form-item label="内容">
                  <el-input v-model="reviewTemplateForm.content" type="textarea" :rows="4" placeholder="输入评价模板内容" />
                </el-form-item>
              </el-form>
              <template #footer>
                <el-button @click="showReviewTemplateDialog = false">取消</el-button>
                <el-button type="primary" class="btn-primary" @click="addReviewTemplate">确定</el-button>
              </template>
            </el-dialog>
          </template>

          <!-- 贴纸生成 -->
          <template v-if="activeModule === 'generator'">
            <QrStickerGenerator
              :merchant-id="route.params.id"
              :merchant-name="merchantForm.name"
              :merchant-logo="merchantForm.logo"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- 图片数量设置 -->
    <el-dialog v-model="showSettings" title="图片数量设置" width="400px" class="dialog-dark">
      <el-form label-width="140px" class="form-dark">
        <el-form-item label="评价配图">
          <el-slider v-model="merchantForm.reviewImageCount" :min="0" :max="9" :step="1" show-stops class="w-full" />
          <span class="ml-3 text-sm text-on-surface-variant">{{ merchantForm.reviewImageCount }} 张</span>
        </el-form-item>
        <el-form-item label="笔记配图">
          <el-slider v-model="merchantForm.noteImageCount" :min="0" :max="9" :step="1" show-stops class="w-full" />
          <span class="ml-3 text-sm text-on-surface-variant">{{ merchantForm.noteImageCount }} 张</span>
        </el-form-item>
        <el-form-item label="服务/产品/套餐配图">
          <el-slider v-model="merchantForm.productImageCount" :min="0" :max="9" :step="1" show-stops class="w-full" />
          <span class="ml-3 text-sm text-on-surface-variant">{{ merchantForm.productImageCount }} 张</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { merchant, warehouse, reference } from '@/api'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Upload, Delete } from '@element-plus/icons-vue'
import ImageUploader from '@/components/ImageUploader.vue'
import QrStickerGenerator from '@/components/QrStickerGenerator.vue'
import DataDashboard from './components/DataDashboard.vue'
import MerchantInfo from './components/MerchantInfo.vue'

const route = useRoute()
const router = useRouter()
const token = localStorage.getItem('token')

const activeModule = ref('dashboard')

const merchantInfo = computed(() => ({
  name: merchantForm.name,
  logo: merchantForm.logo,
  balance: merchantForm.reviewImageCount
}))

const handleModuleClick = (key) => {
  activeModule.value = activeModule.value === key ? null : key
  if (key === 'reference') {
    fetchNoteTemplates()
    fetchReviewTemplates()
  }
}
const industries = [
  { code: 'catering', name: '餐饮' },
  { code: 'beauty', name: '美业' },
  { code: 'general', name: '通用' }
]

const merchantForm = reactive({
  name: '',
  logo: '',
  productsText: '',
  featuresText: '',
  enableReview: false,
  aiPromptExt: '',
  enableNote: false,
  notePromptExt: '',
  noteTopic: '',
  noteCopy: '',
  dy_url: '',
  wx_url: '',
  address: '',
  reviewImageCount: 9,
  noteImageCount: 9,
  productImageCount: 9
})

const productImagesMap = reactive({})
const storeImagesMap = reactive({})
const otherImages = ref([])
const usedImages = ref([])
const storageUsed = ref(0)
const generations = ref([])

const storeTypes = ['通用', '门面', '室内', '室外']

const productList = computed(() => {
  const text = merchantForm.productsText || ''
  return text.split(',').map(p => p.trim()).filter(Boolean)
})

const getProductImages = (product) => {
  return productImagesMap[product] || []
}

const setProductImages = (product, images) => {
  productImagesMap[product] = images
}

const getStoreImages = (type) => {
  return storeImagesMap[type] || []
}

const setStoreImages = (type, images) => {
  storeImagesMap[type] = images
}

const dashboardData = reactive({
  generation_count: 0,
  daily_active: 0,
  click_jump_count: 0,
  conversion_rate: 0,
  daily_trend: []
})
const showSettings = ref(false)
const noteTemplates = ref([])
const reviewTemplates = ref([])
const showNoteTemplateDialog = ref(false)
const showReviewTemplateDialog = ref(false)
const noteTemplateForm = reactive({ content: '' })
const reviewTemplateForm = reactive({ content: '' })

const maxGeneration = computed(() => {
  return Math.max(...dashboardData.daily_trend.map(t => t.generation), 1)
})

const fetchDetail = async () => {
  try {
    const res = await merchant.detail(route.params.id)
    Object.assign(merchantForm, {
      name: res.name || '',
      logo: res.logo || '',
      productsText: Array.isArray(res.products) ? res.products.join(',') : '',
      featuresText: Array.isArray(res.features) ? res.features.join(',') : '',
      aiPromptExt: res.ai_prompt_ext || '',
      notePromptExt: res.note_prompt_ext || '',
      noteTopic: res.note_topic || '',
      noteCopy: res.note_copy || '',
      dy_url: res.dy_url || '',
      wx_url: res.wx_url || '',
      address: res.address || '',
      reviewImageCount: res.review_image_count ?? 9,
      noteImageCount: res.note_image_count ?? 9,
      productImageCount: res.product_image_count ?? 9
    })
  } catch (e) {
    console.error(e)
  }
}

const fetchImages = async () => {
  try {
    const res = await warehouse.images(route.params.id, { tab: 'product' })
    const images = res.list || []
    // 按产品分组
    const grouped = {}
    images.forEach(img => {
      const tag = img.product_tag || '其他'
      if (!grouped[tag]) grouped[tag] = []
      grouped[tag].push(img.url)
    })
    // 更新 productImagesMap
    Object.keys(grouped).forEach(tag => {
      productImagesMap[tag] = grouped[tag]
    })
  } catch (e) {
    console.error(e)
  }
  try {
    const check = await warehouse.storageCheck(route.params.id)
    storageUsed.value = check.used
  } catch (e) {}
}

const fetchDashboard = async () => {
  try {
    const res = await merchant.dashboard(route.params.id)
    Object.assign(dashboardData, res)
  } catch (e) {
    console.error(e)
  }
}

const fetchNoteTemplates = async () => {
  try {
    const res = await reference.notes.list({ merchant_id: route.params.id })
    noteTemplates.value = res.list || []
  } catch (e) {
    console.error(e)
  }
}

const addNoteTemplate = async () => {
  try {
    await reference.notes.create({
      merchant_id: route.params.id,
      content: noteTemplateForm.content
    })
    noteTemplateForm.content = ''
    showNoteTemplateDialog.value = false
    fetchNoteTemplates()
    ElMessage.success('添加成功')
  } catch (e) {
    console.error(e)
    ElMessage.error('添加失败')
  }
}

const deleteNoteTemplate = async (id) => {
  try {
    await reference.notes.delete(id)
    fetchNoteTemplates()
    ElMessage.success('删除成功')
  } catch (e) {
    console.error(e)
    ElMessage.error('删除失败')
  }
}

const fetchReviewTemplates = async () => {
  try {
    const res = await reference.reviews.list({ merchant_id: route.params.id })
    reviewTemplates.value = res.list || []
  } catch (e) {
    console.error(e)
  }
}

const addReviewTemplate = async () => {
  try {
    await reference.reviews.create({
      merchant_id: route.params.id,
      content: reviewTemplateForm.content
    })
    reviewTemplateForm.content = ''
    showReviewTemplateDialog.value = false
    fetchReviewTemplates()
    ElMessage.success('添加成功')
  } catch (e) {
    console.error(e)
    ElMessage.error('添加失败')
  }
}

const deleteReviewTemplate = async (id) => {
  try {
    await reference.reviews.delete(id)
    fetchReviewTemplates()
    ElMessage.success('删除成功')
  } catch (e) {
    console.error(e)
    ElMessage.error('删除失败')
  }
}

const fetchGenerations = async () => {
  try {
    const res = await merchant.generations(route.params.id)
    generations.value = res.list || []
    // 从生成记录中提取已使用的图片
    const usedSet = new Set()
    generations.value.forEach(gen => {
      if (gen.images && Array.isArray(gen.images)) {
        gen.images.forEach(img => usedSet.add(img))
      }
    })
    usedImages.value = Array.from(usedSet)
  } catch (e) {
    console.error(e)
  }
}

const saveConfig = async () => {
  try {
    const data = {
      name: merchantForm.name,
      logo: merchantForm.logo,
      products: (merchantForm.productsText || '').split(',').filter(Boolean),
      features: (merchantForm.featuresText || '').split(',').filter(Boolean),
      ai_prompt_ext: merchantForm.aiPromptExt,
      note_prompt_ext: merchantForm.notePromptExt,
      note_topic: merchantForm.noteTopic,
      note_copy: merchantForm.noteCopy,
      dy_url: merchantForm.dy_url,
      wx_url: merchantForm.wx_url,
      address: merchantForm.address,
      review_image_count: merchantForm.reviewImageCount,
      note_image_count: merchantForm.noteImageCount,
      product_image_count: merchantForm.productImageCount
    }
    await merchant.update(route.params.id, data)
    ElMessage.success('保存成功')
  } catch (e) {
    console.error(e)
    ElMessage.error('保存失败')
  }
}

const saveSettings = async () => {
  try {
    const data = {
      name: merchantForm.name,
      logo: merchantForm.logo,
      products: (merchantForm.productsText || '').split(',').filter(Boolean),
      features: (merchantForm.featuresText || '').split(',').filter(Boolean),
      ai_prompt_ext: merchantForm.aiPromptExt,
      note_prompt_ext: merchantForm.notePromptExt,
      note_topic: merchantForm.noteTopic,
      note_copy: merchantForm.noteCopy,
      dy_url: merchantForm.dy_url,
      wx_url: merchantForm.wx_url,
      address: merchantForm.address,
      review_image_count: merchantForm.reviewImageCount,
      note_image_count: merchantForm.noteImageCount,
      product_image_count: merchantForm.productImageCount
    }
    await merchant.update(route.params.id, data)
    showSettings.value = false
    ElMessage.success('设置已保存')
  } catch (e) {
    console.error(e)
    ElMessage.error('保存失败')
  }
}

onMounted(() => {
  fetchDetail()
  fetchImages()
  fetchDashboard()
  fetchGenerations()
})
</script>

<style scoped>
.merchant-detail {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  align-items: start;
}

.main-content {
  min-width: 0;
}

.side-content {
  position: sticky;
  top: 20px;
}

.module-edit-panel {
  animation: slideIn 0.25s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.warehouse-tabs {
  position: relative;
}

.reference-tabs {
  margin-bottom: 16px;
}

.template-section {
  padding: 16px 0;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.template-content {
  flex: 1;
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.6;
  white-space: pre-wrap;
}

.template-actions {
  flex-shrink: 0;
}

.group-title :deep(.el-form-item__label) {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  padding-bottom: 0;
}

.switch-label {
  font-size: 12px;
  color: #919191;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #919191;
}

.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-section {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.product-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.product-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.storage-info {
  margin-top: 24px;
  text-align: right;
}

.upload-section {
  padding: 16px 0;
}

.store-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.store-section {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.store-title {
  font-size: 13px;
  font-weight: 500;
  color: #919191;
  margin-bottom: 8px;
}

.used-gallery {
  padding: 16px 0;
}

.used-gallery .image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.used-gallery .image-item {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.used-gallery .preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>