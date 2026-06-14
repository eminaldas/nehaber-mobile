export function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function timeAgo(iso, nowMs = Date.now()) {
  const diff = Math.max(0, nowMs - new Date(iso).getTime());
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return 'az önce';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}dk`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}sa`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}g`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}h`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}ay`;
  return `${Math.floor(day / 365)}y`;
}

export function voteDistribution({ vote_suspicious = 0, vote_authentic = 0, vote_investigate = 0 } = {}) {
  const total = vote_suspicious + vote_authentic + vote_investigate;
  return {
    total,
    sPct: pct(vote_suspicious, total),
    aPct: pct(vote_authentic, total),
    iPct: pct(vote_investigate, total),
  };
}
