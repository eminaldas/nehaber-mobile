import { pct } from './format';

test('pct yüzde hesaplar', () => {
  expect(pct(1, 4)).toBe(25);
});
