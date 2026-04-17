# adortb-frontend

adortb 平台运营管理后台，基于 React + Ant Design 构建。

## 启动方式

```bash
npm install
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # 生产构建
npm run preview  # 预览生产构建
```

## 架构位置

```
adortb-admin (:8084)  ←──→  adortb-frontend (:5173)
       ↑                           ↑
   PostgreSQL              浏览器（Hash路由）
```

前端通过 `/api` 前缀代理到 adortb-admin（端口 8084）。

## 功能模块

| 路由 | 功能 |
|------|------|
| `/login` | 登录页 |
| `/dashboard` | 数据概览 |
| `/publishers` | 媒体方管理 |
| `/advertisers` | 广告主管理 |
| `/campaigns` | 活动管理 |
| `/creatives` | 素材管理 |
| `/adslots` | 广告位管理 |
| `/reports` | Publisher 收入 + Advertiser 消耗报表 |

## API 对接说明

- 所有请求发往 `/api/v1/*`，由 Vite 代理转发至 `http://localhost:8084`
- 响应格式：`{ code: number, message: string, data: T }`
- Token 存储于 `localStorage`，请求头 `Authorization: Bearer <token>`
- 401 自动跳转登录

## 技术栈

- Vite 6 + React 18 + TypeScript 5
- Ant Design 5
- React Router 6（Hash 路由）
- Axios（统一拦截器）
- Zustand（Auth 状态）
