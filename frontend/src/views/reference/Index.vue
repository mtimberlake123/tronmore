<template>
  <div class="reference-page">
    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="参考笔记库" name="notes">
        <div class="toolbar">
          <el-button type="primary" @click="showNoteDialog = true" class="btn-primary">
            <span class="material-symbols-outlined text-base">add</span>
            新增笔记
          </el-button>
        </div>

        <div class="card-grid">
          <div v-for="note in notes" :key="note.id" class="glass-card card-item">
            <p class="card-content">{{ note.content }}</p>
            <div class="card-footer">
              <el-tag size="small" class="tag-dark">{{ formatStyle(note.style) }}</el-tag>
              <span class="card-source">{{ note.source || '未填写来源' }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="参考评价库" name="reviews">
        <div class="toolbar">
          <el-button type="primary" @click="showReviewDialog = true" class="btn-primary">
            <span class="material-symbols-outlined text-base">add</span>
            新增评价
          </el-button>
        </div>

        <div class="card-grid">
          <div v-for="review in reviews" :key="review.id" class="glass-card card-item">
            <p class="card-content">{{ review.content }}</p>
            <div class="card-footer">
              <el-tag size="small" class="tag-dark">{{ formatStyle(review.style) }}</el-tag>
              <span class="card-source">{{ review.source || '未填写来源' }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showNoteDialog" title="新增参考笔记" width="560px" class="dialog-dark">
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
        <el-button type="primary" @click="addNote" class="btn-primary">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showReviewDialog" title="新增参考评价" width="560px" class="dialog-dark">
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
        <el-button type="primary" @click="addReview" class="btn-primary">保存</el-button>
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

const styleLabelMap = {
  professional: '专业型',
  friendly: '亲和型',
  promotional: '促销型'
}

const formatStyle = (value) => styleLabelMap[value] || value || '默认'

const fetchNotes = async () => {
  try {
    const res = await reference.notes.list()
    notes.value = res.list || []
  } catch (error) {
    console.error(error)
  }
}

const fetchReviews = async () => {
  try {
    const res = await reference.reviews.list()
    reviews.value = res.list || []
  } catch (error) {
    console.error(error)
  }
}

const addNote = async () => {
  try {
    await reference.notes.create(noteForm.value)
    ElMessage.success('笔记已保存')
    showNoteDialog.value = false
    fetchNotes()
  } catch (error) {
    console.error(error)
  }
}

const addReview = async () => {
  try {
    await reference.reviews.create(reviewForm.value)
    ElMessage.success('评价已保存')
    showReviewDialog.value = false
    fetchReviews()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchNotes()
  fetchReviews()
})
</script>

<style scoped>
.reference-page {
  display: grid;
  gap: 16px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 18px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.card-item {
  padding: 20px;
}

.card-content {
  margin: 0 0 18px;
  color: var(--text);
  line-height: 1.8;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-source {
  color: var(--text-3);
  font-size: 12px;
}
</style>
