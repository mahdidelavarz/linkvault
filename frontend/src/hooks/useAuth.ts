import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { post } from '@/lib/http'
import { useAuthStore } from '@/store/authStore'
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types/user'

// ─── useLogin ─────────────────────────────────────────────────────────────────

export const useLogin = () => {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      post<AuthResponse>('/auth/login', credentials),

    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      router.push('/links')
    },
  })
}

// ─── useRegister ──────────────────────────────────────────────────────────────

export const useRegister = () => {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      post<AuthResponse>('/auth/register', credentials),

    onSuccess: ({ user, token }) => {
      setAuth(user, token)
      router.push('/links')
    },
  })
}

// ─── useLogout ────────────────────────────────────────────────────────────────

export const useLogout = () => {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)

  return () => {
    logout()
    router.push('/login')
  }
}