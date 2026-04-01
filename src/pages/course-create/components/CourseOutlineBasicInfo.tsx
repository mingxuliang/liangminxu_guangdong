import { memo } from 'react';

export interface BasicInfo {
  courseName: string;
  trainingTarget: string;
  courseDuration: string;
  courseIntro: string;
  knowledgeGoals: string[];
  skillGoals: string[];
  attitudeGoals: string[];
}

interface Props {
  data: BasicInfo;
  onChange: (data: BasicInfo) => void;
}

const FIELD_LIST = [
  { key: 'courseName' as const, label: '1、课程名称', multiline: false },
  { key: 'trainingTarget' as const, label: '2、培训对象', multiline: false },
  { key: 'courseDuration' as const, label: '3、课程时长', multiline: false },
  { key: 'courseIntro' as const, label: '4、课程简介', multiline: true },
];

const GOAL_CATS = [
  { type: 'knowledgeGoals' as const, label: '知识目标', borderColor: 'border-blue-200', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  { type: 'skillGoals' as const, label: '技能目标', borderColor: 'border-green-200', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  { type: 'attitudeGoals' as const, label: '态度目标', borderColor: 'border-amber-200', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
];

const CourseOutlineBasicInfo = memo(({ data, onChange }: Props) => {
  const updateField = (key: keyof BasicInfo, val: string) => {
    onChange({ ...data, [key]: val });
  };

  const updateGoal = (type: 'knowledgeGoals' | 'skillGoals' | 'attitudeGoals', idx: number, val: string) => {
    const arr = [...data[type]];
    arr[idx] = val;
    onChange({ ...data, [type]: arr });
  };

  return (
    <div className="mb-8">
      <h2 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded text-[11px] font-bold">一</span>
        基本信息
      </h2>
      <div className="space-y-3 pl-5 border-l-2 border-blue-100">
        {FIELD_LIST.map((field) => (
          <div key={field.key} className="flex items-start gap-4">
            <span className="text-[12px] text-gray-500 w-28 flex-shrink-0 pt-2">{field.label}</span>
            {field.multiline ? (
              <textarea
                rows={3}
                className="flex-1 text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-blue-400 focus:bg-white transition-all leading-relaxed"
                value={data[field.key] as string}
                onChange={(e) => updateField(field.key, e.target.value)}
              />
            ) : (
              <input
                className="flex-1 text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                value={data[field.key] as string}
                onChange={(e) => updateField(field.key, e.target.value)}
              />
            )}
          </div>
        ))}

        {/* Course Goals */}
        <div className="flex items-start gap-4">
          <span className="text-[12px] text-gray-500 w-28 flex-shrink-0 pt-1">5、课程目标</span>
          <div className="flex-1 space-y-3">
            {GOAL_CATS.map((cat) => (
              <div key={cat.type} className={`rounded-xl border ${cat.borderColor} ${cat.bgColor} p-3`}>
                <p className={`text-[11px] font-bold mb-2 ${cat.textColor}`}>{cat.label}</p>
                <div className="space-y-2">
                  {data[cat.type].map((goal, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className={`text-[10px] font-bold mt-2.5 flex-shrink-0 opacity-60 ${cat.textColor}`}>{idx + 1}.</span>
                      <textarea
                        rows={2}
                        className="flex-1 text-[12px] text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:border-blue-400 transition-all leading-relaxed"
                        value={goal}
                        onChange={(e) => updateGoal(cat.type, idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

CourseOutlineBasicInfo.displayName = 'CourseOutlineBasicInfo';

export default CourseOutlineBasicInfo;
