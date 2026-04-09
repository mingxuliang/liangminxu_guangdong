# Devbox / 服务器部署说明（前端 + 本地 BFF）

## 架构

- **前端**：Vite 构建产物在 `out/`。
- **后端**：`server/index.mjs`（Express），提供 `/api/knowledge-extraction/*`。
- **同源代理**：生产环境由 Node 转发 `/islide-api/*` → 阿里云市场 iSlide（与 `vite.config.ts` 开发代理一致），保证「课程创建」第五步 `generate_ppt` 在 Devbox 上可用。
- **会话存储**：`KE_STORAGE_DRIVER=postgres` 时会话落 PostgreSQL；未配置则回退 `server/data/`。
- **对象存储**：配置 `OSS_*` 时上传走 Sealos S3；否则使用 `server/uploads/`。
- **Dify**：知识萃取工作流见 `dify/*.dsl.yml`；`DIFY_BASE_URL` 须以 `/v1` 结尾。

## 环境变量：构建时 vs 运行时

| 类型 | 说明 |
|------|------|
| **构建时（`VITE_*`）** | 由 Vite 打进前端 JS，**必须在执行 `npm run build` 前**注入到环境（Devbox「构建阶段环境变量」或 `export` 后再 build）。 |
| **运行时** | 由 Node 在启动时读取（`dotenv` / 平台「运行环境变量」），含 `DIFY_BASE_URL`、`KE_*`、`PG*`、`OSS_*`、`ISLIDE_PROXY_TARGET` 等。 |

完整模板见仓库根目录 **`devbox.env.example`**（无真实密钥，可对照 Devbox 控制台逐项填写）。

## Devbox 推荐步骤

1. 拉取代码后安装依赖：`npm ci` 或 `npm install`。
2. 在平台配置 **构建阶段** 与 **运行阶段** 环境变量（至少包含 `devbox.env.example` 中全部 `VITE_*` 与数据库、OSS、Dify 密钥）。**勿将密钥提交到 Git。**
3. 构建并启动：

```bash
npm run build
npm run start:app
```

`start:app` 会设置 `NODE_ENV=production` 与 `SERVE_STATIC=1`，由 **同一 Node 进程** 托管 `out/` 静态资源、`/api` 与 `/islide-api` 代理。

4. **监听端口**：`server/index.mjs` 使用 `process.env.PORT || process.env.SERVER_PORT || 8787`。若平台注入 `PORT`，请把 **对外端口** 与该值对齐。
5. 部署后访问：`GET /api/health`，确认 `session_storage`、`postgres_configured`、`object_storage`、`oss_prefix` 符合预期。

## 最小运行时变量（知识萃取）

```env
KE_STORAGE_DRIVER=postgres
DIFY_BASE_URL=http://your-dify-host/v1
KE_ANCHOR_API_KEY=...
KE_FILTER_API_KEY=...
KE_REFINE_API_KEY=...
KE_REEXTRACT_API_KEY=...
KE_VALIDATION_API_KEY=...
# 音频：建议配置 SILICONFLOW_API_KEY 或 KE_AUDIO_TO_TEXT_API_KEY / KE_ANCHOR_API_KEY 回退

PGHOST=dify-db-postgresql.ns-xook3wzu.svc
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=...
DATABASE_SSL=0

OSS_ENDPOINT=http://object-storage.objectstorage-system.svc
OSS_ACCESS_KEY_ID=...
OSS_SECRET_ACCESS_KEY=...
OSS_BUCKET=...
OSS_REGION=us-east-1
OSS_PREFIX=prod
OSS_FORCE_PATH_STYLE=1
```

## 构建阶段变量（课程创建 + 同源 API）

在 **`npm run build` 之前** 设置，例如：

```env
VITE_API_BASE=/api
VITE_DIFY_BASE_URL=http://your-dify-host:8088/v1
VITE_DIFY_STEP1_API_KEY=...
VITE_DIFY_STEP1_APP_MODE=workflow
VITE_DIFY_STEP2A_API_KEY=...
VITE_DIFY_STEP2B_API_KEY=...
VITE_DIFY_STEP3_API_KEY=...
VITE_DIFY_STEP4_API_KEY=...
VITE_ISLIDE_APPCODE=...
```

第五步 iSlide 请求发往同源 `/islide-api/generate_ppt`；服务端通过 `ISLIDE_PROXY_TARGET`（默认 `https://islide.market.alicloudapi.com`）转发。

## 生产建议

- `KE_*`、`SILICONFLOW_API_KEY`、`PGPASSWORD`、`OSS_*` 等仅放 **服务端/构建机密存储**，勿写入可被公开的仓库文件。
- 若本地与生产共用同一 PostgreSQL 或桶，请分库或区分 `OSS_PREFIX`。
- 若 `SERVE_STATIC=1` 但尚未执行 `npm run build`，进程会告警且无法提供页面；请先构建生成 `out/`。
