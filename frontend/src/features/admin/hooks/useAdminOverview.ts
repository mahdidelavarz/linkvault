import { useQuery } from '@tanstack/react-query';
import api from '@/lib/http';

export interface AdminUserOverview {
  id: number;
  username: string;
  email?: string;
  createdAt: string;
  linksCount: number;
  notesCount: number;
  snippetsCount: number;
  promptsCount: number;
  apiCollectionsCount: number;
  infrastructureCount: number;
  projectsCount: number;
}

export interface AdminOverview {
  totalUsers: number;
  users: AdminUserOverview[];
}

export const useAdminOverview = () => {
  return useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const { data } = await api.get('/admin/overview');
      return data as AdminOverview;
    },
  });
};
