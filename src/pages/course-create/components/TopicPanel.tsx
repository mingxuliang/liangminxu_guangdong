export interface CourseFormData {
  trainTarget: string;
  targetJobInfo: string;
  targetJobDuty: string;
  trainGoal: string;
  topicName: string;
  courseDuration: string;
}

/** 拟开发课程时长：仅允许 6 / 12 / 18 课时 */
const DURATION_OPTIONS = [
  { value: '6课时', label: '6 课时' },
  { value: '12课时', label: '12 课时' },
  { value: '18课时', label: '18 课时' },
] as const;

function normalizeCourseDuration(s: string): (typeof DURATION_OPTIONS)[number]['value'] {
  const t = s.trim();
  if (t === '6课时' || t === '12课时' || t === '18课时') return t;
  const m = t.match(/^(\d+)/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n <= 6) return '6课时';
    if (n <= 12) return '12课时';
    return '18课时';
  }
  return '6课时';
}

interface TopicPanelProps {
  form: CourseFormData;
  onFormChange: (key: keyof CourseFormData, val: string) => void;
  onGenerate: () => void;
  loading?: boolean;
}

interface FieldConfig {
  key: keyof CourseFormData;
  label: string;
  placeholder: string;
  rows: number;
  type?: 'textarea' | 'input';
}

const FIELDS: FieldConfig[] = [
  {
    key: 'trainTarget',
    label: '培训对象',
    placeholder: '请描述培训对象，如：企业中层管理者、销售团队骨干...',
    rows: 2,
  },
  {
    key: 'targetJobInfo',
    label: '培训对象岗位信息',
    placeholder: '请填写培训对象的岗位信息，如：产品经理、技术负责人...',
    rows: 2,
  },
  {
    key: 'targetJobDuty',
    label: '培训对象工作职责',
    placeholder: '请填写工作职责，如：负责产品规划、推动团队协作...',
    rows: 3,
  },
  {
    key: 'trainGoal',
    label: '培训目标',
    placeholder: '请填写培训目标，如：掌握AI工具提升工作效率...',
    rows: 3,
  },
  {
    key: 'topicName',
    label: '拟开发的课题名称',
    placeholder: '请填写您想开发的课程主题，如：agent工程师培训...',
    rows: 2,
  },
];

const CourseDurationControl = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const selected = normalizeCourseDuration(value);

  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-[13px] font-medium text-gray-800 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        aria-label="拟开发课程时长"
      >
        {DURATION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <i className="ri-arrow-down-s-line pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
};

const TopicPanel = ({ form, onFormChange, onGenerate, loading }: TopicPanelProps) => {
  const isFormValid = Object.values(form).some((v) => v.trim().length > 0);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-50 px-6 pb-4 pt-5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-50">
            <i className="ri-file-text-line text-xs text-blue-600" />
          </div>
          <span className="text-[14px] font-bold text-gray-800">填写课程信息</span>
        </div>
        <p className="ml-8 mt-1 text-[11px] text-gray-400">完整填写后 AI 将生成课题评估报告</p>
      </div>

      {/* Form fields */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block text-[12px] font-semibold text-gray-700">{field.label}</label>
            <textarea
              value={form[field.key]}
              onChange={(e) => onFormChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-[13px] leading-relaxed text-gray-700 placeholder:text-gray-300 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}

        <div>
          <label className="mb-1.5 block text-[12px] font-semibold text-gray-700">拟开发课程时长</label>
          <CourseDurationControl
            value={form.courseDuration}
            onChange={(v) => onFormChange('courseDuration', v)}
          />
        </div>
      </div>

      {/* Generate button */}
      <div className="flex-shrink-0 border-t border-gray-50 px-6 pb-6 pt-4">
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || !isFormValid}
          className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 py-3 text-[13px] font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin" />
              智能生成中…
            </>
          ) : (
            <>
              <i className="ri-sparkling-2-line" />
              生成评估报告
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TopicPanel;
