// Kullanım: BACKEND=http://localhost:8000 node scripts/seed-forum.mjs
const BASE = (process.env.BACKEND || 'http://localhost:8000') + '/api/v1';

async function j(path, opts = {}) {
  const res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }, ...opts });
  if (!res.ok && res.status !== 202) throw new Error(`${opts.method || 'GET'} ${path} → ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

async function register(email, username) {
  try {
    const r = await j('/auth/register', { method: 'POST', body: JSON.stringify({ email, username, password: 'Test1234!', terms_accepted: true }) });
    return r.access_token;
  } catch {
    const form = new URLSearchParams({ username: email, password: 'Test1234!' });
    const res = await fetch(BASE + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
    return (await res.json()).access_token;
  }
}
const auth = (t) => ({ Authorization: `Bearer ${t}` });

const THREADS = [
  { post_type: 'iddia', category: 'Gündem', title: 'İstanbul metro ücretlerine %40 zam yapıldığı iddiası', body: 'Sosyal medyada yayılan görselde yeni tarifenin 35₺ olduğu öne sürülüyor. Kaynak var mı?', tag_names: ['istanbul', 'ulaşım', 'zam'] },
  { post_type: 'soru', category: 'Dünya', title: 'Bu video gerçekten 2024 seçim gecesinden mi?', body: 'Ters görsel arama eski sonuç veriyor, emin olamadım.', tag_names: ['video', 'seçim'] },
  { post_type: 'tartisma', category: 'Teknoloji', title: 'Deprem erken uyarı sistemi neden geç çalıştı?', body: 'Teknik altyapı mı yoksa operasyonel bir sorun mu?', tag_names: ['deprem', 'teknoloji'] },
];

async function main() {
  const u1 = await register('seed_kaan@example.com', 'kaan_dx');
  const u2 = await register('seed_elif@example.com', 'elif');
  const u3 = await register('seed_mert@example.com', 'mert');

  for (const t of THREADS) {
    const thread = await j('/forum/threads', { method: 'POST', headers: auth(u1), body: JSON.stringify(t) });
    console.log('thread:', thread.id, t.title);
    await j(`/forum/threads/${thread.id}/comments`, { method: 'POST', headers: auth(u2), body: JSON.stringify({ body: 'Bence görsel eski, 2022\'den.' }) });
    await j(`/forum/threads/${thread.id}/comments`, { method: 'POST', headers: auth(u3), body: JSON.stringify({ body: 'Resmi kaynak farklı söylüyor.' }) });
    if (t.post_type === 'iddia') {
      await j(`/forum/threads/${thread.id}/vote`, { method: 'POST', headers: auth(u2), body: JSON.stringify({ vote_type: 'suspicious' }) });
      await j(`/forum/threads/${thread.id}/vote`, { method: 'POST', headers: auth(u3), body: JSON.stringify({ vote_type: 'authentic' }) });
    }
  }
  console.log('✓ seed tamam');
}
main().catch(e => { console.error(e); process.exit(1); });
