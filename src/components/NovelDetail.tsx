interface Chapter {
  id: string;
  title: string;
  number: number;
  froPath: string;
}

interface Novel {
  id: string;
  title: string;
  author: string;
  description: string;
  tags?: string[];
  cover?: string;
  chapters: Chapter[];
}

interface Props {
  novel: Novel;
  darkMode: boolean;
  onBack: () => void;
  onSelectChapter: (ch: Chapter) => void;
}

export default function NovelDetail({ novel, darkMode, onBack, onSelectChapter }: Props) {
  const bg = darkMode ? '#0d0d1a' : '#fdf6f0';
  const cardBg = darkMode ? 'rgba(15,10,30,0.9)' : 'rgba(255,250,245,0.98)';
  const borderColor = darkMode ? 'rgba(138,90,200,0.2)' : 'rgba(107,63,160,0.15)';
  const titleColor = darkMode ? '#c9a96e' : '#6b3fa0';
  const subColor = darkMode ? '#9b7fd4' : '#9b59b6';
  const textColor = darkMode ? '#b8a898' : '#5a3e2b';
  const chapterBg = darkMode ? 'rgba(138,90,200,0.06)' : 'rgba(138,90,200,0.04)';
  const chapterHover = darkMode ? 'rgba(138,90,200,0.14)' : 'rgba(138,90,200,0.1)';

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
        style={{
          background: darkMode ? 'rgba(13,13,26,0.95)' : 'rgba(253,246,240,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-all"
          style={{
            background: 'rgba(138,90,200,0.12)',
            color: titleColor,
            border: `1px solid ${borderColor}`,
          }}
        >
          ←
        </button>
        <h2
          className="text-base font-bold truncate"
          style={{ color: titleColor, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {novel.title}
        </h2>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Info card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 20px rgba(107,63,160,0.08)',
          }}
        >
          {/* Banner gradient */}
          <div
            className="h-28 flex items-end px-6 pb-4"
            style={{
              background: darkMode
                ? 'linear-gradient(135deg,#1a0533,#0d0d2b,#001a33)'
                : 'linear-gradient(135deg,#6b3fa0,#9b59b6,#8e44ad)',
            }}
          >
            <div>
              <h1
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
              >
                {novel.title}
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                ✍️ {novel.author}
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Tags */}
            {novel.tags && novel.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {novel.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(138,90,200,0.12)',
                      border: '1px solid rgba(138,90,200,0.3)',
                      color: subColor,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: titleColor }}>
                📖 Giới thiệu
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: textColor }}>
                {novel.description}
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: subColor, borderTop: `1px solid ${borderColor}`, paddingTop: 12 }}
            >
              <span>📚 {novel.chapters.length} chương</span>
            </div>
          </div>
        </div>

        {/* Chapter list */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            className="px-5 py-4 text-sm font-semibold"
            style={{
              color: titleColor,
              borderBottom: `1px solid ${borderColor}`,
              fontFamily: "'Playfair Display', Georgia, serif",
              background: darkMode ? 'rgba(91,79,207,0.06)' : 'rgba(91,79,207,0.04)',
            }}
          >
            📑 Danh sách chương ({novel.chapters.length})
          </div>

          <div className="divide-y" style={{ borderColor }}>
            {novel.chapters.map(ch => (
              <button
                key={ch.id}
                onClick={() => onSelectChapter(ch)}
                className="w-full text-left px-5 py-4 flex items-center gap-3 transition-all"
                style={{
                  background: chapterBg,
                  color: textColor,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = chapterHover)}
                onMouseLeave={e => (e.currentTarget.style.background = chapterBg)}
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: 'rgba(138,90,200,0.15)',
                    color: subColor,
                    border: '1px solid rgba(138,90,200,0.2)',
                  }}
                >
                  {ch.number}
                </span>
                <span className="flex-1 text-sm">{ch.title}</span>
                <span style={{ color: 'rgba(138,90,200,0.4)', fontSize: 12 }}>▶</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
