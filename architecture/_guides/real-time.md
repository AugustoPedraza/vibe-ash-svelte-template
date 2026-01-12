# Real-time Guide (PubSub + Notifications)

> Real-time patterns for push/pull data, notifications, and presence.

## Quick Index

| If you need... | Section | Time |
|----------------|---------|------|
| PubSub basics | [#pubsub-pattern](#pubsub-pattern) | 3 min |
| Notification system | [#notification-types](#notification-types) | 3 min |
| Push vs pull strategy | [#push-vs-pull](#push-vs-pull-strategy) | 2 min |
| LiveView integration | [#liveview-integration](#liveview-integration) | 3 min |
| Frontend store | [#frontend-store](#frontend-store-pattern) | 3 min |
| Reconnection handling | [#reconnection](#state-reconciliation) | 2 min |

---

## PubSub Pattern

### Topic Naming

| Topic Pattern | Example | Use Case |
|---------------|---------|----------|
| `user:{id}:notifications` | `user:abc123:notifications` | User-specific notifications |
| `channel:{id}` | `channel:xyz789` | Channel messages |
| `project:{id}` | `project:def456` | Project-wide events |
| `presence:{room}` | `presence:room:lobby` | Presence tracking |

### Basic Flow

```
User Action -> Svelte Component -> pushEvent() -> LiveView handle_event
                                                      |
                                              Ash Action
                                                      |
                                              Notifier (PubSub)
                                                      |
LiveView handle_info <- PubSub Broadcast
        |
push_event() -> Svelte Store Update -> UI Re-render
```

---

## Notification Types

| Type | Delivery | Persistence | Badge | Example |
|------|----------|-------------|-------|---------|
| **Transient** | Push only | None | No | "User is typing" |
| **Toast** | Push | None | No | "Message sent" |
| **Activity** | Push + Pull | Yes | Yes | "New message in #design" |
| **Alert** | Push + Pull | Yes | Yes | "Decision deadline tomorrow" |
| **System** | Pull | Yes | No | "App updated" |

---

## Push vs Pull Strategy

```
                    NOTIFICATION FLOW

  +-------------+      +-------------+      +-------------+
  |   Action    |      |   Notifier  |      |   PubSub    |
  | (message    |----->| (creates    |----->| (broadcast) |
  |  sent)      |      |  notif)     |      |             |
  +-------------+      +-------------+      +------+------+
                                                   |
                           +-----------------------+-------+
                           |                               |
                           v                               v
                    +-------------+                 +-------------+
                    |  Database   |                 |  LiveView   |
                    | (persist)   |                 | (push to    |
                    |             |                 |  Svelte)    |
                    +-------------+                 +-------------+
                           |                               |
                           |    PULL (on mount)            |  PUSH
                           +-------------------------------+  (live)
```

**Push (Real-time):**
- User is online and connected
- Immediate delivery via PubSub -> LiveView -> Svelte
- Optimistic badge increment

**Pull (Catch-up):**
- User reconnects or mounts page
- Fetch unread count + recent notifications
- Reconcile with local state

---

## Notifier Pattern

```elixir
defmodule MyApp.Notifications.Notifiers.NotificationNotifier do
  use Ash.Notifier

  def notify(%Ash.Notifier.Notification{action: %{name: :create}} = notification) do
    notif = notification.data
    topic = "user:#{notif.recipient_id}:notifications"

    Phoenix.PubSub.broadcast(MyApp.PubSub, topic, {:notification_created, notif})
    :ok
  end

  def notify(%Ash.Notifier.Notification{action: %{name: :mark_read}} = notification) do
    notif = notification.data
    topic = "user:#{notif.recipient_id}:notifications"

    Phoenix.PubSub.broadcast(MyApp.PubSub, topic, {:notification_read, notif.id})
    :ok
  end
end
```

---

## LiveView Integration

```elixir
defmodule MyAppWeb.AppLayoutLive do
  use MyAppWeb, :live_view

  def mount(_params, session, socket) do
    user_id = session.current_user.id

    if connected?(socket) do
      # Subscribe to user's notification channel
      Phoenix.PubSub.subscribe(MyApp.PubSub, "user:#{user_id}:notifications")
    end

    # Pull: Get unread count on mount
    unread_count = MyApp.Notifications.count_unread(user_id)

    {:ok, assign(socket, unread_count: unread_count)}
  end

  # Push: Handle real-time notifications
  def handle_info({:notification_created, notification}, socket) do
    socket
    |> update(:unread_count, &(&1 + 1))
    |> push_event("notification:new", %{notification: notification})
    |> then(&{:noreply, &1})
  end

  def handle_info({:notification_read, _id}, socket) do
    {:noreply, update(socket, :unread_count, &max(&1 - 1, 0))}
  end

  # Svelte requests mark all read
  def handle_event("mark_all_read", _params, socket) do
    MyApp.Notifications.mark_all_read(socket.assigns.current_user.id)
    {:noreply, assign(socket, unread_count: 0)}
  end
end
```

---

## Frontend Store Pattern

```typescript
// notificationStore.ts
import { writable, derived } from 'svelte/store';

interface Notification {
  id: string;
  type: 'activity' | 'alert' | 'system';
  title: string;
  body?: string;
  data: Record<string, any>;
  read_at: string | null;
  inserted_at: string;
}

function createNotificationStore() {
  const notifications = writable<Notification[]>([]);
  const unreadCount = writable(0);

  return {
    notifications,
    unreadCount,

    // Initialize from LiveView props
    init(initial: Notification[], count: number) {
      notifications.set(initial);
      unreadCount.set(count);
    },

    // Handle push notification
    add(notification: Notification) {
      notifications.update(n => [notification, ...n].slice(0, 50));
      if (!notification.read_at) {
        unreadCount.update(c => c + 1);
      }
    },

    // Optimistic mark read
    markRead(id: string) {
      notifications.update(n =>
        n.map(notif =>
          notif.id === id
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
      unreadCount.update(c => Math.max(c - 1, 0));
    },

    // Mark all read
    markAllRead() {
      notifications.update(n =>
        n.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
      );
      unreadCount.set(0);
    }
  };
}

export const notificationStore = createNotificationStore();
```

---

## Badge Component

```svelte
<!-- NotificationBadge.svelte -->
<script lang="ts">
  import { notificationStore } from '$lib/stores/notificationStore';

  let { live } = $props();

  const count = notificationStore.unreadCount;

  // Listen for server push
  $effect(() => {
    if (live) {
      live.handleEvent('notification:new', (data) => {
        notificationStore.add(data.notification);
        // Optional: Show toast
        showToast(data.notification.title);
      });
    }
  });
</script>

{#if $count > 0}
  <span class="badge badge-error">{$count > 99 ? '99+' : $count}</span>
{/if}
```

---

## State Reconciliation

Handle reconnection to sync state:

```elixir
# In LiveView
def handle_event("reconnect", _params, socket) do
  user_id = socket.assigns.current_user.id

  # Re-fetch authoritative count
  unread_count = MyApp.Notifications.count_unread(user_id)
  recent = MyApp.Notifications.list_recent(user_id, limit: 10)

  socket
  |> assign(unread_count: unread_count)
  |> push_event("notifications:sync", %{
    count: unread_count,
    recent: recent
  })
  |> then(&{:noreply, &1})
end
```

```svelte
<!-- Handle reconnect in Svelte -->
<script>
  import { connectionStore } from '$lib/stores/connection';

  $effect(() => {
    if ($connectionStore.status === 'connected' && $connectionStore.wasDisconnected) {
      // Request sync after reconnect
      live?.pushEvent('reconnect', {});
    }
  });

  $effect(() => {
    if (live) {
      live.handleEvent('notifications:sync', ({ count, recent }) => {
        notificationStore.init(recent, count);
      });
    }
  });
</script>
```

---

## PWA Background Sync

```typescript
// service-worker.ts
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  const cache = await caches.open('notifications');
  const pendingReads = await cache.match('pending-reads');

  if (pendingReads) {
    const ids = await pendingReads.json();
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
    await cache.delete('pending-reads');
  }
}
```

---

## Verification Checklist

- [ ] Notifications created via Ash notifiers (not LiveView)
- [ ] PubSub topic per user: `user:{id}:notifications`
- [ ] Unread count pulled on mount, pushed on change
- [ ] Badge updates optimistically
- [ ] Mark read syncs with server
- [ ] Reconnect reconciles state
- [ ] PWA queues reads offline for sync
- [ ] Expiring notifications filtered automatically

---

## Related Docs

- [backend-ash.md](./backend-ash.md) - Ash notifier patterns
- [frontend-svelte.md](./frontend-svelte.md) - Store patterns
- [mobile-ux.md](./mobile-ux.md) - Offline queue patterns

