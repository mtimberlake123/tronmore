<template>
  <div class="merchant-list">
    <div class="action-bar">
      <div>
        <h1 class="page-title">商家中心</h1>
        <p class="page-subtitle">管理你的门店资料、素材和生成额度</p>
      </div>
      <div class="action-right">
        <el-select v-model="filterSort" placeholder="排序" size="large" class="sort-select" @change="fetchList">
          <el-option label="最近添加" value="created_at_desc" />
          <el-option label="剩余额度" value="balance_desc" />
        </el-select>
        <el-button type="primary" size="large" @click="goToCreate" class="add-btn">新增商家</el-button>
      </div>
    </div>

    <div v-if="merchantList.length > 0" class="merchant-grid">
      <div
        v-for="(item, index) in merchantList"
        :key="item.id"
        class="merchant-card"
        :style="{ animationDelay: `${index * 60}ms` }"
        @click="goToDetail(item.id)"
      >
        <div class="card-badges">
          <span v-if="item.status_tag === 'new'" class="badge badge-new">新商家</span>
          <span v-if="item.status_tag === 'low_balance'" class="badge badge-warning">余额不足</span>
        </div>

        <div class="more-btn-wrapper" @click.stop>
          <button class="more-btn" type="button" @click.stop="toggleDropdown(item.id)">...</button>
          <div v-if="activeDropdown === item.id" class="dropdown-menu">
            <button class="dropdown-item" type="button" @click="handleCopy(item)">复制</button>
            <button class="dropdown-item danger" type="button" @click="handleDeleteClick(item)">删除</button>
          </div>
        </div>

        <div class="merchant-header">
          <el-avatar :size="38" :src="item.logo" class="merchant-logo">
            <span class="material-symbols-outlined text-2xl text-on-surface-variant">storefront</span>
          </el-avatar>
          <div class="merchant-info">
            <h3 class="merchant-name">{{ item.name }}</h3>
            <p class="merchant-expiry">剩余 {{ item.days_remaining }} 天</p>
          </div>
        </div>

        <div class="quota-section">
          <div class="quota-header">
            <div class="quota-left">
              <span class="quota-label">门店剩余额度</span>
              <span class="quota-value">{{ item.balance }} 次</span>
            </div>
            <el-button size="small" class="recharge-btn" @click.stop="openRecharge(item)">分配额度</el-button>
          </div>
          <div class="quota-bar">
            <div class="quota-progress" :style="{ width: `${item.balance_percent}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">
        <span class="material-symbols-outlined text-8xl">inbox</span>
      </div>
      <h3 class="empty-title">暂无商家</h3>
      <p class="empty-desc">点击下方按钮添加你的第一个商家</p>
      <el-button type="primary" size="large" @click="goToCreate" class="add-btn">新增商家</el-button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

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

    <el-dialog v-model="showRechargeDialog" title="分配门店额度" width="420px" class="action-dialog">
      <div class="dialog-content">
        <p class="dialog-title">给「{{ rechargeTarget?.name }}」分配额度</p>
        <p class="dialog-hint">额度会从当前营销公司的未分配额度池中扣除，并增加到该门店。</p>
        <el-input-number v-model="rechargeAmount" :min="1" :step="10" class="quota-input" />
      </div>
      <template #footer>
        <el-button @click="showRechargeDialog = false" size="large">取消</el-button>
        <el-button type="primary" @click="handleRecharge" size="large" :loading="rechargeLoading">确认分配</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDeleteDialog" title="确认删除" width="420px" class="action-dialog">
      <div class="dialog-content">
        <div class="delete-icon">
          <span class="material-symbols-outlined text-4xl">warning</span>
        </div>
        <p class="dialog-title">确定要删除商家「{{ currentMerchant?.name }}」吗？</p>
        <p class="dialog-hint">此操作不可恢复，删除后数据将无法找回。</p>
      </div>
      <template #footer>
        <el-button @click="showDeleteDialog = false" size="large">取消</el-button>
        <el-button type="danger" @click="handleDelete" size="large">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { merchant, quota } from '@/api'
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

const showRechargeDialog = ref(false)
const rechargeTarget = ref(null)
const rechargeAmount = ref(10)
const rechargeLoading = ref(false)

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

const openRecharge = (item) => {
  rechargeTarget.value = item
  rechargeAmount.value = 10
  showRechargeDialog.value = true
}

const handleRecharge = async () => {
  if (!rechargeTarget.value || !rechargeAmount.value) return

  rechargeLoading.value = true
  try {
    await quota.allocate(rechargeTarget.value.id, { amount: rechargeAmount.value })
    ElMessage.success('额度分配成功')
    showRechargeDialog.value = false
    await fetchList()
  } catch (e) {
    console.error(e)
  } finally {
    rechargeLoading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/merchants/${id}`)
}

const goToCreate = () => {
  router.push('/merchants/create')
}

const closeDropdown = () => {
  activeDropdown.value = null
}

onMounted(() => {
  fetchList()
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.merchant-list {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 14px 18px;
}

.page-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: var(--text);
}

.page-subtitle {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 4px;
}

.action-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sort-select {
  width: 128px;
}

.add-btn {
  border-radius: 10px;
  font-weight: 700;
}

.merchant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 24px;
}

.merchant-card {
  position: relative;
  padding: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  border: 1px solid var(--border-strong);
  border-radius: 18px;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.09);
  cursor: pointer;
  transition: all 0.25s ease;
}

.merchant-card:hover {
  border-color: rgba(37, 99, 235, 0.34);
  box-shadow: 0 20px 46px rgba(15, 23, 42, 0.13);
  transform: translateY(-3px);
}

.card-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
}

.badge {
  padding: 3px 7px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 10px;
}

.badge-new {
  background: rgba(82, 196, 26, 0.15);
  color: #82c41c;
}

.badge-warning {
  background: rgba(255, 107, 53, 0.16);
  color: #ff8a4c;
}

.more-btn-wrapper {
  position: absolute;
  top: 10px;
  right: 10px;
}

.more-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 34px;
  right: 0;
  min-width: 96px;
  padding: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  z-index: 10;
}

.dropdown-item {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--text);
  text-align: left;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--surface-2);
}

.dropdown-item.danger {
  color: var(--danger);
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 30px;
  margin-bottom: 20px;
}

.merchant-info {
  min-width: 0;
}

.merchant-name {
  margin: 0 0 4px;
  color: var(--text);
  font-size: 16px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merchant-expiry {
  margin: 0;
  color: var(--text-3);
  font-size: 12px;
}

.quota-section {
  padding: 12px;
  border-radius: 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.quota-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.quota-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quota-label {
  color: var(--text-3);
  font-size: 12px;
}

.quota-value {
  color: var(--text);
  font-weight: 800;
}

.recharge-btn {
  border-radius: 999px;
}

.quota-bar {
  height: 6px;
  margin-top: 12px;
  background: var(--surface-3);
  border-radius: 999px;
  overflow: hidden;
}

.quota-progress {
  height: 100%;
  background: linear-gradient(90deg, #007aff, #00c2ff);
}

html.dark-theme .merchant-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(24px);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: var(--shadow-sm);
}

html.dark-theme .merchant-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-md);
}

html.dark-theme .more-btn {
  background: rgba(255, 255, 255, 0.08);
  border-color: transparent;
}

html.dark-theme .quota-section {
  background: rgba(255, 255, 255, 0.04);
  border-color: transparent;
}

html.dark-theme .quota-bar {
  background: rgba(255, 255, 255, 0.08);
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 72px 20px;
  color: var(--text-3);
}

.empty-title {
  color: var(--text);
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.dialog-content {
  text-align: center;
  padding: 12px 0;
}

.dialog-title {
  color: var(--text);
  font-size: 16px;
  font-weight: 700;
}

.dialog-hint {
  color: var(--text-3);
  font-size: 13px;
  line-height: 1.6;
}

.quota-input {
  margin-top: 12px;
}

.delete-icon {
  color: var(--danger);
}

@media (max-width: 720px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .action-right {
    justify-content: space-between;
  }
}
</style>
