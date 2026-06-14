import { pct, timeAgo, voteDistribution, dateLabel } from './format';

test('pct yüzde hesaplar', () => {
  expect(pct(1, 4)).toBe(25);
});

test('dateLabel TR ay kısaltması içerir', () => {
  expect(dateLabel(new Date(2026, 5, 14).toISOString())).toMatch(/Haz 2026$/);
});

describe('timeAgo', () => {
  const now = new Date('2026-06-14T12:00:00Z').getTime();
  test('dakika', () => {
    expect(timeAgo('2026-06-14T11:30:00Z', now)).toBe('30dk');
  });
  test('saat', () => {
    expect(timeAgo('2026-06-14T09:00:00Z', now)).toBe('3sa');
  });
  test('gün', () => {
    expect(timeAgo('2026-06-12T12:00:00Z', now)).toBe('2g');
  });
  test('az önce', () => {
    expect(timeAgo('2026-06-14T11:59:30Z', now)).toBe('az önce');
  });
});

describe('voteDistribution', () => {
  test('yüzdeler + toplam', () => {
    const d = voteDistribution({ vote_suspicious: 128, vote_authentic: 41, vote_investigate: 18 });
    expect(d.total).toBe(187);
    expect(d.sPct).toBe(68);
    expect(d.aPct).toBe(22);
    expect(d.iPct).toBe(10);
  });
  test('sıfır oyda hepsi 0', () => {
    const d = voteDistribution({ vote_suspicious: 0, vote_authentic: 0, vote_investigate: 0 });
    expect(d.total).toBe(0);
    expect(d.sPct).toBe(0);
  });
});
