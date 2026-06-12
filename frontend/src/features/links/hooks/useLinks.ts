import { useInfiniteQuery, useQuery, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import api from '@/lib/http';
import { useOfflineMutation } from '@/features/shared/hooks/useOfflineMutation';
import { useVault } from '@/features/settings/security/hooks/useVault';
import { Link, CreateLinkDto, UpdateLinkDto } from '@/features/links/types/link';

export type Page<T> = { items: T[]; total: number; page: number; limit: number; hasMore: boolean };

// Fetch all links (paginated)
export const useLinks = (filters?: {
    search?: string;
    categoryId?: number;
    isFavorite?: boolean;
    tagIds?: number[];
    sortBy?: 'updatedAt' | 'createdAt' | 'title';
    sortDir?: 'ASC' | 'DESC';
}) => {
    return useInfiniteQuery<Page<Link>>({
        queryKey: ['links', filters],
        queryFn: async ({ pageParam }) => {
            const params = new URLSearchParams();
            if (filters?.search) params.append('search', filters.search);
            if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
            if (filters?.isFavorite) params.append('isFavorite', 'true');
            if (filters?.tagIds) params.append('tagIds', filters.tagIds.join(','));
            if (filters?.sortBy) params.append('sortBy', filters.sortBy);
            if (filters?.sortDir) params.append('sortDir', filters.sortDir);
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
        // Offline-created links (negative tempId) only exist in the cache until they sync —
        // never fetch for them, the consumer should read straight from the cache.
        enabled: !!id && id > 0,
    });
};

// ─── Offline cache helpers ─────────────────────────────────────────────────────

function patchLinksLists(
    qc: QueryClient,
    updater: (items: Link[]) => Link[],
) {
    qc.setQueriesData<InfiniteData<Page<Link>>>({ queryKey: ['links'], exact: false }, (old) => {
        if (!old) return old;
        return {
            ...old,
            pages: old.pages.map((page) => ({ ...page, items: updater(page.items) })),
        };
    });
}

// Create link
export const useCreateLink = () => {
    const { isEnabled } = useVault();

    return useOfflineMutation<CreateLinkDto, Link>({
        module: 'links',
        method: 'post',
        url: () => '/links',
        payload: (vars) => vars,
        parseResponse: (data) => (data as { link: Link }).link,
        vaultSensitive: (vars) => !!vars.password && isEnabled,
        detailKey: 'link',
        optimisticUpdate: (qc, vars, tempId) => {
            const now = new Date().toISOString();
            const optimisticLink: Link = {
                id: tempId!,
                url: vars.url,
                title: vars.title,
                description: vars.description,
                username: vars.username,
                email: vars.email,
                phone: vars.phone,
                isFavorite: vars.isFavorite ?? false,
                categoryId: vars.categoryId,
                userId: 0,
                createdAt: now,
                updatedAt: now,
            };
            patchLinksLists(qc, (items) => [optimisticLink, ...items]);
            qc.setQueryData(['link', tempId], optimisticLink);
            return optimisticLink;
        },
        invalidates: () => [['links']],
    });
};

// Update link
export const useUpdateLink = () => {
    const { isEnabled } = useVault();

    return useOfflineMutation<UpdateLinkDto & { id: number }, Link>({
        module: 'links',
        method: 'put',
        url: (vars) => `/links/${vars.id}`,
        payload: (vars) => {
            const { id, ...rest } = vars;
            return rest;
        },
        parseResponse: (data) => (data as { link: Link }).link,
        vaultSensitive: (vars) => !!vars.password && isEnabled,
        optimisticUpdate: (qc, vars) => {
            const { id, ...patch } = vars;
            const now = new Date().toISOString();
            let updated: Link | undefined;
            const apply = (item: Link): Link => {
                if (item.id !== id) return item;
                updated = { ...item, ...patch, updatedAt: now };
                return updated;
            };
            patchLinksLists(qc, (items) => items.map(apply));
            qc.setQueryData<Link>(['link', id], (old) => (old ? apply(old) : old));
            return updated ?? ({ id, ...patch, updatedAt: now } as Link);
        },
        invalidates: (vars) => [['links'], ['link', vars.id]],
    });
};

// Delete link
export const useDeleteLink = () => {
    return useOfflineMutation<number, void>({
        module: 'links',
        method: 'delete',
        url: (id) => `/links/${id}`,
        optimisticUpdate: (qc, id) => {
            patchLinksLists(qc, (items) => items.filter((item) => item.id !== id));
            qc.removeQueries({ queryKey: ['link', id] });
        },
        invalidates: () => [['links']],
    });
};

// Toggle favorite
export const useToggleFavorite = () => {
    return useOfflineMutation<number, Link>({
        module: 'links',
        method: 'patch',
        url: (id) => `/links/${id}/favorite`,
        parseResponse: (data) => (data as { link: Link }).link,
        optimisticUpdate: (qc, id) => {
            let updated: Link | undefined;
            const apply = (item: Link): Link => {
                if (item.id !== id) return item;
                updated = { ...item, isFavorite: !item.isFavorite };
                return updated;
            };
            patchLinksLists(qc, (items) => items.map(apply));
            qc.setQueryData<Link>(['link', id], (old) => (old ? apply(old) : old));
            return updated as Link;
        },
        invalidates: (id) => [['links'], ['link', id]],
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

// Check whether a URL is already saved by this user
export type DuplicateResult = { id: number; title: string } | null;

export const useCheckDuplicateUrl = () => {
    return async (url: string): Promise<DuplicateResult> => {
        const { data } = await api.get('/links/check', { params: { url } });
        return (data as { duplicate: DuplicateResult }).duplicate;
    };
};
