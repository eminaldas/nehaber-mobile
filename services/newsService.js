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
