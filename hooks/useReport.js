import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { getFullReport } from '../services/analysisService';

const POLL_MS = 20000;

export function useReport(taskId) {
  const { subscribe } = useWebSocket();
  const [report, setReport]         = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [mlVerdict, setMlVerdict]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!taskId) return undefined;
    doneRef.current = false;

    const apply = (data) => {
      if (!data || data.status !== 'cached' || !data.report) return false;
      doneRef.current = true;
      setReport(data.report);
      if (data.confidence != null) setConfidence(data.confidence);
      if (data.ml_verdict) setMlVerdict(data.ml_verdict);
      setLoading(false);
      return true;
    };

    const fetchReport = () =>
      getFullReport(taskId).then(apply).catch((err) => {
        if (err?.response?.status === 404) { setError('Rapor bulunamadı.'); setLoading(false); }
        return false;
      });

    fetchReport();
    const unsub = subscribe('report_ready', (msg) => { if (msg?.task_id === taskId) fetchReport(); });
    const interval = setInterval(() => {
      if (doneRef.current) { clearInterval(interval); return; }
      fetchReport().then((ok) => { if (ok) clearInterval(interval); });
    }, POLL_MS);

    return () => { unsub && unsub(); clearInterval(interval); };
  }, [taskId, subscribe]);

  return { report, confidence, mlVerdict, loading, error };
}
