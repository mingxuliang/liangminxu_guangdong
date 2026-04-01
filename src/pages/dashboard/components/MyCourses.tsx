import { useEffect, useMemo, useState } from 'react';
import { mockCourses, courseFilterOptions } from '../../../mocks/dashboard';
import { getSavedCourses } from '../../../utils/courseStorage';
import CourseCard from './CourseCard';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE_OPTIONS = [8, 12, 24] as const;

function getPageItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | 'ellipsis')[] = [];
  if (current <= 3) {
    for (let i = 1; i <= 4; i++) items.push(i);
    items.push('ellipsis');
    items.push(total);
  } else if (current >= total - 2) {
    items.push(1);
    items.push('ellipsis');
    for (let i = total - 3; i <= total; i++) items.push(i);
  } else {
    items.push(1);
    items.push('ellipsis');
    items.push(current - 1);
    items.push(current);
    items.push(current + 1);
    items.push('ellipsis');
    items.push(total);
  }
  return items;
}

const MyCourses = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('全部');
  const [searchVal, setSearchVal] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(12);
  const [jumpInput, setJumpInput] = useState('');

  // 合并用户新建课程（localStorage）+ mock 课程，新建的排在最前面
  const savedCourses = getSavedCourses();
  const allCourses = [...savedCourses, ...mockCourses];

  const filtered = useMemo(() => {
    const q = searchVal.trim().toLowerCase();
    return allCourses.filter((c) => {
      const matchFilter = activeFilter === '全部' || c.tag === activeFilter;
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [allCourses, activeFilter, searchVal]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedCourses = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchVal]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const goJump = () => {
    const n = parseInt(jumpInput.trim(), 10);
    if (Number.isNaN(n)) return;
    setPage(Math.min(Math.max(1, n), totalPages));
    setJumpInput('');
  };

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
          <h2 className="text-[15px] font-bold text-gray-800">我的课程</h2>
          <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        </div>

        {/* Search + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search box */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 hover:border-blue-300 focus-within:border-blue-400 focus-within:shadow-sm focus-within:shadow-blue-100 transition-all">
            <span className="w-4 h-4 flex items-center justify-center text-gray-400">
              <i className="ri-search-line text-sm" />
            </span>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="搜索课程或讲师"
              className="text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 w-36"
            />
            {searchVal && (
              <button
                type="button"
                onClick={() => setSearchVal('')}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-sm" />
              </button>
            )}
          </div>

          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
            title="刷新"
          >
            <i className="ri-refresh-line text-base" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/course/create')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md shadow-blue-200 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line text-sm" />
            新建课程
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {['全部', ...courseFilterOptions].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setActiveFilter(opt)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
              activeFilter === opt
                ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-2xl mb-4">
            <i className="ri-book-open-line text-3xl text-blue-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">暂无课程数据</p>
          <p className="text-xs mt-1 text-gray-400">尝试创建你的第一门课程吧~</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {pagedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>每页</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]);
                  setPage(1);
                }}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} 条
                  </option>
                ))}
              </select>
              <span className="text-gray-400">
                共 {filtered.length} 条，第 {safePage} / {totalPages} 页
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage(1)}
                className="min-w-[32px] h-8 px-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="首页"
              >
                <i className="ri-skip-back-line" />
              </button>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="min-w-[32px] h-8 px-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="上一页"
              >
                <i className="ri-arrow-left-s-line" />
              </button>

              {getPageItems(safePage, totalPages).map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-1 text-gray-400 text-xs">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      safePage === item
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="min-w-[32px] h-8 px-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="下一页"
              >
                <i className="ri-arrow-right-s-line" />
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage(totalPages)}
                className="min-w-[32px] h-8 px-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="末页"
              >
                <i className="ri-skip-forward-line" />
              </button>

              <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-gray-200">
                <span className="text-xs text-gray-500 whitespace-nowrap">跳转</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && goJump()}
                  placeholder={String(totalPages)}
                  className="w-12 h-8 px-2 text-xs text-center border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  aria-label="页码"
                />
                <button
                  type="button"
                  onClick={goJump}
                  className="h-8 px-3 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 cursor-pointer"
                >
                  前往
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default MyCourses;
