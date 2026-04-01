import { useState } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';

import { COURSE_SCRIPTS } from '../../../mocks/courseScripts';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

type ScriptStatus = 'idle' | 'generating' | 'done';

interface ScriptState {
  id: string;
  status: ScriptStatus;
}

const CourseScriptEditor = ({ onBack, onNext }: Props) => {
  const [scriptStates, setScriptStates] = useState<ScriptState[]>(
    COURSE_SCRIPTS.map(s => ({ id: s.id, status: 'idle' }))
  );
  const [selectedId, setSelectedId] = useState(COURSE_SCRIPTS[0].id);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editCell, setEditCell] = useState<{ field: string; value: string } | null>(null);
  const [allGenLoading, setAllGenLoading] = useState(false);
  const [outputDone, setOutputDone] = useState(false);
  const [outputLoading, setOutputLoading] = useState(false);

  const selectedScript = COURSE_SCRIPTS.find(s => s.id === selectedId)!;
  const selectedState = scriptStates.find(s => s.id === selectedId)!;
  const doneCount = scriptStates.filter(s => s.status === 'done').length;
  const allDone = doneCount === COURSE_SCRIPTS.length;

  const generateScript = (id: string) => {
    setScriptStates(prev => prev.map(s => s.id === id ? { ...s, status: 'generating' } : s));
    setTimeout(() => {
      setScriptStates(prev => prev.map(s => s.id === id ? { ...s, status: 'done' } : s));
    }, 1600 + Math.random() * 700);
  };

  const generateAll = () => {
    const pending = scriptStates.filter(s => s.status === 'idle');
    if (!pending.length) return;
    setAllGenLoading(true);
    pending.forEach((s, i) => {
      setTimeout(() => {
        setScriptStates(prev => prev.map(p => p.id === s.id ? { ...p, status: 'generating' } : p));
        setTimeout(() => {
          setScriptStates(prev => prev.map(p => p.id === s.id ? { ...p, status: 'done' } : p));
          if (i === pending.length - 1) setAllGenLoading(false);
        }, 1600 + Math.random() * 600);
      }, i * 500);
    });
  };

  const handleOutput = () => {
    setOutputLoading(true);
    setTimeout(() => { setOutputLoading(false); setOutputDone(true); }, 2200);
  };

  const StatusBadge = ({ status }: { status: ScriptStatus }) => {
    if (status === 'idle') return <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">未生成</span>;
    if (status === 'generating') return (
      <span className="flex items-center gap-0.5 text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 whitespace-nowrap">
        <i className="ri-loader-4-line animate-spin text-[9px]" />生成中
      </span>
    );
    return (
      <span className="flex items-center gap-0.5 text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 whitespace-nowrap">
        <i className="ri-check-line text-[9px]" />已完成
      </span>
    );
  };

  const totalDuration = selectedScript.rows.reduce((sum, r) => {
    const n = parseInt(r.duration);
    return sum + (Number.isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center bg-blue-50 rounded-lg flex-shrink-0">
            <i className="ri-film-line text-blue-600 text-sm" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-800">课程脚本</p>
            <p className="text-[11px] text-gray-400">微课脚本标准化输出 · 分镜式格式 · 共 {COURSE_SCRIPTS.length} 节</p>
          </div>
          <div className="ml-2 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full border border-blue-100">
              已完成 {doneCount}/{COURSE_SCRIPTS.length}
            </span>
            <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-medium rounded-full border border-gray-100">
              单节1-2分钟 · 聚焦1个知识点
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${(doneCount / COURSE_SCRIPTS.length) * 100}%` }} />
          </div>
          <span className="text-[10px] text-gray-400">{Math.round((doneCount / COURSE_SCRIPTS.length) * 100)}%</span>
          <button type="button" onClick={generateAll} disabled={allGenLoading || allDone}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer whitespace-nowrap transition-all ${
              allDone ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : allGenLoading ? 'bg-blue-50 text-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}>
            {allGenLoading ? <><i className="ri-loader-4-line animate-spin text-xs" />批量生成中...</>
              : allDone ? <><i className="ri-check-line text-xs" />全部已生成</>
              : <><i className="ri-magic-line text-xs" />一键全部生成</>}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: Script list */}
        <div className="w-[230px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-3 bg-blue-500 rounded-full" />
              <span className="text-[11px] font-bold text-gray-700">微课脚本列表</span>
              <span className="text-[10px] text-gray-400 ml-1">{COURSE_SCRIPTS.length}节</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {COURSE_SCRIPTS.map(script => {
              const state = scriptStates.find(s => s.id === script.id)!;
              const isSelected = script.id === selectedId;
              return (
                <button key={script.id} type="button" onClick={() => setSelectedId(script.id)}
                  className={`w-full text-left rounded-lg border-2 p-2.5 cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>{script.code}</span>
                    <StatusBadge status={state.status} />
                  </div>
                  <p className={`text-[11px] font-medium leading-tight mb-1.5 line-clamp-2 ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                    {script.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-400">{script.totalDuration} · {script.rows.length}个镜头</span>
                    <button type="button" onClick={e => { e.stopPropagation(); generateScript(script.id); }}
                      disabled={state.status !== 'idle'}
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium cursor-pointer whitespace-nowrap transition-all ${
                        state.status === 'done' ? 'text-blue-600 bg-blue-50'
                        : state.status === 'generating' ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                      }`}>
                      {state.status === 'done' ? '已生成' : state.status === 'generating' ? '生成中' : '生成'}
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Script detail */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Script toolbar */}
          <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${selectedState.status === 'done' ? 'bg-blue-50 text-blue-600' : 'bg-blue-50 text-blue-600'}`}>
                {selectedScript.code}
              </span>
              <span className="text-[12px] font-bold text-gray-800">{selectedScript.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedState.status} />
              {selectedState.status !== 'done' ? (
                <button type="button" onClick={() => generateScript(selectedScript.id)}
                  disabled={selectedState.status === 'generating'}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer whitespace-nowrap transition-all ${
                    selectedState.status === 'generating' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                  {selectedState.status === 'generating' ? <><i className="ri-loader-4-line animate-spin text-xs" />生成中...</> : <><i className="ri-magic-line text-xs" />生成此脚本</>}
                </button>
              ) : (
                <button type="button"
                  className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-[11px] rounded-lg cursor-pointer whitespace-nowrap transition-all">
                  <i className="ri-download-line text-xs" />导出脚本
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {selectedState.status === 'idle' && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-50">
                  <i className="ri-film-line text-blue-400 text-3xl" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold text-gray-700 mb-1">{selectedScript.code} · {selectedScript.title}</p>
                  <p className="text-[12px] text-gray-400 mb-0.5">核心目标：{selectedScript.learningGoal}</p>
                  <p className="text-[11px] text-gray-300">{selectedScript.rows.length}个分镜 · 预计时长 {selectedScript.totalDuration}</p>
                </div>
                <button type="button" onClick={() => generateScript(selectedScript.id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-all">
                  <i className="ri-magic-line" />生成 {selectedScript.code} 脚本
                </button>
              </div>
            )}

            {selectedState.status === 'generating' && (
              <div className="flex h-full min-h-[260px] flex-col">
                <GenerationProgressScreen
                  layout="embedded"
                  title="正在生成微课脚本"
                  subtitle="智能引擎正在将课件知识转化为口播脚本，请稍候"
                  stepLabels={['提取知识点', '编排分镜结构', '口语化润色']}
                  className="flex-1 justify-center py-4"
                />
              </div>
            )}

            {selectedState.status === 'done' && (
              <div className="p-5 flex flex-col gap-4">
                {/* Script header info */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2">
                    <span className="w-1 h-3.5 bg-blue-500 rounded-full" />
                    <span className="text-[11px] font-bold text-gray-700">通用脚本表头（每节脚本统一固定信息）</span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-gray-100">
                    {[
                      { label: '微课编号', value: selectedScript.code },
                      { label: '微课标题', value: selectedScript.title },
                      { label: '总时长', value: selectedScript.totalDuration + `（累计约${totalDuration}秒）` },
                      { label: '适配人群', value: selectedScript.audience },
                      { label: '核心学习目标', value: selectedScript.learningGoal },
                      { label: '素材来源', value: selectedScript.sourceModule },
                    ].map((item, i) => (
                      <div key={i} className={`px-4 py-2.5 ${i % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-100'}`}>
                        <p className="text-[9px] text-gray-400 font-medium mb-0.5">{item.label}</p>
                        <p className="text-[11px] text-gray-700 font-medium leading-snug">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 bg-blue-50/60 border-t border-blue-100 flex items-start gap-2">
                    <i className="ri-information-line text-blue-500 text-xs mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-blue-700 leading-relaxed">
                      单节微课时长严格控制在1-2分钟，聚焦1个核心知识点。脚本语言口语化、通俗化，杜绝书面化长句，配音台词单句不超过20字，避免复杂专业术语。
                    </p>
                  </div>
                </div>

                {/* Script body table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-3.5 bg-blue-500 rounded-full" />
                      <span className="text-[11px] font-bold text-gray-700">分镜式脚本主体表格（核心输出格式）</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><i className="ri-edit-line text-gray-300" />双击单元格可编辑</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-gray-50">
                          {['镜头/段落', '画面内容（可视化呈现）', '配音台词（口语化）', '素材/道具提示', '时长', '备注'].map((h, i) => (
                            <th key={i} className={`border border-gray-200 px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap ${
                              i === 0 ? 'w-[80px]' : i === 1 ? 'w-[22%]' : i === 2 ? 'w-[28%]' : i === 3 ? 'w-[18%]' : i === 4 ? 'w-[60px]' : 'w-[12%]'
                            }`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedScript.rows.map((row, ri) => (
                          <tr key={row.id} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            {/* Shot */}
                            <td className="border border-gray-200 px-3 py-2.5 align-top">
                              <div className="flex flex-col items-center gap-1">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center flex-shrink-0">{ri + 1}</span>
                                <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">{row.shot}</span>
                              </div>
                            </td>
                            {/* Visual */}
                            <EditableCell
                              value={row.visual}
                              isEditing={editingRowId === row.id && editCell?.field === 'visual'}
                              editValue={editCell?.field === 'visual' && editingRowId === row.id ? editCell.value : ''}
                              onDoubleClick={() => { setEditingRowId(row.id); setEditCell({ field: 'visual', value: row.visual }); }}
                              onEdit={v => setEditCell({ field: 'visual', value: v })}
                              onBlur={() => { setEditingRowId(null); setEditCell(null); }}
                              className="text-gray-600"
                            />
                            {/* Voiceover */}
                            <EditableCell
                              value={row.voiceover}
                              isEditing={editingRowId === row.id && editCell?.field === 'voiceover'}
                              editValue={editCell?.field === 'voiceover' && editingRowId === row.id ? editCell.value : ''}
                              onDoubleClick={() => { setEditingRowId(row.id); setEditCell({ field: 'voiceover', value: row.voiceover }); }}
                              onEdit={v => setEditCell({ field: 'voiceover', value: v })}
                              onBlur={() => { setEditingRowId(null); setEditCell(null); }}
                              className="text-gray-700 font-medium"
                            />
                            {/* Props */}
                            <EditableCell
                              value={row.props}
                              isEditing={editingRowId === row.id && editCell?.field === 'props'}
                              editValue={editCell?.field === 'props' && editingRowId === row.id ? editCell.value : ''}
                              onDoubleClick={() => { setEditingRowId(row.id); setEditCell({ field: 'props', value: row.props }); }}
                              onEdit={v => setEditCell({ field: 'props', value: v })}
                              onBlur={() => { setEditingRowId(null); setEditCell(null); }}
                              className="text-blue-600"
                            />
                            {/* Duration */}
                            <td className="border border-gray-200 px-3 py-2.5 align-top text-center">
                              <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">{row.duration}</span>
                            </td>
                            {/* Notes */}
                            <EditableCell
                              value={row.notes || '—'}
                              isEditing={editingRowId === row.id && editCell?.field === 'notes'}
                              editValue={editCell?.field === 'notes' && editingRowId === row.id ? editCell.value : ''}
                              onDoubleClick={() => { setEditingRowId(row.id); setEditCell({ field: 'notes', value: row.notes || '' }); }}
                              onEdit={v => setEditCell({ field: 'notes', value: v })}
                              onBlur={() => { setEditingRowId(null); setEditCell(null); }}
                              className="text-gray-400"
                            />
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-blue-50">
                          <td className="border border-gray-200 px-3 py-2 text-center">
                            <span className="text-[10px] font-bold text-blue-700">合计</span>
                          </td>
                          <td colSpan={3} className="border border-gray-200 px-3 py-2">
                            <span className="text-[10px] text-gray-500">{selectedScript.rows.length}个分镜 · 知识点聚焦：{selectedScript.learningGoal.slice(0, 20)}…</span>
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center">
                            <span className="text-[10px] font-bold text-blue-700">{totalDuration}秒</span>
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <span className="text-[9px] text-gray-400">脚本注意事项：配音台词单句≤20字，画面与配音同步，不使用无版权素材</span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Standards reminder */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-2.5">
                  <i className="ri-shield-check-line text-gray-400 text-sm mt-0.5 flex-shrink-0" />
                  <div className="text-[10px] text-gray-500 leading-relaxed">
                    <span className="font-semibold text-gray-600">脚本主体注意事项：</span>
                    配音台词严禁长篇大论，单句台词不超过20字，口语化无生僻词；画面内容与配音完全同步，不出现音画脱节；时长分配精准，核心知识点讲解占比不低于总时长的60%；素材全部源自前期成果，不使用无版权、无关素材；每节脚本结尾必须有精简总结，强化记忆点。
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Output section */}
          <div className="flex-shrink-0 border-t-2 border-blue-100 bg-blue-50/60">
            <div className="px-5 py-2 border-b border-blue-100 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-blue-500 rounded-full" />
              <span className="text-[12px] font-bold text-blue-700">全部微课脚本生成完成后，输出完整脚本库</span>
            </div>
            <div className="px-5 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {!allDone ? (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1.5">
                    <i className="ri-information-line" />还有 {COURSE_SCRIPTS.length - doneCount} 节脚本未生成
                  </span>
                ) : outputDone ? (
                  <span className="text-[11px] text-blue-600 flex items-center gap-1.5">
                    <i className="ri-checkbox-circle-fill" />脚本库已输出，共 {COURSE_SCRIPTS.length} 节微课脚本，{COURSE_SCRIPTS.reduce((sum, s) => sum + s.rows.length, 0)} 个分镜
                  </span>
                ) : (
                  <span className="text-[11px] text-blue-700 flex items-center gap-1.5">
                    <i className="ri-checkbox-circle-fill" />全部脚本生成完毕，可以输出脚本库
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleOutput} disabled={outputLoading || outputDone || !allDone}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-all ${
                    outputDone ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : outputLoading ? 'bg-gray-100 text-gray-400'
                    : allDone ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}>
                  {outputLoading ? <><i className="ri-loader-4-line animate-spin" />打包中...</>
                    : outputDone ? <><i className="ri-check-line" />脚本库已输出</>
                    : <><i className="ri-folder-zip-line" />输出微课脚本库</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-[12px] font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap">
          <i className="ri-arrow-left-line text-sm" />上一步：讲师手册
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <i className="ri-star-fill text-blue-400" />八步成诗 · 最后一步
          </span>
          <button type="button" onClick={onNext} disabled={!outputDone}
            className={`flex items-center gap-1.5 px-6 py-2 rounded-lg text-[12px] font-semibold cursor-pointer whitespace-nowrap transition-all ${
              outputDone ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}>
            课程制作完成，去查看成果 <i className="ri-award-line text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* Editable cell sub-component */
const EditableCell = ({
  value, isEditing, editValue, onDoubleClick, onEdit, onBlur, className,
}: {
  value: string; isEditing: boolean; editValue: string;
  onDoubleClick: () => void; onEdit: (v: string) => void; onBlur: () => void; className?: string;
}) => (
  <td
    className={`border border-gray-200 px-3 py-2.5 align-top cursor-text ${isEditing ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : 'hover:bg-blue-50/20'}`}
    onDoubleClick={onDoubleClick}
  >
    {isEditing ? (
      <textarea
        autoFocus
        value={editValue}
        onChange={e => onEdit(e.target.value)}
        onBlur={onBlur}
        className="w-full min-h-[60px] text-[11px] text-gray-700 bg-transparent resize-none outline-none leading-relaxed"
      />
    ) : (
      <p className={`text-[11px] leading-relaxed ${className}`}>{value}</p>
    )}
  </td>
);

export default CourseScriptEditor;
