"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lv_recent_searches";
const MAX_ITEMS = 8;

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSearches(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (list: string[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  };

  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setSearches(prev => {
      const next = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, MAX_ITEMS);
      persist(next);
      return next;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setSearches(prev => {
      const next = prev.filter(s => s !== query);
      persist(next);
      return next;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    persist([]);
  }, []);

  return { searches, addSearch, removeSearch, clearSearches };
}
