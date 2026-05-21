import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/http';
import { Infrastructure, CreateInfraDto } from '@/types/infrastructure';

export const useInfrastructures = (filters?: {
  search?: string;
  infraType?: string;
  categoryId?: number;
  isFavorite?: boolean;
  tagIds?: number[];
}) => {
  return useQuery({
    queryKey: ['infrastructure', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.infraType) params.append('infraType', filters.infraType);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters?.isFavorite) params.append('isFavorite', 'true');
      if (filters?.tagIds) params.append('tagIds', filters.tagIds.join(','));

      const { data } = await api.get(`/infrastructure?${params.toString()}`);
      return data.infrastructures as Infrastructure[];
    },
  });
};

export const useCreateInfrastructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInfraDto) => {
      const { data: res } = await api.post('/infrastructure', data);
      return res.infrastructure;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['infrastructure'] }),
  });
};

export const useUpdateInfrastructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: CreateInfraDto & { id: number }) => {
      const { data: res } = await api.put(`/infrastructure/${id}`, data);
      return res.infrastructure;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['infrastructure'] }),
  });
};

export const useDeleteInfrastructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/infrastructure/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['infrastructure'] }),
  });
};

export const useToggleInfraFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/infrastructure/${id}/favorite`);
      return data.infrastructure;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['infrastructure'] }),
  });
};