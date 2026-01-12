# Offline Pattern

> PWA offline support with action queuing and sync.

## Quick Index

| If you need... | Section | Time |
|----------------|---------|------|
| Connection store | [#connection-store](#connection-store) | 2 min |
| Offline queue | [#offline-queue](#offline-queue) | 3 min |
| Optimistic updates | [#optimistic-updates](#optimistic-updates) | 3 min |
| Sync on reconnect | [#sync-on-reconnect](#sync-on-reconnect) | 2 min |

---

## Connection Store

```typescript
// $lib/stores/connection.ts
import { writable, derived } from 'svelte/store';

interface ConnectionState {
  status: 'connected' | 'connecting' | 'disconnected';
  wasDisconnected: boolean;
  lastConnectedAt: Date | null;
}

function createConnectionStore() {
  const { subscribe, set, update } = writable<ConnectionState>({
    status: 'connected',
    wasDisconnected: false,
    lastConnectedAt: null
  });

  // Listen to browser online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      update(s => ({
        ...s,
        status: 'connected',
        wasDisconnected: true,
        lastConnectedAt: new Date()
      }));
    });

    window.addEventListener('offline', () => {
      update(s => ({ ...s, status: 'disconnected' }));
    });
  }

  return {
    subscribe,
    setConnected: () => update(s => ({
      ...s,
      status: 'connected',
      lastConnectedAt: new Date()
    })),
    setDisconnected: () => update(s => ({
      ...s,
      status: 'disconnected',
      wasDisconnected: true
    }))
  };
}

export const connectionStore = createConnectionStore();
export const isConnected = derived(connectionStore, $c => $c.status === 'connected');
```

---

## Offline Queue

```typescript
// $lib/stores/offline.ts
import { writable, get } from 'svelte/store';

interface QueuedAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
}

function createOfflineQueue() {
  const queue = writable<QueuedAction[]>([]);

  // Restore from localStorage
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('offlineQueue');
    if (saved) queue.set(JSON.parse(saved));
  }

  // Persist on change
  queue.subscribe(q => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('offlineQueue', JSON.stringify(q));
    }
  });

  return {
    subscribe: queue.subscribe,

    add(type: string, payload: unknown) {
      const action: QueuedAction = {
        id: crypto.randomUUID(),
        type,
        payload,
        timestamp: Date.now(),
        retries: 0
      };
      queue.update(q => [...q, action]);
      return action.id;
    },

    remove(id: string) {
      queue.update(q => q.filter(a => a.id !== id));
    },

    incrementRetry(id: string) {
      queue.update(q => q.map(a =>
        a.id === id ? { ...a, retries: a.retries + 1 } : a
      ));
    },

    async flush(handler: (action: QueuedAction) => Promise<void>) {
      const actions = get(queue);
      const maxRetries = 3;

      for (const action of actions) {
        if (action.retries >= maxRetries) {
          this.remove(action.id);
          continue;
        }

        try {
          await handler(action);
          this.remove(action.id);
        } catch (e) {
          this.incrementRetry(action.id);
        }
      }
    },

    clear() {
      queue.set([]);
    },

    get count() {
      return get(queue).length;
    }
  };
}

export const offlineQueue = createOfflineQueue();
```

---

## Optimistic Updates

```svelte
<script lang="ts">
  import { haptic } from '$lib/utils/haptics';
  import { connectionStore } from '$lib/stores/connection';
  import { offlineQueue } from '$lib/stores/offline';

  let messages = $state<Message[]>([]);

  async function sendMessage(content: string) {
    // 1. Create optimistic message
    const optimisticId = crypto.randomUUID();
    const optimistic: Message = {
      id: optimisticId,
      content,
      status: 'pending',
      sent_at: new Date().toISOString()
    };

    // 2. Add to UI immediately
    messages = [...messages, optimistic];
    haptic('light');

    // 3. Check connection
    if (!$connectionStore.status === 'connected') {
      // Queue for later
      offlineQueue.add('send_message', { content, optimisticId });
      return;
    }

    // 4. Send to server
    try {
      const result = await live?.pushEventAsync('send_message', { content });

      // 5. Replace optimistic with real
      messages = messages.map(m =>
        m.id === optimisticId ? { ...result, status: 'sent' } : m
      );
      haptic('success');
    } catch (error) {
      // 6. Mark as failed
      messages = messages.map(m =>
        m.id === optimisticId ? { ...m, status: 'failed' } : m
      );
      haptic('error');

      // 7. Queue for retry
      offlineQueue.add('send_message', { content, optimisticId });
    }
  }
</script>
```

---

## Sync on Reconnect

```svelte
<script lang="ts">
  import { connectionStore } from '$lib/stores/connection';
  import { offlineQueue } from '$lib/stores/offline';

  // Flush queue when back online
  $effect(() => {
    if ($connectionStore.status === 'connected' && $connectionStore.wasDisconnected) {
      offlineQueue.flush(async (action) => {
        await live?.pushEventAsync(action.type, action.payload);
      });

      // Also request fresh data
      live?.pushEvent('sync', {});
    }
  });
</script>
```

### Server-Side Sync Handler

```elixir
def handle_event("sync", _params, socket) do
  user_id = socket.assigns.current_user.id

  # Re-fetch authoritative data
  messages = MyApp.Messages.list_recent(user_id)
  unread_count = MyApp.Notifications.count_unread(user_id)

  socket
  |> push_event("sync:complete", %{
    messages: messages,
    unread_count: unread_count
  })
  |> then(&{:noreply, &1})
end
```

---

## UI Indicators

### Pending Actions Badge

```svelte
<script>
  import { offlineQueue } from '$lib/stores/offline';
</script>

{#if $offlineQueue.length > 0}
  <div class="text-warning text-sm">
    {$offlineQueue.length} pending action(s)
  </div>
{/if}
```

### Message Status

```svelte
{#each messages as message}
  <div class="message">
    {message.content}

    {#if message.status === 'pending'}
      <span class="text-text-muted text-xs">Sending...</span>
    {:else if message.status === 'failed'}
      <button onclick={() => retry(message.id)} class="text-error text-xs">
        Retry
      </button>
    {/if}
  </div>
{/each}
```

### Connection Banner

```svelte
<script>
  import { connectionStore } from '$lib/stores/connection';
</script>

{#if $connectionStore.status === 'disconnected'}
  <div class="bg-warning-soft text-warning p-2 text-center">
    You're offline. Changes will sync when connected.
  </div>
{/if}
```

---

## Service Worker Sync

```typescript
// service-worker.ts
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-actions') {
    event.waitUntil(syncQueuedActions());
  }
});

async function syncQueuedActions() {
  const cache = await caches.open('offline-actions');
  const response = await cache.match('queue');

  if (response) {
    const queue = await response.json();

    for (const action of queue) {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify(action)
        });
      } catch (e) {
        // Will retry on next sync
        return;
      }
    }

    await cache.delete('queue');
  }
}
```

---

## Checklist

- [ ] Connection status tracked
- [ ] Actions queue when offline
- [ ] Queue persists to localStorage
- [ ] Sync triggers on reconnect
- [ ] UI shows pending status
- [ ] Failed actions can retry
- [ ] Max retries implemented

---

## Related Docs

- [mobile-ux.md](../_guides/mobile-ux.md) - Mobile patterns
- [real-time.md](../_guides/real-time.md) - PubSub sync

