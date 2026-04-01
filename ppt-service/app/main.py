"""
本地/内网部署：上传 PPT 模板与图片素材，按 JSON 大纲生成 .pptx
启动：uvicorn app.main:app --host 0.0.0.0 --port 8090 --reload
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict, Field

from app.generator import build_presentation, save_presentation
from app.storage_paths import (
    asset_path_by_id,
    delete_template,
    ensure_dirs,
    list_template_registry,
    new_asset_path,
    new_template_path,
    output_path,
    register_template_meta,
    template_path_by_id,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="课件 PPT 生成服务", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SubItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    label: str = ""
    lines: list[str] = Field(default_factory=list)


class OutlineSlide(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = "未命名"
    bullets: list[str] = Field(default_factory=list)
    contentLines: list[str] = Field(default_factory=list)
    sub_items: list[SubItem] | None = None
    subItems: list[SubItem] | None = None
    image_asset_id: str | None = None


class GenerateRequest(BaseModel):
    template_id: str
    course_title: str = "课程课件"
    cover_subtitle: str | None = None
    slides: list[OutlineSlide]
    title_layout_index: int = 0
    content_layout_index: int = 1
    asset_ids: list[str] = Field(default_factory=list)


def _slide_to_dict(s: OutlineSlide) -> dict[str, Any]:
    bullets = [x.strip() for x in s.bullets if x and str(x).strip()]
    if not bullets and s.contentLines:
        bullets = [x.strip() for x in s.contentLines if x and str(x).strip()]
    sub = s.sub_items or s.subItems
    sub_dicts = None
    if sub:
        sub_dicts = [{"label": it.label, "lines": it.lines} for it in sub]
    return {
        "title": s.title,
        "bullets": bullets,
        "sub_items": sub_dicts,
        "image_asset_id": s.image_asset_id,
    }


@app.on_event("startup")
def startup() -> None:
    ensure_dirs()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/upload/template")
async def upload_template(file: UploadFile = File(...)) -> dict[str, str]:
    """上传 .pptx 模板，返回 template_id。"""
    name = file.filename or "template.pptx"
    suffix = Path(name).suffix.lower() or ".pptx"
    if suffix not in (".pptx", ".ppt"):
        raise HTTPException(400, "请上传 .pptx 或 .ppt 模板")
    tid, path = new_template_path(suffix)
    data = await file.read()
    path.write_bytes(data)
    register_template_meta(tid, name)
    logger.info("template saved %s -> %s", tid, path)
    return {"template_id": tid, "filename": name}


@app.get("/api/templates")
def list_templates() -> dict[str, list[dict[str, str]]]:
    """已上传的讲义 PPT 模板列表（含原始文件名）。"""
    return {"templates": list_template_registry()}


@app.delete("/api/templates/{template_id}")
def remove_template(template_id: str) -> dict[str, str]:
    """删除已上传的讲义模板（注册表项 + 磁盘文件）。"""
    ok = delete_template(template_id)
    if not ok:
        raise HTTPException(404, "模板不存在或已删除")
    return {"ok": "true", "template_id": template_id}


@app.post("/api/upload/asset")
async def upload_asset(file: UploadFile = File(...)) -> dict[str, str]:
    """上传图片素材（png/jpg/webp 等），返回 asset_id。"""
    name = file.filename or "image.png"
    aid, path = new_asset_path(name)
    data = await file.read()
    path.write_bytes(data)
    logger.info("asset saved %s -> %s", aid, path)
    return {"asset_id": aid, "filename": name}


@app.post("/api/generate")
def generate(req: GenerateRequest) -> FileResponse:
    """根据 template_id、大纲与已上传的 asset_id 生成课件。"""
    tpl = template_path_by_id(req.template_id)
    if not tpl:
        raise HTTPException(404, "template_id 不存在或已过期")

    asset_paths: dict[str, Path] = {}
    for aid in req.asset_ids:
        p = asset_path_by_id(aid)
        if p:
            asset_paths[aid] = p

    for slide in req.slides:
        aid = slide.image_asset_id
        if aid:
            p = asset_path_by_id(aid)
            if p:
                asset_paths[aid] = p

    outline: dict[str, Any] = {
        "course_title": req.course_title,
        "cover_subtitle": (req.cover_subtitle or "").strip(),
        "slides": [_slide_to_dict(s) for s in req.slides],
    }

    try:
        prs = build_presentation(
            tpl,
            outline,
            asset_paths,
            title_layout_index=req.title_layout_index,
            content_layout_index=req.content_layout_index,
        )
    except Exception as e:
        logger.exception("build_presentation failed")
        raise HTTPException(500, f"生成失败: {e}") from e

    out = output_path()
    try:
        save_presentation(prs, out)
    except Exception as e:
        logger.exception("save failed")
        raise HTTPException(500, f"保存失败: {e}") from e

    return FileResponse(
        path=str(out),
        filename="课件.pptx",
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
    )
