<template>
  <div class="merchant-list">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <h1 class="page-title">商家中心</h1>
        <p class="page-subtitle">管理您的营销商家资产</p>
      </div>
      <div class="action-right">
        <el-select v-model="filterSort" placeholder="排序" size="large" class="sort-select">
          <el-option label="最近添加" value="created_at_desc" />
          <el-option label="日活最高" value="daily_active_desc" />
          <el-option label="剩余额度" value="balance_desc" />
        </el-select>
        <el-button type="primary" size="large" @click="goToCreate" class="add-btn">
          新增
        </el-button>
      </div>
    </div>

    <!-- 商家列表网格 -->
    <div v-if="merchantList.length > 0" class="merchant-grid">
      <div
        v-for="(item, index) in merchantList"
        :key="item.id"
        class="merchant-card"
        :style="{ animationDelay: `${index * 60}ms` }"
        @click="goToDetail(item.id)"
      >
        <!-- 状态角标 -->
        <div class="card-badges">
          <span v-if="item.status_tag === 'new'" class="badge badge-new">新商家</span>
          <span v-if="item.status_tag === 'low_balance'" class="badge badge-warning">余额不足</span>
        </div>

        <!-- 更多操作按钮 -->
        <div class="more-btn-wrapper" @click.stop>
          <button class="more-btn" @click.stop="toggleDropdown(item.id)">...</button>
          <div v-if="activeDropdown === item.id" class="dropdown-menu">
            <div class="dropdown-item" @click="handleCopy(item)">复制</div>
            <div class="dropdown-item danger" @click="handleDeleteClick(item)">删除</div>
          </div>
        </div>

        <!-- 商家Logo和名称 -->
        <div class="merchant-header">
          <el-avatar :size="48" :src="item.logo" class="merchant-logo">
            <span class="material-symbols-outlined text-2xl text-on-surface-variant">storefront</span>
          </el-avatar>
          <div class="merchant-info">
            <h3 class="merchant-name">{{ item.name }}</h3>
            <p class="merchant-expiry">剩余 {{ item.days_remaining }} 天</p>
          </div>
        </div>

        <!-- 额度进度 -->
        <div class="quota-section">
          <div class="quota-header">
            <div class="quota-left">
              <span class="quota-label">剩余额度</span>
              <span class="quota-value">{{ item.balance }} 次</span>
            </div>
            <el-button size="small" class="recharge-btn">充值</el-button>
          </div>
          <div class="quota-bar">
            <div class="quota-progress" :style="{ width: `${item.balance_percent}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">
        <span class="material-symbols-outlined text-8xl">inbox</span>
      </div>
      <h3 class="empty-title">暂无商家</h3>
      <p class="empty-desc">点击下方按钮添加您的第一个商家</p>
      <el-button type="primary" size="large" @click="goToCreate" class="add-btn">
        新增
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchList"
        class="custom-pagination"
      />
    </div>

    <!-- 删除确认弹窗 -->
    <el-dialog v-model="showDeleteDialog" title="确认删除" width="420px" class="delete-dialog">
      <div class="delete-content">
        <div class="delete-icon">
          <span class="material-symbols-outlined text-4xl">warning</span>
        </div>
        <p class="delete-text">确定要删除商家「{{ currentMerchant?.name }}」吗？</p>
        <p class="delete-hint">此操作不可恢复，删除后数据将无法找回</p>
      </div>
      <template #footer>
        <el-button @click="showDeleteDialog = false" size="large" class="cancel-btn">取消</el-button>
        <el-button type="danger" @click="handleDelete" size="large" class="delete-btn">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { merchant } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const merchantList = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const filterSort = ref('created_at_desc')

const showDeleteDialog = ref(false)
const currentMerchant = ref(null)
const activeDropdown = ref(null)

const toggleDropdown = (id) => {
  activeDropdown.value = activeDropdown.value === id ? null : id
}

const fetchList = async () => {
  loading.value = true
  try {
    const [sortField, order] = filterSort.value.split('_')
    const res = await merchant.list({
      page: page.value,
      page_size: pageSize.value,
      sort_by: sortField,
      order: order === 'desc' ? 'desc' : 'asc'
    })
    merchantList.value = res.list
    total.value = res.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleCommand = (cmd, item) => {
  currentMerchant.value = item
  if (cmd === 'delete') {
    showDeleteDialog.value = true
  } else if (cmd === 'copy') {
    handleCopy(item)
  }
}

const handleCopy = async (item) => {
  activeDropdown.value = null
  try {
    await merchant.copy(item.id)
    ElMessage.success('复制成功')
    fetchList()
  } catch (e) {
    console.error(e)
  }
}

const handleDeleteClick = (item) => {
  activeDropdown.value = null
  currentMerchant.value = item
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  try {
    await merchant.delete(currentMerchant.value.id)
    ElMessage.success('删除成功')
    showDeleteDialog.value = false
    fetchList()
  } catch (e) {
    console.error(e)
  }
}

const goToDetail = (id) => {
  router.push(`/merchants/${id}`)
}

const goToCreate = () => {
  router.push('/merchants/create')
}

onMounted(() => {
  fetchList()
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

const closeDropdown = () => {
  activeDropdown.value = null
}
</script>

<style scoped>
/* 页面布局 */
.merchant-list {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 页面标题 */
.page-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #ffffff;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.page-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #919191;
  line-height: 1.5;
}

/* 操作栏 - 单行布局 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
}

.action-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 排序选择器 */
.sort-select {
  width: 160px;
}

/* 新增按钮 */
.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #007AFF, #0055cc);
  border: none;
  border-radius: 14px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #ffffff;
  box-shadow: 0 4px 20px -4px rgba(0, 122, 255, 0.4);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px -4px rgba(0, 122, 255, 0.5);
}

/* 商家网格 - 24px 卡片间距 */
.merchant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* 商家卡片 - 玻璃态设计 */
.merchant-card {
  position: relative;
  padding: 20px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardIn 0.5s ease-out both;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.merchant-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.4);
}

/* 卡片角标 */
.card-badges {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  z-index: 1;
}

.badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.badge-new {
  background: rgba(82, 196, 26, 0.15);
  border: 1px solid rgba(82, 196, 26, 0.3);
  color: #82c41c;
}

.badge-warning {
  background: rgba(230, 162, 60, 0.15);
  border: 1px solid rgba(230, 162, 60, 0.3);
  color: #e6a23c;
}

/* 更多操作按钮 */
.more-btn-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.more-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #919191;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: bold;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 8px;
  min-width: 140px;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  color: #e2e2e2;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.dropdown-item.danger {
  color: #ff4d4f;
}

.dropdown-item.danger:hover {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.merchant-card:hover .more-btn {
  opacity: 1;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* 商家Logo和名称一行 */
.merchant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  margin-top: 40px;
}

.merchant-logo {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px !important;
  flex-shrink: 0;
}

.merchant-info {
  flex: 1;
  min-width: 0;
}

.merchant-name {
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #ffffff;
  letter-spacing: 0;
  line-height: 1.3;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merchant-expiry {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #919191;
  line-height: 1.5;
}

/* 额度区域 */
.quota-section {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
}

.quota-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.quota-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quota-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #919191;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.quota-value {
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #007AFF;
}

.recharge-btn {
  background: rgba(0, 122, 255, 0.15) !important;
  border: 1px solid rgba(0, 122, 255, 0.3) !important;
  border-radius: 8px !important;
  color: #007AFF !important;
  font-size: 12px !important;
}

.quota-value {
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #007AFF;
}

.quota-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.quota-progress {
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #0055cc);
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* 存储区域 - 10px Label 层级 */
/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.1);
}

.empty-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 12px;
}

.empty-desc {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #919191;
  margin-bottom: 32px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #919191;
}

/* 分页 - 10px Label 层级 */
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.custom-pagination {
  display: flex;
  gap: 8px;
}

.custom-pagination :deep(.el-pager li) {
  min-width: 40px;
  height: 40px;
  line-height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #919191;
  transition: all 0.3s ease;
}

.custom-pagination :deep(.el-pager li:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.custom-pagination :deep(.el-pager li.is-active) {
  background: #007AFF;
  border-color: #007AFF;
  color: #ffffff;
}

.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) {
  min-width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #919191;
}

/* 下拉菜单 */
.action-menu {
  background: #1f1f1f !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 16px !important;
  padding: 8px !important;
}

.action-menu :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 12px 16px !important;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #e2e2e2;
  transition: all 0.2s ease;
}

.action-menu :deep(.el-dropdown-menu__item:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

/* 创建弹窗 */
.create-dialog :deep(.el-dialog) {
  background: #1f1f1f !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 24px !important;
  backdrop-filter: blur(64px) !important;
}

.create-dialog :deep(.el-dialog__header) {
  padding: 28px 32px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.create-dialog :deep(.el-dialog__title) {
  font-family: 'Manrope', sans-serif !important;
  font-weight: 700 !important;
  font-size: 22px !important;
  color: #ffffff !important;
}

.create-dialog :deep(.el-dialog__body) {
  padding: 32px !important;
}

.create-dialog :deep(.el-dialog__footer) {
  padding: 24px 32px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.create-form :deep(.el-form-item__label) {
  font-family: 'Inter', sans-serif !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1em !important;
  color: #919191 !important;
  margin-bottom: 10px !important;
}

.form-select {
  width: 100%;
}

/* 弹窗按钮 */
.cancel-btn {
  padding: 12px 28px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  font-family: 'Manrope', sans-serif !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  color: #e2e2e2 !important;
  transition: all 0.3s ease !important;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

.confirm-btn {
  padding: 12px 28px !important;
  background: linear-gradient(135deg, #007AFF, #0055cc) !important;
  border: none !important;
  border-radius: 12px !important;
  font-family: 'Manrope', sans-serif !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  color: #ffffff !important;
  box-shadow: 0 4px 16px -4px rgba(0, 122, 255, 0.4) !important;
  transition: all 0.3s ease !important;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -4px rgba(0, 122, 255, 0.5) !important;
}

.delete-btn {
  padding: 12px 28px !important;
  background: linear-gradient(135deg, #ff4d4f, #cf1322) !important;
  border: none !important;
  border-radius: 12px !important;
  font-family: 'Manrope', sans-serif !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  color: #ffffff !important;
  box-shadow: 0 4px 16px -4px rgba(255, 77, 79, 0.4) !important;
  transition: all 0.3s ease !important;
}

/* 删除弹窗内容 */
.delete-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.delete-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  border-radius: 20px;
  color: #ff4d4f;
  margin-bottom: 20px;
}

.delete-text {
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #ffffff;
  margin-bottom: 8px;
}

.delete-hint {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #919191;
}

/* 删除弹窗 */
.delete-dialog :deep(.el-dialog) {
  background: #1f1f1f !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 24px !important;
}

.delete-dialog :deep(.el-dialog__header) {
  padding: 24px 32px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.delete-dialog :deep(.el-dialog__title) {
  font-family: 'Manrope', sans-serif !important;
  font-weight: 700 !important;
  font-size: 20px !important;
  color: #ffffff !important;
}

.delete-dialog :deep(.el-dialog__body) {
  padding: 32px !important;
}

.delete-dialog :deep(.el-dialog__footer) {
  padding: 20px 32px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}
</style>
