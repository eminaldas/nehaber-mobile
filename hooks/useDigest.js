import { useQuery } from '@tanstack/react-query';
import { getTodayDigest } from '../services/digestService';

export function useDigest() {
  return useQuery({
    queryKey:  ['daily-digest'],
    queryFn:   getTodayDigest,
    retry:     false,
    staleTime: 5 * 60_000,
  });
}
