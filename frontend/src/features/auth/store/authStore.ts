import { create } from 'zustand';
import { User } from '@/features/auth/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false });
  },

  setAccessToken: (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ token: accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));

// Restore from localStorage on page load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const userRaw = localStorage.getItem('user');

  if (token && userRaw) {
    try {
      useAuthStore.setState({
        user: JSON.parse(userRaw),
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Corrupted localStorage — clear and force re-login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      useAuthStore.setState({ isLoading: false });
    }
  } else {
    useAuthStore.setState({ isLoading: false });
  }
}
