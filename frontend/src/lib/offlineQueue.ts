import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "linkvault-offline-queue";
const STORE = "mutations";
const CHANNEL_NAME = "linkvault-offline-queue";

export type HttpMethod = "post" | "put" | "patch" | "delete";

export interface QueuedMutation {
  id: string;
  module: string;
  method: HttpMethod;
  url: string;
  payload?: unknown;
  /** Set on `post` (create) entries — the negative local id used for optimistic cache entries. */
  tempId?: number;
  /** Query key prefix for the entity's detail query (e.g. "link"), used to remap tempId -> realId. */
  detailKey?: string;
  /** Query keys to invalidate once this mutation replays successfully. */
  invalidates: unknown[][];
  createdAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE, { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

function getChannel(): BroadcastChannel | null {
  return typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL_NAME) : null;
}

function notifyChange() {
  const channel = getChannel();
  channel?.postMessage("changed");
  channel?.close();
}

export const offlineQueue = {
  async enqueue(mutation: Omit<QueuedMutation, "id" | "createdAt">): Promise<QueuedMutation> {
    const record: QueuedMutation = {
      ...mutation,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const db = await getDb();
    await db.put(STORE, record);
    notifyChange();
    return record;
  },

  async getAll(): Promise<QueuedMutation[]> {
    const db = await getDb();
    const all = await db.getAll(STORE);
    return all.sort((a, b) => a.createdAt - b.createdAt);
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(STORE, id);
    notifyChange();
  },

  async clear(): Promise<void> {
    const db = await getDb();
    await db.clear(STORE);
    notifyChange();
  },

  /** Subscribe to queue changes (including from other tabs). Returns an unsubscribe function. */
  subscribe(callback: () => void): () => void {
    const channel = getChannel();
    if (!channel) return () => {};
    channel.onmessage = () => callback();
    return () => channel.close();
  },
};
