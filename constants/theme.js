export const palette = {
  brand: {
    primary:   '#1a9e4f',
    secondary: '#157a3c',
    accent:    '#e8f5ee',
    light:     '#d1edd9',
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
};

export const light = {
  bg: {
    base:    '#f2f7f4',
    surface: '#f8fffe',
    solid:   '#eaeef2',
  },
  text: {
    primary:   '#0d2b1a',
    secondary: '#1a4028',
    muted:     '#2e5c3a',
  },
  border:  '#d0d7de',
  skeleton: {
    base:      '#eaeef2',
    highlight: '#f8fffe',
  },
};

export const dark = {
  bg: {
    base:    '#0d1f12',
    surface: '#1a2e1f',
    solid:   '#152619',
  },
  text: {
    primary:   '#e8f5ee',
    secondary: '#b8d9c4',
    muted:     '#7aad8a',
  },
  border:  '#2e4a35',
  skeleton: {
    base:      '#1a2e1f',
    highlight: '#243d28',
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
  sm:   6,
  md:   12,
  lg:   16,
  full: 999,
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
