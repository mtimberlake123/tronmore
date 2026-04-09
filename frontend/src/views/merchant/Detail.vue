<template>
  <div class="max-w-7xl mx-auto">
    <!-- 返回 -->
    <el-button text @click="router.push('/merchants')" class="mb-6 text-on-surface-variant hover:text-white transition-colors">
      <ArrowLeft class="w-4 h-4 mr-2" /> 返回商家列表
    </el-button>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <!-- 商家信息 -->
      <el-tab-pane label="商家信息" name="config">
        <div class="glass-card p-8 rounded-2xl">
          <el-form :model="merchantForm" label-width="120px" class="form-dark">
            <el-form-item label="Logo">
              <ImageUploader v-model="merchantForm.logo" />
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
        </div>
      </el-tab-pane>

      <!-- 图库管理 -->
      <el-tab-pane label="图库管理" name="warehouse">
        <div class="glass-card p-8 rounded-2xl">
          <div class="flex justify-end mb-4">
            <el-button size="small" @click="showSettings = true">设置</el-button>
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
        </div>
      </el-tab-pane>

      <!-- 数据看板 -->
      <el-tab-pane label="数据看板" name="dashboard">
        <div class="grid grid-cols-4 gap-6 mb-6">
          <div class="glass-card p-6 text-center rounded-2xl">
            <div class="headline-2 text-primary mb-2">{{ dashboardData.generation_count }}</div>
            <div class="text-sm text-on-surface-variant">生成数</div>
          </div>
          <div class="glass-card p-6 text-center rounded-2xl">
            <div class="headline-2 text-[#52c41a] mb-2">{{ dashboardData.daily_active }}</div>
            <div class="text-sm text-on-surface-variant">日活数</div>
          </div>
          <div class="glass-card p-6 text-center rounded-2xl">
            <div class="headline-2 text-[#1890ff] mb-2">{{ dashboardData.click_jump_count }}</div>
            <div class="text-sm text-on-surface-variant">跳转数</div>
          </div>
          <div class="glass-card p-6 text-center rounded-2xl">
            <div class="headline-2 text-[#722ed1] mb-2">{{ dashboardData.conversion_rate }}%</div>
            <div class="text-sm text-on-surface-variant">转化率</div>
          </div>
        </div>
        <div class="glass-card p-8 rounded-2xl">
          <h3 class="font-headline font-bold text-lg text-white mb-6">趋势图</h3>
          <div class="h-64 flex items-end gap-2">
            <div v-for="(item, i) in dashboardData.daily_trend" :key="i" class="flex-1 flex flex-col items-center">
              <div class="w-full bg-primary/20 rounded-t transition-all hover:bg-primary/40" :style="{ height: `${item.generation / maxGeneration * 100}%` }"></div>
              <span class="text-xs text-on-surface-variant mt-3">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 生成记录 -->
      <el-tab-pane label="生成记录" name="records">
        <div class="glass-card rounded-2xl overflow-hidden">
          <el-table :data="generations" style="width: 100%" class="dark-table">
            <el-table-column prop="created_at" label="时间" width="180" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag class="tag-dark">{{ row.type === 'review' ? '评价' : '笔记' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="生成内容" />
            <el-table-column label="评分" width="120">
              <template #default="{ row }">
                <el-rate v-model="row.rating" disabled v-if="row.rating" class="rate-dark" />
                <span v-else class="text-on-surface-variant text-sm">未评分</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 贴纸生成 -->
      <el-tab-pane label="贴纸生成" name="sticker">
        <div class="glass-card p-8 rounded-2xl">
          <QrStickerGenerator
            :merchant-id="route.params.id"
            :merchant-name="merchantForm.name"
            :merchant-logo="merchantForm.logo"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

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
import { merchant, warehouse } from '@/api'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Upload, Delete } from '@element-plus/icons-vue'
import ImageUploader from '@/components/ImageUploader.vue'
import QrStickerGenerator from '@/components/QrStickerGenerator.vue'

const route = useRoute()
const router = useRouter()
const token = localStorage.getItem('token')

const activeTab = ref('config')
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