import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    children: [
      {
        path: '',
        redirect: '/merchants'
      },
      {
        path: 'merchants',
        name: 'Merchants',
        component: () => import('@/views/merchant/List.vue')
      },
      {
        path: 'merchants/create',
        name: 'MerchantCreate',
        component: () => import('@/views/merchant/Create.vue'),
        meta: { hideTopbar: true }
      },
      {
        path: 'merchants/:id',
        name: 'MerchantDetail',
        component: () => import('@/views/merchant/Detail.vue'),
        meta: { hideTopbar: true }
      },
      {
        path: 'factory',
        name: 'Factory',
        component: () => import('@/views/factory/Index.vue')
      },
      {
        path: 'references',
        name: 'References',
        component: () => import('@/views/reference/Index.vue')
      }
    ]
  },
  // Admin Console
  {
    path: '/admin',
    component: () => import('@/views/admin/Layout.vue'),
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'companies',
        name: 'AdminCompanies',
        component: () => import('@/views/admin/Companies.vue')
      },
      {
        path: 'prompts',
        name: 'AdminPrompts',
        component: () => import('@/views/admin/Prompts.vue')
      },
      {
        path: 'sensitive',
        name: 'AdminSensitive',
        component: () => import('@/views/admin/RiskRules.vue')
      },
      {
        path: 'ai-workflow',
        name: 'AdminAiWorkflow',
        component: () => import('@/views/admin/AiWorkflow.vue')
      },
      {
        path: 'ai-provider',
        name: 'AdminAiProvider',
        component: () => import('@/views/admin/AiProvider.vue')
      }
    ]
  },
  // H5 Consumer Landing Page (no auth required)
  {
    path: '/h5/:merchantId',
    name: 'H5Landing',
    component: () => import('@/views/h5/LandingPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/h5/:merchantId/note',
    name: 'H5NoteGenerate',
    component: () => import('@/views/h5/NoteGenerate.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // H5 landing page不需要登录
  if (!token && to.path !== '/login' && !to.path.startsWith('/h5/')) {
    next('/login')
  } else {
    next()
  }
})

export default router
