/**
 * Patches CourseOutlineEditor loading UI strings on disk (UTF-8).
 * Uses only ASCII + \\u escapes so the script file stays encoding-safe.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, '..', 'src/pages/course-create/components/CourseOutlineEditor.tsx');

let s = fs.readFileSync(p, 'utf8');

const T = '\u6b63\u5728\u751f\u6210\u56db\u7ea7\u5927\u7eb2';
const S =
  '\u667a\u80fd\u5f15\u64ce\u6b63\u7ed3\u5408\u5b66\u5458\u753b\u50cf\u3001\u8bfe\u7a0b\u76ee\u6807\u4e0e\u6559\u5b66\u8bbe\u8ba1\uff0c\u64b0\u5199\u4e0e\u9875\u9762\u4e00\u81f4\u7684\u5b8c\u6574\u5927\u7eb2\uff0c\u8bf7\u7a0d\u5019';
const L1 = '\u63d0\u70bc\u80cc\u666f\u4e0e\u6536\u76ca';
const L2 = '\u7f16\u6392\u56db\u7ea7\u7ed3\u6784';
const L3 = '\u5bf9\u9f50\u5b66\u65f6\u4e0e\u903b\u8f91';
const BTN = '\u4f7f\u7528\u793a\u4f8b\u5927\u7eb2\uff0c\u8df3\u8fc7\u7b49\u5f85';

const before = s;
s = s.replace('title="????????"', `title="${T}"`);
s = s.replace(
  'subtitle="??????????????????????????????????????"',
  `subtitle="${S}"`
);
s = s.replace(
  "stepLabels={['???????', '??????', '???????']}",
  `stepLabels={['${L1}', '${L2}', '${L3}']}`
);
s = s.replace('              ???????????', `              ${BTN}`);

if (s === before) {
  console.error('patch-outline-loading: no changes applied (patterns missing?)');
  process.exit(1);
}

fs.writeFileSync(p, s, 'utf8');
console.log('patched', p);
