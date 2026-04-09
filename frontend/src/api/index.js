import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 30000
})

// 请求拦截器
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

// 响应拦截器
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
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request

// API接口
export const auth = {
  loginByPassword: (data) => request.post('/auth/login/password', data),
  loginBySms: (data) => request.post('/auth/login/sms', data),
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
  upload: (id, formData) => request.post(`/merchants/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id, imageId) => request.delete(`/merchants/${id}/images/${imageId}`),
  batchCheck: (id) => request.post(`/merchants/${id}/images/batch-check`),
  settings: (id, data) => request.put(`/merchants/${id}/image-settings`, data)
}

export const quota = {
  allocate: (id, data) => request.post(`/merchants/${id}/quota/allocate`, data),
  logs: (params) => request.get('/quota/logs', { params })
}

export const generator = {
  content: (data) => request.post('/generate/content', data),
  feedback: (id, data) => request.post(`/generations/${id}/feedback`, data)
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
    create: (data) => request.post('/references/notes', data)
  },
  reviews: {
    list: (params) => request.get('/references/reviews', { params }),
    create: (data) => request.post('/references/reviews', data)
  }
}

export const industry = {
  list: () => request.get('/industries')
}

export const admin = {
  // 营销公司
  companies: {
    list: (params) => request.get('/admin/companies', { params }),
    create: (data) => request.post('/admin/companies', data),
    recharge: (id, data) => request.post(`/admin/companies/${id}/recharge`, data),
    subAccounts: (id, data) => request.post(`/admin/companies/${id}/sub-accounts`, data)
  },
  // Prompt模板
  prompts: {
    list: (params) => request.get('/admin/prompts', { params }),
    create: (data) => request.post('/admin/prompts', data),
    update: (id, data) => request.put(`/admin/prompts/${id}`, data)
  },
  // 敏感词
  sensitiveWords: {
    list: (params) => request.get('/admin/sensitive-words', { params }),
    create: (data) => request.post('/admin/sensitive-words', data),
    delete: (id) => request.delete(`/admin/sensitive-words/${id}`)
  }
}