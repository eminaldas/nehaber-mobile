import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { diffSelection } from '../lib/categories/selection';
import { addHiddenCategory, getFeedPreferences, removeHiddenCategory } from '../services/userService';

export function useFeedPreferences() {
  const { isAuth } = useAuth();
  return useQuery({
    queryKey:  ['feed-preferences'],
    queryFn:   getFeedPreferences,
    enabled:   isAuth,
    staleTime: 5 * 60 * 1000,
    retry:     false, // başarısızsa hızlı düş — bar zaten "tümü görünür"e zarif iniyor
  });
}

export function useSaveCategorySelection() {
  const qc = useQueryClient();
  return useMutation({
    // PATCH'ler SIRAYLA atılır: backend her çağrıda JSONB listesini oku-değiştir-yaz
    // yaptığı için paralel istekler birbirini ezer.
    mutationFn: async ({ allSlugs, selected, currentHidden }) => {
      const { toAdd, toRemove } = diffSelection(allSlugs, selected, currentHidden);
      for (const slug of toAdd)    await addHiddenCategory(slug);
      for (const slug of toRemove) await removeHiddenCategory(slug);
      return { toAdd, toRemove };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed-preferences'] });
      qc.invalidateQueries({ queryKey: ['news-feed'] });
    },
  });
}
