interface Props {
  darkMode: boolean;
  fontSize: number;
  onToggleDark: () => void;
  onFontSize: (s: number) => void;
  onClose: () => void;
}

export default function SettingsPanel({ darkMode, fontSize, onToggleDark, onFontSize, onClose }: Props) {
  const bg = darkMode ? '#1a1030' : '#fff';
  const border = darkMode ? 'rgba(138,90,200,0.3)' : 'rgba(138,90,200,0.2)';
  const text = darkMode ? '#e8dcc8' : '#3d2b1f';
  const sub = darkMode ? '#9b7fd4' : '#9b59b6';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl p-5 space-y-5"
        style={{ background: bg, border: `1px solid ${border}`, maxHeight: '60vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center">
          <div className="w-12 h-1 rounded-full" style={{ background: border }} />
        </div>

        <h3 className="text-center text-sm font-semibold" style={{ color: text }}>
          ⚙️ Cài đặt đọc truyện
        </h3>

        {/* Dark mode */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium" style={{ color: text }}>Chế độ tối</p>
            <p className="text-xs" style={{ color: sub }}>Đổi giao diện sáng / tối</p>
          </div>
          <button
            onClick={onToggleDark}
            className="relative w-12 h-6 rounded-full transition-colors duration-300"
            style={{
              background: darkMode ? '#5b4fcf' : '#d1d5db',
            }}
          >
            <span
              className="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-300"
              style={{
                background: '#fff',
                transform: darkMode ? 'translateX(24px)' : 'translateX(0)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>

        {/* Font size */}
        <div className="py-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: text }}>Cỡ chữ</p>
            <span className="text-sm font-mono" style={{ color: sub }}>{fontSize}px</span>
          </div>
          <input
            type="range"
            min={14}
            max={26}
            step={1}
            value={fontSize}
            onChange={e => onFontSize(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#5b4fcf', background: border }}
          />
          <div className="flex justify-between text-xs" style={{ color: sub }}>
            <span>A</span>
            <span style={{ fontSize: 16 }}>A</span>
            <span style={{ fontSize: 20 }}>A</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: 'rgba(91,79,207,0.2)',
            border: `1px solid rgba(91,79,207,0.3)`,
            color: '#a78bfa',
          }}
        >
          Xong ✓
        </button>
      </div>
    </div>
  );
}
