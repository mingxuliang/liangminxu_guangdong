import { memo } from 'react';

export interface Level3Item {
  id: string;
  content: string;
}

export interface Level2Item {
  id: string;
  name: string;
  level3Items: Level3Item[];
  duration: string;
  teachingFormat: string;
  materials: string;
}

export interface Level1Item {
  id: string;
  name: string;
  teachingGoal: string;
  level2Items: Level2Item[];
}

interface Props {
  items: Level1Item[];
  onChange: (items: Level1Item[]) => void;
}

const MODULE_COLORS = [
  { bg: 'bg-blue-600', light: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
  { bg: 'bg-teal-600', light: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-700' },
  { bg: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' },
  { bg: 'bg-rose-500', light: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700' },
];

const CourseOutlineTable = memo(({ items, onChange }: Props) => {
  const updateModule = (mIdx: number, field: 'name' | 'teachingGoal', val: string) => {
    const updated = items.map((m, i) => i === mIdx ? { ...m, [field]: val } : m);
    onChange(updated);
  };

  const updateSection = (mIdx: number, sIdx: number, field: keyof Omit<Level2Item, 'id' | 'level3Items'>, val: string) => {
    const updated = items.map((m, i) => {
      if (i !== mIdx) return m;
      const sections = m.level2Items.map((s, j) => j === sIdx ? { ...s, [field]: val } : s);
      return { ...m, level2Items: sections };
    });
    onChange(updated);
  };

  const updateKP = (mIdx: number, sIdx: number, kIdx: number, val: string) => {
    const updated = items.map((m, i) => {
      if (i !== mIdx) return m;
      const sections = m.level2Items.map((s, j) => {
        if (j !== sIdx) return s;
        const kps = s.level3Items.map((k, ki) => ki === kIdx ? { ...k, content: val } : k);
        return { ...s, level3Items: kps };
      });
      return { ...m, level2Items: sections };
    });
    onChange(updated);
  };

  return (
    <div className="mb-6">
      <h2 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded text-[11px] font-bold">二</span>
        三级大纲框架信息
      </h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-[12px] min-w-[900px]">
          <thead>
            <tr className="bg-gray-800 text-white">
              {['教学目标', '一级目录（大模块）', '二级目录（小节）', '三级目录（知识点）', '时长', '教学形式', '配套教材资源'].map((h, i) => (
                <th key={i} className="px-3 py-3 text-left text-[11px] font-semibold whitespace-nowrap border-r border-gray-700 last:border-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((module, mIdx) => {
              const color = MODULE_COLORS[mIdx % MODULE_COLORS.length];
              const totalSections = module.level2Items.length;

              return module.level2Items.map((section, sIdx) => (
                <tr
                  key={`${module.id}-${section.id}`}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/40 transition-colors"
                >
                  {/* Teaching Goal - rowspan */}
                  {sIdx === 0 && (
                    <td
                      rowSpan={totalSections}
                      className={`px-3 py-2.5 align-top border-r border-gray-100 ${color.light} ${color.border}`}
                      style={{ verticalAlign: 'top' }}
                    >
                      <textarea
                        className={`w-full min-w-[120px] text-[11px] bg-transparent resize-none focus:outline-none leading-relaxed ${color.text}`}
                        rows={5}
                        value={module.teachingGoal}
                        onChange={(e) => updateModule(mIdx, 'teachingGoal', e.target.value)}
                      />
                    </td>
                  )}

                  {/* Module Name - rowspan */}
                  {sIdx === 0 && (
                    <td
                      rowSpan={totalSections}
                      className={`px-3 py-2.5 align-middle border-r border-gray-100 ${color.light} ${color.border}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`w-5 h-5 flex-shrink-0 flex items-center justify-center ${color.bg} text-white rounded text-[10px] font-bold mt-0.5`}>
                          {mIdx + 1}
                        </span>
                        <textarea
                          className={`flex-1 text-[11px] font-semibold bg-transparent resize-none focus:outline-none leading-relaxed ${color.text}`}
                          rows={2}
                          value={module.name}
                          onChange={(e) => updateModule(mIdx, 'name', e.target.value)}
                        />
                      </div>
                    </td>
                  )}

                  {/* Section name */}
                  <td className="px-3 py-2.5 align-top border-r border-gray-100">
                    <textarea
                      className="w-full min-w-[110px] text-[11px] text-gray-700 bg-transparent resize-none focus:outline-none leading-relaxed"
                      rows={2}
                      value={section.name}
                      onChange={(e) => updateSection(mIdx, sIdx, 'name', e.target.value)}
                    />
                  </td>

                  {/* Knowledge points */}
                  <td className="px-3 py-2.5 align-top border-r border-gray-100">
                    <div className="space-y-1.5">
                      {section.level3Items.map((kp, kIdx) => (
                        <div key={kp.id} className="flex gap-1.5 items-start">
                          <span className="text-[9px] text-gray-400 mt-1.5 flex-shrink-0">▸</span>
                          <textarea
                            className="flex-1 min-w-[160px] text-[11px] text-gray-700 bg-transparent resize-none focus:outline-none leading-relaxed"
                            rows={1}
                            value={kp.content}
                            onChange={(e) => updateKP(mIdx, sIdx, kIdx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="px-3 py-2.5 align-top border-r border-gray-100">
                    <textarea
                      className="w-full min-w-[70px] text-[11px] text-gray-600 bg-transparent resize-none focus:outline-none leading-relaxed"
                      rows={2}
                      value={section.duration}
                      onChange={(e) => updateSection(mIdx, sIdx, 'duration', e.target.value)}
                    />
                  </td>

                  {/* Teaching format */}
                  <td className="px-3 py-2.5 align-top border-r border-gray-100">
                    <textarea
                      className="w-full min-w-[80px] text-[11px] text-gray-600 bg-transparent resize-none focus:outline-none leading-relaxed"
                      rows={2}
                      value={section.teachingFormat}
                      onChange={(e) => updateSection(mIdx, sIdx, 'teachingFormat', e.target.value)}
                    />
                  </td>

                  {/* Materials */}
                  <td className="px-3 py-2.5 align-top">
                    <textarea
                      className="w-full min-w-[100px] text-[11px] text-gray-600 bg-transparent resize-none focus:outline-none leading-relaxed"
                      rows={2}
                      value={section.materials}
                      onChange={(e) => updateSection(mIdx, sIdx, 'materials', e.target.value)}
                    />
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

CourseOutlineTable.displayName = 'CourseOutlineTable';

export default CourseOutlineTable;
