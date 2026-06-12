import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { post } from '@/lib/http'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { AuthResponse, LoginCredentials, RegisterCredentials, ForgotPasswordCredentials, ResetPasswordCredentials } from '@/features/auth/types/user'

// ─── useLogin ─────────────────────────────────────────────────────────────────

export const useLogin = () => {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      post<AuthResponse>('/auth/login', credentials),

    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken)
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

    onSuccess: ({ user, accessToken, refreshToken }) => {
      setAuth(user, accessToken, refreshToken)
      router.push('/links')
    },
  })
}

// ─── useForgotPassword ────────────────────────────────────────────────────────

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (credentials: ForgotPasswordCredentials) =>
      post<{ message: string }>('/auth/forgot-password', credentials),
  })
}

// ─── useResetPassword ─────────────────────────────────────────────────────────

export const useResetPassword = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: (credentials: ResetPasswordCredentials) =>
      post<{ message: string }>('/auth/reset-password', credentials),

    onSuccess: () => {
      router.push('/login')
    },
  })
}

// ─── useLogout ────────────────────────────────────────────────────────────────

export const useLogout = () => {
  const router       = useRouter()
  const logout       = useAuthStore((s) => s.logout)
  const refreshToken = useAuthStore((s) => s.refreshToken)

  return () => {
    // Fire-and-forget: revoke the refresh token on the server
    if (refreshToken) {
      post('/auth/logout', { refreshToken }).catch(() => {/* ignore */})
    }
    logout()
    router.push('/login')
  }
}
