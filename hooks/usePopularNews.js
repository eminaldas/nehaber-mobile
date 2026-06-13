import { useQuery } from '@tanstack/react-query';
import { getPopularNews } from '../services/newsService';

// Haberler rayı: kaynak + tıklanma bazlı popüler haberler (max 5)
export function usePopularNews() {
  return useQuery({
    queryKey: ['popular-news'],
    queryFn:  () => getPopularNews(5),
    staleTime: 120000,
    retry: false,
  });
}
