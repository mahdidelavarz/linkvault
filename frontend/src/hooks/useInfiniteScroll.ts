import { useEffect, useRef } from 'react';

export function useInfiniteScroll(
    onReach: () => void,
    active: boolean,
    root?: Element | null,
): React.RefObject<HTMLDivElement | null> {
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!active) return;
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) onReach(); },
            { root: root ?? null, threshold: 0.1 },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [onReach, active, root]);

    return sentinelRef;
}
