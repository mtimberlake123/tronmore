<template>
  <div>
    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="参考笔记库" name="notes">
        <div class="mb-6 flex justify-between items-center">
          <el-button type="primary" @click="showNoteDialog = true" class="btn-primary">
            <span class="material-symbols-outlined text-base mr-2">add</span> 添加笔记
          </el-button>
        </div>
        <div class="grid grid-cols-3 gap-6">
          <div v-for="note in notes" :key="note.id" class="glass-card p-6 rounded-2xl">
            <p class="text-on-surface mb-4 line-clamp-3 text-sm leading-relaxed">{{ note.content }}</p>
            <div class="flex justify-between items-center text-sm">
              <el-tag size="small" class="tag-dark">{{ note.style }}</el-tag>
              <span class="text-on-surface-variant text-xs">{{ note.source }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="参考评价库" name="reviews">
        <div class="mb-6 flex justify-between items-center">
          <el-button type="primary" @click="showReviewDialog = true" class="btn-primary">
            <span class="material-symbols-outlined text-base mr-2">add</span> 添加评价
          </el-button>
        </div>
        <div class="grid grid-cols-3 gap-6">
          <div v-for="review in reviews" :key="review.id" class="glass-card p-6 rounded-2xl">
            <p class="text-on-surface mb-4 text-sm leading-relaxed">{{ review.content }}</p>
            <div class="flex justify-between items-center text-sm">
              <el-tag size="small" class="tag-dark">{{ review.style }}</el-tag>
              <span class="text-on-surface-variant text-xs">{{ review.source }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加笔记弹窗 -->
    <el-dialog v-model="showNoteDialog" title="添加参考笔记" width="560px" class="dialog-dark">
      <el-form :model="noteForm" label-width="80px" class="form-dark">
        <el-form-item label="内容">
          <el-input v-model="noteForm.content" type="textarea" rows="4" class="input-dark" />
        </el-form-item>
        <el-form-item label="风格">
          <el-select v-model="noteForm.style" class="w-full">
            <el-option label="专业型" value="professional" />
            <el-option label="亲和型" value="friendly" />
            <el-option label="促销型" value="promotional" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="noteForm.source" class="input-dark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNoteDialog = false" class="btn-secondary">取消</el-button>
        <el-button type="primary" @click="addNote" class="btn-primary">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加评价弹窗 -->
    <el-dialog v-model="showReviewDialog" title="添加参考评价" width="560px" class="dialog-dark">
      <el-form :model="reviewForm" label-width="80px" class="form-dark">
        <el-form-item label="内容">
          <el-input v-model="reviewForm.content" type="textarea" rows="4" class="input-dark" />
        </el-form-item>
        <el-form-item label="风格">
          <el-select v-model="reviewForm.style" class="w-full">
            <el-option label="专业型" value="professional" />
            <el-option label="亲和型" value="friendly" />
            <el-option label="促销型" value="promotional" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="reviewForm.source" class="input-dark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReviewDialog = false" class="btn-secondary">取消</el-button>
        <el-button type="primary" @click="addReview" class="btn-primary">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reference } from '@/api'
import { ElMessage } from 'element-plus'

const activeTab = ref('notes')
const notes = ref([])
const reviews = ref([])
const showNoteDialog = ref(false)
const showReviewDialog = ref(false)

const noteForm = ref({
  content: '',
  style: 'professional',
  source: ''
})

const reviewForm = ref({
  content: '',
  style: 'professional',
  source: ''
})

const fetchNotes = async () => {
  try {
    const res = await reference.notes.list()
    notes.value = res.list || []
  } catch (e) {
    console.error(e)
  }
}

const fetchReviews = async () => {
  try {
    const res = await reference.reviews.list()
    reviews.value = res.list || []
  } catch (e) {
    console.error(e)
  }
}

const addNote = async () => {
  try {
    await reference.notes.create(noteForm.value)
    ElMessage.success('添加成功')
    showNoteDialog.value = false
    fetchNotes()
  } catch (e) {
    console.error(e)
  }
}

const addReview = async () => {
  try {
    await reference.reviews.create(reviewForm.value)
    ElMessage.success('添加成功')
    showReviewDialog.value = false
    fetchReviews()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchNotes()
  fetchReviews()
})
</script>