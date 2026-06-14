# Forum Mobil — Faz 1 Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `nehaber-mobile` forumunu salt-okunur taslaktan, oylama + yorum/yanıt + beğeni + rapor + kaydet + paylaş + yeni gönderi yapabilen çekirdek bir deneyime taşımak.

**Architecture:** Ekran → react-query hook → `forumService` (axios `api`) → mevcut FastAPI forum API. Saf mantık (format, optimistic oy/beğeni) `lib/forum/` altında TDD ile; UI bileşenleri uygulama çalıştırılarak görsel doğrulanır. Tasarım dili: koyu/emerald, keskin köşe, SVG ikon, sol-çizgi kart, sabit alt oy dock'u (spec: `docs/specs/2026-06-14-forum-mobil-design.md`).

**Tech Stack:** Expo / React Native, expo-router, @tanstack/react-query, axios, react-native-svg, expo-image, expo-image-picker, expo-blur. Test: jest-expo.

**Test yaklaşımı:** Saf mantık birimleri için TDD (jest). Servis çağrıları mock'lanmış `api` ile test. Ekran/bileşenler `npx expo start` ile elle/görsel doğrulanır (projenin mevcut pratiği).

**Backend referansı:** `Fake-News-Detection-System/app/api/v1/endpoints/forum.py` (DEĞİŞMEZ). Önemli uçlar:
- `GET /forum/threads/discover?sort=hot|new|controversial&category=&tag=&page=&size=` → `ForumThreadSummary` listesi; `current_user_vote` + `is_bookmarked` **dahil** (feed için bunu kullan).
- `GET /forum/bookmarks/me?page=&size=` → kayıtlılar.
- `GET /forum/threads/{id}` → `ForumThreadDetail` (`comments` zaten iç içe ağaç).
- `POST /forum/threads/{id}/vote` `{vote_type}` → `ForumVoteResult`. vote_type: `suspicious|authentic|investigate|up|down`. Aynı oya tekrar = geri çekme. Sonuçlanmışsa 409.
- `POST /forum/threads/{id}/comments` `{body, parent_id?, evidence_urls?}` → 201 `ForumCommentItem`; AI flag'lerse 202.
- `POST /forum/comments/{id}/vote` → 204 (faydalı toggle).
- `POST /forum/comments/{id}/report` `{reason}`; `POST /forum/threads/{id}/report` `{reason}`.
- `POST /forum/threads/{id}/bookmark` → 204 (toggle).
- `POST /forum/threads` `{title, body, category, post_type, tag_names[], image_urls[], article_id?}` → 201 `ForumThreadDetail`.
- `GET /forum/tags?search=&category=` → `{tags:[{id,name,is_system,usage_count}]}`.

**Veri şekilleri (backend `schemas.py`):**
- `ForumThreadSummary`: `id, title, category, status, vote_suspicious, vote_authentic, vote_investigate, comment_count, created_at, author{id,username,avatar_url}, tags[], article_id, image_urls[], is_bookmarked, current_user_vote, verdict, verdict_reason, verdict_by, verdict_at, post_type, featured_comment_id`
- `ForumThreadDetail`: yukarıdakiler + `body, article{id,title,ai_verdict,confidence,image_url,source_url,source_name}, comments[], featured_evidence, ai_evidence_analysis, ai_evidence_verdict`
- `ForumCommentItem`: `id, thread_id, parent_id, user_id, username, avatar_url, body, evidence_urls[], helpful_count, verified_count, is_featured_evidence, current_user_verified, depth, is_highlighted, created_at, moderation_status, replies[]`
- `ForumVoteResult`: `vote_suspicious, vote_authentic, vote_investigate, vote_up, vote_down, status, current_user_vote`

---

## Dosya yapısı

**Oluşturulacak:**
- `jest.config.js`, `jest.setup.js`
- `lib/forum/format.js` + `lib/forum/format.test.js`
- `lib/forum/voteLogic.js` + `lib/forum/voteLogic.test.js`
- `services/forumService.test.js` (mevcut `forumService.js` genişletilecek)
- `constants/forum.js`
- `components/ui/Icon.js`
- `components/forum/Avatar.js`
- `components/forum/PostTypeBadge.js`
- `components/forum/StatusChip.js`
- `components/forum/AIChip.js`
- `components/forum/VoteControl.js`
- `components/forum/VoteDistributionBar.js`
- `components/forum/VoteDock.js`
- `components/forum/ForumCard.js`
- `components/forum/LinkedArticleCard.js`
- `components/forum/FeaturedEvidence.js`
- `components/forum/CommentComposer.js`
- `components/forum/CommentItem.js`
- `components/forum/CommentTree.js`
- `components/forum/CreateThreadForm.js`
- `components/forum/ForumActionSheet.js`
- `hooks/useForum.js` (forum hook'larının tümü tek dosyada)
- `app/(tabs)/forum/yeni.js`
- `scripts/seed-forum.mjs`

**Değiştirilecek:**
- `package.json` (test script + devDeps)
- `services/forumService.js` (tam genişletme)
- `app/(tabs)/forum/index.js` (yeniden yazım)
- `app/(tabs)/forum/[id].js` (yeniden yazım)

---

## Task 0: Test altyapısı (jest-expo)

**Files:**
- Modify: `package.json`
- Create: `jest.config.js`, `jest.setup.js`
- Create (geçici smoke): `lib/forum/format.js`, `lib/forum/format.test.js`

- [ ] **Step 1: jest bağımlılıklarını kur**

Run:
```bash
cd /c/Users/emina/Documents/GitHub/nehaber-mobile
npm i -D jest jest-expo @types/jest
```
Expected: `node_modules/jest-expo` oluşur, hata yok.

- [ ] **Step 2: `package.json`'a test script ekle**

`"scripts"` bloğuna ekle:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 3: `jest.config.js` oluştur**

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tanstack/.*))',
  ],
  testMatch: ['**/*.test.js'],
};
```

- [ ] **Step 4: `jest.setup.js` oluştur (boş yer tutucu, ileride mock'lar)**

```js
// Jest global kurulum. Şimdilik boş; modül mock'ları test dosyalarında yapılır.
```

- [ ] **Step 5: Smoke test — failing test yaz**

`lib/forum/format.test.js`:
```js
import { pct } from './format';

test('pct yüzde hesaplar', () => {
  expect(pct(1, 4)).toBe(25);
});
```

- [ ] **Step 6: Testi çalıştır, fail görmeli**

Run: `npx jest lib/forum/format.test.js`
Expected: FAIL — `Cannot find module './format'`.

- [ ] **Step 7: Minimal `lib/forum/format.js` ile geçir**

```js
export function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
```

- [ ] **Step 8: Test geçer**

Run: `npx jest lib/forum/format.test.js`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json jest.config.js jest.setup.js lib/forum/format.js lib/forum/format.test.js
git commit -m "test: jest-expo kurulumu + ilk forum format helper"
```

---

## Task 1: Format yardımcıları (TDD)

**Files:**
- Modify: `lib/forum/format.js`
- Modify: `lib/forum/format.test.js`

- [ ] **Step 1: `timeAgo` ve `voteDistribution` için failing testler ekle**

`lib/forum/format.test.js` (mevcut `pct` testinin altına ekle):
```js
import { pct, timeAgo, voteDistribution } from './format';

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
```

- [ ] **Step 2: Çalıştır, fail görmeli**

Run: `npx jest lib/forum/format.test.js`
Expected: FAIL — `timeAgo is not a function`.

- [ ] **Step 3: `lib/forum/format.js`'i genişlet**

```js
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
```

- [ ] **Step 4: Test geçer**

Run: `npx jest lib/forum/format.test.js`
Expected: PASS (tüm testler).

- [ ] **Step 5: Commit**

```bash
git add lib/forum/format.js lib/forum/format.test.js
git commit -m "feat(forum): timeAgo + voteDistribution format helpers (TDD)"
```

---

## Task 2: Optimistic oy/beğeni mantığı (TDD)

**Files:**
- Create: `lib/forum/voteLogic.js`, `lib/forum/voteLogic.test.js`

- [ ] **Step 1: Failing testler yaz**

`lib/forum/voteLogic.test.js`:
```js
import { applyThreadVote, applyHelpful } from './voteLogic';

const base = { vote_suspicious: 10, vote_authentic: 5, vote_investigate: 2, current_user_vote: null };

describe('applyThreadVote', () => {
  test('yeni oy ekler', () => {
    const r = applyThreadVote(base, 'suspicious');
    expect(r.vote_suspicious).toBe(11);
    expect(r.current_user_vote).toBe('suspicious');
  });
  test('aynı oya tekrar = geri çekme', () => {
    const voted = { ...base, vote_suspicious: 11, current_user_vote: 'suspicious' };
    const r = applyThreadVote(voted, 'suspicious');
    expect(r.vote_suspicious).toBe(10);
    expect(r.current_user_vote).toBe(null);
  });
  test('oy değiştirme eskiyi düşürür yeniyi artırır', () => {
    const voted = { ...base, vote_suspicious: 11, current_user_vote: 'suspicious' };
    const r = applyThreadVote(voted, 'authentic');
    expect(r.vote_suspicious).toBe(10);
    expect(r.vote_authentic).toBe(6);
    expect(r.current_user_vote).toBe('authentic');
  });
  test('sayım 0'in altına inmez', () => {
    const voted = { vote_suspicious: 0, vote_authentic: 0, vote_investigate: 0, current_user_vote: 'suspicious' };
    const r = applyThreadVote(voted, 'suspicious');
    expect(r.vote_suspicious).toBe(0);
  });
});

describe('applyHelpful', () => {
  test('beğeni ekler', () => {
    const r = applyHelpful({ helpful_count: 3, current_user_helpful: false });
    expect(r.helpful_count).toBe(4);
    expect(r.current_user_helpful).toBe(true);
  });
  test('beğeni geri çeker', () => {
    const r = applyHelpful({ helpful_count: 4, current_user_helpful: true });
    expect(r.helpful_count).toBe(3);
    expect(r.current_user_helpful).toBe(false);
  });
});
```

- [ ] **Step 2: Çalıştır, fail görmeli**

Run: `npx jest lib/forum/voteLogic.test.js`
Expected: FAIL — modül yok.

- [ ] **Step 3: `lib/forum/voteLogic.js` yaz**

```js
const FIELD = {
  suspicious:  'vote_suspicious',
  authentic:   'vote_authentic',
  investigate: 'vote_investigate',
};

const dec = (n) => Math.max(0, (n || 0) - 1);

// Thread oyunu istemci tarafında optimistic uygular (ağırlık yok sayılır, ±1).
export function applyThreadVote(thread, voteType) {
  const next = { ...thread };
  const prev = thread.current_user_vote;

  if (prev && FIELD[prev]) next[FIELD[prev]] = dec(next[FIELD[prev]]);

  if (prev === voteType) {
    next.current_user_vote = null;        // toggle off
  } else {
    if (FIELD[voteType]) next[FIELD[voteType]] = (next[FIELD[voteType]] || 0) + 1;
    next.current_user_vote = voteType;
  }
  return next;
}

export function applyHelpful(comment) {
  const liked = comment.current_user_helpful;
  return {
    ...comment,
    helpful_count: liked ? dec(comment.helpful_count) : (comment.helpful_count || 0) + 1,
    current_user_helpful: !liked,
  };
}
```

- [ ] **Step 4: Test geçer**

Run: `npx jest lib/forum/voteLogic.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/forum/voteLogic.js lib/forum/voteLogic.test.js
git commit -m "feat(forum): optimistic oy + faydalı mantığı (TDD)"
```

---

## Task 3: forumService tam genişletme

**Files:**
- Modify: `services/forumService.js`
- Create: `services/forumService.test.js`

- [ ] **Step 1: Servis param eşleme için failing test yaz**

`services/forumService.test.js`:
```js
jest.mock('./api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() } }));
import api from './api';
import { listThreads, voteThread, addComment, createThread } from './forumService';

beforeEach(() => jest.clearAllMocks());

test('listThreads discover ucunu doğru param ile çağırır', async () => {
  api.get.mockResolvedValue({ data: { items: [], total: 0, page: 1, size: 20 } });
  await listThreads({ sort: 'new', category: 'gundem', page: 2 });
  expect(api.get).toHaveBeenCalledWith('/forum/threads/discover', {
    params: { sort: 'new', page: 2, size: 20, category: 'gundem' },
  });
});

test('voteThread doğru body gönderir', async () => {
  api.post.mockResolvedValue({ data: {} });
  await voteThread('t1', 'suspicious');
  expect(api.post).toHaveBeenCalledWith('/forum/threads/t1/vote', { vote_type: 'suspicious' });
});

test('addComment parent_id ve evidence_urls iletir', async () => {
  api.post.mockResolvedValue({ data: {}, status: 201 });
  await addComment('t1', { body: 'x', parentId: 'c1', evidenceUrls: ['u'] });
  expect(api.post).toHaveBeenCalledWith('/forum/threads/t1/comments', { body: 'x', parent_id: 'c1', evidence_urls: ['u'] });
});

test('createThread payload alanlarını eşler', async () => {
  api.post.mockResolvedValue({ data: {} });
  await createThread({ title: 'T', body: 'B', category: 'gundem', postType: 'iddia', tagNames: ['a'], imageUrls: [], articleId: null });
  expect(api.post).toHaveBeenCalledWith('/forum/threads', {
    title: 'T', body: 'B', category: 'gundem', post_type: 'iddia', tag_names: ['a'], image_urls: [], article_id: null,
  });
});
```

- [ ] **Step 2: Çalıştır, fail görmeli**

Run: `npx jest services/forumService.test.js`
Expected: FAIL — `listThreads is not a function` (mevcut serviste yalnız getThreads/getThreadDetail var).

- [ ] **Step 3: `services/forumService.js`'i tam yaz (mevcut içeriği değiştir)**

```js
import api from './api';

// ---- Threads ----
export async function listThreads({ sort = 'hot', category = null, tag = null, page = 1, size = 20 } = {}) {
  const params = { sort, page, size };
  if (category) params.category = category;
  if (tag) params.tag = tag;
  const { data } = await api.get('/forum/threads/discover', { params });
  return data; // { items, total, page, size }
}

export async function getMyBookmarks({ page = 1, size = 20 } = {}) {
  const { data } = await api.get('/forum/bookmarks/me', { params: { page, size } });
  return data;
}

export async function getThreadDetail(id) {
  const { data } = await api.get(`/forum/threads/${id}`);
  return data; // ForumThreadDetail
}

export async function createThread({ title, body = '', category, postType = 'iddia', tagNames = [], imageUrls = [], articleId = null }) {
  const { data } = await api.post('/forum/threads', {
    title, body, category, post_type: postType, tag_names: tagNames, image_urls: imageUrls, article_id: articleId,
  });
  return data; // ForumThreadDetail
}

export async function updateThread(id, { title, body, category, tagNames }) {
  const payload = {};
  if (title !== undefined) payload.title = title;
  if (body !== undefined) payload.body = body;
  if (category !== undefined) payload.category = category;
  if (tagNames !== undefined) payload.tag_names = tagNames;
  const { data } = await api.put(`/forum/threads/${id}`, payload);
  return data;
}

export async function deleteThread(id) {
  await api.delete(`/forum/threads/${id}`);
}

// ---- Etkileşim ----
export async function voteThread(id, voteType) {
  const { data } = await api.post(`/forum/threads/${id}/vote`, { vote_type: voteType });
  return data; // ForumVoteResult
}

export async function toggleBookmark(id) {
  await api.post(`/forum/threads/${id}/bookmark`);
}

export async function reportThread(id, reason) {
  const { data } = await api.post(`/forum/threads/${id}/report`, { reason });
  return data;
}

export async function resolveThread(id, { verdict, reason }) {
  const { data } = await api.post(`/forum/threads/${id}/resolve`, { verdict, reason });
  return data;
}

// ---- Yorum ----
export async function addComment(threadId, { body, parentId = null, evidenceUrls = [] }) {
  const payload = { body };
  if (parentId) payload.parent_id = parentId;
  if (evidenceUrls && evidenceUrls.length) payload.evidence_urls = evidenceUrls;
  const res = await api.post(`/forum/threads/${threadId}/comments`, payload);
  return { comment: res.data, flagged: res.status === 202 };
}

export async function helpfulVote(commentId) {
  await api.post(`/forum/comments/${commentId}/vote`);
}

export async function verifyComment(commentId) {
  const { data } = await api.post(`/forum/comments/${commentId}/verify`);
  return data; // { verified, verified_count }
}

export async function reportComment(commentId, reason) {
  const { data } = await api.post(`/forum/comments/${commentId}/report`, { reason });
  return data;
}

export async function updateComment(commentId, body) {
  const { data } = await api.put(`/forum/comments/${commentId}`, { body });
  return data;
}

export async function deleteComment(commentId) {
  await api.delete(`/forum/comments/${commentId}`);
}

// ---- Etiket / keşif ----
export async function searchTags(search, category = null) {
  const params = { search };
  if (category) params.category = category;
  const { data } = await api.get('/forum/tags', { params });
  return data.tags ?? [];
}

export async function getTrending() {
  const { data } = await api.get('/forum/trending');
  return data;
}

export async function searchThreads(q, { category = null, page = 1, size = 20 } = {}) {
  const params = { q, page, size };
  if (category) params.category = category;
  const { data } = await api.get('/forum/search', { params });
  return data;
}
```

- [ ] **Step 4: Test geçer**

Run: `npx jest services/forumService.test.js`
Expected: PASS.

- [ ] **Step 5: Tüm testleri çalıştır (regresyon)**

Run: `npx jest`
Expected: 3 suite PASS.

- [ ] **Step 6: Commit**

```bash
git add services/forumService.js services/forumService.test.js
git commit -m "feat(forum): tam forumService API sarmalayıcıları + testler"
```

---

## Task 4: Forum sabitleri + Icon bileşeni

**Files:**
- Create: `constants/forum.js`, `components/ui/Icon.js`

- [ ] **Step 1: `constants/forum.js` yaz**

```js
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
```

- [ ] **Step 2: `components/ui/Icon.js` yaz (lucide alt küme)**

```js
import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const PATHS = {
  'arrow-left':   <Path d="M15 18l-6-6 6-6" />,
  'chevron-right':<Path d="m9 18 6-6-6-6" />,
  'chevron-up':   <Path d="m18 15-6-6-6 6" />,
  'chevron-down': <Path d="m6 9 6 6 6-6" />,
  plus:           <><Path d="M12 5v14" /><Path d="M5 12h14" /></>,
  x:              <><Path d="M18 6 6 18" /><Path d="M6 6l12 12" /></>,
  send:           <><Path d="M22 2 11 13" /><Path d="M22 2l-7 20-4-9-9-4z" /></>,
  message:        <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  bookmark:       <Path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  flag:           <Path d="M4 22V4h13l-1.5 4L17 12H4" />,
  check:          <Path d="M20 6 9 17l-5-5" />,
  search:         <><Circle cx="11" cy="11" r="7" /><Path d="m21 21-4-4" /></>,
  heart:          <Path d="M12 21s-7-4.6-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z" />,
  'shield-alert': <><Path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z" /><Path d="M12 8v4" /><Path d="M12 16h.01" /></>,
  'shield-check': <><Path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z" /><Path d="m9 12 2 2 4-4" /></>,
  link:           <><Path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><Path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></>,
  share:          <><Circle cx="18" cy="5" r="3" /><Circle cx="6" cy="12" r="3" /><Circle cx="18" cy="19" r="3" /><Path d="m8.6 13.5 6.8 4" /><Path d="M15.4 6.5 8.6 10.5" /></>,
  dots:           <><Circle cx="12" cy="5" r="1.3" /><Circle cx="12" cy="12" r="1.3" /><Circle cx="12" cy="19" r="1.3" /></>,
  external:       <><Path d="M7 17 17 7" /><Path d="M9 7h8v8" /></>,
  reply:          <Path d="M9 17H7A4 4 0 0 1 7 9h1M15 7h2a4 4 0 0 1 0 8h-1" />,
  image:          <><Rect x="3" y="3" width="18" height="18" rx="2" /><Circle cx="9" cy="9" r="2" /><Path d="m21 15-5-5L5 21" /></>,
  help:           <><Path d="M9.1 9a3 3 0 1 1 4.5 2.6c-.9.5-1.6 1.2-1.6 2.4" /><Path d="M12 17h.01" /></>,
  info:           <><Circle cx="12" cy="12" r="9" /><Path d="M12 8v4" /><Path d="M12 16h.01" /></>,
};

export default function Icon({ name, size = 18, color = '#fff', fill = 'none', strokeWidth = 2 }) {
  const body = PATHS[name];
  if (!body) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {body}
    </Svg>
  );
}
```

- [ ] **Step 3: Lint/derleme kontrolü — uygulamayı başlat**

Run: `npx expo start -c` (Metro açılır; QR/emulator). Henüz ekran kullanılmıyor, sadece bundle hatası olmadığını doğrula.
Expected: Metro hatasız bundle eder.

- [ ] **Step 4: Commit**

```bash
git add constants/forum.js components/ui/Icon.js
git commit -m "feat(forum): sabitler + lucide Icon bileşeni"
```

---

## Task 5: Sunum primitifleri (Avatar, rozetler, oy kontrolleri)

**Files:**
- Create: `components/forum/Avatar.js`, `PostTypeBadge.js`, `StatusChip.js`, `AIChip.js`, `VoteDistributionBar.js`, `VoteControl.js`

- [ ] **Step 1: `components/forum/Avatar.js`**

```js
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GRADS = [
  ['#3fff8b', '#10b981'], ['#60a5fa', '#3b82f6'], ['#c084fc', '#a855f7'],
  ['#fbbf24', '#d97706'], ['#34d399', '#10b981'], ['#f87171', '#dc2626'],
];

function gradFor(seed = '') {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % GRADS.length;
  return GRADS[h];
}

export default function Avatar({ username = '?', uri = null, size = 26 }) {
  const r = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={r} />;
  const letter = (username || '?').charAt(0).toUpperCase();
  return (
    <LinearGradient colors={gradFor(username)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[r, styles.c]}>
      <Text style={[styles.t, { fontSize: size * 0.42 }]}>{letter}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  c: { alignItems: 'center', justifyContent: 'center' },
  t: { color: '#06080b', fontWeight: '800' },
});
```

- [ ] **Step 2: `components/forum/PostTypeBadge.js` + `StatusChip.js`**

`PostTypeBadge.js`:
```js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { POST_TYPE_MAP } from '../../constants/forum';
import { alpha } from '../../constants/theme';

export default function PostTypeBadge({ type }) {
  const t = POST_TYPE_MAP[type] || POST_TYPE_MAP.iddia;
  return (
    <View style={[styles.b, { backgroundColor: alpha(t.color, 0.13) }]}>
      <Text style={[styles.t, { color: t.color }]}>{t.label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  b: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 4 },
  t: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
});
```

`StatusChip.js`:
```js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STATUS_MAP } from '../../constants/forum';
import { alpha } from '../../constants/theme';

export default function StatusChip({ status }) {
  const s = STATUS_MAP[status];
  if (!s || status === 'active') return null;
  return (
    <View style={[styles.b, { borderColor: alpha(s.color, 0.5) }]}>
      <Text style={[styles.t, { color: s.color }]}>{s.label.toUpperCase()}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  b: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 3, borderWidth: 1 },
  t: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
});
```

- [ ] **Step 3: `components/forum/AIChip.js`**

```js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from '../ui/Icon';
import { alpha } from '../../constants/theme';

// article.ai_verdict 'FAKE' | 'AUTHENTIC'; confidence 0..1
export default function AIChip({ verdict, confidence }) {
  if (!verdict) return null;
  const fake = String(verdict).toUpperCase() === 'FAKE';
  const color = fake ? '#f87171' : '#34d399';
  const pct = confidence != null ? Math.round(confidence * 100) : null;
  return (
    <View style={[styles.b, { backgroundColor: alpha(color, 0.1) }]}>
      <Icon name={fake ? 'shield-alert' : 'shield-check'} size={13} color={color} />
      <Text style={[styles.t, { color }]}>
        AI{pct != null ? `: %${pct}` : ''} {fake ? 'yanıltıcı olabilir' : 'güvenilir'}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  b: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  t: { fontSize: 10, fontWeight: '700' },
});
```

- [ ] **Step 4: `components/forum/VoteDistributionBar.js`**

```js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { voteDistribution } from '../../lib/forum/format';
import { VOTE_COLORS } from '../../constants/forum';

export default function VoteDistributionBar({ thread, height = 4 }) {
  const { total, sPct, aPct, iPct } = voteDistribution(thread);
  if (!total) return <View style={[styles.bar, { height, backgroundColor: '#1d232a', borderRadius: 1 }]} />;
  return (
    <View style={[styles.bar, { height }]}>
      <View style={{ flex: sPct, backgroundColor: VOTE_COLORS.suspicious, borderRadius: 1 }} />
      <View style={{ flex: aPct, backgroundColor: VOTE_COLORS.authentic, borderRadius: 1 }} />
      <View style={{ flex: iPct, backgroundColor: VOTE_COLORS.investigate, borderRadius: 1 }} />
    </View>
  );
}
const styles = StyleSheet.create({ bar: { flexDirection: 'row', gap: 2, width: '100%' } });
```

- [ ] **Step 5: `components/forum/VoteControl.js` (V1 İddia / V3 Soru-Tartışma)**

```js
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';
import { alpha } from '../../constants/theme';

// thread: { post_type, vote_suspicious, vote_authentic, vote_investigate, current_user_vote }
// onVote(voteType); compact: kart içi küçük varyant
export default function VoteControl({ thread, onVote, compact = false }) {
  const { colors } = useTheme();
  const cur = thread.current_user_vote;

  const Chip = ({ vt, icon, count, onColor }) => {
    const on = cur === vt;
    return (
      <Pressable
        onPress={() => onVote?.(vt)}
        style={[
          styles.chip,
          { borderColor: colors.border, backgroundColor: colors.bg.solid },
          on && { borderColor: alpha(onColor, 0.55), backgroundColor: alpha(onColor, 0.1) },
          compact && styles.chipCompact,
        ]}
      >
        <Icon name={icon} size={compact ? 13 : 15} color={on ? onColor : colors.text.muted} />
        <Text style={[styles.count, { color: on ? onColor : colors.text.primary }]}>{count}</Text>
      </Pressable>
    );
  };

  if (thread.post_type === 'tartisma') return null;

  if (thread.post_type === 'soru') {
    // V3: faydalı / değil (up=authentic? backend genel up/down). up/down kullan.
    return (
      <View style={styles.row}>
        <Chip vt="up"   icon="chevron-up"   count={thread.vote_authentic ?? thread.vote_up ?? 0}  onColor="#10b981" />
        <Chip vt="down" icon="chevron-down" count={thread.vote_suspicious ?? thread.vote_down ?? 0} onColor="#dc2626" />
      </View>
    );
  }

  // V1 İddia: 3 yönlü
  return (
    <View style={styles.row}>
      <Chip vt="suspicious"  icon="flag"   count={thread.vote_suspicious}  onColor="#dc2626" />
      <Chip vt="authentic"   icon="check"  count={thread.vote_authentic}   onColor="#10b981" />
      <Chip vt="investigate" icon="search" count={thread.vote_investigate} onColor="#f59e0b" />
    </View>
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', gap: 7 },
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderRadius: 4 },
  chipCompact: { paddingHorizontal: 8, paddingVertical: 5 },
  count: { fontSize: 11, fontWeight: '800' },
});
```

- [ ] **Step 6: Derleme kontrolü**

Run: `npx expo start -c`
Expected: bundle hatasız. (Görsel doğrulama Task 6'da kartla birlikte.)

- [ ] **Step 7: Commit**

```bash
git add components/forum/Avatar.js components/forum/PostTypeBadge.js components/forum/StatusChip.js components/forum/AIChip.js components/forum/VoteDistributionBar.js components/forum/VoteControl.js
git commit -m "feat(forum): sunum primitifleri (avatar, rozetler, oy kontrolleri)"
```

---

## Task 6: Forum hook'ları + akış ekranı (index.js)

**Files:**
- Create: `hooks/useForum.js`, `components/forum/ForumCard.js`
- Modify: `app/(tabs)/forum/index.js`

- [ ] **Step 1: `hooks/useForum.js` yaz**

```js
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listThreads, getMyBookmarks, getThreadDetail, voteThread, toggleBookmark,
  addComment, helpfulVote, reportThread, reportComment, createThread, deleteThread,
} from '../services/forumService';
import { applyThreadVote } from '../lib/forum/voteLogic';

const PAGE = (last) => {
  const loaded = last.page * last.size;
  return loaded < last.total ? last.page + 1 : undefined;
};

export function useThreads(sort = 'hot') {
  return useInfiniteQuery({
    queryKey: ['forum', 'threads', sort],
    queryFn: ({ pageParam = 1 }) =>
      sort === 'bookmarks'
        ? getMyBookmarks({ page: pageParam })
        : listThreads({ sort, page: pageParam }),
    getNextPageParam: PAGE,
    initialPageParam: 1,
  });
}

export function useThread(id) {
  return useQuery({ queryKey: ['forum', 'thread', id], queryFn: () => getThreadDetail(id), enabled: !!id });
}

export function useVote(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (voteType) => voteThread(id, voteType),
    onMutate: async (voteType) => {
      await qc.cancelQueries({ queryKey: ['forum', 'thread', id] });
      const prev = qc.getQueryData(['forum', 'thread', id]);
      if (prev) qc.setQueryData(['forum', 'thread', id], { ...prev, ...applyThreadVote(prev, voteType) });
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['forum', 'thread', id], ctx.prev); },
    onSuccess: (data) => {
      const cur = qc.getQueryData(['forum', 'thread', id]);
      if (cur) qc.setQueryData(['forum', 'thread', id], { ...cur, ...data });
    },
  });
}

export function useAddComment(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars) => addComment(id, vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', 'thread', id] }),
  });
}

export function useHelpful(threadId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => helpfulVote(commentId),
    onSettled: () => qc.invalidateQueries({ queryKey: ['forum', 'thread', threadId] }),
  });
}

export function useBookmarkToggle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => toggleBookmark(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ['forum', 'threads'] }),
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars) => createThread(vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', 'threads'] }),
  });
}

export function useReportThread() {
  return useMutation({ mutationFn: ({ id, reason }) => reportThread(id, reason) });
}
export function useReportComment() {
  return useMutation({ mutationFn: ({ id, reason }) => reportComment(id, reason) });
}
export function useDeleteThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteThread(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forum', 'threads'] }),
  });
}
```

- [ ] **Step 2: `components/forum/ForumCard.js` yaz (A: sol çizgi)**

```js
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import Icon from '../ui/Icon';
import PostTypeBadge from './PostTypeBadge';
import AIChip from './AIChip';
import VoteControl from './VoteControl';
import { useTheme } from '../../hooks/useTheme';
import { timeAgo, voteDistribution } from '../../lib/forum/format';
import { VOTE_COLORS } from '../../constants/forum';

function accentColor(thread) {
  const { sPct, aPct, iPct } = voteDistribution(thread);
  if (thread.status === 'resolved') return '#3b82f6';
  const max = Math.max(sPct, aPct, iPct);
  if (!max) return '#2a323b';
  if (max === sPct) return VOTE_COLORS.suspicious;
  if (max === aPct) return VOTE_COLORS.authentic;
  return VOTE_COLORS.investigate;
}

export default function ForumCard({ thread, onPress, onVote, onBookmark }) {
  const { colors } = useTheme();
  const { total } = voteDistribution(thread);
  const isNews = thread.article_id != null;

  return (
    <Pressable onPress={onPress}
      style={[styles.item, { borderTopColor: colors.border }]}>
      <View style={[styles.accent, { backgroundColor: accentColor(thread) }]} />
      <View style={styles.top}>
        <Avatar username={thread.author?.username} uri={thread.author?.avatar_url} size={26} />
        <Text style={[styles.who, { color: colors.text.secondary }]}>{thread.author?.username}</Text>
        <Text style={[styles.dot, { color: colors.text.muted }]}>·</Text>
        <Text style={[styles.time, { color: colors.text.muted }]}>{timeAgo(thread.created_at)}</Text>
        <View style={{ marginLeft: 'auto' }}><PostTypeBadge type={thread.post_type} /></View>
      </View>

      <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>{thread.title}</Text>

      {isNews && thread.article ? <AIChip verdict={thread.article.ai_verdict} confidence={thread.article.confidence} /> : null}

      {thread.post_type !== 'tartisma' && (
        <View style={{ marginTop: 9 }}>
          <VoteControl thread={thread} onVote={onVote} compact />
        </View>
      )}

      <View style={styles.foot}>
        <View style={styles.f}><Icon name="message" size={14} color={colors.text.muted} /><Text style={[styles.ft, { color: colors.text.muted }]}>{thread.comment_count ?? 0}</Text></View>
        <View style={styles.f}><Text style={[styles.ft, { color: colors.text.muted }]}>{total} oy</Text></View>
        <Pressable onPress={onBookmark} style={{ marginLeft: 'auto' }} hitSlop={8}>
          <Icon name="bookmark" size={15} color={thread.is_bookmarked ? '#3fff8b' : colors.text.muted} fill={thread.is_bookmarked ? 'rgba(63,255,139,0.15)' : 'none'} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item:  { paddingVertical: 14, paddingLeft: 18, paddingRight: 16, borderTopWidth: 1, position: 'relative' },
  accent:{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 2, borderRadius: 2 },
  top:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  who:   { fontSize: 12, fontWeight: '700' },
  dot:   { fontSize: 11 },
  time:  { fontSize: 11, fontWeight: '600' },
  title: { fontSize: 14.5, fontWeight: '700', lineHeight: 20, marginBottom: 9 },
  foot:  { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 11 },
  f:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ft:    { fontSize: 11, fontWeight: '700' },
});
```

- [ ] **Step 3: `app/(tabs)/forum/index.js`'i yeniden yaz**

```js
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../components/ui/Icon';
import ShimmerCard from '../../../components/ui/ShimmerCard';
import LoginNudgeSheet from '../../../components/ui/LoginNudgeSheet';
import ForumCard from '../../../components/forum/ForumCard';
import { FORUM_TABS } from '../../../constants/forum';
import { palette } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useThreads, useVote, useBookmarkToggle } from '../../../hooks/useForum';

export default function ForumScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuth } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('hot');
  const [nudge, setNudge] = useState(false);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useThreads(tab);
  const bookmark = useBookmarkToggle();
  const items = data?.pages.flatMap(p => p.items) ?? [];

  const requireAuth = (fn) => (...a) => { if (!isAuth) return setNudge(true); fn(...a); };

  const onBookmark = requireAuth((id) => bookmark.mutate(id, { onError: () => toast.error('Kaydedilemedi') }));

  return (
    <View style={[styles.c, { backgroundColor: colors.bg.base }]}>
      <View style={[styles.hdr, { paddingTop: insets.top + 6, backgroundColor: colors.bg.deepest, borderBottomColor: colors.border }]}>
        <Text style={[styles.logo, { color: colors.text.primary }]}>ne<Text style={{ color: palette.brand.primary }}>haber</Text></Text>
        <Pressable onPress={requireAuth(() => router.push('/(tabs)/forum/yeni'))}
          style={[styles.add, { borderColor: colors.border }]} hitSlop={6}>
          <Icon name="plus" size={16} color={palette.brand.bright} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {FORUM_TABS.map(t => (
          <Pressable key={t.key} onPress={() => setTab(t.key)}>
            <Text style={[styles.tab, { color: tab === t.key ? colors.text.primary : colors.text.muted }]}>{t.label}</Text>
            {tab === t.key && <View style={[styles.ind, { backgroundColor: palette.brand.bright }]} />}
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={{ padding: 16 }}>{[1, 2, 3].map(i => <ShimmerCard key={i} />)}</View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => String(i.id)}
          renderItem={({ item }) => (
            <ForumCard
              thread={item}
              onPress={() => router.push(`/(tabs)/forum/${item.id}`)}
              onVote={() => router.push(`/(tabs)/forum/${item.id}`)}
              onBookmark={() => onBookmark(item.id)}
            />
          )}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={<View style={styles.empty}><Text style={{ color: colors.text.muted }}>{tab === 'bookmarks' ? 'Henüz bir şey kaydetmedin.' : 'Henüz tartışma yok.'}</Text></View>}
        />
      )}

      <LoginNudgeSheet visible={nudge} onClose={() => setNudge(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  c:    { flex: 1 },
  hdr:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  logo: { fontSize: 18, fontWeight: '800' },
  add:  { width: 30, height: 30, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', gap: 18, paddingHorizontal: 16, paddingVertical: 10 },
  tab:  { fontSize: 12, fontWeight: '700' },
  ind:  { height: 2, borderRadius: 2, marginTop: 6 },
  empty:{ alignItems: 'center', paddingTop: 80 },
});
```

- [ ] **Step 4: Uygulamada görsel doğrula**

Run: `npx expo start -c` → emülatör/cihazda Forum sekmesini aç.
Expected: Sekmeler (Öne çıkan/Yeni/Tartışmalı/Kayıtlı) görünür; kartlar sol-çizgi + avatar + tip rozeti + (İddia'da) oy çipleri + alt meta ile listelenir; pull-to-refresh çalışır; sonsuz kaydırma çalışır; girişsizken `＋`/kaydet login nudge açar. (Veri için Task 12 seed gerekebilir; boşsa "Henüz tartışma yok" görünür.)

- [ ] **Step 5: Commit**

```bash
git add hooks/useForum.js components/forum/ForumCard.js "app/(tabs)/forum/index.js"
git commit -m "feat(forum): forum hookları + sekmeli akış ekranı (sol-çizgi kart)"
```

---

## Task 7: Detay ekranı — üst içerik (header → meta → gövde → haber kartı)

**Files:**
- Create: `components/forum/LinkedArticleCard.js`
- Modify: `app/(tabs)/forum/[id].js`

- [ ] **Step 1: `components/forum/LinkedArticleCard.js`**

```js
import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../ui/Icon';
import { alpha } from '../../constants/theme';

export default function LinkedArticleCard({ article }) {
  if (!article) return null;
  const P = '#a855f7';
  return (
    <View style={[styles.c, { borderColor: alpha(P, 0.28), backgroundColor: alpha(P, 0.06) }]}>
      {article.image_url ? <Image source={{ uri: article.image_url }} style={styles.th} /> : <View style={[styles.th, { backgroundColor: alpha(P, 0.18) }]} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.ti} numberOfLines={2}>{article.title}</Text>
        {article.source_name ? <Text style={styles.src}>{article.source_name}</Text> : null}
      </View>
      {article.source_url ? (
        <Pressable onPress={() => Linking.openURL(article.source_url)} hitSlop={8}>
          <Icon name="external" size={16} color="#c084fc" />
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  c:   { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderRadius: 6, marginBottom: 14 },
  th:  { width: 42, height: 42, borderRadius: 4 },
  ti:  { color: '#eef3f7', fontSize: 11.5, fontWeight: '700', lineHeight: 16 },
  src: { color: '#9aa4ad', fontSize: 10, fontWeight: '600', marginTop: 4 },
});
```

- [ ] **Step 2: `app/(tabs)/forum/[id].js`'i yeniden yaz (yorum/oy dock'u Task 8-9'da eklenecek; şimdilik üst içerik + boş yorum yeri)**

```js
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../../components/forum/Avatar';
import Icon from '../../../components/ui/Icon';
import PostTypeBadge from '../../../components/forum/PostTypeBadge';
import StatusChip from '../../../components/forum/StatusChip';
import AIChip from '../../../components/forum/AIChip';
import LinkedArticleCard from '../../../components/forum/LinkedArticleCard';
import { palette } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useThread } from '../../../hooks/useForum';
import { timeAgo } from '../../../lib/forum/format';

export default function ForumDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: thread, isLoading } = useThread(id);

  if (isLoading || !thread) {
    return <View style={[styles.loader, { backgroundColor: colors.bg.base }]}><ActivityIndicator color={palette.brand.primary} size="large" /></View>;
  }
  const isNews = thread.article_id != null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <View style={[styles.nav, { paddingTop: insets.top + 4, borderBottomColor: colors.border }]}>
        <Pressable style={styles.bk} onPress={() => router.back()} hitSlop={8}>
          <Icon name="arrow-left" size={16} color={colors.text.secondary} strokeWidth={2.2} />
          <Text style={[styles.bkt, { color: colors.text.secondary }]}>Forum</Text>
        </Pressable>
        <View style={styles.sp}>
          <Icon name="share" size={17} color={colors.text.muted} />
          <Icon name="dots" size={17} color={colors.text.muted} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
        <View style={styles.metaRow}>
          <PostTypeBadge type={thread.post_type} />
          <View style={{ marginLeft: 'auto' }}><StatusChip status={thread.status} /></View>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>{thread.title}</Text>

        <View style={styles.auth}>
          <Avatar username={thread.author?.username} uri={thread.author?.avatar_url} size={26} />
          <Text style={[styles.nm, { color: colors.text.secondary }]}>{thread.author?.username}</Text>
          <Text style={[styles.dt, { color: colors.text.muted }]}>· {timeAgo(thread.created_at)}</Text>
          {isNews && thread.article ? <View style={{ marginLeft: 'auto' }}><AIChip verdict={thread.article.ai_verdict} confidence={thread.article.confidence} /></View> : null}
        </View>

        {thread.body ? <Text style={[styles.body, { color: colors.text.secondary, borderLeftColor: 'rgba(16,185,129,0.4)' }]}>{thread.body}</Text> : null}

        {thread.tags?.length ? (
          <View style={styles.tags}>
            {thread.tags.map(t => <Text key={t.id} style={[styles.tag, { color: colors.text.muted, backgroundColor: colors.bg.surface }]}>#{t.name}</Text>)}
          </View>
        ) : null}

        <LinkedArticleCard article={thread.article} />

        {/* Yorumlar Task 9'da; oy dock'u Task 8'de */}
        <Text style={[styles.section, { color: colors.text.primary }]}>Tartışma · {thread.comment_count} yorum</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loader:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nav:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  bk:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bkt:     { fontSize: 12, fontWeight: '700' },
  sp:      { flexDirection: 'row', gap: 16, marginLeft: 'auto' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title:   { fontSize: 19, fontWeight: '800', lineHeight: 25, marginBottom: 12 },
  auth:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  nm:      { fontSize: 12, fontWeight: '700' },
  dt:      { fontSize: 11, fontWeight: '600' },
  body:    { fontSize: 13, lineHeight: 21, borderLeftWidth: 2, paddingLeft: 11, marginBottom: 14 },
  tags:    { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  tag:     { fontSize: 10, fontWeight: '600', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 3 },
  section: { fontSize: 13, fontWeight: '800', marginTop: 4 },
});
```

- [ ] **Step 3: Görsel doğrula**

Run: `npx expo start` → bir karta dokun.
Expected: Detay üst içerik (geri, paylaş/⋯ ikon, tip+durum, başlık, yazar+AI, gövde, etiket, haber kartı, "Tartışma · N yorum") düzgün; taşma yok.

- [ ] **Step 4: Commit**

```bash
git add components/forum/LinkedArticleCard.js "app/(tabs)/forum/[id].js"
git commit -m "feat(forum): detay ekranı üst içerik + bağlı haber kartı"
```

---

## Task 8: Sabit alt oy dock'u

**Files:**
- Create: `components/forum/VoteDock.js`
- Modify: `app/(tabs)/forum/[id].js`

- [ ] **Step 1: `components/forum/VoteDock.js`**

```js
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VoteDistributionBar from './VoteDistributionBar';
import VoteControl from './VoteControl';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';
import { VERDICT_MAP } from '../../constants/forum';

export default function VoteDock({ thread, onVote, onComment }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'}
      style={[styles.dock, { paddingBottom: insets.bottom + 12, borderTopColor: colors.border }]}>
      {thread.verdict ? (
        <View style={styles.resolved}>
          <Icon name="shield-check" size={16} color={VERDICT_MAP[thread.verdict]?.color || colors.text.muted} />
          <Text style={[styles.resolvedT, { color: colors.text.secondary }]}>
            Sonuçlandı: {VERDICT_MAP[thread.verdict]?.label || thread.verdict}
          </Text>
        </View>
      ) : (
        <>
          {thread.post_type === 'iddia' && <VoteDistributionBar thread={thread} />}
          <View style={styles.row}>
            <View style={{ flex: 1 }}><VoteControl thread={thread} onVote={onVote} /></View>
            <Pressable onPress={onComment} style={[styles.cbtn, { borderColor: colors.border }]} hitSlop={6}>
              <Icon name="message" size={16} color={colors.text.secondary} />
            </Pressable>
          </View>
        </>
      )}
    </BlurView>
  );
}
const styles = StyleSheet.create({
  dock:     { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9 },
  cbtn:     { width: 42, height: 40, borderWidth: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  resolved: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  resolvedT:{ fontSize: 12, fontWeight: '700' },
});
```

- [ ] **Step 2: `[id].js`'e dock'u bağla**

`[id].js` import bloğuna ekle:
```js
import VoteDock from '../../../components/forum/VoteDock';
import LoginNudgeSheet from '../../../components/ui/LoginNudgeSheet';
import { useThread, useVote } from '../../../hooks/useForum';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useState, useRef } from 'react';
```

Bileşen gövdesinde (return'den önce) ekle:
```js
const { isAuth } = useAuth();
const toast = useToast();
const vote = useVote(id);
const [nudge, setNudge] = useState(false);

const onVote = (vt) => {
  if (!isAuth) return setNudge(true);
  vote.mutate(vt, { onError: (e) => toast.error(e?.response?.status === 409 ? 'Tartışma sonuçlandı, oy verilemez' : 'Oy gönderilemedi') });
};
```

`return` içindeki en dış `<View>`'ın kapanışından hemen önce (ScrollView'dan sonra) ekle:
```js
        <VoteDock thread={thread} onVote={onVote} onComment={() => {}} />
        <LoginNudgeSheet visible={nudge} onClose={() => setNudge(false)} />
```
(Not: `onComment` Task 9'da composer'a odaklanacak.)

- [ ] **Step 3: Görsel doğrula**

Run: `npx expo start`
Expected: Detayın altında blur dock; İddia'da dağılım çizgisi + 3 oy çipi; oy verince çip dolu renkli olur ve sayı anında artar (optimistic); aynı çipe tekrar basınca geri çekilir; girişsizken nudge açılır; sonuçlanmış thread'de "Sonuçlandı: …" görünür.

- [ ] **Step 4: Commit**

```bash
git add components/forum/VoteDock.js "app/(tabs)/forum/[id].js"
git commit -m "feat(forum): sabit alt oy dock'u + optimistic oylama"
```

---

## Task 9: Yorum ağacı + composer + canlı güncelleme

**Files:**
- Create: `components/forum/CommentComposer.js`, `components/forum/CommentItem.js`, `components/forum/CommentTree.js`, `components/forum/FeaturedEvidence.js`
- Modify: `app/(tabs)/forum/[id].js`

- [ ] **Step 1: `components/forum/CommentComposer.js`**

```js
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Avatar from './Avatar';
import Icon from '../ui/Icon';
import { palette } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export default function CommentComposer({ replyTo, onCancelReply, onSubmit, submitting }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [text, setText] = useState('');

  const send = () => {
    const v = text.trim();
    if (!v) return;
    onSubmit(v);
    setText('');
  };

  return (
    <View style={{ marginBottom: 14 }}>
      {replyTo ? (
        <View style={[styles.reply, { backgroundColor: colors.bg.surface }]}>
          <Text style={[styles.replyT, { color: colors.text.muted }]}>↪ <Text style={{ color: palette.brand.primary }}>@{replyTo.username}</Text> yanıtlanıyor</Text>
          <Pressable onPress={onCancelReply} hitSlop={8}><Icon name="x" size={14} color={colors.text.muted} /></Pressable>
        </View>
      ) : null}
      <View style={styles.row}>
        <Avatar username={user?.username} uri={user?.avatar_url} size={28} />
        <TextInput
          style={[styles.in, { backgroundColor: colors.bg.solid, borderColor: colors.border, color: colors.text.primary }]}
          placeholder="Kanıt veya yorumunu ekle…"
          placeholderTextColor={colors.text.muted}
          value={text} onChangeText={setText} multiline
        />
        <Pressable onPress={send} disabled={submitting || !text.trim()}
          style={[styles.snd, { backgroundColor: palette.brand.primary, opacity: submitting || !text.trim() ? 0.4 : 1 }]}>
          <Icon name="send" size={17} color="#06080b" strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  reply:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, marginBottom: 8 },
  replyT: { fontSize: 11, fontWeight: '600' },
  row:    { flexDirection: 'row', alignItems: 'flex-end', gap: 9 },
  in:     { flex: 1, borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 12.5, maxHeight: 100 },
  snd:    { width: 38, height: 38, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
});
```

- [ ] **Step 2: `components/forum/CommentItem.js`**

```js
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';
import { timeAgo } from '../../lib/forum/format';
import { TRUST_BADGE } from '../../constants/forum';

export default function CommentItem({ comment, isAuthor, onReply, onHelpful, onReport, depth = 0 }) {
  const { colors } = useTheme();
  const removed = comment.moderation_status === 'removed';
  const flagged = comment.moderation_status?.startsWith('flagged');
  const trust = comment.trust_tier ? TRUST_BADGE[comment.trust_tier] : null;
  const hasSource = (comment.evidence_urls || []).length > 0;

  if (removed) return null;

  return (
    <View style={[styles.c, depth > 0 && { marginLeft: 16, paddingLeft: 11, borderLeftWidth: 1, borderLeftColor: colors.border }]}>
      <View style={styles.head}>
        <Avatar username={comment.username} uri={comment.avatar_url} size={22} />
        <Text style={[styles.nm, { color: colors.text.secondary }]}>{comment.username}</Text>
        {isAuthor ? <Text style={[styles.badge, { color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.4)' }]}>Yazar</Text> : null}
        {trust ? <Text style={[styles.badge, { color: trust.color, borderColor: trust.color + '66' }]}>{trust.label}</Text> : null}
        <Text style={[styles.dt, { color: colors.text.muted }]}>{timeAgo(comment.created_at)}</Text>
      </View>

      <Text style={[styles.tx, { color: colors.text.secondary }]}>{comment.body}</Text>
      {flagged ? <Text style={styles.flag}>İncelemede</Text> : null}

      {hasSource ? (
        <Pressable onPress={() => Linking.openURL(comment.evidence_urls[0])} style={[styles.src, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
          <Icon name="link" size={12} color="#60a5fa" />
          <Text style={styles.srcT} numberOfLines={1}>{comment.evidence_urls[0]}</Text>
        </Pressable>
      ) : null}

      <View style={styles.acts}>
        <Pressable style={styles.a} onPress={() => onHelpful(comment)} hitSlop={6}>
          <Icon name="heart" size={13} color={comment.current_user_helpful ? '#6ee7b7' : colors.text.muted} fill={comment.current_user_helpful ? '#6ee7b7' : 'none'} />
          <Text style={[styles.at, { color: comment.current_user_helpful ? '#6ee7b7' : colors.text.muted }]}>{comment.helpful_count || 0}</Text>
        </Pressable>
        {depth < 3 ? (
          <Pressable style={styles.a} onPress={() => onReply(comment)} hitSlop={6}>
            <Icon name="reply" size={13} color={colors.text.muted} /><Text style={[styles.at, { color: colors.text.muted }]}>Yanıtla</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.a} onPress={() => onReport(comment)} hitSlop={6}>
          <Icon name="flag" size={13} color={colors.text.muted} /><Text style={[styles.at, { color: colors.text.muted }]}>Bildir</Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  c:     { paddingVertical: 12 },
  head:  { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  nm:    { fontSize: 11.5, fontWeight: '700' },
  badge: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', borderWidth: 1, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2 },
  dt:    { fontSize: 10, fontWeight: '600', marginLeft: 'auto' },
  tx:    { fontSize: 12.5, lineHeight: 19, marginBottom: 8 },
  flag:  { fontSize: 10, color: '#f59e0b', marginBottom: 8 },
  src:   { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 4, marginBottom: 9, maxWidth: '90%' },
  srcT:  { color: '#60a5fa', fontSize: 10, fontWeight: '700', flexShrink: 1 },
  acts:  { flexDirection: 'row', gap: 16 },
  a:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  at:    { fontSize: 10.5, fontWeight: '700' },
});
```

- [ ] **Step 3: `components/forum/CommentTree.js` (recursive)**

```js
import React from 'react';
import { View } from 'react-native';
import CommentItem from './CommentItem';

export default function CommentTree({ comments = [], authorId, onReply, onHelpful, onReport, depth = 0 }) {
  return (
    <View>
      {comments.map(c => (
        <View key={String(c.id)}>
          <CommentItem
            comment={c}
            isAuthor={c.user_id === authorId}
            depth={depth}
            onReply={onReply}
            onHelpful={onHelpful}
            onReport={onReport}
          />
          {c.replies?.length ? (
            <CommentTree comments={c.replies} authorId={authorId} depth={depth + 1}
              onReply={onReply} onHelpful={onHelpful} onReport={onReport} />
          ) : null}
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 4: `components/forum/FeaturedEvidence.js`**

```js
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';

export default function FeaturedEvidence({ comment }) {
  const { colors } = useTheme();
  if (!comment) return null;
  const url = (comment.evidence_urls || [])[0];
  return (
    <View style={styles.c}>
      <View style={styles.lab}>
        <Icon name="shield-check" size={12} color="#6ee7b7" />
        <Text style={styles.labT}>ÖNE ÇIKAN KANIT</Text>
      </View>
      <View style={styles.head}>
        <Avatar username={comment.username} uri={comment.avatar_url} size={22} />
        <Text style={[styles.nm, { color: colors.text.secondary }]}>{comment.username}</Text>
      </View>
      <Text style={[styles.tx, { color: colors.text.secondary }]}>{comment.body}</Text>
      {url ? (
        <Pressable onPress={() => Linking.openURL(url)} style={styles.row}>
          <Icon name="check" size={13} color="#60a5fa" />
          <Text style={styles.act}>Kaynağı doğrula · {comment.verified_count || 0}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  c:    { backgroundColor: 'rgba(16,185,129,0.055)', borderRadius: 10, padding: 13, marginBottom: 14 },
  lab:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 9 },
  labT: { color: '#6ee7b7', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  nm:   { fontSize: 11, fontWeight: '700' },
  tx:   { fontSize: 12, lineHeight: 18, marginBottom: 9 },
  row:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  act:  { color: '#60a5fa', fontSize: 10, fontWeight: '700' },
});
```

- [ ] **Step 5: `[id].js`'e composer + öne çıkan kanıt + ağaç + canlı güncelleme bağla**

`[id].js` import bloğuna ekle:
```js
import CommentComposer from '../../../components/forum/CommentComposer';
import CommentTree from '../../../components/forum/CommentTree';
import FeaturedEvidence from '../../../components/forum/FeaturedEvidence';
import { useAddComment, useHelpful, useReportComment } from '../../../hooks/useForum';
import { useEffect } from 'react';
import ws from '../../../services/wsService';
```

Bileşen gövdesine (mevcut hook'ların yanına) ekle:
```js
const addComment = useAddComment(id);
const helpful = useHelpful(id);
const reportComment = useReportComment();
const [replyTo, setReplyTo] = useState(null);

useEffect(() => {
  const unsub = ws.subscribe('forum.new_comment', (msg) => {
    if (msg?.payload?.thread_id === String(id)) {
      // canlı: detayını yeniden çek
      vote; // no-op referans
    }
  });
  return unsub;
}, [id]);

const submitComment = (body) => {
  if (!isAuth) return setNudge(true);
  addComment.mutate({ body, parentId: replyTo?.id }, {
    onSuccess: ({ flagged }) => { setReplyTo(null); if (flagged) toast.info('Yorumun incelemeye alındı'); },
    onError: (e) => toast.error(e?.response?.status === 422 ? 'İçerik politikalara aykırı' : 'Yorum gönderilemedi'),
  });
};
const onHelpful = (c) => { if (!isAuth) return setNudge(true); helpful.mutate(c.id); };
const onReport  = (c) => { if (!isAuth) return setNudge(true); reportComment.mutate({ id: c.id, reason: 'spam' }, { onSuccess: () => toast.success('Bildirimin alındı'), onError: () => toast.error('Gönderilemedi') }); };
```

> **Canlı güncelleme notu:** `useThread` query'sini WS olayında invalidate etmek için, useEffect içindeki gövdeyi şununla değiştir:
```js
useEffect(() => {
  const unsub = ws.subscribe('forum.new_comment', (msg) => {
    if (msg?.payload?.thread_id === String(id)) refetchThread();
  });
  return unsub;
}, [id]);
```
ve `useThread` çağrısını `const { data: thread, isLoading, refetch: refetchThread } = useThread(id);` olarak güncelle.

ScrollView içinde "Tartışma · N yorum" satırından sonra ekle:
```js
        <CommentComposer
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onSubmit={submitComment}
          submitting={addComment.isPending}
        />
        {thread.featured_evidence ? <FeaturedEvidence comment={thread.featured_evidence} /> : null}
        <CommentTree
          comments={thread.comments ?? []}
          authorId={thread.author?.id}
          onReply={(c) => setReplyTo({ id: c.id, username: c.username })}
          onHelpful={onHelpful}
          onReport={onReport}
        />
```

- [ ] **Step 6: Görsel doğrula**

Run: `npx expo start`
Expected: Composer (avatar + input + gönder); öne çıkan kanıt kartı (varsa); yorum ağacı iç içe yanıtlarla; Faydalı/Yanıtla/Bildir çalışır; yanıtla → composer'da "@kullanıcı yanıtlanıyor" çıkar; yeni yorum eklenince liste güncellenir; başka cihazdan yorum gelince (WS) liste tazelenir.

- [ ] **Step 7: Commit**

```bash
git add components/forum/CommentComposer.js components/forum/CommentItem.js components/forum/CommentTree.js components/forum/FeaturedEvidence.js "app/(tabs)/forum/[id].js"
git commit -m "feat(forum): yorum ağacı + composer + öne çıkan kanıt + canlı güncelleme"
```

---

## Task 10: Paylaş + ⋯ menü (ForumActionSheet) + thread rapor

**Files:**
- Create: `components/forum/ForumActionSheet.js`
- Modify: `app/(tabs)/forum/[id].js`

- [ ] **Step 1: `components/forum/ForumActionSheet.js` (mevcut BottomSheet üzerine)**

```js
import React from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Icon from '../ui/Icon';
import { useTheme } from '../../hooks/useTheme';

// actions: [{ key, label, icon, danger?, onPress }]
export default function ForumActionSheet({ visible, onClose, actions }) {
  const { colors } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="İşlemler">
      <View style={{ gap: 4 }}>
        {actions.map(a => (
          <Pressable key={a.key} onPress={() => { onClose?.(); a.onPress?.(); }} style={styles.row}>
            <Icon name={a.icon} size={18} color={a.danger ? '#f87171' : colors.text.secondary} />
            <Text style={[styles.t, { color: a.danger ? '#f87171' : colors.text.primary }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

export async function shareThread(thread) {
  try {
    await Share.share({ message: `Forum: ${thread.title}\nnehaber uygulamasında tartış.` });
  } catch (_) {}
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  t:   { fontSize: 15, fontWeight: '600' },
});
```

- [ ] **Step 2: `[id].js`'e paylaş + ⋯ menü bağla**

Import bloğuna ekle:
```js
import ForumActionSheet, { shareThread } from '../../../components/forum/ForumActionSheet';
import { useReportThread, useDeleteThread } from '../../../hooks/useForum';
```

Gövdeye ekle:
```js
const [menu, setMenu] = useState(false);
const reportThreadM = useReportThread();
const deleteThreadM = useDeleteThread();
const isOwner = isAuth && user?.id === thread.author?.id;

const menuActions = [
  ...(isOwner ? [
    { key: 'delete', label: 'Sil', icon: 'x', danger: true, onPress: () =>
        deleteThreadM.mutate(id, { onSuccess: () => { toast.success('Silindi'); router.back(); }, onError: () => toast.error('Silinemedi') }) },
  ] : [
    { key: 'report', label: 'Bildir', icon: 'flag', onPress: () =>
        reportThreadM.mutate({ id, reason: 'spam' }, { onSuccess: () => toast.success('Bildirimin alındı'), onError: () => toast.error('Gönderilemedi') }) },
  ]),
];
```
(Not: `user`'ı `useAuth()`'tan al → `const { isAuth, user } = useAuth();`)

Nav'daki paylaş/⋯ ikonlarını dokunulabilir yap:
```js
        <View style={styles.sp}>
          <Pressable onPress={() => shareThread(thread)} hitSlop={8}><Icon name="share" size={17} color={colors.text.muted} /></Pressable>
          <Pressable onPress={() => setMenu(true)} hitSlop={8}><Icon name="dots" size={17} color={colors.text.muted} /></Pressable>
        </View>
```

En dış View kapanışından önce ekle:
```js
        <ForumActionSheet visible={menu} onClose={() => setMenu(false)} actions={menuActions} />
```

- [ ] **Step 3: Görsel doğrula**

Run: `npx expo start`
Expected: Paylaş ikonu sistem paylaşım sayfasını açar; ⋯ menü alttan açılır; sahip değilse "Bildir", sahipse "Sil" görünür; aksiyonlar toast verir.

- [ ] **Step 4: Commit**

```bash
git add components/forum/ForumActionSheet.js "app/(tabs)/forum/[id].js"
git commit -m "feat(forum): paylaş + ⋯ menü (rapor/sil) action sheet"
```

---

## Task 11: Yeni gönderi ekranı

**Files:**
- Create: `components/forum/CreateThreadForm.js`, `app/(tabs)/forum/yeni.js`

- [ ] **Step 1: `components/forum/CreateThreadForm.js`**

```js
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from '../ui/Icon';
import { POST_TYPES, FORUM_CATEGORIES } from '../../constants/forum';
import { palette, alpha } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function CreateThreadForm({ value, onChange }) {
  const { colors } = useTheme();
  const v = value;
  const set = (patch) => onChange({ ...v, ...patch });
  const [tagInput, setTagInput] = useState('');

  const pickImage = async () => {
    if ((v.imageUrls || []).length >= 4) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled && res.assets?.[0]) set({ imageUrls: [...(v.imageUrls || []), res.assets[0].uri] });
  };
  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !(v.tagNames || []).includes(t)) set({ tagNames: [...(v.tagNames || []), t] });
    setTagInput('');
  };

  const Lab = ({ children }) => <Text style={[styles.lab, { color: colors.text.muted }]}>{children}</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <View style={styles.sect}>
        <Lab>GÖNDERİ TİPİ</Lab>
        <View style={styles.types}>
          {POST_TYPES.map(t => {
            const on = v.postType === t.key;
            return (
              <Pressable key={t.key} onPress={() => set({ postType: t.key })}
                style={[styles.ty, { borderColor: on ? alpha(t.color, 0.6) : colors.border, backgroundColor: on ? alpha(t.color, 0.08) : colors.bg.solid }]}>
                <Icon name={t.icon} size={18} color={on ? t.color : colors.text.muted} />
                <Text style={[styles.tyNm, { color: on ? t.color : colors.text.secondary }]}>{t.label}</Text>
                <Text style={[styles.tyDs, { color: colors.text.muted }]}>{t.desc}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sect}>
        <Lab>BAŞLIK</Lab>
        <TextInput style={[styles.inp, { backgroundColor: colors.bg.solid, borderColor: colors.border, color: colors.text.primary }]}
          placeholder="İddianı kısa ve net yaz…" placeholderTextColor={colors.text.muted}
          value={v.title} onChangeText={t => set({ title: t })} />
      </View>

      <View style={styles.sect}>
        <Lab>DETAY / KANIT</Lab>
        <TextInput style={[styles.area, { backgroundColor: colors.bg.solid, borderColor: colors.border, color: colors.text.primary }]}
          placeholder="Bağlam, kaynak linki veya açıklama ekle…" placeholderTextColor={colors.text.muted}
          value={v.body} onChangeText={t => set({ body: t })} multiline />
      </View>

      <View style={styles.sect}>
        <Lab>KATEGORİ</Lab>
        <View style={styles.chips}>
          {FORUM_CATEGORIES.map(c => {
            const on = v.category === c;
            return (
              <Pressable key={c} onPress={() => set({ category: c })}
                style={[styles.chip, { borderColor: on ? alpha(palette.brand.primary, 0.5) : colors.border, backgroundColor: on ? alpha(palette.brand.primary, 0.08) : colors.bg.solid }]}>
                <Text style={[styles.chipT, { color: on ? palette.brand.bright : colors.text.secondary }]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sect}>
        <Lab>ETİKETLER</Lab>
        <View style={styles.chips}>
          {(v.tagNames || []).map(t => (
            <Pressable key={t} onPress={() => set({ tagNames: v.tagNames.filter(x => x !== t) })} style={[styles.tg, { backgroundColor: alpha(palette.brand.primary, 0.1) }]}>
              <Text style={styles.tgT}>#{t}</Text><Icon name="x" size={11} color={palette.brand.bright} strokeWidth={2.4} />
            </Pressable>
          ))}
          <TextInput style={[styles.tagIn, { color: colors.text.primary }]} placeholder="+ etiket" placeholderTextColor={colors.text.muted}
            value={tagInput} onChangeText={setTagInput} onSubmitEditing={addTag} returnKeyType="done" />
        </View>
      </View>

      <View style={styles.sect}>
        <Lab>GÖRSEL · EN FAZLA 4</Lab>
        <View style={styles.attach}>
          {(v.imageUrls || []).map((uri, i) => (
            <View key={uri} style={styles.thumbW}>
              <Image source={{ uri }} style={styles.thumb} />
              <Pressable onPress={() => set({ imageUrls: v.imageUrls.filter((_, j) => j !== i) })} style={styles.rm}><Icon name="x" size={10} color="#fff" strokeWidth={3} /></Pressable>
            </View>
          ))}
          {(v.imageUrls || []).length < 4 && (
            <Pressable onPress={pickImage} style={[styles.imgbox, { borderColor: colors.border }]}><Icon name="image" size={20} color={colors.text.muted} strokeWidth={1.8} /></Pressable>
          )}
        </View>
      </View>

      {v.postType === 'iddia' ? (
        <View style={[styles.note, { backgroundColor: alpha('#f59e0b', 0.07) }]}>
          <Icon name="info" size={15} color="#d6a64f" />
          <Text style={styles.noteT}>İddia gönderilerinde topluluk oyu eşiğe ulaşınca otomatik “Doğru / Yanlış / Yanıltıcı” sonucu çıkar.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  sect:  { marginBottom: 18 },
  lab:   { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, marginBottom: 9 },
  types: { flexDirection: 'row', gap: 8 },
  ty:    { flex: 1, borderWidth: 1, borderRadius: 8, padding: 11, alignItems: 'center', gap: 6 },
  tyNm:  { fontSize: 12, fontWeight: '800' },
  tyDs:  { fontSize: 9, fontWeight: '600', textAlign: 'center' },
  inp:   { borderWidth: 1, borderRadius: 7, padding: 13, fontSize: 15, fontWeight: '700' },
  area:  { borderWidth: 1, borderRadius: 7, padding: 13, fontSize: 13, minHeight: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, alignItems: 'center' },
  chip:  { borderWidth: 1, borderRadius: 5, paddingHorizontal: 12, paddingVertical: 8 },
  chipT: { fontSize: 11, fontWeight: '700' },
  tg:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 5 },
  tgT:   { color: '#3fff8b', fontSize: 11, fontWeight: '700' },
  tagIn: { minWidth: 80, fontSize: 12, paddingVertical: 7 },
  attach:{ flexDirection: 'row', gap: 9 },
  thumbW:{ position: 'relative' },
  thumb: { width: 60, height: 60, borderRadius: 7 },
  rm:    { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
  imgbox:{ width: 60, height: 60, borderWidth: 1, borderStyle: 'dashed', borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  note:  { flexDirection: 'row', gap: 8, padding: 11, borderRadius: 7 },
  noteT: { flex: 1, fontSize: 10.5, lineHeight: 15, color: '#d6a64f', fontWeight: '600' },
});
```

- [ ] **Step 2: `app/(tabs)/forum/yeni.js`**

```js
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../components/ui/Icon';
import CreateThreadForm from '../../../components/forum/CreateThreadForm';
import { palette } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
import { useCreateThread } from '../../../hooks/useForum';

const EMPTY = { postType: 'iddia', title: '', body: '', category: 'Gündem', tagNames: [], imageUrls: [] };

export default function NewThreadScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const create = useCreateThread();
  const [form, setForm] = useState(EMPTY);

  const valid = form.title.trim().length >= 5 && form.category;

  const submit = () => {
    if (!valid) return toast.error('Başlık en az 5 karakter ve kategori gerekli');
    create.mutate(form, {
      onSuccess: (thread) => { toast.success('Paylaşıldı'); router.replace(`/(tabs)/forum/${thread.id}`); },
      onError: (e) => toast.error(e?.response?.data?.detail || 'Paylaşılamadı'),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.base }}>
      <View style={[styles.nav, { paddingTop: insets.top + 6, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}><Icon name="x" size={20} color={colors.text.secondary} /></Pressable>
        <Text style={[styles.ti, { color: colors.text.primary }]}>Yeni gönderi</Text>
        <Pressable onPress={submit} disabled={!valid || create.isPending}
          style={[styles.sub, { backgroundColor: palette.brand.primary, opacity: !valid || create.isPending ? 0.45 : 1 }]}>
          <Text style={styles.subT}>Paylaş</Text>
        </Pressable>
      </View>
      <CreateThreadForm value={form} onChange={setForm} />
    </View>
  );
}
const styles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  ti:  { fontSize: 14, fontWeight: '800', marginLeft: 12 },
  sub: { marginLeft: 'auto', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  subT:{ color: '#06080b', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
});
```

- [ ] **Step 3: Görsel doğrula**

Run: `npx expo start` → Forum `＋` (girişliyken).
Expected: Tip seçimi (İddia/Soru/Tartışma) çalışır; başlık/detay yazılır; kategori/etiket seçilir; görsel eklenir/silinir; geçersizken Paylaş soluk; geçerli gönderi sonrası yeni thread detayına yönlenir.

- [ ] **Step 4: Commit**

```bash
git add components/forum/CreateThreadForm.js "app/(tabs)/forum/yeni.js"
git commit -m "feat(forum): yeni gönderi ekranı + form (tip/kategori/etiket/görsel)"
```

---

## Task 12: Backend seed (mock veri) script'i

**Files:**
- Create: `scripts/seed-forum.mjs`

> API üzerinden veri üretir (model iç yapısına bağımlı değil). Backend `http://localhost:8000` çalışıyor olmalı.

- [ ] **Step 1: `scripts/seed-forum.mjs` yaz**

```js
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
    // yorumlar
    await j(`/forum/threads/${thread.id}/comments`, { method: 'POST', headers: auth(u2), body: JSON.stringify({ body: 'Bence görsel eski, 2022\'den.' }) });
    await j(`/forum/threads/${thread.id}/comments`, { method: 'POST', headers: auth(u3), body: JSON.stringify({ body: 'Resmi kaynak farklı söylüyor.' }) });
    // oylar
    if (t.post_type === 'iddia') {
      await j(`/forum/threads/${thread.id}/vote`, { method: 'POST', headers: auth(u2), body: JSON.stringify({ vote_type: 'suspicious' }) });
      await j(`/forum/threads/${thread.id}/vote`, { method: 'POST', headers: auth(u3), body: JSON.stringify({ vote_type: 'authentic' }) });
    }
  }
  console.log('✓ seed tamam');
}
main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Backend'i çalıştır ve seed et**

Run (backend ayağa kalkmış olmalı — `Fake-News-Detection-System` docker-compose veya uvicorn):
```bash
cd /c/Users/emina/Documents/GitHub/nehaber-mobile
node scripts/seed-forum.mjs
```
Expected: 3 thread + yorumlar + oylar oluşur; "✓ seed tamam".

- [ ] **Step 3: Uygulamada doğrula**

Run: `npx expo start` → Forum sekmesi.
Expected: 3 thread akışta görünür (sol-çizgi kartlar, İddia'da oy çipleri), detayda yorumlar+oylar gelir.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-forum.mjs
git commit -m "chore(forum): API tabanlı mock veri seed script'i"
```

---

## Self-Review notları (yazar tarafından kontrol edildi)
- **Spec kapsamı:** akış+sekmeler (T6), detay+dock (T7-8), oylama (T8, lib T2), yorum ağacı/yanıt/beğeni/rapor (T9), composer (T9), kaydet (T6), paylaş+⋯ (T10), login nudge (T6/T8/T9), yeni gönderi (T11), canlı WS (T9), seed (T12) → Faz 1 maddeleri karşılandı. Verdict kutusu/kaynak doğrula/AI kanıt/arama/trending/mention/bildirim/düzenle = **Faz 2** (bu planın dışında, bilinçli).
- **Tip tutarlılığı:** `applyThreadVote`/`applyHelpful` (T2) hook'larda (T6) aynı imzayla kullanılıyor; `forumService` fonksiyon adları testle (T3) ve hook'larla eşleşiyor; `Icon` adları `constants/forum.js` ikon anahtarlarıyla uyumlu.
- **Açık nokta:** `VoteControl` "soru" tipinde backend `up`/`down` alanlarını kullanır; summary'de bu alanlar gelmezse 0 gösterir (detay `ForumVoteResult` döndürdüğünde güncellenir). Kabul edilebilir Faz 1 davranışı.
