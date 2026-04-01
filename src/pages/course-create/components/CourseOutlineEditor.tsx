import { useRef, useEffect, useState, useCallback } from 'react';

import { GenerationProgressScreen } from '@/components/GenerationProgressScreen';
import type { CourseAnalysisResultData } from '@/services/dify/step2-parse';
import { isDifyStep3Configured, runStep3FourLevelOutline } from '@/services/dify/step3CourseOutline';

import outlineSampleHtml from '../assets/outline-sample.html?raw';
import {
  AI_REWRITE_ACTION,
  AI_REWRITE_APPLY,
  AI_REWRITE_ANOTHER,
  AI_REWRITE_HINT,
  AI_REWRITE_LOADING,
  AI_REWRITES,
  BTN_BACK,
  BTN_DOWNLOAD,
  BTN_NEXT_MATERIAL,
  BTN_QUALITY,
  BTN_QUALITY_COLLAPSE,
  BTN_QUALITY_LOADING,
  BTN_REGENERATE,
  BTN_SAVE,
  BTN_UPLOAD_WORD,
  DEFAULT_COURSE_DURATION,
  LABEL_SAVED,
  OUTLINE_BANNER_HINT,
  OUTLINE_BANNER_TITLE,
  OUTLINE_DOC_FILENAME,
  OUTLINE_DOC_TITLE,
  OUTLINE_ERR_GENERATE_FALLBACK,
  OUTLINE_SKIP_WAITING_MESSAGE,
  QUALITY_ITEMS,
  QUALITY_PANEL_COUNT,
  QUALITY_PANEL_TITLE,
} from '../constants/outlineEditorCopy';
import { OUTLINE_GENERATION_PROGRESS, SKIP_OUTLINE_WAITING_LABEL } from '../constants/outlineLoadingCopy';
import CourseOutlineWordToolbar from './CourseOutlineWordToolbar';

const INITIAL_HTML = outlineSampleHtml.trim();

interface AiPopupState {
  visible: boolean;
  x: number;
  y: number;
  selectedText: string;
}

interface Props {
  onBack?: () => void;
  onNext?: () => void;
  courseTitle?: string;
  courseDuration?: string;
  courseAnalysis?: CourseAnalysisResultData | null;
}

const CourseOutlineEditor = ({
  onBack,
  onNext,
  courseTitle = '',
  courseDuration = DEFAULT_COURSE_DURATION,
  courseAnalysis = null,
}: Props) => {
  const docRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const configured = isDifyStep3Configured();
  const [outlineLoading, setOutlineLoading] = useState(() => configured);
  const [outlineHtml, setOutlineHtml] = useState<string | null>(() => (configured ? null : INITIAL_HTML));
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const [aiPopup, setAiPopup] = useState<AiPopupState>({ visible: false, x: 0, y: 0, selectedText: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [qualityLoading, setQualityLoading] = useState(false);
  const savedSelectionRef = useRef<Range | null>(null);
  const courseAnalysisKey = JSON.stringify(courseAnalysis ?? null);
  const loadSeqRef = useRef(0);

  const loadOutline = useCallback(async () => {
    if (!isDifyStep3Configured()) {
      setOutlineHtml(INITIAL_HTML);
      setOutlineLoading(false);
      return;
    }
    const seq = ++loadSeqRef.current;
    setOutlineLoading(true);
    setOutlineError(null);
    try {
      const html = await runStep3FourLevelOutline(courseTitle, courseDuration, courseAnalysis);
      if (seq !== loadSeqRef.current) return;
      setOutlineHtml(html);
    } catch (e) {
      if (seq !== loadSeqRef.current) return;
      const msg = e instanceof Error ? e.message : OUTLINE_ERR_GENERATE_FALLBACK;
      setOutlineError(msg);
      setOutlineHtml(INITIAL_HTML);
    } finally {
      if (seq === loadSeqRef.current) {
        setOutlineLoading(false);
      }
    }
  }, [courseTitle, courseDuration, courseAnalysisKey]);

  useEffect(() => {
    void loadOutline();
  }, [loadOutline]);

  const [showSkipWaiting, setShowSkipWaiting] = useState(false);
  useEffect(() => {
    if (!outlineLoading) {
      setShowSkipWaiting(false);
      return;
    }
    const t = window.setTimeout(() => setShowSkipWaiting(true), 15000);
    return () => window.clearTimeout(t);
  }, [outlineLoading]);

  const skipWaitingWithSample = useCallback(() => {
    loadSeqRef.current += 1;
    setOutlineLoading(false);
    setOutlineHtml(INITIAL_HTML);
    setOutlineError(OUTLINE_SKIP_WAITING_MESSAGE);
  }, []);

  useEffect(() => {
    if (outlineLoading) return;
    if (docRef.current && outlineHtml !== null) {
      docRef.current.innerHTML = outlineHtml;
    }
  }, [outlineLoading, outlineHtml]);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setAiPopup((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      setAiSuggestion('');
      return;
    }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    savedSelectionRef.current = range.cloneRange();
    setAiSuggestion('');
    setAiPopup({
      visible: true,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + (containerRef.current?.scrollTop ?? 0) - 8,
      selectedText: selection.toString().trim(),
    });
  }, []);

  const handleAiRewrite = () => {
    setAiLoading(true);
    setAiSuggestion('');
    setTimeout(() => {
      const suggestion = AI_REWRITES[Math.floor(Math.random() * AI_REWRITES.length)];
      setAiSuggestion(suggestion);
      setAiLoading(false);
    }, 1400);
  };

  const handleApplySuggestion = () => {
    if (!aiSuggestion || !savedSelectionRef.current) return;
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
      document.execCommand('insertText', false, aiSuggestion);
    }
    setAiPopup({ visible: false, x: 0, y: 0, selectedText: '' });
    setAiSuggestion('');
    savedSelectionRef.current = null;
  };

  const handleClosePopup = () => {
    setAiPopup({ visible: false, x: 0, y: 0, selectedText: '' });
    setAiSuggestion('');
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleQualityCheck = () => {
    if (showQuality) {
      setShowQuality(false);
      return;
    }
    setQualityLoading(true);
    setTimeout(() => {
      setQualityLoading(false);
      setShowQuality(true);
    }, 1600);
  };

  const handleDownload = () => {
    if (!docRef.current) return;
    setDownloading(true);
    try {
      const content = docRef.current.innerHTML;
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><title>${OUTLINE_DOC_TITLE}</title>
        <style>body{font-family:Microsoft YaHei,SimSun,serif;margin:2cm;color:#111;line-height:1.8;font-size:12pt;}</style></head>
        <body>${content}</body></html>`;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = OUTLINE_DOC_FILENAME;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  if (outlineLoading) {
    return (
      <div className="relative flex h-full min-h-0 flex-1 flex-col">
        <GenerationProgressScreen
          title={OUTLINE_GENERATION_PROGRESS.title}
          subtitle={OUTLINE_GENERATION_PROGRESS.subtitle}
          stepLabels={[...OUTLINE_GENERATION_PROGRESS.stepLabels]}
        />
        {showSkipWaiting && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center px-4 pb-8">
            <button
              type="button"
              onClick={skipWaitingWithSample}
              className="pointer-events-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
            >
              {SKIP_OUTLINE_WAITING_LABEL}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {outlineError && (
        <div
          role="status"
          className="shrink-0 border-b border-amber-200/90 bg-amber-50 px-6 py-2.5 text-[12px] text-amber-900"
        >
          <span className="font-semibold">{OUTLINE_BANNER_TITLE}</span>
          <span className="mt-1 block text-amber-800/90">{outlineError}</span>
          <span className="mt-1 block text-amber-800/80">{OUTLINE_BANNER_HINT}</span>
        </div>
      )}
      <CourseOutlineWordToolbar />

      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto bg-gray-100 px-6 py-6"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('[data-ai-popup]')) {
            if (!(e.target as HTMLElement).closest('[contenteditable]')) {
              handleClosePopup();
            }
          }
        }}
      >
        <div
          className="mx-auto max-w-[800px] rounded-sm bg-white"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.12)' }}
        >
          <div
            ref={docRef}
            contentEditable
            suppressContentEditableWarning
            onMouseUp={handleMouseUp}
            className="min-h-[600px] px-16 py-12 text-[13.5px] leading-loose text-gray-800 selection:bg-blue-200 focus:outline-none"
            style={{ fontFamily: '"Microsoft YaHei", "SimSun", serif', lineHeight: '1.85' }}
          />
        </div>

        {aiPopup.visible && (
          <div
            data-ai-popup="true"
            className="absolute z-50"
            style={{ left: aiPopup.x, top: aiPopup.y, transform: 'translate(-50%, -100%)' }}
          >
            <div
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
            >
              <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-blue-600">
                  <i className="ri-sparkling-fill text-[10px] text-white" />
                </div>
                <button
                  type="button"
                  onClick={handleAiRewrite}
                  disabled={aiLoading}
                  className="cursor-pointer whitespace-nowrap text-[12px] font-semibold text-gray-800 transition-colors hover:text-blue-600"
                >
                  {aiLoading ? AI_REWRITE_LOADING : AI_REWRITE_ACTION}
                </button>
                {aiLoading && <i className="ri-loader-4-line animate-spin text-sm text-blue-500" />}
                <button
                  type="button"
                  onClick={handleClosePopup}
                  className="ml-1 flex h-4 w-4 cursor-pointer items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xs" />
                </button>
              </div>

              {aiSuggestion && (
                <div className="max-w-[360px] px-3 py-2.5">
                  <p className="mb-1.5 text-[11px] text-gray-500">{AI_REWRITE_HINT}</p>
                  <p className="line-clamp-3 text-[12px] leading-relaxed text-gray-700">{aiSuggestion}</p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={handleApplySuggestion}
                      className="flex-1 cursor-pointer rounded-lg bg-blue-600 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      {AI_REWRITE_APPLY}
                    </button>
                    <button
                      type="button"
                      onClick={handleAiRewrite}
                      className="flex-1 cursor-pointer rounded-lg bg-gray-100 py-1.5 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      {AI_REWRITE_ANOTHER}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <div className="-mt-1.5 h-2.5 w-2.5 rotate-45 border-b border-r border-gray-200 bg-white" />
            </div>
          </div>
        )}
      </div>

      {showQuality && (
        <div className="mx-0 flex-shrink-0 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-blue-600">
                <i className="ri-shield-check-line text-[11px] text-white" />
              </div>
              <span className="text-[13px] font-bold text-gray-900">{QUALITY_PANEL_TITLE}</span>
              <span className="ml-1 text-[11px] text-gray-400">{QUALITY_PANEL_COUNT(QUALITY_ITEMS.length)}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowQuality(false)}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            >
              <i className="ri-close-line text-sm" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUALITY_ITEMS.map((item, i) => (
              <div key={i} className={`flex items-start gap-2.5 rounded-xl border p-3 ${item.bg} ${item.border}`}>
                <i className={`${item.icon} ${item.color} mt-0.5 flex-shrink-0 text-sm`} />
                <div className="min-w-0 flex-1">
                  <span className={`mr-1.5 text-[10px] font-bold ${item.color}`}>{item.label}</span>
                  <span className="text-[11px] leading-relaxed text-gray-700">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-shrink-0 items-center gap-3 border-t border-gray-200 bg-white px-6 py-3">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-[12px] font-semibold text-gray-700 transition-all hover:border-gray-300"
        >
          <i className="ri-upload-2-line text-sm" />
          {BTN_UPLOAD_WORD}
        </button>

        {isDifyStep3Configured() && (
          <button
            type="button"
            onClick={() => void loadOutline()}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-4 py-2 text-[12px] font-semibold text-blue-700 transition-all hover:bg-blue-50"
          >
            <i className="ri-refresh-line text-sm" />
            {BTN_REGENERATE}
          </button>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-[12px] font-semibold text-gray-700 transition-all hover:border-gray-300"
        >
          {downloading ? (
            <i className="ri-loader-4-line animate-spin text-sm" />
          ) : (
            <i className="ri-download-2-line text-sm" />
          )}
          {BTN_DOWNLOAD}
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-[12px] font-semibold text-gray-600 transition-all hover:border-gray-300"
          >
            <i className="ri-arrow-left-line text-sm" />
            {BTN_BACK}
          </button>
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={handleQualityCheck}
          disabled={qualityLoading}
          className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-4 py-2 text-[12px] font-semibold transition-all ${
            showQuality
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          {qualityLoading ? (
            <i className="ri-loader-4-line animate-spin text-sm" />
          ) : (
            <i className={`ri-shield-check-line text-sm ${showQuality ? 'text-blue-600' : ''}`} />
          )}
          {qualityLoading ? BTN_QUALITY_LOADING : showQuality ? BTN_QUALITY_COLLAPSE : BTN_QUALITY}
        </button>

        {saved && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-green-500">
            <i className="ri-check-line text-xs" />
            {LABEL_SAVED}
          </span>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-[12px] font-semibold text-gray-700 transition-all hover:border-gray-300"
        >
          <i className="ri-save-line text-sm" />
          {BTN_SAVE}
        </button>

        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-8 py-2 text-[13px] font-bold text-white transition-colors hover:bg-blue-700"
          >
            {BTN_NEXT_MATERIAL}
            <i className="ri-arrow-right-line text-sm" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseOutlineEditor;
