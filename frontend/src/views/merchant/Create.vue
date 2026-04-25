<template>
  <div class="merchant-create-page">
    <el-button text @click="router.push('/merchants')" class="back-button">
      <ArrowLeft class="icon-16" />
      返回商家列表
    </el-button>

    <div class="glass-card create-panel">
      <div class="panel-header">
        <h2>创建商家</h2>
        <p>完善基础资料后，会自动进入该商家的详情配置页。</p>
      </div>

      <el-form :model="merchantForm" label-width="128px" class="form-dark">
        <el-form-item label="商家 Logo">
          <ImageUploader v-model="merchantForm.logo" />
        </el-form-item>

        <el-form-item label="行业类别" required>
          <el-select v-model="merchantForm.category" placeholder="请选择行业类别" class="input-dark">
            <el-option v-for="ind in industries" :key="ind.code" :label="ind.name" :value="ind.code" />
          </el-select>
        </el-form-item>

        <el-form-item label="店铺名称" required>
          <el-input v-model="merchantForm.name" class="input-dark" placeholder="请输入店铺名称" />
        </el-form-item>

        <el-form-item label="服务/套餐/产品">
          <el-input v-model="merchantForm.productsText" type="textarea" placeholder="多个内容请用逗号分隔" class="input-dark" />
        </el-form-item>

        <el-form-item label="特色/宣传点">
          <el-input v-model="merchantForm.featuresText" type="textarea" placeholder="多个内容请用逗号分隔" class="input-dark" />
        </el-form-item>

        <el-form-item label="评价生成">
          <el-switch v-model="merchantForm.enableReview" class="mr-3" />
          <span class="switch-label">{{ merchantForm.enableReview ? '已启用' : '已禁用' }}</span>
        </el-form-item>

        <el-form-item v-if="merchantForm.enableReview" label="预设要求">
          <el-input v-model="merchantForm.aiPromptExt" type="textarea" placeholder="请输入评价生成的预设要求" class="input-dark" />
        </el-form-item>

        <el-form-item label="笔记生成">
          <el-switch v-model="merchantForm.enableNote" class="mr-3" />
          <span class="switch-label">{{ merchantForm.enableNote ? '已启用' : '已禁用' }}</span>
        </el-form-item>

        <template v-if="merchantForm.enableNote">
          <el-form-item label="预设要求">
            <el-input v-model="merchantForm.notePromptExt" type="textarea" placeholder="请输入笔记生成的预设要求" class="input-dark" />
          </el-form-item>
          <el-form-item label="自定义话题">
            <el-input v-model="merchantForm.noteTopic" type="textarea" placeholder="请输入自定义话题" class="input-dark" />
          </el-form-item>
          <el-form-item label="仿写笔记">
            <el-input v-model="merchantForm.noteCopy" type="textarea" placeholder="请输入仿写笔记" class="input-dark" />
          </el-form-item>
        </template>

        <el-form-item label="商家微信">
          <ImageUploader v-model="merchantForm.wx_url" />
        </el-form-item>

        <el-form-item label="商家抖音">
          <el-input v-model="merchantForm.dy_url" placeholder="请输入抖音主页地址" class="input-dark" />
        </el-form-item>

        <el-form-item label="商家地址">
          <el-input v-model="merchantForm.address" placeholder="请输入商家地址" class="input-dark" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleCreate" class="btn-primary">
            创建商家
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { merchant } from '@/api'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import ImageUploader from '@/components/ImageUploader.vue'

const router = useRouter()
const submitting = ref(false)

const industries = [
  { code: 'catering', name: '餐饮' },
  { code: 'beauty', name: '美业' },
  { code: 'general', name: '通用' }
]

const merchantForm = reactive({
  name: '',
  logo: '',
  category: '',
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
  address: ''
})

const toList = (value) => {
  return (value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

const handleCreate = async () => {
  if (submitting.value) return

  if (!merchantForm.name.trim()) {
    ElMessage.error('请输入店铺名称')
    return
  }

  if (!merchantForm.category) {
    ElMessage.error('请选择行业类别')
    return
  }

  submitting.value = true

  try {
    const data = {
      category: merchantForm.category,
      name: merchantForm.name.trim(),
      logo: merchantForm.logo,
      products: toList(merchantForm.productsText),
      features: toList(merchantForm.featuresText),
      ai_prompt_ext: merchantForm.aiPromptExt,
      note_prompt_ext: merchantForm.notePromptExt,
      note_topic: merchantForm.noteTopic,
      note_copy: merchantForm.noteCopy,
      dy_url: merchantForm.dy_url,
      wx_url: merchantForm.wx_url,
      address: merchantForm.address
    }

    const res = await merchant.create(data)
    const merchantId = res?.id || res?.data?.id

    if (!merchantId) {
      throw new Error('创建成功但未返回商家ID')
    }

    ElMessage.success('创建成功')
    await router.push(`/merchants/${merchantId}`)
  } catch (error) {
    console.error(error)
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.merchant-create-page {
  max-width: 1180px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 18px;
  color: var(--text-2);
}

.icon-16 {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.create-panel {
  padding: 28px;
}

.panel-header {
  margin-bottom: 24px;
}

.panel-header h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--text);
}

.panel-header p {
  margin: 8px 0 0;
  color: var(--text-3);
  font-size: 14px;
}

.switch-label {
  font-size: 12px;
  color: var(--text-3);
}
</style>
