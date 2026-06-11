import { useQuery } from '@tanstack/react-query';
import { getTrending } from '../services/newsService';

// Son 24 saatin google_trends_rss başlıkları (max 5)
export function useTrending() {
  return useQuery({
    queryKey: ['trending'],
    queryFn:  getTrending,
    staleTime: 120000,
    retry: false,
  });
}
