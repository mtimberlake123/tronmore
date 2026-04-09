# 创码 (Tronmore) - 营销商家管理平台

## 项目结构

```
tronmore/
├── frontend/                 # 前端项目 (Vue3 + TailwindCSS)
│   ├── src/
│   │   ├── api/             # API接口
│   │   ├── assets/          # 静态资源
│   │   ├── router/          # 路由配置
│   │   ├── store/           # 状态管理
│   │   ├── views/           # 页面组件
│   │   │   ├── Login.vue    # 登录页
│   │   │   ├── Layout.vue   # 主布局
│   │   │   ├── merchant/     # 商家中心
│   │   │   ├── factory/      # 宣传工厂
│   │   │   └── reference/    # 资料管理
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # 后端项目 (NestJS)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── merchant/     # 商家模块
│   │   │   ├── generator/    # 生成器模块
│   │   │   ├── warehouse/   # 图库模块
│   │   │   ├── dashboard/   # 数据看板模块
│   │   │   ├── quota/       # 额度模块
│   │   │   ├── factory/     # 宣传工厂模块
│   │   │   ├── reference/   # 参考资料模块
│   │   │   ├── admin/       # 系统后台模块
│   │   │   ├── h5/          # H5模块
│   │   │   └── analytics/   # 埋点模块
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
│
└── README.md
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
npm install
npm run dev
```

## 技术栈

- **前端**: Vue3 + Vite + TailwindCSS + Element Plus
- **后端**: NestJS + TypeORM + MySQL
- **AI**: OpenAI GPT / Claude API
- **存储**: 阿里云OSS / 腾讯云COS

## 环境变量

### 后端 (.env)

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tronmore
JWT_SECRET=your_secret
PORT=4000
```

### 前端

开发环境代理已配置，会将 `/api` 请求转发到 `http://localhost:4000`

## API文档

详见 `docs/superpowers/specs/2026-04-06-marketing-platform-api.md`

## 功能模块

| 模块 | 状态 | 说明 |
|------|:----:|------|
| 登录认证 | ✅ | 账号密码/手机验证码 |
| 商家管理 | ✅ | CRUD + 迁移 + 复制 |
| 营销码生成 | 🚧 | AI生成核心流程 |
| 图库管理 | 🚧 | 图片上传与匹配 |
| 数据看板 | 🚧 | PV/UV/转化率 |
| 额度管理 | 🚧 | 额度分配与扣费 |
| 宣传工厂 | 🚧 | 海报/卡片制作 |
| 资料管理 | 🚧 | 参考笔记/评价库 |
| H5落地页 | 🚧 | 消费者扫码入口 |
| 系统后台 | 🚧 | 平台运营管理 |

图例: ✅ 完成 | 🚧 进行中