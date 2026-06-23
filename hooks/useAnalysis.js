import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { analyzeText, analyzeUrl, getAnalysisStatus } from '../services/analysisService';

// Analiz başlatma mutation'ı
export function useAnalyzeMutation() {
  return useMutation({
    mutationFn: ({ type, payload }) =>
      type === 'url' ? analyzeUrl(payload) : analyzeText(payload),
  });
}

// Sonuç "tam" sayılır mı? (web ile aynı: SUCCESS + Gemini ai_comment hazır.
// Direct match'te ai_comment olmaz; 90sn sonra da SUCCESS'i kabul et.)
export function isAnalysisComplete(data, timedOut = false) {
  if (data?.status !== 'SUCCESS') return false;
  const r = data.result;
  return r?.ai_comment != null || r?.is_direct_match || r?.isDirectMatch || timedOut;
}

const MAX_POLL_MS = 90_000;

// Analiz sonucu polling + WS hibrit
export function useAnalysisResult(taskId) {
  const { subscribe, connected } = useWebSocket();
  const qc = useQueryClient();
  const startRef = useRef(Date.now());
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!taskId) return undefined;
    startRef.current = Date.now();
    setTimedOut(false);
    const timer = setTimeout(() => setTimedOut(true), MAX_POLL_MS);
    // WS mesajı { type, payload:{ task_id } } şeklinde geliyor — iki olasılığı da karşıla
    const unsub = subscribe('analysis_complete', (msg) => {
      const tid = msg?.task_id ?? msg?.payload?.task_id;
      if (tid === taskId) qc.invalidateQueries({ queryKey: ['analysis-status', taskId] });
    });
    return () => { clearTimeout(timer); unsub?.(); };
  }, [taskId, subscribe, qc]);

  const query = useQuery({
    queryKey:        ['analysis-status', taskId],
    queryFn:         () => getAnalysisStatus(taskId),
    enabled:         !!taskId,
    refetchInterval: (q) => {
      const d = q.state.data;
      if (!d) return connected ? 4000 : 2000;
      if (d.status === 'FAILED') return false;
      const overTime = Date.now() - startRef.current > MAX_POLL_MS;
      if (isAnalysisComplete(d, overTime)) return false;
      // SUCCESS ama ai_comment henüz yok → Gemini için poll'a devam
      return connected ? 5000 : 2500;
    },
  });

  return {
    ...query,
    result:     query.data?.result,
    isComplete: isAnalysisComplete(query.data, timedOut),
    isFailed:   query.data?.status === 'FAILED',
  };
}
