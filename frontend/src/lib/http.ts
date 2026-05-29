import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.100:5000/api";

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

// ─── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor ────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    // Network/offline error
    if (!error.response) {
      error.message = 'You are offline'
      return Promise.reject(error)
    }

    // Real unauthorized response
    if (
      typeof window !== 'undefined' &&
      navigator.onLine &&
      error.response.status === 401
    ) {
      const { useAuthStore } = await import('@/store/authStore')

      useAuthStore.getState().logout()

      window.location.href = '/login'
    }

    // Normalize backend error message
    const serverMessage = error.response.data?.message

    if (serverMessage && error.message !== serverMessage) {
      error.message = serverMessage
    }

    return Promise.reject(error)
  }
)

export default api;

// ─── Typed helper wrappers ────────────────────────────────────────────────────
// Usage: const data = await get<Link[]>('/links')

export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const res = await api.get<T>(url, { params });
  return res.data;
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post<T>(url, body);
  return res.data;
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.put<T>(url, body);
  return res.data;
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.patch<T>(url, body);
  return res.data;
}

export async function del<T>(url: string): Promise<T> {
  const res = await api.delete<T>(url);
  return res.data;
}
