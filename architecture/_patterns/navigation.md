# Navigation Pattern

> App shell with bottom tabs, deep linking, and page transitions.

## Quick Index

| If you need... | Section | Time |
|----------------|---------|------|
| App shell | [#app-shell](#app-shell) | 2 min |
| Bottom tabs | [#bottom-tab-bar](#bottom-tab-bar) | 2 min |
| Deep linking | [#deep-linking](#deep-linking) | 2 min |
| Page transitions | [#page-transitions](#page-transitions) | 3 min |

---

## App Shell

### Structure

```
+------------------------+
|     AppHeader          |
+------------------------+
|                        |
|                        |
|     Page Content       |
|     (slot/children)    |
|                        |
|                        |
+------------------------+
|    BottomTabBar        |
+------------------------+
```

### Implementation

```svelte
<!-- AppShell.svelte -->
<script lang="ts">
  import { AppHeader, BottomTabBar } from '$lib/components/ui';

  let { children, title, showHeader = true, showTabs = true } = $props();
</script>

<div class="min-h-screen flex flex-col safe-top safe-bottom">
  {#if showHeader}
    <AppHeader {title} />
  {/if}

  <main class="flex-1 overflow-y-auto">
    {@render children?.()}
  </main>

  {#if showTabs}
    <BottomTabBar />
  {/if}
</div>
```

---

## Bottom Tab Bar

### Configuration

```svelte
<!-- BottomTabBar.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '../primitives/Icon.svelte';

  const tabs = [
    { path: '/dashboard', icon: 'home', label: 'Home' },
    { path: '/projects', icon: 'folder', label: 'Projects' },
    { path: '/inbox', icon: 'inbox', label: 'Inbox', badge: true },
    { path: '/profile', icon: 'user', label: 'Profile' },
  ];

  function isActive(path: string) {
    return $page.url.pathname.startsWith(path);
  }
</script>

<nav class="fixed bottom-0 inset-x-0 bg-surface border-t border-border safe-bottom z-sticky">
  <div class="flex justify-around h-14">
    {#each tabs as tab}
      <a
        href={tab.path}
        class="flex flex-col items-center justify-center flex-1 {isActive(tab.path) ? 'text-primary' : 'text-text-muted'}"
      >
        <Icon name={tab.icon} class="w-6 h-6" />
        <span class="text-xs mt-1">{tab.label}</span>
      </a>
    {/each}
  </div>
</nav>
```

### Badge Support

```svelte
{#if tab.badge && unreadCount > 0}
  <span class="absolute -top-1 -right-1 min-w-4 h-4 bg-error text-on-error text-xs rounded-full flex items-center justify-center">
    {unreadCount > 99 ? '99+' : unreadCount}
  </span>
{/if}
```

---

## Deep Linking

### Route Structure

```elixir
# router.ex
live_session :authenticated do
  live "/dashboard", DashboardLive
  live "/projects", Projects.IndexLive
  live "/projects/:id", Projects.ShowLive
  live "/projects/:id/settings", Projects.SettingsLive
  live "/inbox", InboxLive
  live "/profile", ProfileLive
end
```

### LiveView with live_action

```elixir
# Projects.ShowLive
def mount(%{"id" => id}, _session, socket) do
  {:ok, assign(socket, project_id: id)}
end

def handle_params(_params, _url, socket) do
  case socket.assigns.live_action do
    :show -> load_project(socket)
    :chat -> load_chat(socket)
    :files -> load_files(socket)
  end
end
```

### URL Preservation

Always preserve state in URL for deep linking:

```svelte
<script>
  // Read from URL
  const searchParams = new URLSearchParams(window.location.search);
  let filter = $state(searchParams.get('filter') || 'all');

  // Update URL when filter changes
  $effect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('filter', filter);
    history.replaceState({}, '', url);
  });
</script>
```

---

## Page Transitions

### Directional Transitions

```svelte
<script>
  import { fly } from 'svelte/transition';

  let { currentRoute, direction } = $props();

  const x = direction === 'forward' ? 30 : -30;
</script>

{#key currentRoute}
  <div
    in:fly={{ x, duration: 300, delay: 50 }}
    out:fly={{ x: -x, duration: 250 }}
  >
    {@render children?.()}
  </div>
{/key}
```

### Direction Detection

```svelte
<script>
  let previousRoute = $state('');

  // Determine direction based on route depth
  const direction = $derived(
    currentRoute.split('/').length > previousRoute.split('/').length
      ? 'forward'
      : 'back'
  );

  $effect(() => {
    previousRoute = currentRoute;
  });
</script>
```

---

## Back Navigation

### With Gesture

```svelte
<script>
  import { swipe } from '$lib/actions/swipe';

  function handleBack() {
    history.back();
  }
</script>

<div use:swipe on:swiperight={handleBack}>
  <!-- Page content -->
</div>
```

### Back Button

```svelte
<AppHeader title="Project Details">
  {#snippet leading()}
    <Button variant="ghost" size="sm" onclick={() => history.back()}>
      <Icon name="arrow-left" />
    </Button>
  {/snippet}
</AppHeader>
```

---

## Tab-Based Navigation

### Within a Page

```svelte
<script>
  import { Tabs } from '$lib/components/ui';

  const tabs = [
    { id: 'chat', label: 'Chat' },
    { id: 'files', label: 'Files' },
    { id: 'tasks', label: 'Tasks' },
  ];

  let activeTab = $state('chat');
</script>

<Tabs {tabs} bind:value={activeTab} />

{#if activeTab === 'chat'}
  <ChatView />
{:else if activeTab === 'files'}
  <FilesView />
{:else if activeTab === 'tasks'}
  <TasksView />
{/if}
```

---

## PWA Navigation

### Standalone Mode

```css
@media (display-mode: standalone) {
  .app-shell {
    /* Adjust for no browser chrome */
    padding-top: env(safe-area-inset-top);
  }
}
```

### Offline Fallback

```svelte
<script>
  import { connectionStore } from '$lib/stores/connection';
</script>

{#if !$connectionStore.connected}
  <div class="bg-warning-soft text-warning p-2 text-center text-sm">
    You're offline. Some features may be limited.
  </div>
{/if}
```

---

## Related Docs

- [mobile-ux.md](../_guides/mobile-ux.md) - Mobile patterns
- [animations.md](../_guides/animations.md) - Page transitions

