import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getMyRewards, markRewardSeen } from '../../services/gamificationService';
import RewardSheet from './RewardSheet';

/**
 * Kök seviyede çalışır: oturum varsa okunmamış liderlik ödüllerini çeker,
 * ilk ödülü kutlama sheet'inde gösterir; kapatınca okundu işaretler.
 */
export default function RewardWatcher() {
  const { isAuth } = useAuth();
  const { data } = useQuery({
    queryKey: ['my-rewards'],
    queryFn: getMyRewards,
    enabled: isAuth,
    staleTime: 60_000,
  });
  const [queue, setQueue] = useState([]);

  // Birden çok ödül varsa sırayla göster; kuyruk boşken doldur (refetch sırayı bozmasın).
  useEffect(() => {
    if (data?.items?.length && queue.length === 0) setQueue(data.items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const current = queue[0] ?? null;

  const close = async () => {
    const r = current;
    setQueue((q) => q.slice(1));   // sıradakine geç
    if (r) await markRewardSeen(r.id).catch(() => {});
  };

  return <RewardSheet reward={current} onClose={close} />;
}
