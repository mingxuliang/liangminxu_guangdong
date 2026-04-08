# Devbox / 服务器部署说明（前端 + 本地 BFF）

## 架构

- **前端**：Vite 构建产物在 `out/`。
- **后端**：`server/index.mjs`（Express），提供 `/api/knowledge-extraction/*`。
- **会话存储**：支持 `file` 与 `postgres` 两种模式。生产环境建议配置 `KE_STORAGE_DRIVER=postgres`，会话与资源元数据落 PostgreSQL；未配置时回退到 `server/data/`。
- **对象存储**：若配置 **Sealos 对象存储**（`OSS_*` 环境变量），上传文件写入存储桶；音频在转写时临时下载到本地缓存后立即删除。未配置时仍暂存 `server/uploads/`。
- **Dify**：导入 `dify/ke-01-source-anchor.dsl.yml`，配置模型后发布；将 **Workflow API Key** 写入环境变量 `KE_ANCHOR_API_KEY`，`DIFY_BASE_URL` 指向可访问的 Dify `/v1` 根路径。

## 本地开发（Windows / Mac）

1. 复制 `.env.example` 为 `.env.local`，至少设置 `VITE_API_BASE=/api`。
2. 根目录创建 `.env`（与 `dotenv` 加载一致），配置 `KE_ANCHOR_API_KEY`（可选，不配则返回模拟锚定包）。
3. 安装依赖：`npm install`。
4. 同时启动 API 与前端：`npm run dev:full`（或两个终端分别 `npm run server` 与 `npm run dev`）。
5. 浏览器访问控制台打印的 Vite 地址（默认端口见 `vite.config.ts`）。

## Devbox 上部署（单进程托管静态站 + API）

1. 在 Devbox 中拉取代码，执行 `npm install`。
2. 在平台环境变量中至少配置：

```env
SERVER_PORT=8787
KE_STORAGE_DRIVER=postgres
DIFY_BASE_URL=http://your-dify-host/v1
KE_ANCHOR_API_KEY=...

# PostgreSQL（Devbox 内推荐内网地址）
PGHOST=dify-db-postgresql.ns-xook3wzu.svc
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=your-password
DATABASE_SSL=0

# Sealos Object Storage（Devbox 内推荐 Internal，开发机推荐 External）
OSS_ENDPOINT=http://object-storage.objectstorage-system.svc
OSS_ACCESS_KEY_ID=your-access-key
OSS_SECRET_ACCESS_KEY=your-secret-key
OSS_BUCKET=your-bucket
OSS_REGION=us-east-1
OSS_PREFIX=prod
OSS_FORCE_PATH_STYLE=1
```

说明：

- **Devbox / 集群内** 优先用 PostgreSQL 和对象存储的 **Internal** 地址。
- **本机开发 / 外网调试** 再使用 **External** 地址。
- `OSS_PREFIX` 建议按环境区分，如 `dev` / `prod`，避免共用桶时数据混写。
3. 构建并启动：

```bash
npm run build
npm run start:app
```

`start:app` 会设置 `NODE_ENV=production` 与 `SERVE_STATIC=1`，由 **同一 Node 进程** 提供 `out/` 静态资源与 `/api` 接口（见 `server/index.mjs`）。

4. 将 Sealos / Devbox **对外端口** 指向 `SERVER_PORT`（默认 `8787`，若平台注入 `PORT` 可改脚本使用 `process.env.PORT`）。

## 生产建议

- 用 `GET /api/health` 检查 `session_storage`、`postgres_configured`、`object_storage`、`oss_prefix` 是否符合预期。
- `KE_ANCHOR_API_KEY` 等服务端密钥仅放后端环境变量，勿写入前端构建环境。
- 若本地和生产共用同一 PostgreSQL / 存储桶，至少要分数据库或分 `OSS_PREFIX`。
