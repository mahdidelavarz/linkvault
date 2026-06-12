import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/http';
import { Project, ProjectDetail, CreateProjectDto, ProjectItemType } from '@/features/projects/types/project';

// ─── Project CRUD ─────────────────────────────────────────────────────────────

export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data.projects as Project[];
    },
  });
};

export const useProject = (id: number) => {
  return useQuery<ProjectDetail>({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data.project as ProjectDetail;
    },
    enabled: id > 0,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProjectDto) => {
      const { data: res } = await api.post('/projects', data);
      return res.project as Project;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: CreateProjectDto & { id: number }) => {
      const { data: res } = await api.put(`/projects/${id}`, data);
      return res.project as Project;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', vars.id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
};

// ─── Project Items ────────────────────────────────────────────────────────────

export const useAddToProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, itemType, itemId }: { projectId: number; itemType: ProjectItemType; itemId: number }) => {
      const { data } = await api.post(`/projects/${projectId}/items`, { itemType, itemId });
      return data.item;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['projects', vars.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-membership', vars.itemType, vars.itemId] });
    },
  });
};

export const useRemoveFromProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, itemType, itemId }: { projectId: number; itemType: ProjectItemType; itemId: number }) => {
      await api.delete(`/projects/${projectId}/items/${itemType}/${itemId}`);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['projects', vars.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-membership', vars.itemType, vars.itemId] });
    },
  });
};

export const useReorderProjectItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, order }: {
      projectId: number;
      order: { itemType: string; itemId: number; sortOrder: number }[];
    }) => {
      await api.put(`/projects/${projectId}/items/reorder`, { order });
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['projects', vars.projectId] });
    },
  });
};

// ─── Membership ───────────────────────────────────────────────────────────────

export const useItemMembership = (itemType: ProjectItemType | '', itemId: number) => {
  return useQuery<Project[]>({
    queryKey: ['project-membership', itemType, itemId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/membership/${itemType}/${itemId}`);
      return data.projects as Project[];
    },
    enabled: !!itemType && itemId > 0,
  });
};
