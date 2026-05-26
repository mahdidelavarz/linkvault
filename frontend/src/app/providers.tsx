"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, createContext, useContext } from "react";
import { useAuthStore } from "@/store/authStore";
import { SidebarProvider } from "@/components/layout/SidebarContext";

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
// Keeps authStore hydrated on first render (SSR-safe)

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    // authStore already hydrates itself from localStorage in its module scope.
    // We just make sure isLoading is resolved after mount.
    setLoading(false);
  }, [setLoading]);

  return <>{children}</>;
}

// ─── QueryClient factory ─────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus in a self-hosted vault app
        refetchOnWindowFocus: false,
        // Retry once on failure, not 3 times
        retry: 1,
        // Data stays fresh for 30 seconds
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
