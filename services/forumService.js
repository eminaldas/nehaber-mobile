import api from './api';

export async function getThreads({ page = 1, category = null, pageSize = 20 } = {}) {
  const params = { page, page_size: pageSize };
  if (category) params.category = category;
  const { data } = await api.get('/forum/threads', { params });
  return data; // { items: ForumThreadSummary[], total, page, size }
}

export async function getThreadDetail(id) {
  const { data } = await api.get(`/forum/threads/${id}`);
  return data; // ForumThreadDetail
}
