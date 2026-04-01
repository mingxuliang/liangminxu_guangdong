"""本地文件存储：模板与素材按 UUID 命名。"""
from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE = BASE_DIR / "storage"
TEMPLATES = STORAGE / "templates"
REGISTRY = TEMPLATES / "_registry.json"
ASSETS = STORAGE / "assets"
OUTPUT = STORAGE / "output"


def ensure_dirs() -> None:
    for p in (TEMPLATES, ASSETS, OUTPUT):
        p.mkdir(parents=True, exist_ok=True)


def new_template_path(ext: str) -> tuple[str, Path]:
    ensure_dirs()
    tid = str(uuid.uuid4())
    ext = ext if ext.startswith(".") else f".{ext}"
    if ext.lower() not in (".pptx", ".ppt"):
        ext = ".pptx"
    path = TEMPLATES / f"{tid}{ext}"
    return tid, path


def new_asset_path(original_name: str) -> tuple[str, Path]:
    ensure_dirs()
    aid = str(uuid.uuid4())
    suffix = Path(original_name).suffix.lower() or ".bin"
    if suffix not in (".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"):
        suffix = ".png"
    path = ASSETS / f"{aid}{suffix}"
    return aid, path


def register_template_meta(template_id: str, original_filename: str) -> None:
    """记录上传时的原始文件名（如 2、《课程名》讲义PPT（模板）必填.pptx）。"""
    ensure_dirs()
    data: dict[str, dict[str, str]] = {}
    if REGISTRY.is_file():
        try:
            data = json.loads(REGISTRY.read_text(encoding="utf-8"))
        except Exception:
            data = {}
    data[template_id] = {
        "filename": original_filename,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    REGISTRY.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def list_template_registry() -> list[dict[str, str]]:
    """返回已上传模板列表。"""
    ensure_dirs()
    if not REGISTRY.is_file():
        return []
    try:
        data = json.loads(REGISTRY.read_text(encoding="utf-8"))
    except Exception:
        return []
    out: list[dict[str, str]] = []
    for tid, meta in data.items():
        if not isinstance(meta, dict):
            continue
        fn = meta.get("filename") or ""
        if template_path_by_id(tid):
            out.append({"template_id": tid, "filename": fn})
    return out


def template_path_by_id(template_id: str) -> Path | None:
    for ext in (".pptx", ".ppt"):
        p = TEMPLATES / f"{template_id}{ext}"
        if p.is_file():
            return p
    return None


def delete_template(template_id: str) -> bool:
    """从注册表移除并删除磁盘上的模板文件。若注册表项或文件任一存在则视为成功删除。"""
    ensure_dirs()
    tid = (template_id or "").strip()
    if not tid:
        return False

    removed_registry = False
    data: dict[str, dict[str, str]] = {}
    if REGISTRY.is_file():
        try:
            raw = json.loads(REGISTRY.read_text(encoding="utf-8"))
            if isinstance(raw, dict):
                data = raw  # type: ignore[assignment]
        except Exception:
            data = {}
    if tid in data:
        del data[tid]
        REGISTRY.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        removed_registry = True

    path = template_path_by_id(tid)
    removed_file = False
    if path and path.is_file():
        try:
            path.unlink()
            removed_file = True
        except OSError as e:
            logger.warning("unlink template file failed: %s", e)

    return removed_registry or removed_file


def asset_path_by_id(asset_id: str) -> Path | None:
    for p in ASSETS.glob(f"{asset_id}.*"):
        if p.is_file():
            return p
    return None


def output_path() -> Path:
    ensure_dirs()
    name = f"{uuid.uuid4()}.pptx"
    return OUTPUT / name
