<template>
  <div>
    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="自由制作" name="cards">
        <div class="grid grid-cols-4 gap-6">
          <div
            v-for="tpl in cardTemplates"
            :key="tpl.id"
            class="glass-card p-5 cursor-pointer rounded-2xl text-center group"
            @click="useTemplate(tpl)"
          >
            <div class="aspect-square rounded-xl mb-4 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all">
              <span class="material-symbols-outlined text-5xl text-on-surface-variant">image</span>
            </div>
            <h3 class="font-headline font-semibold text-white">{{ tpl.name }}</h3>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="海报制作" name="poster">
        <div class="grid grid-cols-4 gap-6">
          <div
            v-for="tpl in posterTemplates"
            :key="tpl.id"
            class="glass-card p-5 cursor-pointer rounded-2xl text-center group"
          >
            <div class="aspect-[4/3] rounded-xl mb-4 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all">
              <span class="material-symbols-outlined text-5xl text-on-surface-variant">movie</span>
            </div>
            <h3 class="font-headline font-semibold text-white">{{ tpl.name }}</h3>
            <p class="text-xs text-on-surface-variant mt-1">{{ tpl.category }}</p>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的草稿" name="drafts">
        <div class="grid grid-cols-4 gap-6">
          <div
            v-for="draft in drafts"
            :key="draft.id"
            class="glass-card p-5 cursor-pointer rounded-2xl relative group"
          >
            <div class="aspect-square rounded-xl mb-4 flex items-center justify-center bg-white/5">
              <span class="material-symbols-outlined text-5xl text-on-surface-variant">draft</span>
            </div>
            <p class="text-xs text-on-surface-variant">{{ draft.updated_at }}</p>
            <div class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <el-button size="small" @click.stop="editDraft(draft)" class="btn-secondary !py-1 !px-3 !text-[10px]">编辑</el-button>
              <el-button size="small" type="danger" @click.stop="deleteDraft(draft.id)" class="!bg-error/80 !border-error !py-1 !px-3 !text-[10px]">删除</el-button>
            </div>
          </div>
          <div v-if="drafts.length === 0" class="col-span-full">
            <div class="glass-card p-12 rounded-2xl text-center">
              <span class="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">draft</span>
              <p class="text-on-surface-variant">暂无草稿</p>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Picture, Document } from '@element-plus/icons-vue'

const activeTab = ref('cards')

const cardTemplates = ref([
  { id: 1, name: '节日促销' },
  { id: 2, name: '新品上市' },
  { id: 3, name: '店铺活动' },
  { id: 4, name: '空白画布' }
])

const posterTemplates = ref([
  { id: 1, name: '朋友圈海报', category: '社交媒体' },
  { id: 2, name: '小红书封面', category: '社交媒体' },
  { id: 3, name: '微博配图', category: '社交媒体' }
])

const drafts = ref([])

const useTemplate = (tpl) => {
  console.log('使用模板:', tpl)
}

const editDraft = (draft) => {
  console.log('编辑草稿:', draft)
}

const deleteDraft = async (id) => {
  console.log('删除草稿:', id)
}

onMounted(() => {
  // TODO: 获取草稿列表
})
</script>