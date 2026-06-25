import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { diffSelection } from '../lib/categories/selection';
import {
  addHiddenCategory, addHiddenSubcategory, getFeedPreferences,
  removeHiddenCategory, removeHiddenSubcategory,
} from '../services/userService';

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
    // Ana kategoriler: slug; alt kategoriler: "ana/alt" çiftleri.
    mutationFn: async ({
      allMainSlugs, selectedMains, currentHiddenCats,
      allSubPairs = [], selectedSubs = [], currentHiddenSubs = [],
    }) => {
      const cats = diffSelection(allMainSlugs, selectedMains, currentHiddenCats);
      const subs = diffSelection(allSubPairs, selectedSubs, currentHiddenSubs);
      for (const slug of cats.toAdd)    await addHiddenCategory(slug);
      for (const slug of cats.toRemove) await removeHiddenCategory(slug);
      for (const pair of subs.toAdd)    await addHiddenSubcategory(pair);
      for (const pair of subs.toRemove) await removeHiddenSubcategory(pair);
      return { cats, subs };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed-preferences'] });
      qc.invalidateQueries({ queryKey: ['news-feed'] });
    },
  });
}
