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

export async function requestFullReport(taskId, userNote = '') {
  const { data } = await api.post(`/analysis/analyze/full-report/${taskId}`, {
    user_note: userNote || undefined,
  });
  return data;
}

export async function getFullReport(taskId) {
  const { data } = await api.get(`/analysis/analyze/full-report/${taskId}`);
  return data; // { task_id, status: 'cached'|'pending', report, confidence, ml_verdict }
}

export async function checkSimilarReport(taskId) {
  const { data } = await api.get(`/analysis/analyze/check-similar/${taskId}`);
  return data; // { found, similarity, title, task_id }
}

export async function submitAnalysisFeedback(taskId, label) {
  const { data } = await api.post('/analysis/feedback', {
    task_id: taskId,
    submitted_label: label,
  });
  return data;
}

// Son N saatte en çok analiz edilen haberler (popüler günlük analizler)
export async function getHotAnalyses(hours = 24, limit = 8) {
  const { data } = await api.get('/articles/trending-analyses', { params: { hours, limit } });
  return data; // { items: [{ task_id, title, request_count, status, confidence, source_url, source_domain }], hours }
}
