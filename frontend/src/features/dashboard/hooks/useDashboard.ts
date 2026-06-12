import { useQuery } from '@tanstack/react-query';
import api from '@/lib/http';

interface DashboardStats {
  links: {
    total: number;
    favorites: number;
    recentlyAdded: any[];
  };
  notes: {
    total: number;
    pinned: number;
    recentlyAdded: any[];
  };
  snippets: {
    total: number;
    favorites: number;
    recentlyAdded: any[];
  };
  prompts: {
    total: number;
    favorites: number;
    recentlyAdded: any[];
  };
  categories: {
    total: number;
  };
  tags: {
    total: number;
  };
}

export interface RecentItem {
  id: number;
  title: string;
  type: 'link' | 'note' | 'snippet' | 'prompt' | 'infrastructure';
  updatedAt: string;
  category?: string;
  url?: string;
  content?: string;
  language?: string;
  snippetType?: string;
  promptType?: string;
  infraType?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
}

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data as {
        stats: DashboardStats;
        recentItems: RecentItem[];
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};