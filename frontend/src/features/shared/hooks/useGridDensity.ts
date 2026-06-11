import { useState, useEffect } from "react";

export type Density = "comfortable" | "compact";

/**
 * Persists grid density preference per-module in localStorage.
 * Pass a unique storageKey per module (e.g. "links-density").
 */
export function useGridDensity(storageKey: string): [Density, (d: Density) => void] {
    const [density, setDensityState] = useState<Density>("comfortable");

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved === "compact" || saved === "comfortable") {
            setDensityState(saved);
        }
    }, [storageKey]);

    const setDensity = (d: Density) => {
        setDensityState(d);
        localStorage.setItem(storageKey, d);
    };

    return [density, setDensity];
}
