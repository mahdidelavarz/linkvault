import { openDB } from "idb";
import type {
  Persister,
  PersistedClient,
} from "@tanstack/query-persist-client-core";

const DB_NAME = "linkvault-query-cache";
const STORE = "cache";
const KEY = "tanstack-query";

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE);
    },
  });
}

export function createIdbPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      const db = await getDb();
      // IDB uses structured clone; PersistedClient can contain non-cloneable
      // values (e.g. Promises inside React Query internals). Serialize to JSON
      // string first so the structured clone algorithm only sees a plain string.
      await db.put(STORE, JSON.stringify(client), KEY);
    },
    restoreClient: async () => {
      const db = await getDb();
      const raw = await db.get(STORE, KEY) as string | undefined;
      if (!raw) return undefined;
      try {
        return JSON.parse(raw) as PersistedClient;
      } catch {
        // Stale entry stored as a non-JSON value (pre-serialization format).
        // Clear it so the next persist writes a clean JSON string.
        await db.delete(STORE, KEY);
        return undefined;
      }
    },
    removeClient: async () => {
      const db = await getDb();
      await db.delete(STORE, KEY);
    },
  };
}
