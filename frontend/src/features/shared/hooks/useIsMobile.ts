import { useState, useEffect } from "react";

/**
 * Returns true when the viewport matches a max-width media query.
 * SSR-safe: defaults to false on the server / first render, then syncs.
 * Default breakpoint is the app's mobile cutoff (767px).
 */
export function useIsMobile(maxWidth = 767): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
        const update = () => setIsMobile(mql.matches);
        update();
        mql.addEventListener("change", update);
        return () => mql.removeEventListener("change", update);
    }, [maxWidth]);

    return isMobile;
}
