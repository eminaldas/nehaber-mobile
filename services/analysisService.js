import api from './api';

export async function analyzeText(text) {
  const { data } = await api.post('/analysis/analyze', { text });
  return data; // { task_id, message, is_direct_match, direct_match_data }
}

export async function analyzeUrl(url) {
  const { data } = await api.post('/analysis/analyze/url', { url });
  return data;
}

export async function getAnalysisStatus(taskId) {
  const { data } = await api.get(`/analysis/status/${taskId}`);
  return data; // { task_id, status, result }
}
