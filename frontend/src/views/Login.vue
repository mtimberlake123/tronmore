<template>
  <div class="auth-page">
    <div class="auth-shell">
      <section class="brand-panel">
        <div class="brand-badge">创码</div>
        <h1 class="brand-title">营销商家管理平台</h1>
        <p class="brand-desc">围绕商家运营、内容生成、素材管理与投放协同，打造更清晰的业务工作台。</p>

        <div class="brand-metrics">
          <div class="metric-card">
            <span class="metric-label">统一工作流</span>
            <strong class="metric-value">商家配置到内容生产</strong>
          </div>
          <div class="metric-card">
            <span class="metric-label">双模式主题</span>
            <strong class="metric-value">日间清晰 夜间稳重</strong>
          </div>
          <div class="metric-card">
            <span class="metric-label">当前状态</span>
            <strong class="metric-value">适合 B 端 SaaS 团队协作</strong>
          </div>
        </div>
      </section>

      <section class="auth-panel">
        <div class="panel-top">
          <div>
            <h2 class="panel-title">{{ isRegister ? '创建企业账号' : '欢迎登录' }}</h2>
            <p class="panel-subtitle">{{ isRegister ? '填写企业信息后即可立即进入系统。' : '支持账号密码和短信验证码两种方式。' }}</p>
          </div>
          <button class="theme-switch" type="button" @click="toggleTheme">
            <span>{{ isDark ? '切换日间' : '切换夜间' }}</span>
          </button>
        </div>

        <div class="mode-switch">
          <button :class="['mode-btn', { active: !isRegister }]" type="button" @click="isRegister = false">登录</button>
          <button :class="['mode-btn', { active: isRegister }]" type="button" @click="isRegister = true">注册</button>
        </div>

        <template v-if="!isRegister">
          <el-tabs v-model="loginType" class="login-tabs">
            <el-tab-pane label="密码登录" name="password">
              <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-position="top" class="auth-form">
                <el-form-item label="账号" prop="account">
                  <el-input v-model="passwordForm.account" size="large" placeholder="请输入手机号或企业名称" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input v-model="passwordForm.password" size="large" type="password" show-password placeholder="请输入登录密码" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="短信登录" name="sms">
              <el-form ref="smsFormRef" :model="smsForm" :rules="smsRules" label-position="top" class="auth-form">
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="smsForm.phone" size="large" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="验证码" prop="code">
                  <div class="code-row">
                    <el-input v-model="smsForm.code" size="large" placeholder="请输入验证码" />
                    <button class="code-btn" type="button" :disabled="countdown > 0" @click="sendCode('login')">
                      {{ countdown > 0 ? `${countdown} 秒后重发` : '获取验证码' }}
                    </button>
                  </div>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>

        <template v-else>
          <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-position="top" class="auth-form">
            <el-form-item label="企业名称" prop="company_name">
              <el-input v-model="registerForm.company_name" size="large" placeholder="请输入企业名称" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="registerForm.phone" size="large" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="验证码" prop="code">
              <div class="code-row">
                <el-input v-model="registerForm.code" size="large" placeholder="请输入验证码" />
                <button class="code-btn" type="button" :disabled="countdown > 0" @click="sendCode('register')">
                  {{ countdown > 0 ? `${countdown} 秒后重发` : '获取验证码' }}
                </button>
              </div>
            </el-form-item>
            <el-form-item label="登录密码" prop="password">
              <el-input v-model="registerForm.password" size="large" type="password" show-password placeholder="不少于 6 位" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" size="large" type="password" show-password placeholder="请再次输入密码" />
            </el-form-item>
          </el-form>
        </template>

        <div class="terms-row">
          <el-checkbox v-model="agreeTerms">我已阅读并同意《用户协议》</el-checkbox>
        </div>

        <el-button class="submit-btn" type="primary" size="large" :loading="loading" :disabled="!agreeTerms" @click="handleSubmit">
          {{ isRegister ? '注册并进入系统' : '立即登录' }}
        </el-button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { auth } from '@/api'

const router = useRouter()
const loginType = ref('password')
const isRegister = ref(false)
const loading = ref(false)
const agreeTerms = ref(true)
const countdown = ref(0)
const isDark = ref(localStorage.getItem('theme') === 'dark')

const passwordFormRef = ref()
const smsFormRef = ref()
const registerFormRef = ref()

const passwordForm = reactive({
  account: '',
  password: ''
})

const smsForm = reactive({
  phone: '',
  code: ''
})

const registerForm = reactive({
  company_name: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const phoneValidator = (_, value, callback) => {
  if (!value) return callback(new Error('请输入手机号'))
  if (!/^1\d{10}$/.test(value)) return callback(new Error('请输入正确的手机号'))
  callback()
}

const confirmPasswordValidator = (_, value, callback) => {
  if (!value) return callback(new Error('请再次输入密码'))
  if (value !== registerForm.password) return callback(new Error('两次输入的密码不一致'))
  callback()
}

const passwordRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const smsRules = {
  phone: [{ validator: phoneValidator, trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const registerRules = {
  company_name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  phone: [{ validator: phoneValidator, trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少 6 位', trigger: 'blur' }],
  confirmPassword: [{ validator: confirmPasswordValidator, trigger: 'blur' }]
}

const activePhone = computed(() => isRegister.value ? registerForm.phone : smsForm.phone)

const applyTheme = () => {
  document.documentElement.classList.toggle('dark-theme', isDark.value)
  document.documentElement.classList.toggle('light-theme', !isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
}

const persistLogin = (data) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('company_id', data.company_id)
  localStorage.setItem('company_name', data.company_name)
}

const sendCode = async (type) => {
  if (!activePhone.value) {
    ElMessage.warning('请先输入手机号')
    return
  }

  try {
    await auth.sendSms({ phone: activePhone.value, type })
    ElMessage.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error(error)
  }
}

const handleSubmit = async () => {
  if (!agreeTerms.value) {
    ElMessage.warning('请先同意用户协议')
    return
  }

  loading.value = true
  try {
    let data

    if (isRegister.value) {
      await registerFormRef.value.validate()
      data = await auth.register({
        company_name: registerForm.company_name,
        phone: registerForm.phone,
        code: registerForm.code,
        password: registerForm.password,
        agree_terms: true
      })
      ElMessage.success('注册成功')
    } else if (loginType.value === 'password') {
      await passwordFormRef.value.validate()
      data = await auth.loginByPassword({ ...passwordForm, agree_terms: true })
      ElMessage.success('登录成功')
    } else {
      await smsFormRef.value.validate()
      data = await auth.loginBySms({ ...smsForm, agree_terms: true })
      ElMessage.success('登录成功')
    }

    persistLogin(data)
    router.push('/')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  applyTheme()
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.auth-shell {
  width: min(1180px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.brand-panel {
  padding: 56px;
  background:
    linear-gradient(160deg, rgba(37, 99, 235, 0.92), rgba(29, 78, 216, 0.84)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0));
  color: #fff;
}

html.dark-theme .auth-shell {
  background: rgba(21, 34, 53, 0.9);
}

html.dark-theme .brand-panel {
  background:
    linear-gradient(160deg, rgba(19, 33, 53, 0.95), rgba(30, 58, 138, 0.88)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0));
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 13px;
  font-weight: 700;
}

.brand-title {
  margin: 24px 0 12px;
  font-family: var(--font-display);
  font-size: 42px;
  line-height: 1.12;
}

.brand-desc {
  margin: 0;
  max-width: 520px;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.82);
}

.brand-metrics {
  display: grid;
  gap: 16px;
  margin-top: 40px;
}

.metric-card {
  padding: 18px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.metric-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.metric-value {
  font-size: 18px;
  line-height: 1.5;
}

.auth-panel {
  padding: 40px 40px 36px;
  background: var(--surface);
}

.panel-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  color: var(--text);
}

.panel-subtitle {
  margin: 8px 0 0;
  color: var(--text-2);
  font-size: 14px;
}

.theme-switch {
  min-height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-2);
  cursor: pointer;
}

.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 28px 0 24px;
  padding: 6px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
}

.mode-btn {
  min-height: 42px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-2);
  font-weight: 700;
  cursor: pointer;
}

.mode-btn.active {
  background: var(--surface);
  color: var(--accent);
  box-shadow: var(--shadow-sm);
}

.auth-form {
  display: grid;
  gap: 4px;
}

.auth-form :deep(.el-form-item__label) {
  color: var(--text-2);
  font-weight: 700;
}

.code-row {
  display: grid;
  grid-template-columns: 1fr 128px;
  gap: 12px;
  width: 100%;
}

.code-btn {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
}

.code-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.terms-row {
  margin: 18px 0 20px;
  color: var(--text-2);
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px !important;
  font-size: 15px !important;
  font-weight: 700 !important;
}

@media (max-width: 960px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    padding: 32px;
  }

  .auth-panel {
    padding: 28px 24px 24px;
  }
}

@media (max-width: 640px) {
  .auth-page {
    padding: 16px;
  }

  .brand-title {
    font-size: 32px;
  }

  .code-row {
    grid-template-columns: 1fr;
  }

  .panel-top {
    flex-direction: column;
  }
}
</style>
