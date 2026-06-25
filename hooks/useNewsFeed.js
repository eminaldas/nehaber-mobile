import { useInfiniteQuery } from '@tanstack/react-query';
import { getNewsFeed } from '../services/newsService';

export function useNewsFeed(category = null, subcategory = null) {
  return useInfiniteQuery({
    queryKey:         ['news-feed', category, subcategory],
    queryFn:          ({ pageParam = 1 }) => getNewsFeed({ page: pageParam, category, subcategory }),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * 20;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
