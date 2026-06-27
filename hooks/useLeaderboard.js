import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../services/gamificationService';

export function useLeaderboard(period = 'alltime', type = 'xp') {
  return useQuery({
    queryKey: ['leaderboard', period, type],
    queryFn: () => getLeaderboard({ period, type }),
    staleTime: 5 * 60 * 1000,      // backend 5dk cache'liyor
    placeholderData: keepPreviousData, // sekme değişince eski liste kalsın (spinner flaşı yok)
  });
}
