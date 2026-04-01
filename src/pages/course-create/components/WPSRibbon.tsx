import { useState, useRef } from 'react';

export type RibbonTab = 'home' | 'insert' | 'design' | 'animation' | 'review' | 'view';

export interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  color: string;
}

interface WPSRibbonProps {
  fileName: string;
  activeTab: RibbonTab;
  onTabChange: (tab: RibbonTab) => void;
  format: FormatState;
  onFormat: (key: keyof FormatState, value: string | boolean | number) => void;
  onUploadPPT: (file: File) => void;
  onAddSlide: () => void;
  onDeleteSlide: () => void;
  onUndo: () => void;
  onRedo: () => void;
  showReview: boolean;
  onToggleReview: () => void;
}

const FONTS = ['微软雅黑', '宋体', '黑体', '楷体', 'Arial', 'Times New Roman'];
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60, 72];
const COLORS = ['#1a1a1a', '#374151', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];

const WPSRibbon = ({
  fileName, activeTab, onTabChange, format, onFormat,
  onUploadPPT, onAddSlide, onDeleteSlide, onUndo, onRedo,
  showReview, onToggleReview,
}: WPSRibbonProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fontSizeInput, setFontSizeInput] = useState(String(format.fontSize));
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false);

  const tabs: { id: RibbonTab; label: string }[] = [
    { id: 'home', label: '开始' },
    { id: 'insert', label: '插入' },
    { id: 'design', label: '设计' },
    { id: 'animation', label: '动画' },
    { id: 'review', label: '审阅' },
    { id: 'view', label: '视图' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { onUploadPPT(file); e.target.value = ''; }
  };

  const handleFontSizeBlur = () => {
    const n = parseInt(fontSizeInput, 10);
    if (!Number.isNaN(n) && n >= 6 && n <= 120) {
      onFormat('fontSize', n);
    } else {
      setFontSizeInput(String(format.fontSize));
    }
  };

  const ToolBtn = ({ icon, label, onClick, active, disabled }: {
    icon: string; label?: string; onClick?: () => void; active?: boolean; disabled?: boolean;
  }) => (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] transition-all cursor-pointer whitespace-nowrap min-w-[36px]
        ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <i className={`${icon} text-base leading-none`} />
      {label && <span className="leading-none">{label}</span>}
    </button>
  );

  const Divider = () => <div className="w-px h-8 bg-gray-200 mx-1 self-center" />;

  const renderHomeTab = () => (
    <div className="flex items-stretch gap-1 h-full px-2">
      {/* 剪贴板 */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <ToolBtn icon="ri-clipboard-line" label="粘贴" />
          <div className="flex flex-col">
            <ToolBtn icon="ri-scissors-cut-line" label="剪切" />
            <ToolBtn icon="ri-file-copy-line" label="复制" />
          </div>
        </div>
        <span className="text-[9px] text-gray-400 mt-0.5 border-t border-gray-100 w-full text-center pt-0.5">剪贴板</span>
      </div>
      <Divider />
      {/* 字体 */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          {/* Font family dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setFontFamilyOpen(v => !v); setColorPickerOpen(false); }}
              className="flex items-center gap-1 px-2 h-6 border border-gray-200 rounded text-[11px] text-gray-700 bg-white hover:border-gray-300 min-w-[90px] cursor-pointer"
            >
              <span className="flex-1 text-left truncate">{format.fontFamily}</span>
              <i className="ri-arrow-down-s-line text-gray-400 text-xs" />
            </button>
            {fontFamilyOpen && (
              <div className="absolute top-7 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                {FONTS.map(f => (
                  <button key={f} type="button" onClick={() => { onFormat('fontFamily', f); setFontFamilyOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-indigo-50 cursor-pointer ${format.fontFamily === f ? 'text-indigo-600 font-bold' : 'text-gray-700'}`}>
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Font size */}
          <div className="flex items-center border border-gray-200 rounded overflow-hidden h-6">
            <button type="button" onClick={() => { const n = Math.max(6, format.fontSize - 2); onFormat('fontSize', n); setFontSizeInput(String(n)); }}
              className="w-5 flex items-center justify-center hover:bg-gray-100 text-gray-500 cursor-pointer text-xs">
              <i className="ri-subtract-line" />
            </button>
            <input
              value={fontSizeInput}
              onChange={e => setFontSizeInput(e.target.value)}
              onBlur={handleFontSizeBlur}
              className="w-8 text-center text-[11px] text-gray-700 outline-none"
            />
            <button type="button" onClick={() => { const n = Math.min(120, format.fontSize + 2); onFormat('fontSize', n); setFontSizeInput(String(n)); }}
              className="w-5 flex items-center justify-center hover:bg-gray-100 text-gray-500 cursor-pointer text-xs">
              <i className="ri-add-line" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => onFormat('bold', !format.bold)}
            className={`w-6 h-6 flex items-center justify-center rounded text-[13px] font-bold cursor-pointer transition-all ${format.bold ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}>
            B
          </button>
          <button type="button" onClick={() => onFormat('italic', !format.italic)}
            className={`w-6 h-6 flex items-center justify-center rounded text-[13px] italic cursor-pointer transition-all ${format.italic ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}>
            I
          </button>
          <button type="button" onClick={() => onFormat('underline', !format.underline)}
            className={`w-6 h-6 flex items-center justify-center rounded text-[13px] underline cursor-pointer transition-all ${format.underline ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}>
            U
          </button>
          <Divider />
          {/* Color picker */}
          <div className="relative">
            <button type="button" onClick={() => { setColorPickerOpen(v => !v); setFontFamilyOpen(false); }}
              className="flex flex-col items-center w-6 cursor-pointer">
              <span className="text-[11px] font-bold text-gray-700">A</span>
              <span className="w-5 h-1 rounded-sm" style={{ backgroundColor: format.color }} />
            </button>
            {colorPickerOpen && (
              <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                <div className="grid grid-cols-5 gap-1.5">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => { onFormat('color', c); setColorPickerOpen(false); }}
                      className="w-5 h-5 rounded cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="text-[9px] text-gray-400 border-t border-gray-100 w-full text-center pt-0.5">字体</span>
      </div>
      <Divider />
      {/* 段落对齐 */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-0.5">
          {(['left', 'center', 'right'] as const).map(a => (
            <button key={a} type="button" onClick={() => onFormat('textAlign', a)}
              className={`w-7 h-7 flex items-center justify-center rounded cursor-pointer transition-all text-sm ${format.textAlign === a ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`}>
              <i className={`ri-align-${a} `} />
            </button>
          ))}
        </div>
        <span className="text-[9px] text-gray-400 border-t border-gray-100 w-full text-center pt-0.5 mt-auto">段落</span>
      </div>
      <Divider />
      {/* 幻灯片操作 */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <ToolBtn icon="ri-add-box-line" label="新建" onClick={onAddSlide} />
          <ToolBtn icon="ri-delete-bin-line" label="删除" onClick={onDeleteSlide} />
        </div>
        <span className="text-[9px] text-gray-400 mt-0.5 border-t border-gray-100 w-full text-center pt-0.5">幻灯片</span>
      </div>
      <Divider />
      {/* 撤销/重做 */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <ToolBtn icon="ri-arrow-go-back-line" label="撤销" onClick={onUndo} />
          <ToolBtn icon="ri-arrow-go-forward-line" label="重做" onClick={onRedo} />
        </div>
        <span className="text-[9px] text-gray-400 mt-0.5 border-t border-gray-100 w-full text-center pt-0.5">历史</span>
      </div>
    </div>
  );

  const renderInsertTab = () => (
    <div className="flex items-stretch gap-1 h-full px-2">
      <ToolBtn icon="ri-image-add-line" label="图片" />
      <ToolBtn icon="ri-shapes-line" label="形状" />
      <ToolBtn icon="ri-text" label="文本框" />
      <Divider />
      <ToolBtn icon="ri-table-line" label="表格" />
      <ToolBtn icon="ri-bar-chart-2-line" label="图表" />
      <Divider />
      <ToolBtn icon="ri-link" label="超链接" />
      <ToolBtn icon="ri-video-line" label="视频" />
    </div>
  );

  const renderDesignTab = () => (
    <div className="flex items-stretch gap-1 h-full px-2">
      {['简洁商务', '科技蓝调', '活力橙红', '自然绿意', '经典黑白'].map(t => (
        <button key={t} type="button"
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer text-[10px] text-gray-600">
          <div className="w-12 h-8 rounded bg-gradient-to-br from-indigo-400 to-indigo-600 border border-gray-200" />
          {t}
        </button>
      ))}
    </div>
  );

  const renderOtherTab = () => (
    <div className="flex items-center gap-2 h-full px-4 text-[12px] text-gray-400">
      <i className="ri-tools-line" /> 功能开发中...
    </div>
  );

  const tabContent: Record<RibbonTab, React.ReactNode> = {
    home: renderHomeTab(),
    insert: renderInsertTab(),
    design: renderDesignTab(),
    animation: renderOtherTab(),
    review: renderOtherTab(),
    view: renderOtherTab(),
  };

  return (
    <div className="bg-white border-b border-gray-200 flex-shrink-0" onClick={() => { setColorPickerOpen(false); setFontFamilyOpen(false); }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[8px] font-bold">P</span>
          </div>
          <span className="text-[11px] text-gray-600 font-medium">{fileName || '未命名演示文稿.pptx'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-medium rounded cursor-pointer whitespace-nowrap transition-all">
            <i className="ri-upload-2-line text-xs" /> 上传PPT文件
          </button>
          <input ref={fileRef} type="file" accept=".ppt,.pptx" className="hidden" onChange={handleFileChange} />
          <button type="button" onClick={onToggleReview}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded cursor-pointer whitespace-nowrap transition-all ${showReview ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <i className="ri-shield-check-line text-xs" /> 质量审核
          </button>
        </div>
      </div>
      {/* Tab bar */}
      <div className="flex items-end px-3 gap-0.5 border-b border-gray-100">
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => onTabChange(t.id)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-t-md cursor-pointer whitespace-nowrap transition-all border-b-2 ${activeTab === t.id ? 'text-indigo-600 border-indigo-500 bg-indigo-50/50' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="h-[74px] flex items-stretch">
        {tabContent[activeTab]}
      </div>
    </div>
  );
};

export default WPSRibbon;
