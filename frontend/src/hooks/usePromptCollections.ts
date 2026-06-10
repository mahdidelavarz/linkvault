import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/http';
import { PromptCollection, PromptCollectionDetail, CreatePromptCollectionDto } from '@/types/promptCollection';

// ─── Collection CRUD ────────────────────────────────────────────────────────────

export const usePromptCollections = () => {
  return useQuery<PromptCollection[]>({
    queryKey: ['prompt-collections'],
    queryFn: async () => {
      const { data } = await api.get('/prompt-collections');
      return data.collections as PromptCollection[];
    },
  });
};

export const usePromptCollection = (id: number) => {
  return useQuery<PromptCollectionDetail>({
    queryKey: ['prompt-collections', id],
    queryFn: async () => {
      const { data } = await api.get(`/prompt-collections/${id}`);
      return data.collection as PromptCollectionDetail;
    },
    enabled: id > 0,
  });
};

export const useCreatePromptCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePromptCollectionDto) => {
      const { data: res } = await api.post('/prompt-collections', data);
      return res.collection as PromptCollection;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prompt-collections'] }),
  });
};

export const useUpdatePromptCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: CreatePromptCollectionDto & { id: number }) => {
      const { data: res } = await api.put(`/prompt-collections/${id}`, data);
      return res.collection as PromptCollection;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['prompt-collections'] });
      queryClient.invalidateQueries({ queryKey: ['prompt-collections', vars.id] });
    },
  });
};

export const useDeletePromptCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/prompt-collections/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prompt-collections'] }),
  });
};

// ─── Collection Items ───────────────────────────────────────────────────────────

export const useAddToPromptCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, promptId }: { collectionId: number; promptId: number }) => {
      const { data } = await api.post(`/prompt-collections/${collectionId}/items`, { promptId });
      return data.item;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['prompt-collections'] });
      queryClient.invalidateQueries({ queryKey: ['prompt-collections', vars.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['prompt-collection-membership', vars.promptId] });
    },
  });
};

export const useRemoveFromPromptCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, promptId }: { collectionId: number; promptId: number }) => {
      await api.delete(`/prompt-collections/${collectionId}/items/${promptId}`);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['prompt-collections'] });
      queryClient.invalidateQueries({ queryKey: ['prompt-collections', vars.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['prompt-collection-membership', vars.promptId] });
    },
  });
};

// ─── Membership ─────────────────────────────────────────────────────────────────

export const usePromptCollectionMembership = (promptId: number) => {
  return useQuery<PromptCollection[]>({
    queryKey: ['prompt-collection-membership', promptId],
    queryFn: async () => {
      const { data } = await api.get(`/prompt-collections/membership/${promptId}`);
      return data.collections as PromptCollection[];
    },
    enabled: promptId > 0,
  });
};
