import type { ChatMessage } from "@/lib/openrouter";

export type AnalysisMethod = "scalping" | "swing" | "investing";

export type AiChatSession = {
  id: string;
  title: string;
  ticker: string;
  method: AnalysisMethod;
  compareTicker?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

const DB_NAME = "idx-saham-ai-chat";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("ticker", "ticker", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function runTx<T>(
  mode: IDBTransactionMode,
  runner: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const req = runner(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export async function listAiChatSessions(): Promise<AiChatSession[]> {
  const all = await runTx<AiChatSession[]>("readonly", (store) =>
    store.getAll(),
  );
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getAiChatSession(
  id: string,
): Promise<AiChatSession | undefined> {
  return runTx<AiChatSession | undefined>("readonly", (store) => store.get(id));
}

export function upsertAiChatSession(
  session: AiChatSession,
): Promise<AiChatSession> {
  return runTx<AiChatSession>("readwrite", (store) => store.put(session)).then(
    () => session,
  );
}

export function deleteAiChatSession(id: string): Promise<void> {
  return runTx<undefined>("readwrite", (store) => store.delete(id)).then(
    () => undefined,
  );
}
