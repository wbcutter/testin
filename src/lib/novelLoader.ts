// ═══════════════════════════════════════════════════════════
//  NOVEL LOADER
//  Load danh sách truyện từ /stories/index.json
//  Fallback về DEMO_NOVELS nếu không có
// ═══════════════════════════════════════════════════════════
import { DEMO_NOVELS, type Novel } from './store';

// Decoder từ PNG loader (inject bởi loader.js)
declare global {
  interface Window {
    __xrf_d__?: { d: (raw: string) => string };
  }
}

export async function loadNovels(): Promise<Novel[]> {
  try {
    const res = await fetch('/stories/index.json');
    if (!res.ok) throw new Error('index.json not found');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data as Novel[];
    return DEMO_NOVELS;
  } catch {
    return DEMO_NOVELS;
  }
}

export async function loadChapterText(froPath: string): Promise<string> {
  // Demo paths
  if (froPath.startsWith('/demo')) {
    await new Promise(r => setTimeout(r, 200));
    return DEMO_TEXT;
  }

  const res = await fetch(froPath);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.text();

  // Dùng decoder từ PNG nếu có
  const dec = window.__xrf_d__?.d;
  if (dec) {
    return dec(raw.trim());
  }

  // Fallback: import decoder module
  const { decodeFro } = await import('./decoder');
  return decodeFro(raw);
}

// ── Wait for PNG loader ──────────────────────────────────────
export function waitForDecoder(timeout = 5000): Promise<boolean> {
  return new Promise(resolve => {
    if (window.__xrf_d__) { resolve(true); return; }
    const start = Date.now();
    const iv = setInterval(() => {
      if (window.__xrf_d__) { clearInterval(iv); resolve(true); }
      if (Date.now() - start > timeout) { clearInterval(iv); resolve(false); }
    }, 100);
  });
}

const DEMO_TEXT = `Hôm đó, mình đi chơi lại thấy bản vẽ này đẹp quá.

Ánh nắng chiều tà trải dài trên con đường làng, nhuộm vàng những tán lá xanh mướt bên đường. Gió nhẹ thổi qua, mang theo hương thơm của hoa dại nở rộ hai bên vệ cỏ.

Cô bé Tấm dừng chân, nhìn ngắm bức tranh thiên nhiên trước mắt với đôi mắt sáng ngời. Lần đầu tiên trong cuộc đời, cô cảm nhận được vẻ đẹp thực sự của thế giới xung quanh mình.

"Nếu cuộc sống luôn đẹp như thế này..." cô thầm nghĩ, đôi môi khẽ cong lên thành nụ cười.

Phía xa, tiếng chuông chùa vang lên ba tiếng trầm bổng, như một lời nhắc nhở rằng khoảnh khắc hiện tại chính là món quà quý giá nhất.

Tấm nhặt một bông hoa dại màu tím nhỏ xinh, cài lên tóc, rồi tiếp tục bước đi trên con đường về nhà quen thuộc. Bước chân cô nhẹ nhàng hơn, tâm hồn thanh thản hơn, như thể tất cả những gánh nặng cuộc đời đã được gió chiều cuốn đi tự lúc nào không hay.

Đây là khởi đầu của một câu chuyện, một hành trình mà cô chưa hề biết trước sẽ dẫn mình đến đâu. Nhưng không sao – cô đã sẵn sàng.

Ngày hôm sau, khi ánh bình minh vừa ló dạng, Tấm đã thức dậy từ rất sớm. Mặt trời còn chưa lên cao, nhưng cô đã có mặt bên bờ giếng, xách nước tưới cho vườn rau nhỏ sau nhà.

Mẹ kế nhìn qua cửa sổ, mắt lạnh như băng. Cô Cám ngồi ăn bánh trong buồng, thỉnh thoảng ném ra những câu chế nhạo mà Tấm đã quá quen thuộc.

Nhưng hôm nay khác. Hôm nay có điều gì đó trong lòng Tấm đã thay đổi.

Cô không còn cúi đầu cam chịu. Cô ngẩng đầu nhìn về phía chân trời xa xăm, nơi ánh sáng đang dần lan tỏa, và mỉm cười.

Câu chuyện của cô – câu chuyện thật sự – bắt đầu từ khoảnh khắc ấy.`;
