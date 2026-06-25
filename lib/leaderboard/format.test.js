import { formatValue, PERIODS, TYPES, MEDALS } from './format';

describe('formatValue', () => {
  test('1000 altı olduğu gibi', () => { expect(formatValue(980)).toBe('980'); });
  test('1000 üstü k ile kısalır', () => { expect(formatValue(1800)).toBe('1.8k'); });
  test('tam binler ondalıksız', () => { expect(formatValue(12000)).toBe('12k'); });
  test('0 ve negatif güvenli', () => { expect(formatValue(0)).toBe('0'); expect(formatValue(-5)).toBe('0'); });
});

test('PERIODS üç dönem içerir', () => {
  expect(PERIODS.map(p => p.key)).toEqual(['weekly', 'monthly', 'alltime']);
  expect(PERIODS[0].label).toBe('Bu Hafta');
});

test('TYPES dört tür ve birim eşler', () => {
  expect(TYPES.map(t => t.key)).toEqual(['xp', 'analyses', 'threads', 'evidence']);
  const xp = TYPES.find(t => t.key === 'xp');
  expect(xp.label).toBe('XP'); expect(xp.unit).toBe('XP');
});

test('MEDALS ilk üçü verir', () => { expect(MEDALS[1]).toBe('🥇'); expect(MEDALS[3]).toBe('🥉'); });
