import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data/sessions');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadSession(id) {
  ensureDir();
  const fp = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

export function saveSession(session) {
  ensureDir();
  session.updated_at = new Date().toISOString();
  const fp = path.join(DATA_DIR, `${session.id}.json`);
  fs.writeFileSync(fp, JSON.stringify(session, null, 2), 'utf8');
}

export function createSessionRecord(payload) {
  const id = randomUUID();
  const session = {
    id,
    mode: payload.mode ?? 'manual',
    course_id: payload.course_id ?? null,
    course_title: payload.course_title ?? null,
    material_selection: payload.material_selection ?? { outline: true, ppt: true, script: true },
    extract_goal: payload.extract_goal ?? '',
    target_audience: payload.target_audience ?? '',
    use_scenes: Array.isArray(payload.use_scenes) ? payload.use_scenes : ['knowledge-base'],
    status: 'draft',
    assets: [],
    anchor_package: null,
    error_message: null,
    updated_at: new Date().toISOString(),
  };
  saveSession(session);
  return session;
}
