#!/bin/bash
# Sealos DevBox 发布：前端 out/ + Express /api + /islide-api 同源（与 npm run start:app 一致）。
# 发布前请在构建阶段执行：npm run build（生成 out/）。
# 仅静态、无后端时可：./entrypoint.sh static
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 与平台「容器暴露端口」一致：Sealos 常注入 PORT=8080；未设置时默认 8080（与旧版 serve 一致）
export PORT="${PORT:-8080}"
export NODE_ENV=production
export SERVE_STATIC=1

MODE="${1:-prod}"

if [[ "$MODE" == "static" ]]; then
  exec ./node_modules/.bin/serve -s out -l "tcp://0.0.0.0:${PORT}"
fi

if [[ "$MODE" != "prod" ]]; then
  echo "[entrypoint] 未知参数: $MODE。使用: $0 prod | static" >&2
  exit 1
fi

if [[ ! -d out ]]; then
  echo "[entrypoint] 缺少 out/，请在构建阶段执行: npm run build" >&2
  exit 1
fi

exec node server/index.mjs
