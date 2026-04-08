import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data/sessions');

describe('store.mjs - Session Management', () => {
  let store;
  const testSessionIds = [];
  const originalDriver = process.env.KE_STORAGE_DRIVER;

  beforeEach(async () => {
    vi.resetModules();
    process.env.KE_STORAGE_DRIVER = 'file';

    if (fs.existsSync(DATA_DIR)) {
      const files = fs.readdirSync(DATA_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(DATA_DIR, file));
        }
      }
    }

    store = await import('../lib/store.mjs');
    testSessionIds.length = 0;
  });

  afterEach(() => {
    if (originalDriver === undefined) delete process.env.KE_STORAGE_DRIVER;
    else process.env.KE_STORAGE_DRIVER = originalDriver;
    for (const id of testSessionIds) {
      const fp = path.join(DATA_DIR, `${id}.json`);
      if (fs.existsSync(fp)) {
        fs.unlinkSync(fp);
      }
    }
  });

  describe('createSessionRecord', () => {
    it('should create a session with default values', async () => {
      const session = await store.createSessionRecord({});

      expect(session.id).toBeDefined();
      expect(session.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(session.mode).toBe('manual');
      expect(session.course_id).toBeNull();
      expect(session.course_title).toBeNull();
      expect(session.material_selection).toEqual({ outline: true, ppt: true, script: true });
      expect(session.extract_goal).toBe('');
      expect(session.project_name).toBe('');
      expect(session.target_audience).toBe('');
      expect(session.use_scenes).toEqual(['knowledge-base']);
      expect(session.status).toBe('draft');
      expect(session.extraction_completed).toBe(false);
      expect(session.assets).toEqual([]);
      expect(session.anchor_package).toBeNull();
      expect(session.error_message).toBeNull();
      expect(session.updated_at).toBeDefined();

      testSessionIds.push(session.id);
    });

    it('should create a session with custom mode', async () => {
      const session = await store.createSessionRecord({ mode: 'course' });

      expect(session.mode).toBe('course');
      testSessionIds.push(session.id);
    });

    it('should create a session with course_id and course_title', async () => {
      const session = await store.createSessionRecord({
        course_id: 'course-123',
        course_title: '测试课程'
      });

      expect(session.course_id).toBe('course-123');
      expect(session.course_title).toBe('测试课程');
      testSessionIds.push(session.id);
    });

    it('should create a session with custom material_selection', async () => {
      const session = await store.createSessionRecord({
        material_selection: { outline: true, ppt: false, script: false }
      });

      expect(session.material_selection).toEqual({ outline: true, ppt: false, script: false });
      testSessionIds.push(session.id);
    });

    it('should create a session with custom use_scenes', async () => {
      const session = await store.createSessionRecord({
        use_scenes: ['training', 'meeting']
      });

      expect(session.use_scenes).toEqual(['training', 'meeting']);
      testSessionIds.push(session.id);
    });

    it('should handle non-array use_scenes by defaulting to knowledge-base', async () => {
      const session = await store.createSessionRecord({
        use_scenes: 'invalid-scenarios'
      });

      expect(session.use_scenes).toEqual(['knowledge-base']);
      testSessionIds.push(session.id);
    });

    it('should create a session with extract_goal and target_audience', async () => {
      const session = await store.createSessionRecord({
        extract_goal: '萃取机器学习知识',
        target_audience: '初级开发者'
      });

      expect(session.extract_goal).toBe('萃取机器学习知识');
      expect(session.target_audience).toBe('初级开发者');
      testSessionIds.push(session.id);
    });

    it('should persist session to disk', async () => {
      const session = await store.createSessionRecord({});
      testSessionIds.push(session.id);

      const fp = path.join(DATA_DIR, `${session.id}.json`);
      expect(fs.existsSync(fp)).toBe(true);

      const loaded = JSON.parse(fs.readFileSync(fp, 'utf8'));
      expect(loaded.id).toBe(session.id);
    });
  });

  describe('loadSession', () => {
    it('should return null for non-existent session', async () => {
      const result = await store.loadSession('non-existent-id');
      expect(result).toBeNull();
    });

    it('should load existing session', async () => {
      const created = await store.createSessionRecord({ mode: 'course' });
      testSessionIds.push(created.id);

      const loaded = await store.loadSession(created.id);

      expect(loaded).toBeDefined();
      expect(loaded.id).toBe(created.id);
      expect(loaded.mode).toBe('course');
    });

    it('should load session with all properties', async () => {
      const created = await store.createSessionRecord({
        mode: 'course',
        course_id: 'c-001',
        course_title: 'Test Course',
        extract_goal: 'Extract knowledge',
        target_audience: 'Developers'
      });
      testSessionIds.push(created.id);

      const loaded = await store.loadSession(created.id);

      expect(loaded.course_id).toBe('c-001');
      expect(loaded.course_title).toBe('Test Course');
      expect(loaded.extract_goal).toBe('Extract knowledge');
      expect(loaded.target_audience).toBe('Developers');
    });
  });

  describe('saveSession', () => {
    it('should update session and set updated_at', async () => {
      const created = await store.createSessionRecord({});
      testSessionIds.push(created.id);
      await new Promise(resolve => setTimeout(resolve, 10));

      created.extract_goal = 'Updated goal';
      await store.saveSession(created);

      const loaded = await store.loadSession(created.id);
      expect(loaded.extract_goal).toBe('Updated goal');
      expect(loaded.updated_at).toBeDefined();
    });

    it('should update session status', async () => {
      const created = await store.createSessionRecord({});
      testSessionIds.push(created.id);

      created.status = 'anchoring';
      created.anchor_package = { summary: 'test' };
      await store.saveSession(created);

      const loaded = await store.loadSession(created.id);
      expect(loaded.status).toBe('anchoring');
      expect(loaded.anchor_package).toEqual({ summary: 'test' });
    });

    it('should update assets array', async () => {
      const created = await store.createSessionRecord({});
      testSessionIds.push(created.id);

      created.assets = [
        { id: 'asset-1', name: 'test.pdf', extracted_text: 'content' }
      ];
      await store.saveSession(created);

      const loaded = await store.loadSession(created.id);
      expect(loaded.assets).toHaveLength(1);
      expect(loaded.assets[0].id).toBe('asset-1');
    });
  });

  describe('listSessions', () => {
    it('should return all sessions sorted by updated_at desc', async () => {
      const a = await store.createSessionRecord({ extract_goal: 'A' });
      testSessionIds.push(a.id);
      await new Promise((r) => setTimeout(r, 15));
      const b = await store.createSessionRecord({ extract_goal: 'B' });
      testSessionIds.push(b.id);
      const list = await store.listSessions();
      expect(list.length).toBeGreaterThanOrEqual(2);
      expect(list[0].id).toBe(b.id);
    });
  });
});
