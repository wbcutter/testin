import { useEffect, useState, useCallback, useRef } from 'react';
import { initAntiDevtools } from './lib/antiDevtools';
import { DEMO_NOVELS, type Novel } from './lib/store';
import NovelCard from './components/NovelCard';
import NovelDetail from './components/NovelDetail';
import ChapterView from './components/ChapterView';
import SettingsPanel from './components/SettingsPanel';

type Screen = 'home' | 'detail' | 'chapter';

interface Chapter {
  id: string;
  title: string;
  number: number;
  froPath: string;
}

// ── Particles background ──────────────────────────────────────
function Particles({ darkMode }: { darkMode: boolean }) {
  const items = useRef(
    Array.from({ length: darkMode ? 35 : 20 }, (_, i) => ({
      key: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 3.5,
      dur: 12 + Math.random() * 14,
      delay: Math.random() * 12,
      color: darkMode
        ? `rgba(${[138,90,200,90,120,200,200,150,90][i % 9]},${[90,200,200,200,200,200,90,90,200][i % 9]},${[200,200,90,200,200,200,90,200,90][i % 9]},0.6)`
        : undefined,
      symbol: ['🌸','✿','❀','🌺','🌼','✨','🦋','🌷'][i % 8],
    }))
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        overflow: 'hidden', zIndex: 0,
      }}
    >
      {items.current.map(p =>
        darkMode ? (
          <div
            key={p.key}
            style={{
              position: 'absolute',
              left: p.left + '%',
              width: p.size + 'px',
              height: p.size + 'px',
              borderRadius: '50%',
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animation: `floatUp ${p.dur}s ${p.delay}s linear infinite`,
              opacity: 0,
            }}
          />
        ) : (
          <div
            key={p.key}
            style={{
              position: 'absolute',
              left: p.left + '%',
              fontSize: 13 + Math.random() * 8 + 'px',
              animation: `petalFall ${p.dur}s ${p.delay}s linear infinite`,
              opacity: 0,
              userSelect: 'none',
            }}
          >
            {p.symbol}
          </div>
        )
      )}
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode]     = useState(() => localStorage.getItem('fro_dark') !== 'light');
  const [fontSize, setFontSize]     = useState(() => Number(localStorage.getItem('fro_fs')) || 18);
  const [screen, setScreen]         = useState<Screen>('home');
  const [novels]                    = useState<Novel[]>(DEMO_NOVELS);
  const [activeNovel, setActiveNovel] = useState<Novel | null>(null);
  const [activeChap, setActiveChap] = useState<Chapter | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [containerW, setContainerW] = useState(760);
  const containerRef = useRef<HTMLDivElement>(null);

  // Init anti-devtools
  useEffect(() => {
    initAntiDevtools();
  }, []);

  // Measure container width
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setContainerW(Math.min(e.contentRect.width - 48, 800));
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Theme persistence
  useEffect(() => {
    localStorage.setItem('fro_dark', darkMode ? 'dark' : 'light');
    document.documentElement.style.setProperty(
      '--fro-bg', darkMode ? '#0d0d1a' : '#fdf6f0'
    );
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('fro_fs', String(fontSize));
  }, [fontSize]);

  // Keyboard back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleBack = useCallback(() => {
    if (screen === 'chapter') { setScreen('detail'); setActiveChap(null); }
    else if (screen === 'detail') { setScreen('home'); setActiveNovel(null); }
  }, [screen]);

  const selectNovel = (n: Novel) => {
    setActiveNovel(n);
    setScreen('detail');
    window.scrollTo({ top: 0 });
  };

  const selectChapter = (ch: Chapter) => {
    setActiveChap(ch);
    setScreen('chapter');
    window.scrollTo({ top: 0 });
  };

  const prevChapter = () => {
    if (!activeNovel || !activeChap) return;
    const idx = activeNovel.chapters.findIndex(c => c.id === activeChap.id);
    if (idx > 0) selectChapter(activeNovel.chapters[idx - 1]);
  };

  const nextChapter = () => {
    if (!activeNovel || !activeChap) return;
    const idx = activeNovel.chapters.findIndex(c => c.id === activeChap.id);
    if (idx < activeNovel.chapters.length - 1) selectChapter(activeNovel.chapters[idx + 1]);
  };

  const bg = darkMode ? '#0d0d1a' : '#fdf6f0';

  // ── Render screens ────────────────────────────────────────
  if (screen === 'chapter' && activeChap && activeNovel) {
    const idx = activeNovel.chapters.findIndex(c => c.id === activeChap.id);
    return (
      <>
        <style>{KEYFRAMES}</style>
        <Particles darkMode={darkMode} />
        <div ref={containerRef} style={{ position: 'relative', zIndex: 1 }}>
          <ChapterView
            chapter={activeChap}
            novelTitle={activeNovel.title}
            darkMode={darkMode}
            fontSize={fontSize}
            onBack={() => setScreen('detail')}
            onPrev={prevChapter}
            onNext={nextChapter}
            hasPrev={idx > 0}
            hasNext={idx < activeNovel.chapters.length - 1}
            containerWidth={containerW}
          />
        </div>

        {/* FAB settings */}
        <FloatButtons
          darkMode={darkMode}
          onSettings={() => setShowSettings(true)}
          onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />

        {showSettings && (
          <SettingsPanel
            darkMode={darkMode}
            fontSize={fontSize}
            onToggleDark={() => setDarkMode(d => !d)}
            onFontSize={setFontSize}
            onClose={() => setShowSettings(false)}
          />
        )}
      </>
    );
  }

  if (screen === 'detail' && activeNovel) {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <Particles darkMode={darkMode} />
        <div ref={containerRef} style={{ position: 'relative', zIndex: 1 }}>
          <NovelDetail
            novel={activeNovel}
            darkMode={darkMode}
            onBack={() => setScreen('home')}
            onSelectChapter={selectChapter}
          />
        </div>
        <FloatButtons
          darkMode={darkMode}
          onSettings={() => setShowSettings(true)}
          onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
        {showSettings && (
          <SettingsPanel
            darkMode={darkMode}
            fontSize={fontSize}
            onToggleDark={() => setDarkMode(d => !d)}
            onFontSize={setFontSize}
            onClose={() => setShowSettings(false)}
          />
        )}
      </>
    );
  }

  // HOME
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        className="min-h-screen relative"
        style={{ background: bg, transition: 'background 0.3s' }}
      >
        <Particles darkMode={darkMode} />

        <div
          ref={containerRef}
          className="relative z-10 max-w-2xl mx-auto px-4 pb-20"
        >
          {/* Hero header */}
          <div
            className="rounded-b-3xl mb-6 px-6 pt-14 pb-10 text-center relative overflow-hidden"
            style={{
              background: darkMode
                ? 'linear-gradient(160deg,#1a0533 0%,#0d0d2b 60%,#001a33 100%)'
                : 'linear-gradient(160deg,#6b3fa0 0%,#9b59b6 60%,#8e44ad 100%)',
              boxShadow: darkMode
                ? '0 8px 40px rgba(91,79,207,0.3)'
                : '0 8px 40px rgba(107,63,160,0.25)',
            }}
          >
            <div
              className="absolute inset-x-0 top-3 text-center text-xs tracking-[10px] opacity-40"
              style={{ color: '#c9a96e' }}
            >
              ✦ ✦ ✦
            </div>

            <h1
              className="text-3xl font-bold text-white mb-2"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                textShadow: '0 2px 16px rgba(0,0,0,0.4)',
              }}
            >
              📚 Reader
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Thư viện truyện của bạn
            </p>

            <div
              className="absolute inset-x-0 bottom-3 text-center text-xs tracking-[10px] opacity-40"
              style={{ color: '#c9a96e' }}
            >
              ✦ ✦ ✦
            </div>
          </div>

          {/* Search bar (decorative) */}
          <div
            className="mx-2 mb-5 flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{
              background: darkMode ? 'rgba(15,10,30,0.8)' : 'rgba(255,250,245,0.9)',
              border: `1px solid ${darkMode ? 'rgba(138,90,200,0.2)' : 'rgba(107,63,160,0.15)'}`,
            }}
          >
            <span style={{ opacity: 0.5 }}>🔍</span>
            <span
              className="text-sm flex-1"
              style={{ color: darkMode ? 'rgba(200,180,240,0.4)' : 'rgba(100,80,120,0.4)' }}
            >
              Tìm kiếm truyện...
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{
              background: darkMode ? 'rgba(91,79,207,0.2)' : 'rgba(91,79,207,0.1)',
              color: darkMode ? '#a78bfa' : '#6b3fa0',
            }}>
              {novels.length} truyện
            </span>
          </div>

          {/* Novel list */}
          <div className="space-y-3 px-2">
            <h2
              className="text-sm font-semibold mb-3 px-1"
              style={{
                color: darkMode ? '#9b7fd4' : '#9b59b6',
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              ✦ Tất cả truyện
            </h2>

            {novels.map(n => (
              <NovelCard
                key={n.id}
                title={n.title}
                author={n.author}
                description={n.description}
                tags={n.tags}
                chapterCount={n.chapters.length}
                cover={n.cover}
                onClick={() => selectNovel(n)}
              />
            ))}
          </div>

          {/* Footer */}
          <div
            className="text-center mt-10 text-xs"
            style={{ color: darkMode ? 'rgba(155,127,212,0.3)' : 'rgba(107,63,160,0.3)' }}
          >
            Reader System v1.0
          </div>
        </div>

        <FloatButtons
          darkMode={darkMode}
          onSettings={() => setShowSettings(true)}
          onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />

        {showSettings && (
          <SettingsPanel
            darkMode={darkMode}
            fontSize={fontSize}
            onToggleDark={() => setDarkMode(d => !d)}
            onFontSize={setFontSize}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </>
  );
}

// ── FAB buttons ───────────────────────────────────────────────
function FloatButtons({
  darkMode, onSettings, onScrollTop,
}: {
  darkMode: boolean;
  onSettings: () => void;
  onScrollTop: () => void;
}) {
  const fabStyle = {
    position: 'fixed' as const,
    zIndex: 200,
    border: `1px solid ${darkMode ? 'rgba(138,90,200,0.3)' : 'rgba(107,63,160,0.2)'}`,
    background: darkMode ? 'rgba(13,10,26,0.92)' : 'rgba(255,252,250,0.95)',
    backdropFilter: 'blur(8px)',
    color: darkMode ? '#c9a96e' : '#6b3fa0',
    cursor: 'pointer',
    borderRadius: '50%',
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    boxShadow: darkMode ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(107,63,160,0.12)',
    transition: 'transform 0.2s',
  };

  return (
    <>
      <button
        onClick={onSettings}
        style={{ ...fabStyle, top: 16, right: 16 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        title="Cài đặt"
      >
        ⚙️
      </button>
      <button
        onClick={onScrollTop}
        style={{ ...fabStyle, bottom: 24, right: 16 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        title="Lên đầu"
      >
        ⬆
      </button>
    </>
  );
}

// ── Keyframes ─────────────────────────────────────────────────
const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

@keyframes floatUp {
  0%   { transform: translateY(100vh) scale(0); opacity: 0; }
  15%  { opacity: 0.8; }
  85%  { opacity: 0.6; }
  100% { transform: translateY(-5vh) scale(1.2); opacity: 0; }
}
@keyframes petalFall {
  0%   { transform: translateY(-5vh) rotate(0deg); opacity: 0; }
  10%  { opacity: 0.9; }
  90%  { opacity: 0.8; }
  100% { transform: translateY(105vh) rotate(720deg) translateX(40px); opacity: 0; }
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { font-family: 'Lora', Georgia, serif; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(138,90,200,0.3); border-radius: 10px; }

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #5b4fcf;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(91,79,207,0.5);
}
`;
