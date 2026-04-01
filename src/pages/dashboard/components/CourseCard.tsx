import { useState } from 'react';

interface Step {
  label: string;
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  coverImage: string;
  author: string;
  updatedAt: string;
  progress: number;
  steps: string[];
  completedSteps: number;
}

interface CourseCardProps {
  course: Course;
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

const getProgressColor = (progress: number) => {
  if (progress >= 70) return 'text-blue-600';
  if (progress >= 40) return 'text-sky-600';
  return 'text-indigo-400';
};

const CourseCard = ({ course }: CourseCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const steps: Step[] = course.steps.map((label, i) => ({
    label,
    completed: i < course.completedSteps,
  }));

  const grad = progressGradMap[course.tagColor] || progressGradMap.blue;
  const tagStyle = tagStyleMap[course.tagColor] || tagStyleMap.blue;

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => setMenuOpen(false)}
    >
      {/* Cover image */}
      <div className="relative h-[148px] overflow-hidden flex-shrink-0">
        <img
          src={course.coverImage}
          alt={course.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Tag badge */}
        <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap backdrop-blur-sm ${tagStyle}`}>
          {course.tag}
        </span>

        {/* Progress overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/70 text-[10px]">制作进度</span>
            <span className="text-white text-[10px] font-bold">{course.progress}%</span>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${grad} rounded-full`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {/* Menu */}
        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="w-7 h-7 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:bg-white hover:text-gray-900 transition-colors cursor-pointer shadow-sm"
          >
            <i className="ri-more-2-fill text-sm" />
          </button>
          {menuOpen && (
            <div className="absolute top-9 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-10 min-w-[100px]">
              {['编辑课程', '复制', '分享', '删除'].map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer whitespace-nowrap"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-3 line-clamp-2 flex-shrink-0">
          {course.title}
        </h3>

        {/* Steps timeline */}
        <div className="flex items-center gap-0 mb-2 flex-shrink-0">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex items-center flex-1">
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 flex items-center justify-center border ${
                  step.completed
                    ? `bg-gradient-to-br ${grad} border-transparent shadow-sm`
                    : 'bg-white border-gray-300'
                }`}
              >
                {step.completed && <i className="ri-check-line text-white text-[7px]" />}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-px ${
                    step.completed && steps[idx + 1].completed
                      ? `bg-gradient-to-r ${grad}`
                      : step.completed
                      ? `bg-gradient-to-r ${grad}`
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step labels */}
        <div className="flex gap-1 mb-3 flex-shrink-0 overflow-hidden">
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

        {/* Progress stat */}
        <div className="flex items-center gap-1.5 mb-3 flex-shrink-0">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${grad} rounded-full transition-all duration-700`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <span className={`text-[11px] font-bold ${getProgressColor(course.progress)}`}>
            {course.progress}%
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-[9px] font-bold">时</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-700 font-medium truncate">{course.author}</p>
              <p className="text-[9px] text-gray-400 whitespace-nowrap">修改 {course.updatedAt}</p>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-semibold rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm shadow-blue-200 cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            <i className="ri-play-fill text-xs" />
            开始制课
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
