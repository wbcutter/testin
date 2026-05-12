import { useState, useEffect } from 'react';
import CanvasReader from './CanvasReader';
import { loadChapterText } from '../lib/novelLoader';

interface Chapter {
  id: string;
  title: string;
  number: number;
  froPath: string;
}

interface Props {
  chapter: Chapter;
  novelTitle: string;
  darkMode: boolean;
  fontSize: number;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  containerWidth: number;
}

export default function ChapterView({
  chapter, novelTitle, darkMode, fontSize,
  onBack, onPrev, onNext, hasPrev, hasNext, containerWidth
}: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setText('');

    // Fetch .fro file và decode
    const loadChapter = async () => {
      try {
        const decoded = await loadChapterText(chapter.froPath);
        if (!decoded) throw new Error('Decode failed');
        setText(decoded);
      } catch (e) {
        setError('Không thể tải chương này. Vui lòng thử lại.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [chapter.froPath]);

  const bg = darkMode ? '#0d0d1a' : '#fdf6f0';
  const cardBg = darkMode ? 'rgba(15,10,30,0.95)' : 'rgba(255,250,245,0.98)';
  const borderColor = darkMode ? 'rgba(138,90,200,0.2)' : 'rgba(107,63,160,0.15)';
  const titleColor = darkMode ? '#c9a96e' : '#6b3fa0';
  const subColor = darkMode ? '#7b6fa0' : '#9b59b6';

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: bg }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
        style={{
          background: darkMode
            ? 'rgba(13,13,26,0.95)'
            : 'rgba(253,246,240,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <button
          onClick={onBack}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: darkMode ? 'rgba(138,90,200,0.15)' : 'rgba(138,90,200,0.1)',
            color: titleColor,
            border: `1px solid ${borderColor}`,
          }}
          title="Quay lại"
        >
          ←
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs truncate" style={{ color: subColor }}>
            {novelTitle}
          </p>
          <p
            className="text-sm font-semibold truncate"
            style={{
              color: titleColor,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {chapter.title}
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        className="mx-auto px-4 py-6"
        style={{ maxWidth: containerWidth + 48 }}
      >
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            boxShadow: darkMode
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(107,63,160,0.08)',
          }}
        >
          {/* Chapter title */}
          <h1
            className="text-xl md:text-2xl font-bold mb-6 pb-4"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: titleColor,
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            {chapter.title}
          </h1>

          {/* Content */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3" style={{ color: subColor }}>
              <span className="animate-spin">⏳</span>
              <span className="text-sm">Đang tải nội dung...</span>
            </div>
          )}

          {error && (
            <div
              className="text-center py-10 text-sm"
              style={{ color: '#e74c3c' }}
            >
              ❌ {error}
            </div>
          )}

          {!loading && !error && text && (
            <CanvasReader
              text={text}
              fontSize={fontSize}
              darkMode={darkMode}
              containerWidth={containerWidth}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 gap-3">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]"
            style={{
              background: darkMode ? 'rgba(91,79,207,0.2)' : 'rgba(91,79,207,0.1)',
              border: `1px solid rgba(91,79,207,0.3)`,
              color: darkMode ? '#a78bfa' : '#6b3fa0',
            }}
          >
            ← Chương trước
          </button>

          <button
            onClick={onBack}
            className="px-4 py-3 rounded-xl text-sm transition-all hover:scale-105"
            style={{
              background: 'rgba(138,90,200,0.15)',
              border: `1px solid ${borderColor}`,
              color: subColor,
            }}
          >
            📑
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]"
            style={{
              background: darkMode ? 'rgba(91,79,207,0.2)' : 'rgba(91,79,207,0.1)',
              border: `1px solid rgba(91,79,207,0.3)`,
              color: darkMode ? '#a78bfa' : '#6b3fa0',
            }}
          >
            Chương sau →
          </button>
        </div>
      </div>
    </div>
  );
}
