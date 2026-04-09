<template>
  <div class="max-w-7xl mx-auto">
    <!-- 返回 -->
    <el-button text @click="router.push('/merchants')" class="mb-6 text-on-surface-variant hover:text-white transition-colors">
      <ArrowLeft class="w-4 h-4 mr-2" /> 返回商家列表
    </el-button>

    <div class="glass-card p-8 rounded-2xl">
      <h2 class="text-xl font-bold text-white mb-6">创建商家</h2>
      <el-form :model="merchantForm" label-width="120px" class="form-dark">
        <el-form-item label="Logo">
          <ImageUploader v-model="merchantForm.logo" />
        </el-form-item>
        <el-form-item label="行业类别">
          <el-select v-model="merchantForm.category" placeholder="请选择行业类别" class="input-dark">
            <el-option v-for="ind in industries" :key="ind.code" :label="ind.name" :value="ind.code" />
          </el-select>
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
          <el-button type="primary" @click="handleCreate" class="btn-primary">创建商家</el-button>
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

const handleCreate = async () => {
  if (!merchantForm.name) {
    ElMessage.error('请输入店铺名称')
    return
  }
  if (!merchantForm.category) {
    ElMessage.error('请选择行业类别')
    return
  }
  try {
    const data = {
      category: merchantForm.category,
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
      address: merchantForm.address
    }
    const res = await merchant.create(data)
    ElMessage.success('创建成功')
    router.push(`/merchants/${res.data.id}`)
  } catch (e) {
    console.error(e)
    ElMessage.error('创建失败')
  }
}
</script>

<style scoped>
.switch-label {
  font-size: 12px;
  color: #919191;
}
</style>
