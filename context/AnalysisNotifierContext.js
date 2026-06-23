import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getAnalysisStatus } from '../services/analysisService';
import { useToast } from '../hooks/useToast';

const AnalysisNotifierContext = createContext(null);

/**
 * Arka planda analiz takibi: kullanıcı analiz başlatıp sayfadan ayrılabilsin.
 * Bekleyen task'lar /status ile yoklanır (WS eşleşmesi güvenilmez olduğu için
 * polling kullanıyoruz). Tamamlanınca üstten toast + "Görüntüle" aksiyonu.
 */
export function AnalysisNotifierProvider({ children }) {
  const toast = useToast();
  const [pending, setPending] = useState([]); // [{ taskId }]
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  const track = useCallback((taskId) => {
    if (!taskId) return;
    setPending(prev => (prev.some(p => p.taskId === taskId) ? prev : [...prev, { taskId }]));
  }, []);

  const drop = (taskId) => setPending(prev => prev.filter(p => p.taskId !== taskId));

  useEffect(() => {
    if (pending.length === 0) return undefined;
    const iv = setInterval(async () => {
      for (const p of pendingRef.current) {
        try {
          const res = await getAnalysisStatus(p.taskId);
          const st = (res?.status || '').toUpperCase();
          if (st === 'SUCCESS') {
            drop(p.taskId);
            toast.success('Analiz tamamlandı.', {
              title: 'Analiz hazır',
              actionLabel: 'Görüntüle',
              onAction: () => router.push(`/(tabs)/analiz/${p.taskId}`),
              duration: 6000,
            });
          } else if (st === 'FAILED') {
            drop(p.taskId);
            toast.error('Analiz tamamlanamadı.', { title: 'Analiz' });
          }
        } catch (_) { /* geçici hata — sonraki yoklamada tekrar denenir */ }
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [pending.length, toast]);

  return (
    <AnalysisNotifierContext.Provider value={{ track }}>
      {children}
    </AnalysisNotifierContext.Provider>
  );
}

export function useAnalysisNotifier() {
  const ctx = useContext(AnalysisNotifierContext);
  if (!ctx) throw new Error('useAnalysisNotifier must be used within AnalysisNotifierProvider');
  return ctx;
}
