import api from './api';

export async function getNewsFeed({ page = 1, category = null, subcategory = null, pageSize = 20 } = {}) {
  const params = { page, page_size: pageSize };
  if (category) params.category = category;
  if (subcategory) params.subcategory = subcategory;
  const { data } = await api.get('/news', { params });
  return data; // { items: NewsArticleResponse[], total, page }
}

export async function searchNews(q, { size = 50 } = {}) {
  const { data } = await api.get('/news', { params: { q, size } });
  return data; // { items, total, page }
}

export async function getNewsDetail(id) {
  const { data } = await api.get(`/news/${id}`);
  return data;
}

// Popülerlik (kaynak sayısı + tıklanma + tazelik) bazlı trend haberler — gerçek source_url'li
export async function getPopularNews(size = 5) {
  const { data } = await api.get('/news', { params: { sort: 'popular', size } });
  return data.items ?? [];
}

// Google Trends RSS başlıkları (analiz önerisi için) — Article tablosu, WebView detayı yok
export async function getTrending() {
  const { data } = await api.get('/articles/trending');
  return data; // TrendingHeadlineResponse[] (max 5): { id, title, status, source_url, source_name, source_domain }
}

export async function getCachedSummary(id) {
  const { data } = await api.get(`/news/${id}/summary`);
  return data; // { summary: string|null, exists: bool }
}

export async function summarizeNews(id) {
  const { data } = await api.post(`/news/${id}/summarize`);
  return data; // { summary: string }
}

// Public kategori ağacı → ana + alt kategoriler (sadece {slug,name}'e indirgenir)
export async function getCategories() {
  const { data } = await api.get('/news/categories');
  if (!Array.isArray(data)) return [];
  return data.map(c => ({
    slug: c.slug,
    name: c.name,
    subcategories: Array.isArray(c.subcategories)
      ? c.subcategories.map(s => ({ slug: s.slug, name: s.name }))
      : [],
  }));
}
