import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import api from '@/lib/http';
import { SearchResults } from '@/types/search';

export const useGlobalSearch = (filters: {
  query: string;
  type?: string;
  categoryId?: number;
  tagIds?: number[];
}) => {
  const [debouncedQuery] = useDebounce(filters.query, 300);

  return useQuery({
    queryKey: ['search', { ...filters, query: debouncedQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (debouncedQuery) params.append('q', debouncedQuery);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.tagIds && filters.tagIds.length > 0) {
        params.append('tagIds', filters.tagIds.join(','));
      }

      const { data } = await api.get(`/search?${params.toString()}`);
      return data as SearchResults;
    },
    // P1-7: Only run when there is an actual query — empty string returns nothing useful
    enabled: debouncedQuery.trim().length > 0,
  });
};