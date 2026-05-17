import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/http';
import { useAuthStore } from '@/store/authStore';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types/user';

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push('/links');
    },
  });
};

export const useRegister = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const { data } = await api.post<AuthResponse>('/auth/register', credentials);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push('/links');
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
    router.push('/login');
  };
};