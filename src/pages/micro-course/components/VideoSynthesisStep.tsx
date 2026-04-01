import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VOICE_OPTIONS = [
  { id: 'v1', name: '晓雪', gender: '女声', style: '温暖亲切', preview: '适合知识科普类微课' },
  { id: 'v2', name: '云逸', gender: '男声', style: '沉稳专业', preview: '适合管理培训类微课' },
  { id: 'v3', name: '晓桐', gender: '女声', style: '活泼轻松', preview: '适合入职引导类微课' },
  { id: 'v4', name: '明哲', gender: '男声', style: '激情励志', preview: '适合销售激励类微课' },
];

const SUBTITLE_STYLES = [
  { id: 'sub1', name: '标准白字', preview: '白色文字，黑色描边，居底部' },
  { id: 'sub2', name: '半透明条', preview: '半透明黑底白字，专业感强' },
  { id: 'sub3', name: '彩色强调', preview: '关键词高亮蓝色，提升记忆' },
];

const BGM_OPTIONS = [
  { id: 'b1', name: '轻快活力', style: '125bpm · 积极向上', icon: 'ri-music-2-line' },
  { id: 'b2', name: '专注深沉', style: '90bpm · 思考氛围', icon: 'ri-music-line' },
  { id: 'b3', name: '无背景音', style: '纯人声输出', icon: 'ri-volume-mute-line' },
];

interface VideoSynthesisStepProps {
  courseTitle: string;
  onBack: () => void;
}

const VideoSynthesisStep = ({ courseTitle, onBack }: VideoSynthesisStepProps) => {
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState('v1');
  const [selectedSubtitle, setSelectedSubtitle] = useState('sub2');
  const [selectedBgm, setSelectedBgm] = useState('b1');
  const [speed, setSpeed] = useState(1.0);
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthPhase, setSynthPhase] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const SYNTH_PHASES = [
    '正在处理脚本文本...',
    '合成AI配音...',
    '匹配画面素材...',
    '添加字幕轨道...',
    '混合背景音乐...',
    '输出最终视频...',
  ];

  const handleSynthesize = () => {
    setSynthesizing(true);
    setSynthPhase(0);
    setCompleted(false);

    let phase = 0;
    const timer = setInterval(() => {
      phase += 1;
      setSynthPhase(phase);
      if (phase >= SYNTH_PHASES.length - 1) {
        clearInterval(timer);
        setTimeout(() => {
          setSynthesizing(false);
          setCompleted(true);
        }, 600);
      }
    }, 700);
  };

  const handleComplete = () => {
    navigate('/ai-course');
  };

  return (
    <div className="flex gap-5 h-full">
      {/* ── Left: Settings Panel ── */}
      <div className="w-[360px] flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded-md">
              <i className="ri-settings-3-line text-white text-xs" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">视频合成配置</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Voice */}
          <div>
            <p className="text-[12px] font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
              <i className="ri-mic-line text-blue-500" />
              匹配音频（配音员）
            </p>
            <div className="space-y-2">
              {VOICE_OPTIONS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVoice(v.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedVoice === v.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${selectedVoice === v.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {v.name[0]}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-gray-800">{v.name} · {v.gender}</p>
                        <p className="text-[10px] text-gray-400">{v.style}</p>
                      </div>
                    </div>
                    {selectedVoice === v.id && <i className="ri-checkbox-circle-fill text-blue-500" />}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 ml-9">{v.preview}</p>
                </button>
              ))}
            </div>

            {/* Speed */}
            <div className="mt-3 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-gray-600 font-medium">语速</span>
                <span className="text-[11px] font-bold text-blue-600">{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.7}
                max={1.5}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-300 mt-0.5">
                <span>慢速 0.7x</span>
                <span>正常 1.0x</span>
                <span>快速 1.5x</span>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <p className="text-[12px] font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
              <i className="ri-closed-captioning-line text-blue-500" />
              输出字幕样式
            </p>
            <div className="space-y-2">
              {SUBTITLE_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubtitle(s.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedSubtitle === s.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-semibold text-gray-800">{s.name}</p>
                    {selectedSubtitle === s.id && <i className="ri-checkbox-circle-fill text-blue-500 text-sm" />}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.preview}</p>
                </button>
              ))}
            </div>
          </div>

          {/* BGM */}
          <div>
            <p className="text-[12px] font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
              <i className="ri-headphone-line text-blue-500" />
              背景音乐
            </p>
            <div className="space-y-2">
              {BGM_OPTIONS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBgm(b.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${
                    selectedBgm === b.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full ${selectedBgm === b.id ? 'bg-blue-600' : 'bg-gray-100'}`}>
                    <i className={`${b.icon} text-sm ${selectedBgm === b.id ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-gray-800">{b.name}</p>
                    <p className="text-[10px] text-gray-400">{b.style}</p>
                  </div>
                  {selectedBgm === b.id && <i className="ri-checkbox-circle-fill text-blue-500 text-sm" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <button
            type="button"
            onClick={handleSynthesize}
            disabled={synthesizing || completed}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white text-[13px] font-semibold rounded-lg cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 transition-all"
          >
            {synthesizing ? (
              <><i className="ri-loader-4-line animate-spin" />合成中...</>
            ) : completed ? (
              <><i className="ri-checkbox-circle-fill" />已合成完成</>
            ) : (
              <><i className="ri-video-line" />开始视频合成</>
            )}
          </button>
          <button type="button" onClick={onBack} className="w-full py-2 text-[12px] text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            ← 返回脚本设计
          </button>
        </div>
      </div>

      {/* ── Right: Preview & Output ── */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded-md">
              <i className="ri-play-circle-line text-white text-xs" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">输出微课视频</span>
          </div>
          {completed && (
            <span className="text-[11px] text-blue-600 flex items-center gap-1">
              <i className="ri-checkbox-circle-fill" />
              视频合成完成
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!synthesizing && !completed && (
            <div className="h-full flex flex-col items-center justify-center gap-5">
              <div className="w-full max-w-lg aspect-video bg-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                <img
                  src="https://readdy.ai/api/search-image?query=professional%20corporate%20training%20micro%20video%20preview%20screen%20dark%20background%20abstract%20motion%20graphics%20workplace%20learning%20content%20creation%20studio%20modern&width=640&height=360&seq=vidprev&orientation=landscape"
                  alt="preview"
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-40"
                />
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3">
                    <i className="ri-play-fill text-white text-2xl ml-1" />
                  </div>
                  <p className="text-white text-[13px] font-semibold">{courseTitle || '高效职场沟通三步法'}</p>
                  <p className="text-white/50 text-[11px] mt-1">配置参数后开始合成</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 w-full max-w-lg">
                {[
                  { icon: 'ri-time-line', label: '时长', value: '约5分钟' },
                  { icon: 'ri-hd-line', label: '分辨率', value: '1920×1080' },
                  { icon: 'ri-file-video-line', label: '格式', value: 'MP4 H.264' },
                  { icon: 'ri-database-2-line', label: '预估大小', value: '约45MB' },
                ].map((spec) => (
                  <div key={spec.label} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="w-6 h-6 flex items-center justify-center mx-auto mb-1">
                      <i className={`${spec.icon} text-blue-500`} />
                    </div>
                    <p className="text-[10px] text-gray-400">{spec.label}</p>
                    <p className="text-[11px] font-bold text-gray-700">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {synthesizing && (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (synthPhase + 1) / SYNTH_PHASES.length)}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[16px] font-black text-blue-600">
                    {Math.round(((synthPhase + 1) / SYNTH_PHASES.length) * 100)}%
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[15px] font-bold text-gray-800 mb-1">视频合成中...</p>
                <p className="text-[12px] text-blue-600">{SYNTH_PHASES[synthPhase]}</p>
              </div>

              <div className="w-full max-w-sm space-y-2">
                {SYNTH_PHASES.map((phase, idx) => (
                  <div key={phase} className={`flex items-center gap-3 text-[12px] transition-all ${idx <= synthPhase ? 'text-gray-700' : 'text-gray-300'}`}>
                    <div className={`w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${
                      idx < synthPhase ? 'bg-blue-600' : idx === synthPhase ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                    }`}>
                      {idx < synthPhase ? (
                        <i className="ri-check-line text-white text-[10px]" />
                      ) : idx === synthPhase ? (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      ) : null}
                    </div>
                    {phase}
                  </div>
                ))}
              </div>
            </div>
          )}

          {completed && (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <div className="w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full mx-auto mb-4">
                  <i className="ri-checkbox-circle-fill text-blue-600 text-4xl" />
                </div>
                <h3 className="text-[20px] font-black text-gray-800">微课视频合成成功！</h3>
                <p className="text-[13px] text-gray-500 mt-1">{courseTitle || '高效职场沟通三步法'}</p>
              </div>

              <div className="w-full max-w-md aspect-video bg-gray-900 rounded-xl overflow-hidden relative cursor-pointer group" onClick={() => setPreviewPlaying(!previewPlaying)}>
                <img
                  src="https://readdy.ai/api/search-image?query=completed%20professional%20corporate%20micro%20course%20training%20video%20output%20screen%20modern%20workplace%20communication%20coaching%20result%20success%20vibrant%20blue%20accent%20colors%20professional%20quality&width=640&height=360&seq=vidout&orientation=landscape"
                  alt="output video"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 flex items-center justify-center bg-white/20 rounded-full group-hover:bg-white/30 transition-all">
                    <i className={`text-white text-xl ${previewPlaying ? 'ri-pause-fill' : 'ri-play-fill ml-1'}`} />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: previewPlaying ? '35%' : '0%', transition: 'width 0.5s' }} />
                  </div>
                  <span className="text-[10px] text-white/80">4:52</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                {[
                  { label: '视频时长', value: '4分52秒', icon: 'ri-time-line' },
                  { label: '文件大小', value: '43.2 MB', icon: 'ri-file-video-line' },
                  { label: '质量评分', value: '96 / 100', icon: 'ri-star-line' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-blue-50 rounded-xl p-3.5 text-center border border-blue-100">
                    <div className="w-6 h-6 flex items-center justify-center mx-auto mb-1">
                      <i className={`${stat.icon} text-blue-600`} />
                    </div>
                    <p className="text-[16px] font-black text-blue-700">{stat.value}</p>
                    <p className="text-[10px] text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-white border border-gray-200 hover:border-blue-400 text-gray-700 text-[13px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                  <i className="ri-download-line text-blue-500" />
                  下载视频
                </button>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-white border border-gray-200 hover:border-blue-400 text-gray-700 text-[13px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                  <i className="ri-share-line text-blue-500" />
                  分享微课
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                >
                  <i className="ri-home-3-line" />
                  回到首页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSynthesisStep;
