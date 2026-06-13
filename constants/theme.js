export const palette = {
  brand: {
    primary:   '#10b981',   // emerald — yalnızca aksan (aktif sekme, badge, köşe HUD)
    secondary: '#0e9f6e',
    bright:    '#3fff8b',   // parlak yeşil — aktif ikon/çizgi (koyu zeminde pop)
    accent:    '#0c1b16',   // koyu emerald-siyah dolgu (placeholder vb.)
    light:     '#1a2e26',
  },
  authentic: {
    bg:     '#dcfce7',
    border: '#16a34a',
    text:   '#15803d',
    fill:   '#16a34a',
    track:  '#bbf7d0',
  },
  fake: {
    bg:     '#fee2e2',
    border: '#dc2626',
    text:   '#b91c1c',
    fill:   '#dc2626',
    track:  '#fecaca',
  },
  neutral: {
    bg:     '#f4f4f5',
    border: '#a1a1aa',
    text:   '#71717a',
    fill:   '#a1a1aa',
  },
  risk: {
    low:    '#16a34a',
    medium: '#d97706',
    high:   '#dc2626',
  },
  trust: {
    high:   '#16a34a',
    medium: '#d97706',
    low:    '#dc2626',
  },
  // Analiz verdict renkleri — dark-tema uyumlu (web analysisTheme hex'leri)
  verdict: {
    authentic: '#3fff8b',
    fake:      '#ff7351',
    iddia:     '#f59e0b',
    neutral:   '#9aa4ad',
  },
};

export const light = {
  bg: {
    base:    '#f2f7f4',
    surface: '#f8fffe',
    solid:   '#eaeef2',
    deepest: '#ffffff',   // top bar / nav bar
  },
  text: {
    primary:   '#0d2b1a',
    secondary: '#1a4028',
    muted:     '#5a6b62',
  },
  border:  '#d0d7de',
  skeleton: {
    base:      '#eaeef2',
    highlight: '#f8fffe',
  },
};

// Siyaha yakın — neredeyse saf siyah arka plan, nötr gri metin, yeşil yalnızca aksan
export const dark = {
  bg: {
    base:    '#06080b',
    surface: '#0d1116',
    solid:   '#161b21',
    deepest: '#070a0d',   // top bar / nav bar
  },
  text: {
    primary:   '#eef3f7',
    secondary: '#c5cdd5',
    muted:     '#6f7a86',
  },
  border:  '#1d232a',
  skeleton: {
    base:      '#11161c',
    highlight: '#1b222a',
  },
};

export const typography = {
  xs:  11,
  sm:  13,
  md:  15,
  lg:  18,
  xl:  22,
  xxl: 28,
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const radius = {
  none: 0,    // brutalist kare köşe
  sm:   6,
  md:   12,
  lg:   16,
  full: 999,
};

export const fonts = {
  regular:   'Manrope_400Regular',
  medium:    'Manrope_500Medium',
  semibold:  'Manrope_600SemiBold',
  bold:      'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
  logo:      'Pacifico_400Regular',
};

export function getRiskColor(score) {
  if (score < 0.3) return palette.risk.low;
  if (score < 0.6) return palette.risk.medium;
  return palette.risk.high;
}

export function getTrustColor(score) {
  if (score >= 0.7) return palette.trust.high;
  if (score >= 0.4) return palette.trust.medium;
  return palette.trust.low;
}

// Haber kartı/hero için durum rozeti — nlp_score (sahtelik) ve trust_score'a göre
export function getVerdict({ nlp_score, trust_score } = {}) {
  if (nlp_score != null && nlp_score >= 0.6)   return { label: 'ŞÜPHELİ',    color: palette.fake.fill };
  if (trust_score != null && trust_score >= 0.7) return { label: 'DOĞRULANDI', color: palette.brand.primary };
  return { label: 'ANALİZ', color: palette.neutral.fill };
}

// Analiz sonucu durum teması (web analysisTheme.getTheme karşılığı)
// icon: Ionicons adı
export function getAnalysisTheme(status) {
  const s = (status || '').toUpperCase();
  const isAuthentic = ['AUTHENTIC', 'TRUE', 'GÜVENİLİR', 'REAL'].includes(s);
  const isFake      = ['FAKE', 'FALSE', 'YANILTICI'].includes(s);
  const isIddia     = ['IDDIA', 'UNCERTAIN'].includes(s);

  if (isAuthentic) return {
    hex: palette.verdict.authentic, icon: 'shield-checkmark',
    label: 'ANALİZ TAMAMLANDI', mainTitle: 'Güvenilir İçerik Tespit Edildi', kind: 'authentic',
  };
  if (isFake) return {
    hex: palette.verdict.fake, icon: 'shield',
    label: 'RİSK TESPİT EDİLDİ', mainTitle: 'Yüksek Yanıltma Riski Mevcut', kind: 'fake',
  };
  if (isIddia) return {
    hex: palette.verdict.iddia, icon: 'shield-half',
    label: 'İDDİA TESPİT EDİLDİ', mainTitle: 'İddia / Doğrulanamadı', kind: 'iddia',
  };
  return {
    hex: palette.verdict.neutral, icon: 'shield-outline',
    label: 'ANALİZ SONUCU', mainTitle: 'Sonuç Belirsiz', kind: 'neutral',
  };
}

// hex + alfa yardımcısı (web hex08/hex15/hex30 karşılığı)
export const alpha = (hex, a) => `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`;
