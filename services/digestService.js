import api from './api';

export async function getTodayDigest() {
  const { data } = await api.get('/digest/today');
  return data; // { summary_text, topics, article_count, slot, ... }
}

const SLOTS = ['09:00', '13:00', '17:00', '21:00'];

export function relSlot(slot) {
  const next = SLOTS[SLOTS.indexOf(slot) + 1];
  return next ? `Sonraki güncelleme ${next}` : "Yarın 09:00'da güncellenir";
}

// summary_text JSON ({summary, sections}) veya düz metin olabilir
export function parseDigest(raw) {
  if (!raw) return { summary: '', sections: [] };
  try {
    const p = JSON.parse(raw);
    if (p && (p.summary || p.sections)) return { summary: p.summary || '', sections: p.sections || [] };
  } catch { /* eski düz-metin format */ }
  return { summary: raw, sections: [] };
}
