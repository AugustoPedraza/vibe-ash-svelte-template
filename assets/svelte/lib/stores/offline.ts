/**
 * Offline Queue Store
 *
 * Queues actions while offline and automatically flushes when reconnected.
 * Provides resilient offline-first behavior for PWA.
 */
import { writable, get, type Readable } from 'svelte/store';
import { connectionStatus, isConnected } from './connection';

export interface QueuedAction {
  id: string;
  event: string;
  payload: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

interface OfflineQueueStore extends Readable<QueuedAction[]> {
  enqueue: (event: string, payload: Record<string, unknown>) => string;
  dequeue: (id: string) => void;
  clear: () => void;
  flush: (
    pushEvent: (event: string, payload: Record<string, unknown>) => Promise<unknown>
  ) => Promise<void>;
  getQueue: () => QueuedAction[];
  size: () => number;
}

const STORAGE_KEY = 'syna_offline_queue';
const MAX_RETRIES = 3;

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const loadFromStorage = (): QueuedAction[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (queue: QueuedAction[]): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full or unavailable
  }
};

const createOfflineQueueStore = (): OfflineQueueStore => {
  const { subscribe, set, update } = writable<QueuedAction[]>(loadFromStorage());

  let isFlushing = false;

  const store: OfflineQueueStore = {
    subscribe,

    enqueue: (event: string, payload: Record<string, unknown>): string => {
      const id = generateId();
      const action: QueuedAction = {
        id,
        event,
        payload,
        timestamp: Date.now(),
        retries: 0,
      };

      update((queue) => {
        const newQueue = [...queue, action];
        saveToStorage(newQueue);
        return newQueue;
      });

      return id;
    },

    dequeue: (id: string): void => {
      update((queue) => {
        const newQueue = queue.filter((a) => a.id !== id);
        saveToStorage(newQueue);
        return newQueue;
      });
    },

    clear: (): void => {
      set([]);
      saveToStorage([]);
    },

    flush: async (pushEvent): Promise<void> => {
      if (isFlushing) return;
      if (!get(isConnected)) return;

      isFlushing = true;
      const queue = get({ subscribe });

      for (const action of queue) {
        try {
          await pushEvent(action.event, action.payload);
          store.dequeue(action.id);
        } catch {
          // Increment retry count
          update((q) => {
            const newQueue = q
              .map((a) => {
                if (a.id === action.id) {
                  const retries = a.retries + 1;
                  if (retries >= MAX_RETRIES) {
                    console.warn(`Action ${action.event} exceeded max retries, removing`);
                    return null;
                  }
                  return { ...a, retries };
                }
                return a;
              })
              .filter((a): a is QueuedAction => a !== null);
            saveToStorage(newQueue);
            return newQueue;
          });

          // If connection is lost during flush, stop
          if (!get(isConnected)) break;
        }
      }

      isFlushing = false;
    },

    getQueue: () => get({ subscribe }),

    size: () => get({ subscribe }).length,
  };

  return store;
};

export const offlineQueue = createOfflineQueueStore();

export const pendingActionsCount: Readable<number> = {
  subscribe: (run) => {
    return offlineQueue.subscribe((queue) => run(queue.length));
  },
};

export const hasPendingActions: Readable<boolean> = {
  subscribe: (run) => {
    return offlineQueue.subscribe((queue) => run(queue.length > 0));
  },
};

/**
 * Initialize auto-flush on reconnection.
 * Call this from app.js with your pushEvent function.
 */
export const initOfflineSync = (
  pushEvent: (event: string, payload: Record<string, unknown>) => Promise<unknown>
): (() => void) => {
  const unsubscribe = connectionStatus.subscribe((status) => {
    if (status === 'connected') {
      offlineQueue.flush(pushEvent);
    }
  });

  return unsubscribe;
};

/**
 * Helper to wrap an action with offline support.
 * If online, executes immediately. If offline, queues for later.
 */
export const withOfflineSupport = async (
  event: string,
  payload: Record<string, unknown>,
  pushEvent: (event: string, payload: Record<string, unknown>) => Promise<unknown>
): Promise<{ queued: boolean; result?: unknown }> => {
  if (get(isConnected)) {
    try {
      const result = await pushEvent(event, payload);
      return { queued: false, result };
    } catch {
      // Fall through to queue
    }
  }

  offlineQueue.enqueue(event, payload);
  return { queued: true };
};
