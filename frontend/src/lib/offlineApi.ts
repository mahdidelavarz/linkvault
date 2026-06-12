import api from "@/lib/http";
import type { HttpMethod } from "@/lib/offlineQueue";

/** Thrown when a mutation touches vault-encrypted fields and the device is offline. */
export class OfflineVaultError extends Error {
  constructor(
    message = "This change includes encrypted vault data and requires an internet connection.",
  ) {
    super(message);
    this.name = "OfflineVaultError";
  }
}

/** The axios response interceptor in lib/http.ts normalises network failures to this message. */
export function isOfflineError(err: unknown): boolean {
  return err instanceof Error && err.message === "You are offline";
}

export async function callApi(method: HttpMethod, url: string, payload?: unknown) {
  switch (method) {
    case "post":
      return api.post(url, payload);
    case "put":
      return api.put(url, payload);
    case "patch":
      return api.patch(url, payload);
    case "delete":
      return api.delete(url, payload !== undefined ? { data: payload } : undefined);
  }
}
