import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../services/newsService';

export function useCategories() {
  return useQuery({
    queryKey:  ['categories'],
    queryFn:   getCategories,
    staleTime: 60 * 60 * 1000, // kategoriler nadiren değişir
  });
}
