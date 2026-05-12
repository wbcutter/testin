interface Props {
  title: string;
  author: string;
  description: string;
  tags?: string[];
  chapterCount: number;
  cover?: string;
  onClick: () => void;
}

export default function NovelCard({ title, author, description, tags, chapterCount, cover, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group transition-all duration-300"
      style={{ background: 'none', border: 'none', padding: 0 }}
    >
      <div
        className="rounded-2xl overflow-hidden border transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl"
        style={{
          background: 'rgba(15,10,30,0.85)',
          borderColor: 'rgba(138,90,200,0.25)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top gradient bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg,#5b4fcf,#9b59b6,transparent)' }} />

        <div className="flex gap-4 p-5">
          {/* Cover */}
          <div
            className="flex-shrink-0 rounded-xl overflow-hidden"
            style={{ width: 72, height: 100 }}
          >
            {cover ? (
              <img src={cover} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(135deg,#2d1b69,#11998e)' }}
              >
                📚
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-base mb-1 truncate"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#c9a96e',
              }}
            >
              {title}
            </h3>
            <p className="text-sm mb-2" style={{ color: '#9b7fd4' }}>
              ✍️ {author}
            </p>
            <p
              className="text-xs leading-relaxed mb-3 line-clamp-2"
              style={{ color: '#8a7a6a' }}
            >
              {description}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex flex-wrap gap-1">
                {tags?.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(138,90,200,0.15)',
                      border: '1px solid rgba(138,90,200,0.3)',
                      color: '#a78bfa',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs" style={{ color: '#6b5b8b' }}>
                📖 {chapterCount} chương
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
