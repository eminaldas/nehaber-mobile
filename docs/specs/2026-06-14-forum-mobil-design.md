# Forum — Mobil Tasarım & Mimari Spec

**Tarih:** 2026-06-14
**Repo:** `nehaber-mobile` (Expo / React Native, expo-router)
**Backend:** `Fake-News-Detection-System` → `app/api/v1/endpoints/forum.py` (hazır, değişmiyor)
**Durum:** Onaylanmış tasarım — uygulama planına hazır

---

## 1. Amaç ve bağlam

Web platformundaki forum (`Fake-News-Detection-System/frontend/src/features/forum/*`) tam
özellikli; backend API'leri eksiksiz. Mobil taraf (`nehaber-mobile`) ise yalnızca **salt-okunur
taslak**:

- `services/forumService.js` → sadece `getThreads`, `getThreadDetail`
- `app/(tabs)/forum/index.js` → basit kart listesi (filtre/sort yok)
- `app/(tabs)/forum/[id].js` → salt-okunur detay; yorum yazma "yakında", oy/yanıt/beğeni/rapor yok

Hedef: web forumun tüm akışlarını, **yeni mobil terminal tasarım diline** uygun, dokunmatik-öncelikli
bileşenlerle yeniden inşa etmek. Backend değişmez; mobil onun mevcut sözleşmesini tüketir.

## 2. Tasarım dili (kilitli kararlar)

- **Tema:** koyu (`#06080b`) zemin + emerald aksan (`#10b981` / parlak `#3fff8b`); light mode
  desteklenir (`constants/theme.js` `light`/`dark`). Renkler temadan, sabit hex yok.
- **Köşeler:** keskin — pill/buton/etiket 3–7px, kart/panel 8–10px, telefon-içi blok minimal.
- **İkonografi:** SVG stroke ikonlar (lucide seti — `react-native-svg`). Emoji yok.
- **Avatar:** `avatar_url` varsa görsel; yoksa kullanıcı adının baş harfiyle gradient daire.
- **Belirteç:** kart sol kenarında ince dikey **renkli çizgi** (duruma göre kırmızı/yeşil/mavi) +
  kartlar arası tam genişlik 1px ayraç. Kutu/çerçeve yok.
- **Etiketler (post tipi):** İddia = amber, Soru = mavi, Tartışma = mor; pill, küçük, sakin dolgu.
- **Durum çipleri:** Aktif = emerald, İnceleme altında = amber, Çözüldü = mavi.

### Oy kontrolü stilleri
- **V1 — sayaç çip** (İddia/haber thread'i): ikon + sayı çipleri (Şüpheli/Doğru/Araştır). Kullanıcının
  kendi oyu dolu renkli. Sayılar küçük, göze sokmaz. *Görüntü + aksiyon tek yerde.*
- **V3 — yukarı/aşağı ok** (Soru/Tartışma): net skor + ok; "Araştır" ayrı çip gerekmiyorsa gizli.
- **V2 — düz dağılım çizgisi:** detay sayfasında "topluluk dağılımı" oranı (ince segment bar + %).

## 3. Ekranlar (onaylanmış mockup'lar)

Mockup dosyaları: `.superpowers/brainstorm/<session>/content/` (forum-feed-v2, forum-vote,
forum-detail-v2, forum-create).

### 3.1 Akış — `app/(tabs)/forum/index.js`
- Üst başlık: `ne**haber**` logo + sağda `＋` (yeni gönderi).
- Sekmeler: **Öne çıkan (hot) · Yeni · Tartışmalı (controversial) · Kayıtlı (bookmarks)**.
- Liste öğesi (= **A: sol çizgi** stili):
  - Üst satır: avatar + `@kullanıcı · zaman` + sağda post-tipi pill.
  - Başlık (2 satır).
  - Haber thread'iyse: AI çipi ("AI: %82 yanıltıcı/güvenilir").
  - Oy kontrolü: İddia→V1, Soru→V3, Tartışma→yok.
  - Alt meta: 💬 yorum sayısı · toplam oy · kaydet (bookmark) ikonu sağda.
- Sonsuz kaydırma (`useInfiniteQuery`), pull-to-refresh, boş/şimmer durumları.

### 3.2 Detay — `app/(tabs)/forum/[id].js` (**B: tek akış**)
- Nav: ← Forum · sağda paylaş + ⋯ (menü).
- Meta (tip · durum) → başlık → yazar satırı (AI %xx sağda küçük) → gövde → etiketler.
- Bağlı haber kartı (varsa, mor; "Habere git" dış link).
- **Verdict kutusu** (sonuçlandıysa) — DOĞRU/YANLIŞ/YANILTICI + gerekçe + kim/ne zaman.
- **Öne çıkan kanıt** kartı (varsa) — yeşil vurgulu; kaynak çipi + "Kaynağı doğrula · N".
- AI kanıt analizi (varsa) — okuma amaçlı blok.
- Yorum bölümü: composer (avatar + input + gönder) → yorum ağacı.
  - Yorum aksiyonları: **Faydalı (helpful) · Yanıtla · Bildir**; kaynaklı yorumda **Kaynağı doğrula**.
  - İç içe yanıt (max 3 derinlik), Yazar/Analist/Dedektif rozetleri (`forum_trust_tier`).
  - Moderasyon: `flagged_*` görünür ama işaretli; `removed` gizli.
- **Sabit alt oy dock'u** (blur): V2 dağılım çizgisi + V1/V3 oy butonları + yorum kısayolu.
  Sonuçlanmış thread'de oy yerine "sonuçlandı" durumu.
- Canlı güncelleme: `wsService` ile `forum.new_comment` → yeni yorum anında eklenir.

### 3.3 Yeni gönderi — `app/(tabs)/forum/yeni.js`
Sıra: **Tip (İddia/Soru/Tartışma)** → Başlık → Detay/kanıt → Habere bağla (ops.) → Kategori çipleri →
Etiketler (arama + öneri, silinebilir) → Görsel (max 4). Sağ üstte "Paylaş". Tip seçimi, sonuç/oy
mantığını belirlediği için en üstte ve bilgi notuyla.

## 4. Mimari

### Servis katmanı — `services/forumService.js`
Backend endpoint'lerinin tamamını saran ince fonksiyonlar:
- Threads: `listThreads({sort,category,tag,page})`, `discoverThreads`, `getThreadDetail`,
  `createThread`, `updateThread`, `deleteThread`, `getMyBookmarks`, `searchThreads`,
  `getTrending`, `getArticleThreads`
- Etkileşim: `voteThread`, `toggleBookmark`, `reportThread`, `resolveThread`
- Yorum: `addComment`, `helpfulVote`, `verifyComment`, `updateComment`, `deleteComment`,
  `reportComment`
- Etiket: `searchTags`

### Hook katmanı — `hooks/`
react-query tabanlı; `useThreads` (infinite), `useThread`, `useCreateThread`, `useVote`
(optimistic), `useComments`, `useAddComment`, `useHelpful` (optimistic), `useBookmark`
(optimistic), `useTags`, `useTrending`. Mutasyonlar ilgili query'leri invalidate eder.

### Ekran/route — `app/(tabs)/forum/`
`index.js`, `[id].js`, `yeni.js`, `_layout.js` (mevcut). Stack içinde sunulur.

### Bileşenler — `components/forum/`
`ForumCard`, `PostTypeBadge`, `StatusChip`, `AIChip`, `VoteControl` (V1/V3),
`VoteDistributionBar` (V2), `VoteDock`, `CommentTree`, `CommentItem`, `CommentComposer`,
`VerdictBox`, `FeaturedEvidence`, `LinkedArticleCard`, `TagInput`, `CreateThreadForm`,
`ForumActionSheet` (paylaş / düzenle / sil / sonuçlandır / rapor).

### Yeniden kullanılan mevcut yapılar
`components/ui/ShimmerCard`, `components/ui/LoginNudgeSheet`, toast, `constants/theme`,
`hooks/useAuth`, `hooks/useTheme`, `services/api`, `services/wsService`.

### Veri akışı
Ekran → hook (react-query) → forumService → `api` (axios). Yazma işlemleri optimistic update +
hata durumunda toast ile geri alma. Giriş gerektiren aksiyonlarda (oy/yorum/kaydet/oluştur) auth
yoksa `LoginNudgeSheet`.

## 5. Hata ve uç durumlar
- Oy: sonuçlanmış thread 409 → buton pasif + toast. Aynı oya tekrar tıklama = geri çekme.
- Yorum: 202 (AI flag) → "incelemeye alındı" toast, alanı koru. 422 (yüksek toksisite) → hata toast.
- Yetki: 403 (kısıtlı hesap / sahip değil) → açıklayıcı toast.
- Düzenleme süresi: thread 24sa, yorum 15dk (UI buton görünürlüğü buna göre).
- Ağ/boş/yükleniyor: ShimmerCard + boş durum metinleri; retry.

## 6. Kapsam — fazlar
- **Faz 1 (çekirdek):** akış + sekmeler · detay + sabit dock · oylama · yorum ağacı
  (yanıt/beğeni/rapor) · composer · kaydet · paylaş · login nudge · yeni gönderi · canlı yorum (WS).
- **Faz 2 (derinlik):** verdict kutusu + sonuçlandırma · kaynak doğrula + öne çıkan kanıt + AI kanıt ·
  etiket filtre + forum arama + trending şeridi · mention · bildirim entegrasyonu · düzenle/sil ·
  moderasyon görünümleri.
- **Build hazırlığı:** backend seed/mock veri script'i (örnek thread + yorum + oy) — mobilde dolu görünüm.

## 7. Kapsam dışı (şimdilik)
Admin moderasyon paneli (web'de kalır), forum analitiği, çoklu dil. İçerik üretimi yalnızca
mevcut backend sözleşmesi üzerinden; API değişikliği yok.

## 8. Başarı kriterleri
- Kullanıcı mobilde: thread oluşturabilir, oylayabilir, yorum/yanıt yazabilir, beğenebilir,
  raporlayabilir, kaydedebilir, paylaşabilir; verdict/öne çıkan kanıtı görebilir.
- Tüm akışlar tek tasarım dilinde, light/dark uyumlu, taşma/karışıklık olmadan.
- Mevcut redesign edilmiş ekranlarla (auth/profil/analiz/haberler) görsel tutarlılık.
