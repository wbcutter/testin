// ═══════════════════════════════════════════════════════════
//  STORE – quản lý danh sách truyện, chapter, config
// ═══════════════════════════════════════════════════════════

export interface Chapter {
  id: string;
  title: string;
  froPath: string;    // URL tới file .fro
  number: number;
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  cover?: string;      // URL ảnh bìa
  description: string;
  chapters: Chapter[];
  tags?: string[];
}

// ── Cấu hình nguồn data ──────────────────────────────────────
export interface SourceConfig {
  pngLoaderUrl: string;     // URL file icon.png chứa JS giải mã
  novelIndexUrl: string;    // URL file index (JSON hoặc .fro)
  baseFroUrl: string;       // Base URL chứa các file .fro
}

// ── Local state ───────────────────────────────────────────────
let _config: SourceConfig | null = null;
let _novels: Novel[] = [];
let _decoderReady = false;

export function setConfig(cfg: SourceConfig): void { _config = cfg; }
export function getConfig(): SourceConfig | null { return _config; }

export function setNovels(novels: Novel[]): void { _novels = novels; }
export function getNovels(): Novel[] { return _novels; }

export function setDecoderReady(v: boolean): void { _decoderReady = v; }
export function isDecoderReady(): boolean { return _decoderReady; }

// ── Demo data (dùng khi chưa có server) ─────────────────────
export const DEMO_NOVELS: Novel[] = [
  {
    id: 'demo-1',
    title: 'Tấm Cám – Phiên Bản Hiện Đại',
    author: 'Dân Gian VN',
    description: 'Câu chuyện cổ tích kinh điển được tái hiện trong bối cảnh đương đại, với những tình tiết bất ngờ và ý nghĩa nhân văn sâu sắc...',
    tags: ['Cổ Tích', 'Hiện Đại', 'Phiêu Lưu'],
    chapters: [
      { id: 'c1', title: 'Chương 1: Cuộc Gặp Gỡ Định Mệnh', number: 1, froPath: '/demo/c1.fro' },
      { id: 'c2', title: 'Chương 2: Bão Tố Ập Đến',           number: 2, froPath: '/demo/c2.fro' },
      { id: 'c3', title: 'Chương 3: Ánh Sáng Cuối Đường',     number: 3, froPath: '/demo/c3.fro' },
    ],
  },
  {
    id: 'demo-2',
    title: 'Kiếm Thần Vô Song',
    author: 'Nguyễn Văn A',
    description: 'Một chàng trai bình thường bỗng nhận được hệ thống tu luyện huyền bí, bắt đầu hành trình trở thành kiếm thần vô địch thiên hạ...',
    tags: ['Huyền Huyễn', 'Võ Hiệp', 'Hệ Thống'],
    chapters: [
      { id: 'c1', title: 'Chương 1: Hệ Thống Thức Tỉnh', number: 1, froPath: '/demo/novel2/c1.fro' },
      { id: 'c2', title: 'Chương 2: Đệ Nhất Kiếm',       number: 2, froPath: '/demo/novel2/c2.fro' },
    ],
  },
];

// Demo text để render khi không có .fro thật
export const DEMO_CHAPTER_TEXT = `Hôm đó, mình đi chơi lại thấy bản vẽ này đẹp quá.

Ánh nắng chiều tà trải dài trên con đường làng, nhuộm vàng những tán lá xanh mướt bên đường. Gió nhẹ thổi qua, mang theo hương thơm của hoa dại nở rộ hai bên vệ cỏ.

Cô bé Tấm dừng chân, nhìn ngắm bức tranh thiên nhiên trước mắt với đôi mắt sáng ngời. Lần đầu tiên trong cuộc đời, cô cảm nhận được vẻ đẹp thực sự của thế giới xung quanh mình.

"Nếu cuộc sống luôn đẹp như thế này..." cô thầm nghĩ, đôi môi khẽ cong lên thành nụ cười.

Phía xa, tiếng chuông chùa vang lên ba tiếng trầm bổng, như một lời nhắc nhở rằng khoảnh khắc hiện tại chính là món quà quý giá nhất.

Tấm nhặt một bông hoa dại màu tím nhỏ xinh, cài lên tóc, rồi tiếp tục bước đi trên con đường về nhà quen thuộc. Bước chân cô nhẹ nhàng hơn, tâm hồn thanh thản hơn, như thể tất cả những gánh nặng cuộc đời đã được gió chiều cuốn đi tự lúc nào không hay.

Đây là khởi đầu của một câu chuyện, một hành trình mà cô chưa hề biết trước sẽ dẫn mình đến đâu.

Nhưng không sao. Cô đã sẵn sàng.`;
