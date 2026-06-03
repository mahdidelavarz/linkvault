import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/http';
import { Snippet, CreateSnippetDto, UpdateSnippetDto } from '@/types/snippet';

type Page<T> = { items: T[]; total: number; page: number; limit: number; hasMore: boolean };

// Fetch all snippets (paginated)
export const useSnippets = (filters?: {
  search?: string;
  categoryId?: number;
  snippetType?: string;
  language?: string;
  isFavorite?: boolean;
  tagIds?: number[];
}) => {
  return useInfiniteQuery<Page<Snippet>>({
    queryKey: ['snippets', filters],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters?.snippetType) params.append('snippetType', filters.snippetType);
      if (filters?.language) params.append('language', filters.language);
      if (filters?.isFavorite) params.append('isFavorite', 'true');
      if (filters?.tagIds) params.append('tagIds', filters.tagIds.join(','));
      params.append('page', String(pageParam));
      params.append('limit', '20');
      const { data } = await api.get(`/snippets?${params.toString()}`);
      return data as Page<Snippet>;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
};

// Fetch single snippet
export const useSnippet = (id: number) => {
  return useQuery({
    queryKey: ['snippet', id],
    queryFn: async () => {
      const { data } = await api.get(`/snippets/${id}`);
      return data.snippet as Snippet;
    },
    enabled: !!id,
  });
};

// Create snippet
export const useCreateSnippet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snippetData: CreateSnippetDto) => {
      const { data } = await api.post('/snippets', snippetData);
      return data.snippet as Snippet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
    },
  });
};

// Update snippet
export const useUpdateSnippet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...snippetData }: UpdateSnippetDto & { id: number }) => {
      const { data } = await api.put(`/snippets/${id}`, snippetData);
      return data.snippet as Snippet;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
      queryClient.invalidateQueries({ queryKey: ['snippet', variables.id] });
    },
  });
};

// Delete snippet
export const useDeleteSnippet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/snippets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
    },
  });
};

// Toggle favorite
export const useToggleSnippetFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/snippets/${id}/favorite`);
      return data.snippet as Snippet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets'] });
    },
  });
};