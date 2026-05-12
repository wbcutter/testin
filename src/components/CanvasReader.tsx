import { useEffect, useRef, useState, useCallback } from 'react';
import { renderTextToSegments, RenderSegment, activateScreenshotProtection } from '../lib/canvasRenderer';

interface Props {
  text: string;
  fontSize?: number;
  darkMode?: boolean;
  containerWidth?: number;
}

export default function CanvasReader({ text, fontSize = 18, darkMode = true, containerWidth = 760 }: Props) {
  const [segments, setSegments] = useState<RenderSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const blobRefs = useRef<string[]>([]);

  const textColor = darkMode ? '#e8dcc8' : '#2c1e12';

  const buildSegments = useCallback(async () => {
    setLoading(true);

    // Revoke blobs cũ
    blobRefs.current.forEach(u => URL.revokeObjectURL(u));
    blobRefs.current = [];

    const maxW = Math.min(containerWidth - 48, 800);

    const segs = await renderTextToSegments(text, {
      fontSize,
      lineHeight: 1.85,
      textColor,
      bgColor: 'transparent',
      maxWidth: maxW,
      paddingX: 0,
      paddingY: 8,
    });

    // Ghi nhớ blob URLs để revoke sau
    segs.forEach(s => {
      if (s.type === 'blob' && s.blobUrl) blobRefs.current.push(s.blobUrl);
    });

    setSegments(segs);
    setLoading(false);
  }, [text, fontSize, textColor, containerWidth]);

  useEffect(() => {
    activateScreenshotProtection();
    buildSegments();
    return () => {
      blobRefs.current.forEach(u => URL.revokeObjectURL(u));
    };
  }, [buildSegments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                background: darkMode ? '#9b7fd4' : '#8b5cf6',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fro-reader-content select-none" style={{ userSelect: 'none' }}>
      {segments.map((seg, idx) => {
        if (seg.type === 'canvas' && seg.canvas) {
          return (
            <CanvasDisplay key={idx} canvas={seg.canvas} />
          );
        }
        // blob: render img siêu nhỏ (1x1) – nhiễu loạn
        if (seg.type === 'blob' && seg.blobUrl) {
          return (
            <img
              key={idx}
              src={seg.blobUrl}
              width={1}
              height={1}
              alt=""
              aria-hidden
              style={{ display: 'inline', opacity: 0, pointerEvents: 'none' }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

// ── Mount canvas DOM node ─────────────────────────────────────
function CanvasDisplay({ canvas }: { canvas: HTMLCanvasElement }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    canvas.style.display = 'block';
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    el.appendChild(canvas);
  }, [canvas]);

  return <div ref={ref} style={{ lineHeight: 0, marginBottom: 0 }} />;
}
