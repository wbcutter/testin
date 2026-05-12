// ═══════════════════════════════════════════════════════════
//  ANTI-DEVTOOLS GUARD
//  - Chặn F12, Ctrl+Shift+I/J/C, Ctrl+U
//  - Detect devtools mở → redirect 404
//  - Chặn chuột phải
//  - Chặn text selection trên reader
//  - Chặn bypass script (override setInterval/setTimeout/eval)
// ═══════════════════════════════════════════════════════════

let _guardActive = false;
let _redirecting = false;

function doRedirect(): void {
  if (_redirecting) return;
  _redirecting = true;
  // Xóa toàn bộ DOM rồi chuyển về trang trắng 404
  document.documentElement.innerHTML = `
    <html><head><title>404 Not Found</title></head>
    <body style="background:#000;color:#fff;font-family:monospace;
      display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
      <div>404 | Page Not Found</div>
    </body></html>`;
  setTimeout(() => { window.location.replace('/404'); }, 800);
}

// ── Detect devtools bằng timing + size ───────────────────────
function startDevtoolsDetection(): void {
  // Method 1: window size diff
  const threshold = 160;
  function checkSize(): void {
    const diff = window.outerWidth - window.innerWidth;
    const diffH = window.outerHeight - window.innerHeight;
    if (diff > threshold || diffH > threshold) {
      doRedirect();
    }
  }

  // Method 2: console.log timing trick
  let devtoolsOpen = false;
  const img = new Image();
  Object.defineProperty(img, 'id', {
    get() {
      devtoolsOpen = true;
      return '';
    }
  });

  // Method 3: debugger timing
  function timingCheck(): void {
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    const end = performance.now();
    if (end - start > 100) {
      doRedirect();
    }
  }

  setInterval(() => {
    checkSize();
    // Mỗi 3 giây mới check timing để tránh false positive
  }, 1000);

  setInterval(() => {
    timingCheck();
  }, 3000);

  // Method 4: toString trick
  setInterval(() => {
    const check = /./;
    check.toString = () => { devtoolsOpen = true; return ''; };
    console.log('%c', check);
    if (devtoolsOpen) {
      devtoolsOpen = false;
      doRedirect();
    }
  }, 2000);
}

// ── Hardening: override các hàm hay bị tamper ─────────────────
function hardenRuntime(): void {
  // Chặn eval chạy mã inject từ ngoài
  const _origEval = window.eval;
  try {
    (window as Window & { eval: typeof eval }).eval = function(code: string) {
      // Cho phép eval nội bộ (từ cùng script context)
      if (typeof code !== 'string') return _origEval(code);
      // Block nếu chứa các keyword đặc trưng của bypass script
      const suspicious = [
        'unsafeWindow', 'GM_setValue', 'GM_getValue',
        'tampermonkey', 'greasemonkey', '__tdmp',
        'installCanvasTextCapture', 'installReaderEnvironmentGuard',
      ];
      for (const kw of suspicious) {
        if (code.includes(kw)) {
          console.warn('[Guard] Blocked suspicious eval');
          return undefined;
        }
      }
      return _origEval(code);
    };
  } catch { /* ignore */ }

  // Detect nếu ai override CanvasRenderingContext2D.fillText
  const _origFillText = CanvasRenderingContext2D.prototype.fillText;
  let _fillTextHooked = false;
  setInterval(() => {
    if (CanvasRenderingContext2D.prototype.fillText !== _origFillText) {
      if (!_fillTextHooked) {
        _fillTextHooked = true;
        // Restore
        CanvasRenderingContext2D.prototype.fillText = _origFillText;
        doRedirect();
      }
    }
  }, 500);

  // Chặn querySelectorAll bị patch để tìm script src
  const _origQSA = Document.prototype.querySelectorAll;
  try {
    Document.prototype.querySelectorAll = function(sel: string, ...args: unknown[]) {
      // Nếu ai đang tìm script[src] để tìm extension scripts → trả về rỗng
      if (sel && sel.toString().trim() === 'script[src]') {
        const all = _origQSA.call(this, sel, ...(args as []));
        // Lọc extension URLs
        return Array.from(all).filter(el => {
          const src = (el as HTMLScriptElement).src || '';
          return !/chrome-extension|moz-extension|safari-extension/i.test(src);
        }) as unknown as NodeListOf<Element>;
      }
      return _origQSA.call(this, sel, ...(args as []));
    };
  } catch { /* ignore */ }
}

// ── Block keyboard shortcuts & context menu ───────────────────
function blockKeyboardAndMenu(): void {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return false; }
    // Ctrl+Shift+I/J/C/K
    if (e.ctrlKey && e.shiftKey && ['I','J','C','K'].includes(e.key.toUpperCase())) {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    // Ctrl+S (save)
    if (e.ctrlKey && e.key.toUpperCase() === 'S') {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    // Ctrl+A (select all)
    if (e.ctrlKey && e.key.toUpperCase() === 'A') {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    // Ctrl+P (print)
    if (e.ctrlKey && e.key.toUpperCase() === 'P') {
      e.preventDefault(); e.stopPropagation(); return false;
    }
  }, true);

  document.addEventListener('contextmenu', (e: MouseEvent) => {
    e.preventDefault(); return false;
  }, true);

  // Block drag
  document.addEventListener('dragstart', (e: DragEvent) => {
    e.preventDefault(); return false;
  }, true);

  // Block select
  document.addEventListener('selectstart', (e: Event) => {
    e.preventDefault(); return false;
  }, true);
}

// ── Public init ───────────────────────────────────────────────
export function initAntiDevtools(): void {
  if (_guardActive) return;
  _guardActive = true;

  try {
    hardenRuntime();
    startDevtoolsDetection();
    blockKeyboardAndMenu();
  } catch (e) {
    console.error('[Guard] init error', e);
  }
}
