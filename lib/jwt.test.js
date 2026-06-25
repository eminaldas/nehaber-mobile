import { decodeJwt, getTokenExpMs } from './jwt';

// base64url encode helper (test-only) — JWT segmentleri böyle kodlanır
function seg(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function makeToken(payload) {
  return `${seg({ alg: 'HS256', typ: 'JWT' })}.${seg(payload)}.sig`;
}

test('decodeJwt geçerli token payload döner', () => {
  const t = makeToken({ sub: 'u1', username: 'emin', exp: 1700000000 });
  expect(decodeJwt(t)).toEqual({ sub: 'u1', username: 'emin', exp: 1700000000 });
});

test('decodeJwt UTF-8 (Türkçe) karakterleri bozmaz', () => {
  const t = makeToken({ username: 'Şükrü', exp: 1 });
  expect(decodeJwt(t).username).toBe('Şükrü');
});

test('getTokenExpMs exp saniyeyi milisaniyeye çevirir', () => {
  const t = makeToken({ exp: 1700000000 });
  expect(getTokenExpMs(t)).toBe(1700000000 * 1000);
});

test('exp yoksa getTokenExpMs null döner', () => {
  expect(getTokenExpMs(makeToken({ sub: 'x' }))).toBeNull();
});

test('bozuk token hata fırlatmaz, null döner', () => {
  expect(decodeJwt('not-a-jwt')).toBeNull();
  expect(decodeJwt('')).toBeNull();
  expect(decodeJwt(null)).toBeNull();
  expect(getTokenExpMs('garbage')).toBeNull();
});
