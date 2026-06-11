import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/http';
import { Tag, CreateTagDto } from '@/features/tags/types/tag';

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await api.get('/tags');
      return data.tags as Tag[];
    },
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagData: CreateTagDto) => {
      const { data } = await api.post('/tags', tagData);
      return data.tag as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tagData }: CreateTagDto & { id: number }) => {
      const { data } = await api.put(`/tags/${id}`, tagData);
      return data.tag as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};