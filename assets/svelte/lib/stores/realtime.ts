/**
 * RealtimeStore Factory
 *
 * Creates stores that sync with Phoenix LiveView via PubSub.
 * Handles server-pushed updates for lists like feeds, messages, contacts.
 */
import { writable, get, type Readable } from 'svelte/store';

export type SyncAction = 'set' | 'prepend' | 'append' | 'update' | 'remove';

export interface StorePayload<T> {
  store: string;
  action: SyncAction;
  data?: T | T[];
  id?: string | number;
  changes?: Partial<T>;
}

export interface OptimisticResult {
  rollback: () => void;
  confirm: (serverData?: Record<string, unknown>) => void;
}

export interface RealtimeStoreOptions<T> {
  getId?: (item: T) => string | number;
  onSync?: (action: SyncAction, data: unknown) => void;
  optimistic?: boolean;
}

export interface RealtimeStore<T> extends Readable<T[]> {
  name: string;
  set: (data: T | T[]) => void;
  prepend: (items: T | T[]) => void;
  append: (items: T | T[]) => void;
  updateItem: (id: string | number, changes: Partial<T>) => void;
  remove: (id: string | number) => void;
  find: (id: string | number) => T | undefined;
  optimisticUpdate: (itemId: string | number, optimisticChanges: Partial<T>) => OptimisticResult;
  handleServerSync: (action: SyncAction, payload: Partial<StorePayload<T>>) => void;
  clear: () => void;
  get: () => T[];
}

export const createRealtimeStore = <T extends Record<string, unknown>>(
  name: string,
  initialData: T[] = [],
  options: RealtimeStoreOptions<T> = {}
): RealtimeStore<T> => {
  const {
    getId = (item: T) => item.id as string | number,
    onSync = null,
    optimistic = true,
  } = options;

  const { subscribe, set: setStore, update } = writable<T[]>(initialData);
  const pendingOptimistic = new Map<string | number, T>();

  const store: RealtimeStore<T> = {
    subscribe,
    name,

    set: (data: T | T[]) => {
      setStore(Array.isArray(data) ? data : [data]);
      onSync?.('set', data);
    },

    prepend: (items: T | T[]) => {
      const newItems = Array.isArray(items) ? items : [items];
      update((current) => [...newItems, ...current]);
      onSync?.('prepend', items);
    },

    append: (items: T | T[]) => {
      const newItems = Array.isArray(items) ? items : [items];
      update((current) => [...current, ...newItems]);
      onSync?.('append', items);
    },

    updateItem: (id: string | number, changes: Partial<T>) => {
      update((current) =>
        current.map((item) => (getId(item) === id ? { ...item, ...changes } : item))
      );
      onSync?.('update', { id, changes });
    },

    remove: (id: string | number) => {
      update((current) => current.filter((item) => getId(item) !== id));
      onSync?.('remove', { id });
    },

    find: (id: string | number) => {
      return get({ subscribe }).find((item) => getId(item) === id);
    },

    optimisticUpdate: (
      itemId: string | number,
      optimisticChanges: Partial<T>
    ): OptimisticResult => {
      if (!optimistic) {
        return { rollback: () => {}, confirm: () => {} };
      }

      const currentItem = store.find(itemId);
      if (currentItem) {
        pendingOptimistic.set(itemId, { ...currentItem });
      }

      store.updateItem(itemId, optimisticChanges);

      return {
        rollback: () => {
          const original = pendingOptimistic.get(itemId);
          if (original) {
            store.updateItem(itemId, original);
            pendingOptimistic.delete(itemId);
          }
        },
        confirm: (serverData?: Record<string, unknown>) => {
          pendingOptimistic.delete(itemId);
          if (serverData) {
            store.updateItem(itemId, serverData as Partial<T>);
          }
        },
      };
    },

    handleServerSync: (action: SyncAction, payload: Partial<StorePayload<T>>) => {
      switch (action) {
        case 'set':
          if (payload.data) store.set(payload.data);
          break;
        case 'prepend':
          if (payload.data) store.prepend(payload.data);
          break;
        case 'append':
          if (payload.data) store.append(payload.data);
          break;
        case 'update':
          if (payload.id && (payload.changes || payload.data)) {
            store.updateItem(payload.id, (payload.changes || payload.data) as Partial<T>);
          }
          break;
        case 'remove':
          if (payload.id) store.remove(payload.id);
          break;
        default:
          console.warn(`Unknown store sync action: ${action}`);
      }
    },

    clear: () => {
      setStore([]);
      pendingOptimistic.clear();
    },

    get: () => get({ subscribe }),
  };

  return store;
};

const storeRegistry = new Map<string, RealtimeStore<Record<string, unknown>>>();

export const registerStore = <T extends Record<string, unknown>>(store: RealtimeStore<T>): void => {
  storeRegistry.set(store.name, store as RealtimeStore<Record<string, unknown>>);
};

export const unregisterStore = (name: string): void => {
  storeRegistry.delete(name);
};

export const getStore = <T extends Record<string, unknown>>(
  name: string
): RealtimeStore<T> | undefined => {
  return storeRegistry.get(name) as RealtimeStore<T> | undefined;
};

export const handleStoreSync = <T extends Record<string, unknown>>(
  payload: StorePayload<T>
): void => {
  const { store: storeName, action, ...data } = payload;
  const store = getStore<T>(storeName);

  if (!store) {
    console.warn(`Store "${storeName}" not found for sync`);
    return;
  }

  store.handleServerSync(action, data);
};

export const RealtimeStoreHook = {
  mounted(this: {
    handleEvent: (
      event: string,
      callback: (payload: StorePayload<Record<string, unknown>>) => void
    ) => void;
  }) {
    this.handleEvent('store_sync', (payload) => {
      handleStoreSync(payload);
    });
  },
};

export default createRealtimeStore;
