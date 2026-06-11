// lib/themes.ts
export type ThemeName = 
  | 'default'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'emerald'
  | 'indigo'
  | 'orange'
  | 'teal'
  | 'violet'
  | 'slate'
  | 'crimson';

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  colors: {
    accent: string;
    accentHover: string;
    accentMuted: string;
    accentSubtle: string;
    accentBorder: string;
    cyan50: string;
    cyan100: string;
    cyan200: string;
    cyan300: string;
    cyan400: string;
    cyan500: string;
    cyan600: string;
    cyan700: string;
    cyan800: string;
    cyan900: string;
  };
}

export const themes: Record<ThemeName, ThemeConfig> = {
  default: {
    name: 'default',
    label: 'Cyan (Default)',
    colors: {
      accent: '#06b6d4',
      accentHover: '#22d3ee',
      accentMuted: '#06b6d41a',
      accentSubtle: '#06b6d40d',
      accentBorder: '#06b6d433',
      cyan50: '#ecfeff',
      cyan100: '#cffafe',
      cyan200: '#a5f3fc',
      cyan300: '#67e8f9',
      cyan400: '#22d3ee',
      cyan500: '#06b6d4',
      cyan600: '#0891b2',
      cyan700: '#0e7490',
      cyan800: '#155e75',
      cyan900: '#164e63',
    },
  },
  purple: {
    name: 'purple',
    label: 'Purple Nebula',
    colors: {
      accent: '#a855f7',
      accentHover: '#c084fc',
      accentMuted: '#a855f71a',
      accentSubtle: '#a855f70d',
      accentBorder: '#a855f733',
      cyan50: '#faf5ff',
      cyan100: '#f3e8ff',
      cyan200: '#e9d5ff',
      cyan300: '#d8b4fe',
      cyan400: '#c084fc',
      cyan500: '#a855f7',
      cyan600: '#9333ea',
      cyan700: '#7e22ce',
      cyan800: '#6b21a8',
      cyan900: '#581c87',
    },
  },
  amber: {
    name: 'amber',
    label: 'Amber Glow',
    colors: {
      accent: '#f59e0b',
      accentHover: '#fbbf24',
      accentMuted: '#f59e0b1a',
      accentSubtle: '#f59e0b0d',
      accentBorder: '#f59e0b33',
      cyan50: '#fffbeb',
      cyan100: '#fef3c7',
      cyan200: '#fde68a',
      cyan300: '#fcd34d',
      cyan400: '#fbbf24',
      cyan500: '#f59e0b',
      cyan600: '#d97706',
      cyan700: '#b45309',
      cyan800: '#92400e',
      cyan900: '#78350f',
    },
  },
  rose: {
    name: 'rose',
    label: 'Rose Blossom',
    colors: {
      accent: '#f43f5e',
      accentHover: '#fb7185',
      accentMuted: '#f43f5e1a',
      accentSubtle: '#f43f5e0d',
      accentBorder: '#f43f5e33',
      cyan50: '#fff1f2',
      cyan100: '#ffe4e6',
      cyan200: '#fecdd3',
      cyan300: '#fda4af',
      cyan400: '#fb7185',
      cyan500: '#f43f5e',
      cyan600: '#e11d48',
      cyan700: '#be123c',
      cyan800: '#9f1239',
      cyan900: '#881337',
    },
  },
  emerald: {
    name: 'emerald',
    label: 'Emerald Forest',
    colors: {
      accent: '#10b981',
      accentHover: '#34d399',
      accentMuted: '#10b9811a',
      accentSubtle: '#10b9810d',
      accentBorder: '#10b98133',
      cyan50: '#ecfdf5',
      cyan100: '#d1fae5',
      cyan200: '#a7f3d0',
      cyan300: '#6ee7b7',
      cyan400: '#34d399',
      cyan500: '#10b981',
      cyan600: '#059669',
      cyan700: '#047857',
      cyan800: '#065f46',
      cyan900: '#064e3b',
    },
  },
  indigo: {
    name: 'indigo',
    label: 'Indigo Dream',
    colors: {
      accent: '#6366f1',
      accentHover: '#818cf8',
      accentMuted: '#6366f11a',
      accentSubtle: '#6366f10d',
      accentBorder: '#6366f133',
      cyan50: '#eef2ff',
      cyan100: '#e0e7ff',
      cyan200: '#c7d2fe',
      cyan300: '#a5b4fc',
      cyan400: '#818cf8',
      cyan500: '#6366f1',
      cyan600: '#4f46e5',
      cyan700: '#4338ca',
      cyan800: '#3730a3',
      cyan900: '#312e81',
    },
  },
  orange: {
    name: 'orange',
    label: 'Orange Sunset',
    colors: {
      accent: '#f97316',
      accentHover: '#fb923c',
      accentMuted: '#f973161a',
      accentSubtle: '#f973160d',
      accentBorder: '#f9731633',
      cyan50: '#fff7ed',
      cyan100: '#ffedd5',
      cyan200: '#fed7aa',
      cyan300: '#fdba74',
      cyan400: '#fb923c',
      cyan500: '#f97316',
      cyan600: '#ea580c',
      cyan700: '#c2410c',
      cyan800: '#9a3412',
      cyan900: '#7c2d12',
    },
  },
  teal: {
    name: 'teal',
    label: 'Teal Ocean',
    colors: {
      accent: '#14b8a6',
      accentHover: '#2dd4bf',
      accentMuted: '#14b8a61a',
      accentSubtle: '#14b8a60d',
      accentBorder: '#14b8a633',
      cyan50: '#f0fdfa',
      cyan100: '#ccfbf1',
      cyan200: '#99f6e4',
      cyan300: '#5eead4',
      cyan400: '#2dd4bf',
      cyan500: '#14b8a6',
      cyan600: '#0d9488',
      cyan700: '#0f766e',
      cyan800: '#115e59',
      cyan900: '#134e4a',
    },
  },
  violet: {
    name: 'violet',
    label: 'Violet Magic',
    colors: {
      accent: '#8b5cf6',
      accentHover: '#a78bfa',
      accentMuted: '#8b5cf61a',
      accentSubtle: '#8b5cf60d',
      accentBorder: '#8b5cf633',
      cyan50: '#f5f3ff',
      cyan100: '#ede9fe',
      cyan200: '#ddd6fe',
      cyan300: '#c4b5fd',
      cyan400: '#a78bfa',
      cyan500: '#8b5cf6',
      cyan600: '#7c3aed',
      cyan700: '#6d28d9',
      cyan800: '#5b21b6',
      cyan900: '#4c1d95',
    },
  },
  slate: {
    name: 'slate',
    label: 'Slate Minimal',
    colors: {
      accent: '#64748b',
      accentHover: '#94a3b8',
      accentMuted: '#64748b1a',
      accentSubtle: '#64748b0d',
      accentBorder: '#64748b33',
      cyan50: '#f8fafc',
      cyan100: '#f1f5f9',
      cyan200: '#e2e8f0',
      cyan300: '#cbd5e1',
      cyan400: '#94a3b8',
      cyan500: '#64748b',
      cyan600: '#475569',
      cyan700: '#334155',
      cyan800: '#1e293b',
      cyan900: '#0f172a',
    },
  },
  crimson: {
    name: 'crimson',
    label: 'Crimson Passion',
    colors: {
      accent: '#dc2626',
      accentHover: '#ef4444',
      accentMuted: '#dc26261a',
      accentSubtle: '#dc26260d',
      accentBorder: '#dc262633',
      cyan50: '#fef2f2',
      cyan100: '#fee2e2',
      cyan200: '#fecaca',
      cyan300: '#fca5a5',
      cyan400: '#f87171',
      cyan500: '#ef4444',
      cyan600: '#dc2626',
      cyan700: '#b91c1c',
      cyan800: '#991b1b',
      cyan900: '#7f1d1d',
    },
  },
};