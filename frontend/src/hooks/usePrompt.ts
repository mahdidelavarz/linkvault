import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/http';
import { Prompt, CreatePromptDto, UpdatePromptDto } from '@/types/prompt';

export const usePrompts = (filters?: {
  search?: string;
  categoryId?: number;
  promptType?: string;
  targetAI?: string;
  isFavorite?: boolean;
  tagIds?: number[];
}) => {
  return useQuery({
    queryKey: ['prompts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters?.promptType) params.append('promptType', filters.promptType);
      if (filters?.targetAI) params.append('targetAI', filters.targetAI);
      if (filters?.isFavorite) params.append('isFavorite', 'true');
      if (filters?.tagIds) params.append('tagIds', filters.tagIds.join(','));

      const { data } = await api.get(`/prompts?${params.toString()}`);
      return data.prompts as Prompt[];
    },
  });
};

export const usePrompt = (id: number) => {
  return useQuery({
    queryKey: ['prompt', id],
    queryFn: async () => {
      const { data } = await api.get(`/prompts/${id}`);
      return data.prompt as Prompt;
    },
    enabled: !!id,
  });
};

export const useCreatePrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePromptDto) => {
      const { data: response } = await api.post('/prompts', data);
      return response.prompt as Prompt;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prompts'] }),
  });
};

export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePromptDto & { id: number }) => {
      const { data: response } = await api.put(`/prompts/${id}`, data);
      return response.prompt as Prompt;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompt', variables.id] });
    },
  });
};

export const useDeletePrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/prompts/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prompts'] }),
  });
};

export const useTogglePromptFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/prompts/${id}/favorite`);
      return data.prompt as Prompt;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prompts'] }),
  });
};

export const useIncrementPromptUsage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/prompts/${id}/use`);
      return data.prompt as Prompt;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prompts'] }),
  });
};