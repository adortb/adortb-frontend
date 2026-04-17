# adortb-frontend

> 运营后台前端：React 18 + Ant Design 5 + TypeScript，对接 adortb-admin REST API。

## 快速理解

Hash 路由 SPA，登录态存 localStorage，所有请求统一走 `/api` 代理。

**核心抽象**：
- `useTableData` hook — 封装分页 + loading + refresh，所有列表页复用
- `statusTag` util — 统一渲染状态 Tag（active/inactive/pending）
- `api/client.ts` — axios 实例，含 401 自动跳转和错误 toast

## 目录结构

```
src/
  api/          # 各资源 REST 调用（publisher/advertiser/campaign/creative/adslot/report）
  hooks/        # useTableData — 通用分页 hook
  utils/        # statusTag — 状态展示
  store/        # useAuthStore — Zustand 登录态
  types/        # entities.ts — 所有实体类型
  layouts/      # MainLayout — 侧边栏布局
  pages/        # 页面组件（List + Form 各一对）
```

## 开发指南

```bash
npm run dev     # 启动开发服务器（端口 5173）
npm run build   # 构建检查 TypeScript
```

代理配置在 `vite.config.ts`：`/api → http://localhost:8084`

## 扩展新页面

1. 在 `src/api/` 添加对应 API 文件
2. 在 `src/types/entities.ts` 添加类型
3. 新建 `XxxList.tsx` + `XxxForm.tsx`，复用 `useTableData`
4. 在 `src/router.tsx` 注册路由
5. 在 `src/layouts/MainLayout.tsx` 菜单添加入口
