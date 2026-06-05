import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { analyzeText, analyzeUrl, getAnalysisStatus } from '../services/analysisService';

// Analiz başlatma mutation'ı
export function useAnalyzeMutation() {
  return useMutation({
    mutationFn: ({ type, payload }) =>
      type === 'url' ? analyzeUrl(payload) : analyzeText(payload),
  });
}

// Analiz sonucu polling + WS hibrit
export function useAnalysisResult(taskId) {
  const { subscribe, connected } = useWebSocket();
  const qc = useQueryClient();

  // WS üzerinden analysis_complete gelirse cache'i güncelle
  useEffect(() => {
    if (!taskId) return;
    const unsub = subscribe('analysis_complete', (msg) => {
      if (msg?.task_id === taskId) {
        qc.invalidateQueries({ queryKey: ['analysis-status', taskId] });
      }
    });
    return unsub;
  }, [taskId, subscribe, qc]);

  return useQuery({
    queryKey:        ['analysis-status', taskId],
    queryFn:         () => getAnalysisStatus(taskId),
    enabled:         !!taskId,
    // WS bağlıysa daha seyrek poll et, değilse 2 sn
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'SUCCESS' || status === 'FAILED') return false;
      return connected ? 5000 : 2000;
    },
  });
}
