import { useState } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';

const MOCK_SCENES = [
  {
    id: 'sc1',
    segment: '开场白',
    time: '0:00-0:30',
    scriptText: '你有没有遇到过这样的情况——发出去的消息，对方回复"好的"，但最后根本没按你说的做？',
    sceneType: '真实场景',
    sceneDesc: '现代化办公室，职场人盯着手机屏幕，表情困惑，背景有其他同事在忙碌',
    visualElements: ['职场环境', '手机特写', '困惑表情', '自然光线'],
    transition: '渐入',
    imageUrl: 'https://readdy.ai/api/search-image?query=modern%20office%20worker%20looking%20at%20smartphone%20with%20confused%20expression%20workplace%20communication%20problem%20relatable%20scene%20natural%20lighting%20warm%20tones%20professional%20environment&width=480&height=270&seq=sc1&orientation=landscape',
    aiScore: 92,
    colorTone: '暖橙',
  },
  {
    id: 'sc2',
    segment: '知识点一',
    time: '0:30-2:00',
    scriptText: '高效沟通的第一步：先说结论，再说理由。',
    sceneType: '对比演示',
    sceneDesc: '分屏对比：左侧"模糊表达"文字气泡，右侧"清晰结构"文字气泡，视觉上形成鲜明对比',
    visualElements: ['文字动效', '对比色块', '图标动画', '放大字号'],
    transition: '左推进',
    imageUrl: 'https://readdy.ai/api/search-image?query=workplace%20communication%20comparison%20clear%20message%20vs%20vague%20message%20visual%20contrast%20split%20screen%20style%20text%20bubbles%20modern%20flat%20design%20clean%20minimalist&width=480&height=270&seq=sc2&orientation=landscape',
    aiScore: 88,
    colorTone: '清爽蓝',
  },
  {
    id: 'sc3',
    segment: '知识点二',
    time: '2:00-3:30',
    scriptText: '说完了，就以为对方听懂了？高效沟通的第二步：用提问确认理解。',
    sceneType: '动画演示',
    sceneDesc: '传话游戏动画：一排人依次传话，每个人脑袋上的信息泡泡逐渐变形，最后一人说出的话与原始大相径庭',
    visualElements: ['动画人物', '信息变形', '幽默效果', '简洁线条'],
    transition: '放大进入',
    imageUrl: 'https://readdy.ai/api/search-image?query=telephone%20game%20communication%20distortion%20chain%20of%20people%20passing%20message%20getting%20garbled%20cartoon%20illustration%20flat%20design%20colorful%20playful%20workplace%20training&width=480&height=270&seq=sc3&orientation=landscape',
    aiScore: 95,
    colorTone: '活力紫',
  },
  {
    id: 'sc4',
    segment: '结尾行动',
    time: '3:30-4:00',
    scriptText: '从今天起，试着在每次重要沟通前，先在心里想：我要说什么结论？对方需要做什么行动？',
    sceneType: '激励结尾',
    sceneDesc: '职场人自信地打出一条清晰的消息，发送后立刻收到积极回应，背景出现绿色勾选效果',
    visualElements: ['成功反馈', '绿色元素', '积极氛围', '行动符号'],
    transition: '淡出',
    imageUrl: 'https://readdy.ai/api/search-image?query=confident%20business%20person%20sending%20clear%20message%20on%20phone%20getting%20positive%20response%20green%20checkmarks%20success%20indicator%20motivation%20workplace%20achievement%20warm%20uplifting%20colors&width=480&height=270&seq=sc4&orientation=landscape',
    aiScore: 90,
    colorTone: '生机绿',
  },
];

interface ScriptDesignStepProps {
  onBack: () => void;
  onNext: () => void;
}

const ScriptDesignStep = ({ onBack, onNext }: ScriptDesignStepProps) => {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selectedScene, setSelectedScene] = useState<string>('sc1');
  const [scenes, setScenes] = useState(MOCK_SCENES);

  const handleGenerate = () => {
    setLoading(true);
    setGenerated(false);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 2500);
  };

  const handleRegenerateScene = (sceneId: string) => {
    setScenes((prev) =>
      prev.map((s) =>
        s.id === sceneId ? { ...s, aiScore: Math.min(99, s.aiScore + Math.floor(Math.random() * 3)) } : s
      )
    );
  };

  const currentScene = scenes.find((s) => s.id === selectedScene) || scenes[0];

  return (
    <div className="flex gap-5 h-full">
      {/* ── Left: Script segments list ── */}
      <div className="w-[320px] flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded-md">
              <i className="ri-film-line text-white text-xs" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">脚本段落</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">AI为每段脚本匹配最优画面方案</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {!generated && !loading && (
            <div className="py-8 text-center">
              <i className="ri-image-line text-3xl text-gray-200 mb-2" />
              <p className="text-[12px] text-gray-400">生成后将显示画面匹配方案</p>
            </div>
          )}

          {loading && (
            <div className="flex min-h-[200px] flex-col py-4">
              <GenerationProgressScreen
                layout="embedded"
                title="正在分析画面方案"
                subtitle="智能引擎正在生成场景列表，请稍候"
                stepLabels={['解析脚本', '拆分场景', '生成描述']}
                className="justify-center py-4"
              />
            </div>
          )}

          {generated &&
            scenes.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setSelectedScene(scene.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedScene === scene.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 bg-gray-50 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-gray-800">{scene.segment}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-blue-600 font-semibold">{scene.aiScore}分</span>
                    <i className="ri-sparkling-fill text-amber-400 text-[10px]" />
                  </div>
                </div>
                <div className="h-14 w-full rounded overflow-hidden mb-1.5">
                  <img
                    src={scene.imageUrl}
                    alt={scene.segment}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-2">{scene.sceneDesc}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">{scene.sceneType}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500">{scene.time}</span>
                </div>
              </button>
            ))}
        </div>

        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white text-[13px] font-semibold rounded-lg cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <><i className="ri-loader-4-line animate-spin" />分析中...</>
            ) : generated ? (
              <><i className="ri-refresh-line" />重新匹配画面</>
            ) : (
              <><i className="ri-sparkling-line" />AI智能分析画面</>
            )}
          </button>
          <button type="button" onClick={onBack} className="w-full py-2 text-[12px] text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            ← 返回脚本生成
          </button>
        </div>
      </div>

      {/* ── Right: Scene detail ── */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded-md">
              <i className="ri-landscape-line text-white text-xs" />
            </div>
            <span className="text-[13px] font-bold text-gray-800">生成匹配画面</span>
          </div>
          {generated && (
            <span className="text-[11px] text-blue-600 flex items-center gap-1">
              <i className="ri-checkbox-circle-fill" />
              {scenes.length} 个场景已匹配
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {!generated && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                <i className="ri-gallery-line text-3xl text-blue-300" />
              </div>
              <p className="text-[14px] text-gray-400 font-medium">AI将为每段脚本智能匹配画面</p>
              <p className="text-[12px] text-gray-300 mt-1">分析表达意图，生成最贴合的视觉方案</p>
            </div>
          )}

          {loading && (
            <div className="flex h-full min-h-[280px] flex-col">
              <GenerationProgressScreen
                layout="embedded"
                title="正在匹配画面与视觉方案"
                subtitle="智能引擎正在分析脚本语义并检索视觉方案，请稍候"
                stepLabels={['读取脚本语义', '匹配视觉风格', '生成画面描述']}
                className="flex-1 justify-center py-6"
              />
            </div>
          )}

          {generated && (
            <div className="p-6 space-y-6">
              {/* Scene preview */}
              <div className="relative rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <img
                  src={currentScene.imageUrl}
                  alt={currentScene.sceneDesc}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-white/70">{currentScene.segment} · {currentScene.time}</span>
                      <p className="text-[13px] font-semibold text-white mt-0.5">{currentScene.sceneType}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-600/90 px-2.5 py-1 rounded-full">
                      <i className="ri-sparkling-fill text-white text-xs" />
                      <span className="text-[11px] font-bold text-white">匹配度 {currentScene.aiScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Script text */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-[10px] text-gray-400 mb-2 font-semibold">对应脚本片段</p>
                <p className="text-[13px] text-gray-700 leading-relaxed italic">&quot;{currentScene.scriptText}&quot;</p>
              </div>

              {/* Scene description */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[12px] font-semibold text-gray-700">AI画面描述</p>
                  <button
                    type="button"
                    onClick={() => handleRegenerateScene(currentScene.id)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer whitespace-nowrap flex items-center gap-1"
                  >
                    <i className="ri-refresh-line" />
                    重新生成
                  </button>
                </div>
                <p className="text-[12px] text-gray-600 leading-relaxed bg-white border border-gray-100 rounded-lg p-3.5">
                  {currentScene.sceneDesc}
                </p>
              </div>

              {/* Visual elements */}
              <div>
                <p className="text-[12px] font-semibold text-gray-700 mb-2">视觉元素标签</p>
                <div className="flex flex-wrap gap-2">
                  {currentScene.visualElements.map((el) => (
                    <span key={el} className="text-[11px] px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                      {el}
                    </span>
                  ))}
                  <span className="text-[11px] px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                    色调：{currentScene.colorTone}
                  </span>
                  <span className="text-[11px] px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100">
                    转场：{currentScene.transition}
                  </span>
                </div>
              </div>

              {/* All scenes thumbnail strip */}
              <div>
                <p className="text-[12px] font-semibold text-gray-700 mb-2.5">所有场景</p>
                <div className="grid grid-cols-4 gap-2">
                  {scenes.map((scene) => (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => setSelectedScene(scene.id)}
                      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedScene === scene.id ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="w-full" style={{ paddingBottom: '56.25%', position: 'relative' }}>
                        <img
                          src={scene.imageUrl}
                          alt={scene.segment}
                          className="absolute inset-0 w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <span className="absolute bottom-1 left-1 text-[9px] text-white font-semibold">{scene.segment}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {generated && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">画面方案确认后，进入视频合成阶段</p>
            <button
              type="button"
              onClick={onNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              进入视频合成
              <i className="ri-arrow-right-line" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptDesignStep;
