import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

import { runKeAnchorWorkflow } from './lib/difyClient.mjs';
import { extractTextFromFile, mergeMaterialLines } from './lib/extractText.mjs';
import { createSessionRecord, loadSession, saveSession } from './lib/store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const UPLOAD_ROOT = path.join(__dirname, 'uploads');

const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 8787);

function ensureUploadDir(sessionId) {
  const dir = path.join(UPLOAD_ROOT, sessionId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'knowledge-extraction-api', time: new Date().toISOString() });
});

app.post('/api/knowledge-extraction/sessions', (req, res) => {
  try {
    const session = createSessionRecord(req.body || {});
    res.status(201).json(session);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.get('/api/knowledge-extraction/sessions/:id', (req, res) => {
  const s = loadSession(req.params.id);
  if (!s) return res.status(404).json({ error: 'not_found' });
  res.json(s);
});

app.patch('/api/knowledge-extraction/sessions/:id', (req, res) => {
  const s = loadSession(req.params.id);
  if (!s) return res.status(404).json({ error: 'not_found' });
  const b = req.body || {};
  if (b.mode != null) s.mode = b.mode;
  if (b.course_id !== undefined) s.course_id = b.course_id;
  if (b.course_title !== undefined) s.course_title = b.course_title;
  if (b.material_selection) s.material_selection = { ...s.material_selection, ...b.material_selection };
  if (b.extract_goal !== undefined) s.extract_goal = b.extract_goal;
  if (b.target_audience !== undefined) s.target_audience = b.target_audience;
  if (b.use_scenes) s.use_scenes = b.use_scenes;
  saveSession(s);
  res.json(s);
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const sid = req.params.id;
      cb(null, ensureUploadDir(sid));
    },
    filename: (_req, file, cb) => {
      const safe = `${Date.now()}-${file.originalname.replace(/[^\w.\-\u4e00-\u9fa5]/g, '_')}`;
      cb(null, safe);
    },
  }),
  limits: { fileSize: 80 * 1024 * 1024 },
});

app.post('/api/knowledge-extraction/sessions/:id/assets', upload.single('file'), (req, res) => {
  const s = loadSession(req.params.id);
  if (!s) return res.status(404).json({ error: 'not_found' });
  if (!req.file) return res.status(400).json({ error: 'file_required' });

  const kind = (req.body?.kind || 'manual_upload').toString();
  const extracted_text = extractTextFromFile(req.file.path, req.file.originalname);

  const asset = {
    id: randomUUID(),
    kind,
    original_name: req.file.originalname,
    path: path.relative(ROOT, req.file.path).replace(/\\/g, '/'),
    size: req.file.size,
    mime: req.file.mimetype,
    extracted_text,
  };
  s.assets = s.assets || [];
  s.assets.push(asset);
  saveSession(s);
  res.status(201).json(asset);
});

app.post('/api/knowledge-extraction/sessions/:id/anchor/run', async (req, res) => {
  const s = loadSession(req.params.id);
  if (!s) return res.status(404).json({ error: 'not_found' });

  if (!s.extract_goal?.trim()) {
    return res.status(400).json({ error: 'extract_goal_required' });
  }

  if (s.mode === 'manual' && (!s.assets || s.assets.length === 0)) {
    return res.status(400).json({ error: 'manual_requires_files' });
  }

  s.status = 'anchoring';
  s.error_message = null;
  saveSession(s);

  try {
    const material_bundle_text = mergeMaterialLines(s);
    const inputs = {
      mode: s.mode,
      extract_goal: s.extract_goal,
      target_audience: s.target_audience || '',
      use_scenes: JSON.stringify(s.use_scenes || []),
      course_title: s.course_title || '',
      material_bundle_text: material_bundle_text.slice(0, 100_000),
    };

    const result = await runKeAnchorWorkflow(inputs);
    s.anchor_package = result.anchor_package;
    s.status = 'ready';
    s.error_message = result.mock
      ? 'mock: 未配置 KE_ANCHOR_API_KEY，返回模拟锚定包'
      : null;
    saveSession(s);
    res.json(s);
  } catch (e) {
    s.status = 'failed';
    s.error_message = String(e?.message || e);
    saveSession(s);
    res.status(500).json({ error: s.error_message, session: s });
  }
});

/** 生产/Devbox：构建前端后由本进程托管 out/ */
const serveStatic = process.env.SERVE_STATIC === '1' || process.env.NODE_ENV === 'production';
const outDir = path.join(ROOT, 'out');
if (serveStatic && fs.existsSync(outDir)) {
  app.use(express.static(outDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(outDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`[ke-api] http://0.0.0.0:${PORT}  health: /api/health`);
});
