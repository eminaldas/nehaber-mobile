// Post tipleri ve tema eşlemeleri (renkler ekranlarda useTheme ile birleştirilir).
export const POST_TYPES = [
  { key: 'iddia',    label: 'İddia',    color: '#fbbf24', desc: 'doğru/yanlış oylanır', icon: 'shield-alert' },
  { key: 'soru',     label: 'Soru',     color: '#60a5fa', desc: 'yanıt aranır',          icon: 'help' },
  { key: 'tartisma', label: 'Tartışma', color: '#c084fc', desc: 'serbest sohbet',        icon: 'message' },
];

export const POST_TYPE_MAP = Object.fromEntries(POST_TYPES.map(t => [t.key, t]));

export const STATUS_MAP = {
  active:       { label: 'Aktif',            color: '#10b981' },
  under_review: { label: 'İnceleme altında', color: '#f59e0b' },
  resolved:     { label: 'Çözüldü',          color: '#3b82f6' },
  closed:       { label: 'Kapalı',           color: '#6f7a86' },
};

export const VERDICT_MAP = {
  DOGRU:       { label: 'DOĞRU',       color: '#10b981' },
  YANLIS:      { label: 'YANLIŞ',      color: '#dc2626' },
  YANILTICI:   { label: 'YANILTICI',   color: '#f59e0b' },
  YANITLANDI:  { label: 'YANITLANDI',  color: '#10b981' },
  YANITLANMADI:{ label: 'YANITLANMADI',color: '#6f7a86' },
};

export const VOTE_COLORS = { suspicious: '#dc2626', authentic: '#10b981', investigate: '#f59e0b' };

export const FORUM_TABS = [
  { key: 'hot',           label: 'Öne çıkan' },
  { key: 'new',           label: 'Yeni' },
  { key: 'controversial', label: 'Tartışmalı' },
  { key: 'bookmarks',     label: 'Kayıtlı' },
];

export const FORUM_CATEGORIES = ['Gündem', 'Siyaset', 'Ekonomi', 'Sağlık', 'Teknoloji', 'Spor', 'Dünya'];

// İddia → 3 yönlü (V1); soru/tartışma → up/down (V3); tartışmada oy gizli.
export const TRUST_BADGE = {
  yeni_uye:    null,
  dogrulayici: { label: 'Doğrulayıcı', color: '#60a5fa' },
  analist:     { label: 'Analist',     color: '#60a5fa' },
  dedektif:    { label: 'Dedektif',    color: '#a855f7' },
};
