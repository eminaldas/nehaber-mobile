import { useQuery } from '@tanstack/react-query';
import { getHotAnalyses } from '../services/analysisService';

// Son N saatin en çok analiz edilen haberleri
export function useHotAnalyses(hours = 24) {
  return useQuery({
    queryKey: ['hot-analyses', hours],
    queryFn:  () => getHotAnalyses(hours, 8),
    staleTime: 60000,
    retry: false,
  });
}
