<template>
  <div class="login-page">
    <!-- 背景 -->
    <div class="login-bg"></div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo -->
      <div class="login-header">
        <div class="login-logo">
          <span class="material-symbols-outlined text-4xl">qr_code_2</span>
        </div>
        <h1 class="login-title">创码</h1>
        <p class="login-subtitle">营销商家管理平台</p>
      </div>

      <!-- 登录方式切换 -->
      <el-tabs v-model="loginType" class="login-tabs">
        <el-tab-pane label="密码登录" name="password">
          <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-position="top" class="login-form">
            <el-form-item label="账号" prop="account" class="form-item">
              <el-input
                v-model="passwordForm.account"
                placeholder="请输入手机号或账号"
                size="large"
                class="form-input"
              />
            </el-form-item>
            <el-form-item label="密码" prop="password" class="form-item">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                class="form-input"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="验证码登录" name="sms">
          <el-form ref="smsFormRef" :model="smsForm" :rules="smsRules" label-position="top" class="login-form">
            <el-form-item label="手机号" prop="phone" class="form-item">
              <el-input
                v-model="smsForm.phone"
                placeholder="请输入手机号"
                size="large"
                class="form-input"
              />
            </el-form-item>
            <el-form-item label="验证码" prop="code" class="form-item">
              <div class="code-input-wrap">
                <el-input
                  v-model="smsForm.code"
                  placeholder="请输入验证码"
                  size="large"
                  class="form-input code-input"
                />
                <button
                  type="button"
                  class="code-btn"
                  :disabled="countdown > 0"
                  @click="sendCode"
                >
                  {{ countdown > 0 ? `${countdown} 秒` : '获取验证码' }}
                </button>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 用户协议 -->
      <div class="terms-wrap">
        <el-checkbox v-model="agreeTerms" class="terms-checkbox">
          <span class="terms-text">我已阅读并同意</span>
        </el-checkbox>
        <a href="#" class="terms-link">《用户协议》</a>
      </div>

      <!-- 登录按钮 -->
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        @click="handleLogin"
        class="login-btn"
        :disabled="!agreeTerms"
      >
        登录
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loginType = ref('password')
const loading = ref(false)
const agreeTerms = ref(false)
const countdown = ref(0)

const passwordFormRef = ref()
const smsFormRef = ref()

const passwordForm = reactive({
  account: '',
  password: ''
})

const smsForm = reactive({
  phone: '',
  code: ''
})

const passwordRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const smsRules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const sendCode = async () => {
  if (!smsForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  try {
    await auth.sendSms({ phone: smsForm.phone, type: 'login' })
    ElMessage.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (error) {
    console.error(error)
  }
}

const handleLogin = async () => {
  if (!agreeTerms.value) {
    ElMessage.warning('请先阅读并同意用户协议')
    return
  }

  loading.value = true
  try {
    let data
    if (loginType.value === 'password') {
      await passwordFormRef.value.validate()
      data = await auth.loginByPassword({ ...passwordForm, agree_terms: true })
    } else {
      await smsFormRef.value.validate()
      data = await auth.loginBySms({ ...smsForm, agree_terms: true })
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('company_id', data.company_id)
    localStorage.setItem('company_name', data.company_name)

    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 登录页面 */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
}

/* 背景 */
.login-bg {
  position: fixed;
  inset: 0;
  background: #0e0e0e;
  z-index: 0;
}

/* 登录卡片 - 玻璃态 */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 48px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  animation: cardIn 0.6s ease-out;
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

/* Logo 区域 */
.login-header {
  text-align: center;
  margin-bottom: 48px;
}

.login-logo {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.2), rgba(0, 122, 255, 0.1));
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 24px;
  color: #007AFF;
}

.login-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
}

.login-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #919191;
}

/* 登录表单 */
.login-tabs {
  margin-bottom: 32px;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 28px;
}

.login-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.login-tabs :deep(.el-tabs__item) {
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: #919191;
  padding: 0 24px;
  height: 44px;
  line-height: 44px;
}

.login-tabs :deep(.el-tabs__item:hover) {
  color: #c6c6c6;
}

.login-tabs :deep(.el-tabs__item.is-active) {
  color: #007AFF;
}

.login-tabs :deep(.el-tabs__active-bar) {
  height: 3px;
  background: #007AFF;
  border-radius: 3px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 表单项 */
.form-item :deep(.el-form-item__label) {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #919191;
  margin-bottom: 12px;
  padding: 0;
}

.form-input :deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 14px !important;
  box-shadow: none !important;
  padding: 14px 18px !important;
  transition: all 0.3s ease;
}

.form-input :deep(.el-input__inner) {
  color: #ffffff !important;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
}

.form-input :deep(.el-input__inner::placeholder) {
  color: #474747;
}

.form-input :deep(.el-input__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  border-color: #007AFF !important;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1) !important;
}

/* 验证码输入 */
.code-input-wrap {
  display: flex;
  gap: 12px;
}

.code-input {
  flex: 1;
}

.code-btn {
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #e2e2e2;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.code-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 用户协议 */
.terms-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 28px;
}

.terms-checkbox :deep(.el-checkbox__label) {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #474747;
  padding-left: 8px;
}

.terms-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #007AFF;
  border-color: #007AFF;
}

.terms-checkbox :deep(.el-checkbox__inner) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

.terms-text {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #474747;
}

.terms-link {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #007AFF;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #3395ff;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, #007AFF, #0055cc) !important;
  border: none !important;
  border-radius: 16px !important;
  font-family: 'Manrope', sans-serif !important;
  font-weight: 700 !important;
  font-size: 16px !important;
  color: #ffffff !important;
  box-shadow: 0 8px 28px -8px rgba(0, 122, 255, 0.5);
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px -8px rgba(0, 122, 255, 0.6);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-btn :deep(.el-icon) {
  margin-right: 8px;
}
</style>
