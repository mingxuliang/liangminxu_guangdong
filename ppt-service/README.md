# 课件 PPT 生成服务（python-pptx）

上传 **PPT 模板**（`.pptx`）与 **图片素材**，通过 JSON **大纲** 自动生成课件 `.pptx`。

## 环境

- Python 3.10+
- 依赖见 `requirements.txt`

```bash
cd ppt-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8090 --reload
```

健康检查：<http://localhost:8090/health>

## 模板要求

- 使用 **PowerPoint 另存为** 的 `.pptx`。
- 建议至少包含两种版式：**标题页**（封面）与 **标题和内容**（正文）。服务默认使用 `slide_layouts[0]` 作封面、`slide_layouts[1]` 作正文，可在生成请求里改 `title_layout_index` / `content_layout_index`。
- 服务会先**清空模板中已有幻灯片**，再按大纲重建（**保留母版与主题**）。

## 接口说明

### 1. 上传模板

`POST /api/upload/template`  
`multipart/form-data`，字段名 `file`。

响应：`{"template_id": "<uuid>", "filename": "..."}`

### 2. 上传素材图

`POST /api/upload/asset`  
`multipart/form-data`，字段名 `file`（png/jpg/webp 等）。

响应：`{"asset_id": "<uuid>", "filename": "..."}`

### 3. 生成课件

`POST /api/generate`  
`Content-Type: application/json`

```json
{
  "template_id": "上一步返回的 uuid",
  "course_title": "课程名称",
  "cover_subtitle": "副标题可选",
  "title_layout_index": 0,
  "content_layout_index": 1,
  "slides": [
    {
      "title": "第一节 概述",
      "bullets": ["要点一", "要点二"],
      "sub_items": [
        { "label": "小标题", "lines": ["子要点1", "子要点2"] }
      ],
      "image_asset_id": "某张上传图的 asset_id，可省略"
    }
  ]
}
```

- `bullets` 与 `contentLines` 二选一或合并（实现上优先 `bullets`，为空则用 `contentLines`）。
- `sub_items` 与前端 `subItems` 均可（camelCase 兼容）。
- 某页需要插图时，将对应图片先上传，把返回的 `asset_id` 填到该页的 `image_asset_id`。

响应：二进制流，`课件.pptx` 下载。

### curl 示例

```bash
# 上传模板
curl -s -F "file=@./my-template.pptx" http://localhost:8090/api/upload/template

# 上传图片
curl -s -F "file=@./diagram.png" http://localhost:8090/api/upload/asset

# 生成（请替换 ID）
curl -s -X POST http://localhost:8090/api/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"template_id\":\"YOUR_TEMPLATE_ID\",\"course_title\":\"测试课\",\"slides\":[{\"title\":\"第1页\",\"bullets\":[\"A\",\"B\"]}]}" ^
  -o out.pptx
```

（Linux/macOS 将 `^` 换为 `\`。）

## 与 Dify / 前端对接

1. Dify 工作流输出结构化 `slides` JSON（或你们「课程大纲 / 素材匹配」页的数据）。
2. 前端或中间层先调用本服务上传模板与素材，再 `POST /api/generate`。
3. **勿**把本服务直接暴露公网；应放在内网或由网关鉴权。

## 限制说明

- `python-pptx` 不支持复杂动画、SmartArt 全部特性；以**文本 + 配图**为主。
- 插图当前策略为在页面**右侧**放置图片，具体坐标可在 `app/generator.py` 中调整。
