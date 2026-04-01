import { useState } from 'react';

const exec = (cmd: string, val?: string) => {
  document.execCommand(cmd, false, val ?? '');
};

const ToolBtn = ({
  icon, title, onClick, active,
}: { icon: string; title: string; onClick: () => void; active?: boolean }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`w-7 h-7 flex items-center justify-center rounded cursor-pointer transition-colors text-[13px]
      ${active ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
  >
    <i className={icon} />
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />;

const CourseOutlineWordToolbar = () => {
  const [fontSize, setFontSize] = useState('14');

  const setFontSizeCmd = (size: string) => {
    setFontSize(size);
    // Map px size to font size 1-7
    const sizeMap: Record<string, string> = { '10': '1', '12': '2', '13': '3', '14': '3', '16': '4', '18': '4', '20': '5', '24': '6', '28': '7' };
    exec('fontSize', sizeMap[size] ?? '3');
  };

  const insertTable = () => {
    const html = `<table border="1" style="border-collapse:collapse;width:100%;margin:8px 0;">
      <tr><td style="padding:6px 8px;border:1px solid #ccc;">&nbsp;</td><td style="padding:6px 8px;border:1px solid #ccc;">&nbsp;</td><td style="padding:6px 8px;border:1px solid #ccc;">&nbsp;</td></tr>
      <tr><td style="padding:6px 8px;border:1px solid #ccc;">&nbsp;</td><td style="padding:6px 8px;border:1px solid #ccc;">&nbsp;</td><td style="padding:6px 8px;border:1px solid #ccc;">&nbsp;</td></tr>
    </table>`;
    exec('insertHTML', html);
  };

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 bg-white border-b border-gray-200 flex-wrap flex-shrink-0 min-h-[42px]">
      {/* Style selector */}
      <select
        className="text-[11px] border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer text-gray-700 mr-1"
        onChange={(e) => {
          const styleMap: Record<string, string> = { h1: 'H1', h2: 'H2', h3: 'H3', p: 'P' };
          const tag = e.target.value;
          if (styleMap[tag]) exec('formatBlock', tag);
        }}
        defaultValue="p"
      >
        <option value="p">正文</option>
        <option value="h1">标题 1</option>
        <option value="h2">标题 2</option>
        <option value="h3">标题 3</option>
      </select>

      {/* Font selector */}
      <select
        className="text-[11px] border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer text-gray-700 mr-1"
        onChange={(e) => exec('fontName', e.target.value)}
        defaultValue="Microsoft YaHei"
      >
        <option value="Microsoft YaHei">微软雅黑</option>
        <option value="SimSun">宋体</option>
        <option value="SimHei">黑体</option>
        <option value="Arial">Arial</option>
      </select>

      {/* Font size */}
      <select
        className="text-[11px] border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer text-gray-700 mr-1 w-14"
        value={fontSize}
        onChange={(e) => setFontSizeCmd(e.target.value)}
      >
        {['10', '12', '13', '14', '16', '18', '20', '24', '28'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <Divider />

      {/* Basic format */}
      <ToolBtn icon="ri-bold" title="粗体 (Ctrl+B)" onClick={() => exec('bold')} />
      <ToolBtn icon="ri-italic" title="斜体 (Ctrl+I)" onClick={() => exec('italic')} />
      <ToolBtn icon="ri-underline" title="下划线 (Ctrl+U)" onClick={() => exec('underline')} />
      <ToolBtn icon="ri-strikethrough" title="删除线" onClick={() => exec('strikeThrough')} />

      <Divider />

      {/* Text color */}
      <div className="relative group">
        <button
          type="button"
          title="字体颜色"
          className="w-7 h-7 flex flex-col items-center justify-center rounded cursor-pointer hover:bg-gray-100"
          onMouseDown={(e) => e.preventDefault()}
        >
          <span className="text-[11px] font-bold text-gray-700 leading-none">A</span>
          <span className="w-5 h-1 bg-red-500 rounded-sm mt-0.5" />
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 hidden group-hover:grid grid-cols-6 gap-1 z-50 w-36">
          {['#000000','#374151','#EF4444','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EC4899','#ffffff','#F3F4F6','#FEF3C7','#D1FAE5'].map((c) => (
            <button
              key={c}
              type="button"
              className="w-4 h-4 rounded-sm border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              onMouseDown={(e) => { e.preventDefault(); exec('foreColor', c); }}
            />
          ))}
        </div>
      </div>

      {/* Highlight */}
      <div className="relative group">
        <button
          type="button"
          title="高亮颜色"
          className="w-7 h-7 flex flex-col items-center justify-center rounded cursor-pointer hover:bg-gray-100"
          onMouseDown={(e) => e.preventDefault()}
        >
          <span className="text-[11px] font-bold text-gray-700 leading-none">A</span>
          <span className="w-5 h-1 bg-yellow-300 rounded-sm mt-0.5" />
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 hidden group-hover:grid grid-cols-6 gap-1 z-50 w-36">
          {['#FEF08A','#BBF7D0','#BFDBFE','#FECACA','#E9D5FF','#FED7AA','transparent'].map((c) => (
            <button
              key={c}
              type="button"
              className="w-4 h-4 rounded-sm border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: c === 'transparent' ? '#fff' : c }}
              onMouseDown={(e) => { e.preventDefault(); exec('hiliteColor', c); }}
            >
              {c === 'transparent' && <span className="text-[8px] text-gray-400 leading-none">×</span>}
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* Alignment */}
      <ToolBtn icon="ri-align-left" title="左对齐" onClick={() => exec('justifyLeft')} />
      <ToolBtn icon="ri-align-center" title="居中对齐" onClick={() => exec('justifyCenter')} />
      <ToolBtn icon="ri-align-right" title="右对齐" onClick={() => exec('justifyRight')} />
      <ToolBtn icon="ri-align-justify" title="两端对齐" onClick={() => exec('justifyFull')} />

      <Divider />

      {/* Indent */}
      <ToolBtn icon="ri-indent-increase" title="增加缩进" onClick={() => exec('indent')} />
      <ToolBtn icon="ri-indent-decrease" title="减少缩进" onClick={() => exec('outdent')} />

      <Divider />

      {/* Lists */}
      <ToolBtn icon="ri-list-ordered" title="有序列表" onClick={() => exec('insertOrderedList')} />
      <ToolBtn icon="ri-list-unordered" title="无序列表" onClick={() => exec('insertUnorderedList')} />

      <Divider />

      {/* Table */}
      <ToolBtn icon="ri-table-line" title="插入表格" onClick={insertTable} />

      <Divider />

      {/* Undo / Redo */}
      <ToolBtn icon="ri-arrow-go-back-line" title="撤销 (Ctrl+Z)" onClick={() => exec('undo')} />
      <ToolBtn icon="ri-arrow-go-forward-line" title="重做 (Ctrl+Y)" onClick={() => exec('redo')} />
    </div>
  );
};

export default CourseOutlineWordToolbar;
