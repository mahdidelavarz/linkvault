import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/http';
import { Link, CreateLinkDto, UpdateLinkDto } from '@/types/link';

export type Page<T> = { items: T[]; total: number; page: number; limit: number; hasMore: boolean };

// Fetch all links (paginated)
export const useLinks = (filters?: {
    search?: string;
    categoryId?: number;
    isFavorite?: boolean;
    tagIds?: number[];
}) => {
    return useInfiniteQuery<Page<Link>>({
        queryKey: ['links', filters],
        queryFn: async ({ pageParam }) => {
            const params = new URLSearchParams();
            if (filters?.search) params.append('search', filters.search);
            if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
            if (filters?.isFavorite) params.append('isFavorite', 'true');
            if (filters?.tagIds) params.append('tagIds', filters.tagIds.join(','));
            params.append('page', String(pageParam));
            params.append('limit', '20');
            const { data } = await api.get(`/links?${params.toString()}`);
            return data as Page<Link>;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    });
};

// Fetch single link
export const useLink = (id: number) => {
    return useQuery({
        queryKey: ['link', id],
        queryFn: async () => {
            const { data } = await api.get(`/links/${id}`);
            return data.link as Link;
        },
        enabled: !!id,
    });
};

// Create link
export const useCreateLink = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (linkData: CreateLinkDto) => {
            const { data } = await api.post('/links', linkData);
            return data.link as Link;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['links'] });
        },
    });
};

// Update link
export const useUpdateLink = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...linkData }: UpdateLinkDto & { id: number }) => {
            const { data } = await api.put(`/links/${id}`, linkData);
            return data.link as Link;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['links'] });
            queryClient.invalidateQueries({ queryKey: ['link', variables.id] });
        },
    });
};

// Delete link
export const useDeleteLink = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/links/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['links'] });
        },
    });
};

// Toggle favorite
export const useToggleFavorite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.patch(`/links/${id}/favorite`);
            return data.link as Link;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['links'] });
        },
    });
};

// Fetch URL metadata (title, description, favicon) for auto-fill in LinkForm
export type LinkMeta = { title?: string; description?: string; favicon?: string };

export const useFetchLinkMeta = () => {
    return async (url: string): Promise<LinkMeta> => {
        const { data } = await api.get('/links/meta', { params: { url } });
        return data as LinkMeta;
    };
};