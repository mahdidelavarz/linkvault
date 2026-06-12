"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/query-persist-client-core";
import { useState, useEffect, createContext, useContext } from "react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { createIdbPersister } from "@/lib/idb-persister";
import { SidebarProvider } from "@/features/shared/layout/SidebarContext";

// ─── Theme ───────────────────────────────────────────────────────────────────

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initial = saved ?? preferred;
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Auth initializer ────────────────────────────────────────────────────────

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  return <>{children}</>;
}

// ─── QueryClient factory ─────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30_000,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// ─── Root Providers ──────────────────────────────────────────────────────────

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  // Wire IDB persistence — runs only on the client after mount.
  // Vault queries are excluded because they contain sensitive encrypted data.
  useEffect(() => {
    const [unsubscribe] = persistQueryClient({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient: queryClient as any,
      persister: createIdbPersister(),
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          const key = String(query.queryKey[0] ?? "");
          if (key.startsWith("vault")) return false;
          // Only persist settled queries — persisting a query mid-fetch ("pending")
          // serializes its in-flight promise to "{}" (JSON.stringify strips Promises),
          // which breaks on restore: "promise.then is not a function" / "A query that
          // was dehydrated as pending ended up rejecting" (CancelledError).
          return query.state.status === "success";
        },
      },
    });
    return unsubscribe;
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthInitializer>
          <SidebarProvider>{children}</SidebarProvider>
        </AuthInitializer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
