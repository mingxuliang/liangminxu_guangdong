import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ensurePostgresSchema, getPool, getSessionStoreDriver } from './db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data/sessions');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function buildSessionRecord(payload) {
  return {
    id: randomUUID(),
    mode: payload.mode ?? 'manual',
    course_id: payload.course_id ?? null,
    course_title: payload.course_title ?? null,
    material_selection: payload.material_selection ?? { outline: true, ppt: true, script: true },
    extract_goal: payload.extract_goal ?? '',
    project_name: typeof payload.project_name === 'string' ? payload.project_name : '',
    target_audience: payload.target_audience ?? '',
    use_scenes: Array.isArray(payload.use_scenes) ? payload.use_scenes : ['knowledge-base'],
    extraction_completed: false,
    status: 'draft',
    assets: [],
    anchor_package: null,
    error_message: null,
    updated_at: new Date().toISOString(),
  };
}

function normalizeSession(session) {
  return {
    ...session,
    assets: Array.isArray(session.assets) ? session.assets : [],
    updated_at: new Date().toISOString(),
  };
}

async function loadSessionFromFile(id) {
  ensureDir();
  const fp = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(fp)) return null;
  const raw = await fsp.readFile(fp, 'utf8');
  return JSON.parse(raw);
}

async function saveSessionToFile(session) {
  ensureDir();
  const normalized = normalizeSession(session);
  const fp = path.join(DATA_DIR, `${normalized.id}.json`);
  await fsp.writeFile(fp, JSON.stringify(normalized, null, 2), 'utf8');
  return normalized;
}

async function listSessionsFromFile() {
  ensureDir();
  if (!fs.existsSync(DATA_DIR)) return [];
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  const sessions = [];
  for (const f of files) {
    try {
      const raw = await fsp.readFile(path.join(DATA_DIR, f), 'utf8');
      sessions.push(JSON.parse(raw));
    } catch {
      /* 跳过损坏文件 */
    }
  }
  sessions.sort((a, b) => {
    const ta = new Date(a.updated_at || 0).getTime();
    const tb = new Date(b.updated_at || 0).getTime();
    return tb - ta;
  });
  return sessions;
}

function mapAssetRow(row) {
  const payload = row.payload || {};
  return {
    ...payload,
    id: row.id,
    kind: row.kind,
    original_name: row.original_name,
    storage: row.storage,
    path: row.path ?? undefined,
    oss_bucket: row.oss_bucket ?? undefined,
    oss_key: row.oss_key ?? undefined,
    size: row.size == null ? undefined : Number(row.size),
    mime: row.mime ?? undefined,
    audio_pending: row.audio_pending ?? undefined,
  };
}

async function loadAssetsForSessions(sessionIds) {
  if (sessionIds.length === 0) return new Map();
  const db = getPool();
  const { rows } = await db.query(
    `
      SELECT *
      FROM ke_assets
      WHERE session_id = ANY($1::text[])
      ORDER BY updated_at ASC, id ASC
    `,
    [sessionIds]
  );

  const grouped = new Map();
  for (const row of rows) {
    const items = grouped.get(row.session_id) || [];
    items.push(mapAssetRow(row));
    grouped.set(row.session_id, items);
  }
  return grouped;
}

function mapSessionRow(row, assets = []) {
  const payload = row.payload || {};
  return {
    ...payload,
    id: row.id,
    mode: row.mode,
    course_id: row.course_id,
    course_title: row.course_title,
    project_name: row.project_name || '',
    status: row.status,
    extraction_completed: row.extraction_completed,
    updated_at: new Date(row.updated_at).toISOString(),
    assets,
  };
}

async function loadSessionFromPostgres(id) {
  await ensurePostgresSchema();
  const db = getPool();
  const { rows } = await db.query(
    `
      SELECT *
      FROM ke_sessions
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );
  if (rows.length === 0) return null;
  const assetsBySession = await loadAssetsForSessions([id]);
  return mapSessionRow(rows[0], assetsBySession.get(id) || []);
}

async function saveSessionToPostgres(session) {
  await ensurePostgresSchema();
  const db = getPool();
  const normalized = normalizeSession(session);
  const { assets, ...payload } = normalized;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `
        INSERT INTO ke_sessions (
          id, mode, course_id, course_title, project_name, status, extraction_completed, updated_at, payload
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          mode = EXCLUDED.mode,
          course_id = EXCLUDED.course_id,
          course_title = EXCLUDED.course_title,
          project_name = EXCLUDED.project_name,
          status = EXCLUDED.status,
          extraction_completed = EXCLUDED.extraction_completed,
          updated_at = EXCLUDED.updated_at,
          payload = EXCLUDED.payload
      `,
      [
        normalized.id,
        normalized.mode ?? 'manual',
        normalized.course_id ?? null,
        normalized.course_title ?? null,
        normalized.project_name ?? '',
        normalized.status ?? 'draft',
        Boolean(normalized.extraction_completed),
        normalized.updated_at,
        JSON.stringify(payload),
      ]
    );

    await client.query('DELETE FROM ke_assets WHERE session_id = $1', [normalized.id]);

    for (const asset of assets) {
      const { id, kind, original_name, storage, path: localPath, oss_bucket, oss_key, size, mime, audio_pending, ...assetPayload } = asset;
      await client.query(
        `
          INSERT INTO ke_assets (
            id, session_id, kind, original_name, storage, path, oss_bucket, oss_key, size, mime, audio_pending, updated_at, payload
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)
        `,
        [
          id,
          normalized.id,
          kind ?? null,
          original_name ?? null,
          storage ?? null,
          localPath ?? null,
          oss_bucket ?? null,
          oss_key ?? null,
          size ?? null,
          mime ?? null,
          audio_pending ?? null,
          normalized.updated_at,
          JSON.stringify(assetPayload),
        ]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return normalized;
}

async function listSessionsFromPostgres() {
  await ensurePostgresSchema();
  const db = getPool();
  const { rows } = await db.query(
    `
      SELECT *
      FROM ke_sessions
      ORDER BY updated_at DESC
    `
  );
  const ids = rows.map((row) => row.id);
  const assetsBySession = await loadAssetsForSessions(ids);
  return rows.map((row) => mapSessionRow(row, assetsBySession.get(row.id) || []));
}

export async function loadSession(id) {
  return getSessionStoreDriver() === 'postgres'
    ? loadSessionFromPostgres(id)
    : loadSessionFromFile(id);
}

export async function saveSession(session) {
  return getSessionStoreDriver() === 'postgres'
    ? saveSessionToPostgres(session)
    : saveSessionToFile(session);
}

/** 列出全部会话（按 updated_at 降序） */
export async function listSessions() {
  return getSessionStoreDriver() === 'postgres'
    ? listSessionsFromPostgres()
    : listSessionsFromFile();
}

export async function createSessionRecord(payload) {
  const session = buildSessionRecord(payload);
  await saveSession(session);
  return session;
}
