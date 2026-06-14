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
