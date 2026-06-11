import api from './api';

export async function getNewsFeed({ page = 1, category = null, pageSize = 20 } = {}) {
  const params = { page, page_size: pageSize };
  if (category) params.category = category;
  const { data } = await api.get('/news', { params });
  return data; // { items: NewsArticleResponse[], total, page }
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
