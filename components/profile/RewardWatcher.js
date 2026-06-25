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
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const r = data?.items?.[0];
    if (r) setCurrent(r);
  }, [data]);

  const close = async () => {
    const r = current;
    setCurrent(null);
    if (r) await markRewardSeen(r.id).catch(() => {});
  };

  return <RewardSheet reward={current} onClose={close} />;
}
