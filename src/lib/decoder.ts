// ═══════════════════════════════════════════════════════════
//  CORE DECODER  –  .fro → plain text
//  Pipeline: base64 → emoji string → reverse map → reverse → plain
// ═══════════════════════════════════════════════════════════
import { UPPER_MARKER, getReverseMap } from './emojiMap';

// ── Grapheme splitter dùng Regex Unicode ────────────────────
function splitGraphemes(str: string): string[] {
  // Regex match emoji + combining chars
  const regex = /\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}\uFE0F?\u20E3?|\p{Emoji}\uFE0F?(?:\u200D\p{Emoji}\uFE0F?)*|[\u0300-\u036f\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]|./gsu;
  return str.match(regex) ?? [];
}

// ── Bước 1: b64 → raw emoji string ──────────────────────────
function b64ToStr(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}

// ── Bước 2: emoji string → original text (sau reverse) ──────
function emojiToText(emojiStr: string): string {
  const reverseMap = getReverseMap();
  const segs = splitGraphemes(emojiStr);

  const result: string[] = [];
  let i = 0;
  while (i < segs.length) {
    if (segs[i] === UPPER_MARKER) {
      i++;
      if (i < segs.length) {
        const ch = reverseMap[segs[i]] ?? segs[i];
        result.push(ch.toUpperCase());
        i++;
      }
    } else {
      const ch = reverseMap[segs[i]] ?? segs[i];
      result.push(ch);
      i++;
    }
  }
  return result.join('');
}

// ── Bước 3: reverse string (grapheme-safe) ───────────────────
function reverseStr(s: string): string {
  return splitGraphemes(s).reverse().join('');
}

// ── Public API ───────────────────────────────────────────────
export function decodeFro(rawContent: string): string {
  try {
    const emojiStr = b64ToStr(rawContent.trim());
    const textReversed = emojiToText(emojiStr);
    return reverseStr(textReversed);
  } catch (e) {
    console.error('decodeFro error', e);
    return '';
  }
}

// ── Extract JS payload được nhét vào PNG ─────────────────────
export function extractJsFromPng(buffer: ArrayBuffer): string | null {
  try {
    const bytes = new Uint8Array(buffer);
    const enc = new TextEncoder();
    const MARKER     = enc.encode('/*FRO_PAYLOAD_START*/');
    const END_MARKER = enc.encode('/*FRO_PAYLOAD_END*/');

    let startPos = -1;
    let endPos   = -1;

    scan:
    for (let i = bytes.length - MARKER.length; i >= 0; i--) {
      for (let j = 0; j < MARKER.length; j++) {
        if (bytes[i + j] !== MARKER[j]) continue scan;
      }
      startPos = i + MARKER.length;
      break;
    }
    if (startPos === -1) return null;

    scan2:
    for (let i = startPos; i <= bytes.length - END_MARKER.length; i++) {
      for (let j = 0; j < END_MARKER.length; j++) {
        if (bytes[i + j] !== END_MARKER[j]) continue scan2;
      }
      endPos = i;
      break;
    }
    if (endPos === -1) return null;

    return new TextDecoder('utf-8').decode(bytes.slice(startPos, endPos));
  } catch {
    return null;
  }
}

// ── Decode từ PNG URL (fetch + extract) ──────────────────────
export async function loadDecoderFromPng(pngUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pngUrl);
    const buf = await res.arrayBuffer();
    return extractJsFromPng(buf);
  } catch {
    return null;
  }
}
