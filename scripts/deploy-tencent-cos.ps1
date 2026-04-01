# 构建并同步到腾讯云 COS（需安装 coscli：https://cloud.tencent.com/document/product/436/63144）
# 环境变量：
#   TENCENT_SECRET_ID / TENCENT_SECRET_KEY — API 密钥（控制台「访问管理 - API 密钥管理」）
#   COS_BUCKET — 存储桶全称，格式 桶名-APPID，如 myapp-1250000000
#   COS_REGION — 地域，如 ap-guangzhou
# coscli 的 endpoint 使用 cos.<region>.myqcloud.com（无 https 前缀）

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$secretId = $env:TENCENT_SECRET_ID
$secretKey = $env:TENCENT_SECRET_KEY
$bucket = $env:COS_BUCKET
$region = $env:COS_REGION
$alias = if ($env:COS_ALIAS) { $env:COS_ALIAS } else { "deploy" }

if (-not $secretId -or -not $secretKey -or -not $bucket -or -not $region) {
    Write-Host "请设置环境变量: TENCENT_SECRET_ID, TENCENT_SECRET_KEY, COS_BUCKET, COS_REGION" -ForegroundColor Yellow
    exit 1
}

$coscli = Get-Command coscli -ErrorAction SilentlyContinue
if (-not $coscli) {
    Write-Host "未找到 coscli。下载 Windows-amd64 重命名为 coscli.exe 并加入 PATH: https://cloud.tencent.com/document/product/436/63144" -ForegroundColor Red
    exit 1
}

$endpoint = "cos.$region.myqcloud.com"

Write-Host "npm run build ..."
& npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$outDir = Join-Path $root "out"
if (-not (Test-Path $outDir)) {
    Write-Host "未找到 out 目录，请先构建成功。" -ForegroundColor Red
    exit 1
}

Write-Host "coscli config set (密钥) ..."
& coscli config set --secret_id $secretId --secret_key $secretKey
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& coscli config delete -a $alias 2>$null
Write-Host "coscli config add 桶别名 $alias ..."
& coscli config add -b $bucket -r $region -e $endpoint -a $alias
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "coscli sync -> cos://$alias/ ..."
& coscli sync $outDir "cos://$alias/" -r
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "上传完成。请在 COS 控制台：存储桶 - 基础配置 - 静态网站，索引文档 index.html；使用 History 路由时错误文档也可设为 index.html。" -ForegroundColor Green
Write-Host "默认域名或绑定域名见同页的「静态网站」访问节点说明。" -ForegroundColor Green
