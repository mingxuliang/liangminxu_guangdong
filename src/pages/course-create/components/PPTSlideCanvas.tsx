import { useState, useRef, useCallback, useEffect } from 'react';

export interface SlideElement {
  id: string;
  type: 'title' | 'subtitle' | 'body' | 'label' | 'note';
  content: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontFamily: string;
}

export interface PPTSlide {
  id: number;
  type: 'cover' | 'toc' | 'content' | 'end' | 'blank';
  background: string;
  elements: SlideElement[];
}

interface PPTSlideCanvasProps {
  slide: PPTSlide;
  onUpdateElement: (slideId: number, elementId: string, content: string) => void;
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  scale?: number;
}

const CANVAS_W = 960;
const CANVAS_H = 540;

const PPTSlideCanvas = ({
  slide, onUpdateElement, selectedId, onSelectElement, scale = 1,
}: PPTSlideCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [localElements, setLocalElements] = useState<SlideElement[]>(slide.elements);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { setLocalElements(slide.elements); }, [slide.elements]);

  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  }, [scale]);

  const handleMouseDown = useCallback((e: React.MouseEvent, el: SlideElement) => {
    if (editingId === el.id) return;
    e.stopPropagation();
    onSelectElement(el.id);
    const coords = getCanvasCoords(e);
    setDragging({ id: el.id, startX: coords.x, startY: coords.y, origX: el.x, origY: el.y });
  }, [editingId, onSelectElement, getCanvasCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const coords = getCanvasCoords(e);
    const dx = ((coords.x - dragging.startX) / CANVAS_W) * 100;
    const dy = ((coords.y - dragging.startY) / CANVAS_H) * 100;
    setLocalElements(prev => prev.map(el =>
      el.id === dragging.id
        ? { ...el, x: Math.max(0, Math.min(90, dragging.origX + dx)), y: Math.max(0, Math.min(90, dragging.origY + dy)) }
        : el
    ));
  }, [dragging, getCanvasCoords]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleDoubleClick = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    setEditingId(el.id);
    onSelectElement(el.id);
  };

  const handleContentChange = (el: SlideElement, newContent: string) => {
    setLocalElements(prev => prev.map(e => e.id === el.id ? { ...e, content: newContent } : e));
    onUpdateElement(slide.id, el.id, newContent);
  };

  const handleEditBlur = () => {
    setEditingId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
      setEditingId(null);
    }
  };

  const getBackground = () => {
    if (slide.background.startsWith('gradient')) {
      const map: Record<string, string> = {
        'gradient-cover': 'linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6366f1 100%)',
        'gradient-end': 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
        'gradient-toc': 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%)',
      };
      return map[slide.background] || '#ffffff';
    }
    return slide.background || '#ffffff';
  };

  const isLight = !slide.background.includes('cover') && !slide.background.includes('end');

  return (
    <div
      ref={canvasRef}
      className="relative select-none overflow-hidden cursor-default"
      style={{
        width: `${CANVAS_W}px`,
        height: `${CANVAS_H}px`,
        background: getBackground(),
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Grid background for blank slides */}
      {slide.type === 'blank' && (
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />
      )}

      {/* Top color bar for content slides */}
      {slide.type === 'content' && (
        <div className="absolute top-0 left-0 right-0 h-[60px] bg-indigo-600 flex items-center px-8">
          <div className="w-1 h-8 bg-white/40 rounded-full mr-3 flex-shrink-0" />
        </div>
      )}

      {/* TOC accent */}
      {slide.type === 'toc' && (
        <div className="absolute left-0 top-0 bottom-0 w-[8px] bg-indigo-600" />
      )}

      {/* Cover decoration */}
      {slide.type === 'cover' && (
        <>
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white/5" style={{ transform: 'translate(40%, 40%)' }} />
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white/5" style={{ transform: 'translate(-40%, -40%)' }} />
          <div className="absolute bottom-8 left-0 right-0 h-px bg-white/20" />
        </>
      )}

      {/* Elements */}
      {localElements.map(el => {
        const isSelected = selectedId === el.id;
        const isEditing = editingId === el.id;
        return (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.w}%`,
              minHeight: `${el.h}%`,
              cursor: isEditing ? 'text' : 'move',
              outline: isSelected ? '2px solid #6366f1' : 'none',
              outlineOffset: '2px',
            }}
            onMouseDown={e => handleMouseDown(e, el)}
            onDoubleClick={e => handleDoubleClick(e, el)}
          >
            {/* Selection handles */}
            {isSelected && !isEditing && (
              <>
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                  <div key={pos}
                    className={`absolute w-2.5 h-2.5 bg-white border-2 border-indigo-500 rounded-sm z-10 ${
                      pos === 'top-left' ? '-top-1.5 -left-1.5' :
                      pos === 'top-right' ? '-top-1.5 -right-1.5' :
                      pos === 'bottom-left' ? '-bottom-1.5 -left-1.5' :
                      '-bottom-1.5 -right-1.5'
                    }`} />
                ))}
              </>
            )}
            {isEditing ? (
              <textarea
                autoFocus
                value={el.content}
                onChange={e => handleContentChange(el, e.target.value)}
                onBlur={handleEditBlur}
                className="w-full min-h-full bg-white/20 border-none outline-none resize-none p-1 leading-snug"
                style={{
                  fontSize: `${el.fontSize}px`,
                  fontWeight: el.fontWeight,
                  fontStyle: el.fontStyle,
                  textDecoration: el.textDecoration,
                  color: el.color,
                  textAlign: el.textAlign,
                  fontFamily: el.fontFamily,
                  backdropFilter: 'blur(4px)',
                  borderRadius: '4px',
                }}
              />
            ) : (
              <div
                className="w-full leading-snug whitespace-pre-wrap break-words"
                style={{
                  fontSize: `${el.fontSize}px`,
                  fontWeight: el.fontWeight,
                  fontStyle: el.fontStyle,
                  textDecoration: el.textDecoration,
                  color: el.color,
                  textAlign: el.textAlign,
                  fontFamily: el.fontFamily,
                  padding: '2px 4px',
                }}
              >
                {el.content}
              </div>
            )}
          </div>
        );
      })}

      {/* Slide number */}
      <div className={`absolute bottom-2 right-4 text-[11px] ${isLight ? 'text-gray-300' : 'text-white/30'}`}>
        {slide.id}
      </div>
    </div>
  );
};

/* ── Thumbnail variant ── */
export const PPTSlideThumbnail = ({ slide }: { slide: PPTSlide }) => {
  const getBackground = () => {
    const map: Record<string, string> = {
      'gradient-cover': 'linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6366f1 100%)',
      'gradient-end': 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
      'gradient-toc': 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%)',
    };
    return map[slide.background] || slide.background || '#ffffff';
  };
  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%', background: getBackground(), overflow: 'hidden', borderRadius: '4px' }}>
      {slide.type === 'content' && <div className="absolute top-0 left-0 right-0 h-[18%] bg-indigo-600" />}
      {slide.type === 'toc' && <div className="absolute left-0 top-0 bottom-0 w-[3%] bg-indigo-600" />}
      <div className="absolute inset-0 p-[6%] pt-[20%] flex flex-col gap-1 overflow-hidden">
        {slide.elements.filter(e => e.type !== 'note').map(el => (
          <div key={el.id} className="truncate leading-tight"
            style={{
              fontSize: `${Math.max(4, el.fontSize * 0.12)}px`,
              fontWeight: el.fontWeight,
              color: el.color,
              textAlign: el.textAlign,
              maxWidth: `${el.w}%`,
              marginLeft: el.textAlign === 'center' ? 'auto' : el.textAlign === 'right' ? 'auto' : '0',
              marginRight: el.textAlign === 'center' ? 'auto' : '0',
            }}>
            {el.content.split('\n')[0]}
          </div>
        ))}
      </div>
    </div>
  );
};

export { CANVAS_W, CANVAS_H };
export default PPTSlideCanvas;
