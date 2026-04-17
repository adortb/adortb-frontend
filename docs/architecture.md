# 架构文档

## 系统架构图

```
┌─────────────────────────────────────────────┐
│              浏览器（Hash Router）            │
│                                             │
│  /#/login  /#/dashboard  /#/publishers ...  │
│                  │                          │
│          HashRouter + useRoutes             │
│                  │                          │
│     RequireAuth Guard (localStorage token)  │
│                  │                          │
│          MainLayout (Sider + Header)        │
│                  │                          │
│    ┌─────────────┼───────────────────┐      │
│  Dashboard  PublisherList  Reports...│      │
│    │            │              │     │      │
│    └────────────┴──────────────┘     │      │
│              axios /api/*            │      │
└──────────────────────────────────────┘      │
                   │                          │
      Vite proxy /api → :8084                 │
                   │                          │
        ┌──────────▼──────────┐               │
        │    adortb-admin     │               │
        │   REST API (:8084)  │               │
        └──────────┬──────────┘               │
                   │                          │
             PostgreSQL                       │
```

## 路由表

| 路径 | 组件 | 说明 |
|------|------|------|
| `/login` | Login | 登录，成功写 localStorage token |
| `/` | MainLayout | 需要认证，嵌套子路由 |
| `/dashboard` | Dashboard | 并发拉取各资源 total |
| `/publishers` | PublisherList | CRUD + 分页 |
| `/advertisers` | AdvertiserList | CRUD + 分页 |
| `/campaigns` | CampaignList | CRUD + 分页，关联广告主 |
| `/creatives` | CreativeList | CRUD + 分页，关联活动 |
| `/adslots` | AdSlotList | CRUD + 分页，关联媒体方 |
| `/reports` | Reports | Publisher/Advertiser 双 Tab |

## 组件设计

### useTableData hook

```ts
useTableData<T>(fetcher, defaultPageSize?)
→ { data, total, loading, page, pageSize, setPage, setPageSize, refresh }
```

- `fetcher` 变化（search 关键字改变）时自动重新请求
- 内部用 `version` 计数器支持手动 refresh
- 用 `cancelled` flag 防止竞态条件

### API 层约定

- 统一响应：`ApiResponse<T> = { code, message, data }`
- 分页响应：`ApiResponse<PageResult<T>>`，PageResult = `{ list, total, page, pageSize }`
- 401 由 axios 拦截器处理，清 token 并跳转 `/login`

## 数据流

```
用户操作
  → 触发 refresh() 或 search 变化
  → useTableData 更新 version/fetcher
  → useEffect 触发 fetcher(page, pageSize)
  → axios → Vite proxy → adortb-admin
  → 响应数据 → setData(res.data.list)
  → Table 重新渲染
```
