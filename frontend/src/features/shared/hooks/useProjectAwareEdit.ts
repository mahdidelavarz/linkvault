'use client';

import { useState } from 'react';
import { useItemMembership } from '@/features/projects/hooks/useProjects';
import { type ProjectItemType } from '@/features/projects/types/project';

interface UseProjectAwareEditOptions<T> {
    itemType: ProjectItemType;
    itemId: number;
    onEdit: (item: T) => void;
}

// Sentinel wrapper so we can detect "pending item set" even when T is null/undefined
type PendingState<T> = { set: true; item: T } | { set: false };

export function useProjectAwareEdit<T>({ itemType, itemId, onEdit }: UseProjectAwareEditOptions<T>) {
    const [pending, setPending] = useState<PendingState<T>>({ set: false });
    const { data: membership } = useItemMembership(itemType, itemId);

    const handleEdit = (item: T) => {
        if (membership && membership.length > 1) {
            setPending({ set: true, item });
        } else {
            onEdit(item);
        }
    };

    const confirmEdit = () => {
        if (pending.set) {
            onEdit(pending.item);
            setPending({ set: false });
        }
    };

    const cancelEdit = () => setPending({ set: false });

    return {
        handleEdit,
        confirmEdit,
        cancelEdit,
        isWarnOpen: pending.set,
        projectCount: membership?.length ?? 0,
        projectNames: membership?.map(p => p.title) ?? [],
    };
}
