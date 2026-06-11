import { useState, useCallback } from "react";

/**
 * Manages bulk-select state for any list of items with an id field.
 * Usage: const bulk = useBulkSelection(links);
 */
export function useBulkSelection<T extends { id: number }>(items: T[]) {
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const enter = useCallback(() => {
        setIsSelectMode(true);
        setSelectedIds(new Set());
    }, []);

    const exit = useCallback(() => {
        setIsSelectMode(false);
        setSelectedIds(new Set());
    }, []);

    const toggle = useCallback((id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }, []);

    const isAllSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));

    const toggleAll = useCallback(() => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map((i) => i.id)));
        }
    }, [isAllSelected, items]);

    const clear = useCallback(() => setSelectedIds(new Set()), []);

    return {
        isSelectMode,
        selectedIds,
        enter,
        exit,
        toggle,
        toggleAll,
        clear,
        isAllSelected,
        count: selectedIds.size,
    };
}
