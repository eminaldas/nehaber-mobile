// Saf JWT yardımcıları — yalnız payload okur (imza DOĞRULAMAZ; bunu backend yapar).
// Amaç: token'ın `exp` (bitiş) anını bilip proaktif yenileme zamanlamak.

function b64UrlDecode(str) {
  let s = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin =
    typeof atob === 'function'
      ? atob(s)
      : // Node/test ortamı (Hermes'te atob var; jest'te Buffer)
        // eslint-disable-next-line no-undef
        Buffer.from(s, 'base64').toString('binary');
  // binary string → UTF-8 (Türkçe karakterler bozulmasın)
  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(bin, (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
  } catch (_) {
    return bin;
  }
}

export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(b64UrlDecode(parts[1]));
  } catch (_) {
    return null;
  }
}

// exp (saniye) → milisaniye epoch. Yoksa null.
export function getTokenExpMs(token) {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000;
}
