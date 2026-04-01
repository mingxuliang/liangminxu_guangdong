#!/bin/bash
# Sealos DevBox：只负责启动进程，不包含构建。
# 发布前请在 DevBox 开发环境里执行：npm run build（产物目录为 out/）。
set -euo pipefail
PORT="${PORT:-8080}"
exec ./node_modules/.bin/serve -s out -l "tcp://0.0.0.0:${PORT}"
