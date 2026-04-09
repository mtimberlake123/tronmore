<template>
  <div class="image-uploader">
    <!-- 单个图片模式 -->
    <div v-if="!multiple" class="single-mode">
      <el-upload
        class="single-upload"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleSingleChange"
        :accept="accept"
        :disabled="disabled"
      >
        <div v-if="modelValue" class="image-preview">
          <img :src="modelValue" alt="preview" class="preview-img" />
          <div class="mask-layer" @click.stop>
            <el-button circle size="small" @click.stop="removeImage" class="delete-btn">-</el-button>
          </div>
        </div>
        <div v-else class="upload-placeholder">
          <span class="plus-icon">+</span>
        </div>
      </el-upload>
    </div>

    <!-- 多个图片模式 -->
    <div v-else class="multiple-mode">
      <div class="image-grid">
        <div v-for="(url, index) in imageList" :key="index" class="image-item">
          <img :src="url" alt="preview" class="preview-img" />
          <div class="mask-layer" @click.stop>
            <el-button circle size="small" @click.stop="removeImageByIndex(index)" class="delete-btn">-</el-button>
          </div>
        </div>
        <el-upload
          v-if="maxCount === 0 || imageList.length < maxCount"
          class="add-btn"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleMultipleChange"
          :accept="accept"
          :disabled="disabled"
        >
          <div class="upload-placeholder">
            <span class="plus-icon">+</span>
          </div>
        </el-upload>
      </div>
      <div v-if="maxCount" class="count-hint">{{ imageList.length }} / {{ maxCount }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  maxCount: {
    type: Number,
    default: 0
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const imageList = ref([])

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (props.multiple) {
    imageList.value = Array.isArray(newVal) ? [...newVal] : []
  }
}, { immediate: true })

// 单图上传
const handleSingleChange = (file) => {
  const url = URL.createObjectURL(file.raw)
  emit('update:modelValue', url)
}

// 多图上传
const handleMultipleChange = (file) => {
  const url = URL.createObjectURL(file.raw)
  imageList.value.push(url)
  emit('update:modelValue', [...imageList.value])
}

// 删除单图
const removeImage = () => {
  emit('update:modelValue', '')
}

// 删除多图中的某一张
const removeImageByIndex = (index) => {
  imageList.value.splice(index, 1)
  emit('update:modelValue', [...imageList.value])
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.single-mode .single-upload {
  width: 80px;
  height: 80px;
  cursor: pointer;
}

.image-preview,
.upload-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  transition: all 0.3s;
}

.image-preview {
  position: relative;
  border-style: solid;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mask-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .mask-layer {
  opacity: 1;
}

.delete-btn {
  background: rgba(255, 77, 79, 0.8) !important;
  border: none !important;
  color: #ffffff !important;
}

.delete-btn:hover {
  background: #ff4d4f !important;
}

.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: #919191;
}

.upload-placeholder:hover {
  border-color: #007AFF;
  color: #007AFF;
}

.plus-icon {
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
}

.multiple-mode .image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.multiple-mode .image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
}

.multiple-mode .add-btn {
  width: 80px;
  height: 80px;
  cursor: pointer;
}

.count-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #919191;
}
</style>
