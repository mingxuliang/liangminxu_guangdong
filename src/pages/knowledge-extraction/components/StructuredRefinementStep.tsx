import { useEffect, useState } from 'react';
import {
  keGetSession,
  keRunRefine,
  type RefinementResult,
} from '../../../services/knowledgeExtractionApi';
import { pollRefineUntilSettled } from '../utils/longRunningSession';

interface StructuredRefinementStepProps {
  sessionId: string | null;
  onNext: (result: RefinementResult) => void;
  onPrev: () => void;
}

type TabKey = 'core' | 'case' | 'tool' | 'suggest';

const StructuredRefinementStep = ({ sessionId, onNext, onPrev }: StructuredRefinementStepProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('core');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [result, setResult] = useState<RefinementResult | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const ac = new AbortController();
    const { signal } = ac;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        let s = await keGetSession(sessionId);
        if (signal.aborted) return;

        const applyRefine = (sess: typeof s) => {
          const r = sess.refine_result;
          if (r && (r.core_knowledge?.length || r.case_materials?.length)) {
            setResult(r);
            setIsMock(Boolean(sess.refine_error?.startsWith('mock')));
            return true;
          }
          return false;
        };

        if (s.refine_status === 'ready') {
          if (applyRefine(s)) return;
          setError('结构化提炼返回数据为空，请检查工作流配置');
          return;
        }
        if (s.refine_status === 'failed') {
          setError(s.refine_error || '结构化提炼失败');
          return;
        }
        if (s.refine_status === 'running') {
          s = await pollRefineUntilSettled(sessionId, { signal });
          if (signal.aborted) return;
          if (applyRefine(s)) return;
          if (s.refine_status === 'failed') {
            setError(s.refine_error || '结构化提炼失败');
            return;
          }
          if (s.refine_status === 'running') {
            setError(
              '结构化提炼仍在服务端处理中，请稍后点击「重新提炼」或刷新页面；若 Dify 较慢属正常现象。',
            );
            return;
          }
        }

        s = await keRunRefine(sessionId);
        if (signal.aborted) return;
        if (!applyRefine(s)) {
          setError('结构化提炼返回数据为空，请检查工作流配置');
        }
      } catch (e) {
        const msg = String((e as Error)?.message ?? e);
        if (msg === 'Aborted') return;
        setError(msg);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [sessionId]);

  const tabs: { key: TabKey; label: string; icon: string; count: number }[] = [
    { key: 'core', label: '核心知识', icon: 'ri-star-line', count: result?.core_knowledge?.length ?? 0 },
    { key: 'case', label: '案例素材', icon: 'ri-file-copy-2-line', count: result?.case_materials?.length ?? 0 },
    { key: 'tool', label: '实操工具', icon: 'ri-tools-line', count: result?.practical_tools?.length ?? 0 },
    { key: 'suggest', label: '优化建议', icon: 'ri-lightbulb-line', count: result?.optimization_suggestions?.length ?? 0 },
  ];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
          <p className="text-sm font-bold mb-1">结构化提炼</p>
          <p className="text-xs text-blue-200">AI 正在将筛选后的知识整合为四层结构成果，请稍候…</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="w-14 h-14 flex items-center justify-center bg-blue-50 rounded-2xl">
              <i className="ri-loader-4-line text-blue-500 text-2xl animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 mb-1">正在结构化提炼…</p>
              <p className="text-xs text-gray-400">AI 正在将知识条目整合为核心知识、案例素材、实操工具、优化建议四层结构，通常需要 30-90 秒</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button type="button" onClick={onPrev} className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-arrow-left-line" />返回上一步
          </button>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white">
          <p className="text-sm font-bold mb-1">结构化提炼</p>
          <p className="text-xs text-red-100">提炼过程遇到问题，请检查配置或重试</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center px-6 max-w-sm">
            <div className="w-14 h-14 flex items-center justify-center bg-red-50 rounded-2xl">
              <i className="ri-error-warning-line text-red-400 text-2xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 mb-2">结构化提炼失败</p>
              <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl p-3 text-left">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => { setError(null); setLoading(true); if (sessionId) keRunRefine(sessionId).then(s => { setResult(s.refine_result ?? null); setIsMock(Boolean(s.refine_error?.startsWith('mock'))); }).catch(e => setError(String(e?.message ?? e))).finally(() => setLoading(false)); }}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line" />重新提炼
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button type="button" onClick={onPrev} className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-arrow-left-line" />返回上一步
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const coreList = result.core_knowledge ?? [];
  const caseList = result.case_materials ?? [];
  const toolList = result.practical_tools ?? [];
  const suggestList = result.optimization_suggestions ?? [];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold">结构化提炼成果</p>
              {isMock && (
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">演示数据</span>
              )}
            </div>
            <p className="text-xs text-blue-200">按「核心知识 - 案例素材 - 实操工具 - 优化建议」四层架构梳理</p>
          </div>
          <div className="flex items-center gap-4">
            {[
              { label: '知识条目', value: String(coreList.length) },
              { label: '案例素材', value: String(caseList.length) },
              { label: '实操工具', value: String(toolList.length) },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 flex-1 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 pt-3">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap mr-1 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className={`${tab.icon} text-sm`} />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'core' && (
            <div className="space-y-3">
              {coreList.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">暂无核心知识条目</div>
              ) : coreList.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {item.type}
                        </span>
                        {(item.tags ?? []).map(tag => (
                          <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-gray-800 mb-1.5">{item.title}</p>
                      {editingId === item.id ? (
                        <textarea
                          defaultValue={item.content}
                          className="w-full text-xs text-gray-600 border border-blue-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
                          rows={3}
                          onBlur={() => setEditingId(null)}
                          autoFocus
                        />
                      ) : (
                        <p className="text-xs text-gray-600 leading-relaxed">{item.content}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingId(item.id)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                      >
                        <i className="ri-edit-line text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'case' && (
            <div className="space-y-3">
              {caseList.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">暂无案例素材</div>
              ) : caseList.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-sky-100 rounded-xl flex-shrink-0">
                      <i className="ri-file-copy-2-line text-sky-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-800">{item.title}</p>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">来源：{item.source}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">{item.content}</p>
                      <div className="flex items-center gap-1.5">
                        <i className="ri-lightbulb-line text-amber-500 text-xs" />
                        <span className="text-[10px] text-amber-600 font-medium">{item.highlight}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tool' && (
            <div className="grid grid-cols-3 gap-3">
              {toolList.length === 0 ? (
                <div className="col-span-3 text-center py-10 text-xs text-gray-400">暂无实操工具</div>
              ) : toolList.map(item => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all cursor-pointer group">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-xl mb-3 group-hover:bg-blue-100 transition-colors">
                    <i className="ri-tools-line text-blue-500 text-base" />
                  </div>
                  <p className="text-xs font-bold text-gray-800 mb-1">{item.title}</p>
                  <span className="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{item.format}</span>
                  <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'suggest' && (
            <div className="space-y-3">
              {suggestList.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">暂无优化建议</div>
              ) : suggestList.map((item, idx) => (
                <div key={item.id} className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-all">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold ${
                    item.priority === 'high' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700 leading-relaxed">{item.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.priority === 'high' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.priority === 'high' ? '高优先级' : '中优先级'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-arrow-left-line" />
          返回上一步
        </button>
        <button
          type="button"
          onClick={() => onNext(result)}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          进入校验闭环
          <i className="ri-arrow-right-line" />
        </button>
      </div>
    </div>
  );
};

export default StructuredRefinementStep;
