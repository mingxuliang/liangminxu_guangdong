import { useState } from 'react';

interface Extraction {
  id: string;
  title: string;
  sourceCourse: string;
  tag: string;
  tagColor: string;
  coverImage: string;
  author: string;
  updatedAt: string;
  progress: number;
  itemCount: number;
  outputFormats: string[];
  steps: string[];
  completedSteps: number;
  passRate: number;
}

interface ExtractionCardProps {
  extraction: Extraction;
  onOpen: (id: string) => void;
}

const tagStyleMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

const progressGradMap: Record<string, string> = {
  blue: 'from-blue-400 to-blue-600',
  sky: 'from-sky-400 to-sky-600',
  indigo: 'from-indigo-400 to-indigo-600',
  cyan: 'from-cyan-400 to-cyan-500',
};

const ExtractionCard = ({ extraction, onOpen }: ExtractionCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const grad = progressGradMap[extraction.tagColor] || progressGradMap.blue;
  const tagStyle = tagStyleMap[extraction.tagColor] || tagStyleMap.blue;

  const steps = extraction.steps.map((label, i) => ({
    label,
    completed: i < extraction.completedSteps,
  }));

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => { if (!menuOpen) onOpen(extraction.id); }}
    >
      {/* Cover */}
      <div className="relative h-[148px] overflow-hidden flex-shrink-0">
        <img
          src={extraction.coverImage}
          alt={extraction.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Tag */}
        <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap backdrop-blur-sm ${tagStyle}`}>
          {extraction.tag}
        </span>

        {/* Progress overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/70 text-[10px]">萃取进度</span>
            <span className="text-white text-[10px] font-bold">{extraction.progress}%</span>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${grad} rounded-full`}
              style={{ width: `${extraction.progress}%` }}
            />
          </div>
        </div>

        {/* Menu */}
        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-7 h-7 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:bg-white hover:text-gray-900 transition-colors cursor-pointer shadow-sm"
          >
            <i className="ri-more-2-fill text-sm" />
          </button>
          {menuOpen && (
            <div className="absolute top-9 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-10 min-w-[100px]">
              {['继续萃取', '复制', '导出成果', '删除'].map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer whitespace-nowrap"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-1.5 line-clamp-2 flex-shrink-0">
          {extraction.title}
        </h3>
        <p className="text-[10px] text-gray-400 mb-3 truncate flex-shrink-0">
          <i className="ri-links-line mr-1" />
          来源：{extraction.sourceCourse}
        </p>

        {/* Steps timeline */}
        <div className="flex items-center gap-0 mb-1.5 flex-shrink-0">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 border ${
                step.completed
                  ? `bg-gradient-to-br ${grad} border-transparent shadow-sm`
                  : 'bg-white border-gray-300'
              }`} />
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-px ${step.completed ? `bg-gradient-to-r ${grad}` : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-1 mb-3 flex-shrink-0">
          {steps.map((step) => (
            <span
              key={step.label}
              className={`text-[9px] flex-1 text-center py-0.5 rounded whitespace-nowrap ${
                step.completed ? 'bg-blue-50 text-blue-600 font-medium' : 'bg-gray-50 text-gray-400'
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <i className="ri-file-list-3-line text-blue-400" />
            <span>{extraction.itemCount} 条知识</span>
          </div>
          {extraction.passRate > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-blue-600">
              <i className="ri-shield-check-line" />
              <span>通过率 {extraction.passRate}%</span>
            </div>
          )}
          <div className="flex gap-1 ml-auto flex-wrap justify-end">
            {extraction.outputFormats.slice(0, 2).map(fmt => (
              <span key={fmt} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full whitespace-nowrap">{fmt}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-[9px] font-bold">时</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-700 font-medium truncate">{extraction.author}</p>
              <p className="text-[9px] text-gray-400 whitespace-nowrap">修改 {extraction.updatedAt}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpen(extraction.id); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-semibold rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm shadow-blue-200 cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            <i className="ri-play-fill text-xs" />
            {extraction.progress === 100 ? '查看成果' : '继续萃取'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtractionCard;
