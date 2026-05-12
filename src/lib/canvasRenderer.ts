// ═══════════════════════════════════════════════════════════
//  CANVAS RENDERER
//  Render plain text → canvas segments
//  Xen kẽ blob img giả để gây rối reverse
// ═══════════════════════════════════════════════════════════

export interface RenderSegment {
  type: 'canvas' | 'blob';
  canvas?: HTMLCanvasElement;
  blobUrl?: string;
  height: number;
}

export interface RenderOptions {
  fontSize: number;        // px
  lineHeight: number;      // multiplier
  fontFamily: string;
  textColor: string;
  bgColor: string;
  maxWidth: number;        // px
  paddingX: number;
  paddingY: number;
}

const DEFAULT_OPTS: RenderOptions = {
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'Georgia, "Times New Roman", serif',
  textColor: '#e8dcc8',
  bgColor: 'transparent',
  maxWidth: 800,
  paddingX: 24,
  paddingY: 16,
};

// ── Wrap text thành lines ─────────────────────────────────────
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (paragraph.trim() === '') { lines.push(''); continue; }
    const words = paragraph.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

// ── Tạo 1 canvas segment ─────────────────────────────────────
function renderChunk(
  lines: string[],
  opts: RenderOptions
): HTMLCanvasElement {
  const lineH = opts.fontSize * opts.lineHeight;
  const height = lines.length * lineH + opts.paddingY * 2;
  const width  = opts.maxWidth + opts.paddingX * 2;

  const cv = document.createElement('canvas');
  cv.width  = width;
  cv.height = Math.ceil(height);

  const ctx = cv.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);

  if (opts.bgColor && opts.bgColor !== 'transparent') {
    ctx.fillStyle = opts.bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.font      = `${opts.fontSize}px ${opts.fontFamily}`;
  ctx.fillStyle = opts.textColor;
  ctx.textBaseline = 'top';

  lines.forEach((line, i) => {
    const y = opts.paddingY + i * lineH;
    ctx.fillText(line, opts.paddingX, y);
  });

  return cv;
}

// ── Tạo noise blob (ảnh ngẫu nhiên nhỏ) ──────────────────────
function createNoiseBlob(): Promise<string> {
  return new Promise(resolve => {
    const cv = document.createElement('canvas');
    cv.width  = 1;
    cv.height = 1;
    const ctx = cv.getContext('2d')!;
    // Pixel ngẫu nhiên trong suốt
    ctx.fillStyle = `rgba(${Math.random()*255|0},${Math.random()*255|0},${Math.random()*255|0},0.01)`;
    ctx.fillRect(0, 0, 1, 1);
    cv.toBlob(blob => {
      if (!blob) { resolve(''); return; }
      const url = URL.createObjectURL(blob);
      // Revoke sau 100ms (blob tồn tại ngắn)
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      resolve(url);
    }, 'image/png');
  });
}

// ── Public: render toàn bộ text thành segments ───────────────
export async function renderTextToSegments(
  text: string,
  userOpts: Partial<RenderOptions> = {}
): Promise<RenderSegment[]> {
  const opts = { ...DEFAULT_OPTS, ...userOpts };
  const segments: RenderSegment[] = [];

  // Tạo canvas tạm để measure text
  const measureCv  = document.createElement('canvas');
  const measureCtx = measureCv.getContext('2d')!;
  measureCtx.font  = `${opts.fontSize}px ${opts.fontFamily}`;

  const allLines = wrapText(measureCtx, text, opts.maxWidth);

  // Chia nhỏ: mỗi canvas ~ 30 dòng (tránh canvas quá to)
  const CHUNK = 30;
  let lineIdx = 0;

  while (lineIdx < allLines.length) {
    const chunk = allLines.slice(lineIdx, lineIdx + CHUNK);
    lineIdx += CHUNK;

    const cv = renderChunk(chunk, opts);
    segments.push({
      type: 'canvas',
      canvas: cv,
      height: cv.height,
    });

    // Xen kẽ noise blob ngẫu nhiên (~30% xác suất)
    if (Math.random() < 0.3 && lineIdx < allLines.length) {
      const bUrl = await createNoiseBlob();
      if (bUrl) {
        segments.push({ type: 'blob', blobUrl: bUrl, height: 1 });
      }
    }
  }

  return segments;
}

// ── Screenshot protection: overlay đen khi visibility hidden ─
let _protectionActive = false;
export function activateScreenshotProtection(): void {
  if (_protectionActive) return;
  _protectionActive = true;

  const overlay = document.createElement('div');
  overlay.id = '__fro_overlay__';
  overlay.style.cssText = `
    position:fixed;inset:0;background:#000;z-index:2147483647;
    display:none;pointer-events:none;
  `;
  document.body.appendChild(overlay);

  // Ẩn nội dung khi tab mất focus (screenshot tools)
  document.addEventListener('visibilitychange', () => {
    overlay.style.display = document.hidden ? 'block' : 'none';
  });

  // Print protection
  const style = document.createElement('style');
  style.textContent = `@media print { * { display:none!important; } }`;
  document.head.appendChild(style);
}
