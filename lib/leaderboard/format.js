// Saf biçimlendirme — UI'dan bağımsız, test edilebilir.

export function formatValue(n) {
  const v = Number(n) || 0;
  if (v <= 0) return '0';
  if (v < 1000) return String(v);
  const k = v / 1000;
  const s = k.toFixed(1).replace(/\.0$/, '');
  return `${s}k`;
}

export const PERIODS = [
  { key: 'weekly',  label: 'Bu Hafta' },
  { key: 'monthly', label: 'Bu Ay' },
  { key: 'alltime', label: 'Tümü' },
];

export const TYPES = [
  { key: 'xp',       label: 'XP',     unit: 'XP' },
  { key: 'analyses', label: 'Analiz', unit: 'AN' },
  { key: 'threads',  label: 'Başlık', unit: 'BŞ' },
  { key: 'evidence', label: 'Kanıt',  unit: 'KN' },
];

export const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
