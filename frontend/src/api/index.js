import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 30000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => {
    const { code, message, data } = response.data
    if (code !== 200) {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
    return data
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    ElMessage.error(error.response?.data?.message || error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request

export const auth = {
  loginByPassword: (data) => request.post('/auth/login/password', data),
  loginBySms: (data) => request.post('/auth/login/sms', data),
  register: (data) => request.post('/auth/register', data),
  sendSms: (data) => request.post('/auth/sms/send', data),
  refresh: (data) => request.post('/auth/refresh', data),
  logout: () => request.post('/auth/logout')
}

export const merchant = {
  list: (params) => request.get('/merchants', { params }),
  create: (data) => request.post('/merchants', data),
  detail: (id) => request.get(`/merchants/${id}`),
  update: (id, data) => request.put(`/merchants/${id}`, data),
  delete: (id) => request.delete(`/merchants/${id}`),
  transfer: (id, data) => request.post(`/merchants/${id}/transfer`, data),
  copy: (id) => request.post(`/merchants/${id}/copy`),
  sort: (data) => request.put('/merchants/sort', data),
  balance: (id) => request.get(`/merchants/${id}/balance`),
  dashboard: (id, params) => request.get(`/merchants/${id}/dashboard`, { params }),
  generations: (id, params) => request.get(`/merchants/${id}/generations`, { params }),
  qrcode: (id, data) => request.post(`/merchants/${id}/qrcode`, data)
}

export const warehouse = {
  storageCheck: (id) => request.get(`/merchants/${id}/storage/check`),
  images: (id, params) => request.get(`/merchants/${id}/images`, { params }),
  upload: (id, data) => request.post(`/merchants/${id}/images`, data),
  delete: (id, imageId) => request.delete(`/merchants/${id}/images/${imageId}`),
  batchCheck: (id) => request.post(`/merchants/${id}/images/batch-check`),
  settings: (id, data) => request.put(`/merchants/${id}/image-settings`, data)
}

export const quota = {
  allocate: (id, data) => request.post(`/merchants/${id}/quota/allocate`, data),
  logs: (params) => request.get('/quota/logs', { params }),
  tenantBalance: () => request.get('/quota/balance'),
  balance: () => request.get('/admin/ai-provider/balance')
}

export const generator = {
  content: (data) => request.post('/generate/content', data),
  reviewPreview: (data) => request.post('/generate/review-preview', data),
  feedback: (id, data) => request.post(`/generations/${id}/feedback`, data)
}

export const factory = {
  modules: () => request.get('/factory/modules'),
  generate: (data) => request.post('/factory/generations', data),
  detail: (id) => request.get(`/factory/generations/${id}`),
  history: (params) => request.get('/factory/history', { params }),
  drafts: (params) => request.get('/drafts', { params }),
  deleteDraft: (id) => request.delete(`/drafts/${id}`)
}

export const h5 = {
  config: (id) => request.get(`/h5/merchants/${id}/config`),
  generate: (data) => request.post('/h5/generate', data),
  track: (data) => request.post('/h5/track', data),
  publishCallback: (data) => request.post('/h5/publish-callback', data)
}

export const reference = {
  notes: {
    list: (params) => request.get('/references/notes', { params }),
    create: (data) => request.post('/references/notes', data),
    delete: (id) => request.delete(`/references/notes/${id}`)
  },
  reviews: {
    list: (params) => request.get('/references/reviews', { params }),
    create: (data) => request.post('/references/reviews', data),
    delete: (id) => request.delete(`/references/reviews/${id}`)
  }
}

export const marketingVideo = {
  types: () => request.get('/marketing-videos/types'),
  list: () => request.get('/marketing-videos'),
  create: (data) => request.post('/marketing-videos', data),
  detail: (id) => request.get(`/marketing-videos/${id}`),
  updateStep: (id, stepKey, data) => request.put(`/marketing-videos/${id}/steps/${stepKey}`, data)
}

export const industry = {
  list: () => request.get('/industries')
}

export const admin = {
  companies: {
    list: (params) => request.get('/admin/companies', { params }),
    create: (data) => request.post('/admin/companies', data),
    recharge: (id, data) => request.post(`/admin/companies/${id}/recharge`, data),
    subAccounts: (id, data) => request.post(`/admin/companies/${id}/sub-accounts`, data)
  },
  merchants: {
    list: (params) => request.get('/admin/merchants', { params }),
    delete: (id) => request.delete(`/admin/merchants/${id}`),
    transfer: (id, data) => request.post(`/admin/merchants/${id}/transfer`, data)
  },
  prompts: {
    list: (params) => request.get('/admin/prompts', { params }),
    create: (data) => request.post('/admin/prompts', data),
    update: (id, data) => request.put(`/admin/prompts/${id}`, data)
  },
  sensitiveWords: {
    list: (params) => request.get('/admin/sensitive-words', { params }),
    create: (data) => request.post('/admin/sensitive-words', data),
    update: (id, data) => request.put(`/admin/sensitive-words/${id}`, data),
    delete: (id) => request.delete(`/admin/sensitive-words/${id}`),
    activeRules: () => request.get('/admin/rules/active')
  },
  aiAgents: {
    list: (params) => request.get('/admin/ai-agents', { params }),
    create: (data) => request.post('/admin/ai-agents', data),
    update: (id, data) => request.put(`/admin/ai-agents/${id}`, data)
  },
  aiSkills: {
    list: (params) => request.get('/admin/ai-skills', { params }),
    create: (data) => request.post('/admin/ai-skills', data),
    update: (id, data) => request.put(`/admin/ai-skills/${id}`, data)
  },
  aiProvider: {
    get: () => request.get('/admin/ai-provider'),
    update: (data) => request.put('/admin/ai-provider', data),
    balance: () => request.get('/admin/ai-provider/balance')
  }
}
