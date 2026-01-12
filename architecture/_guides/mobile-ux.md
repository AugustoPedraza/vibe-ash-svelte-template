# Mobile UX Guide

> Native-like mobile UX patterns. Pull these when features need them.

## Quick Index

| I need... | Pattern | Complexity |
|-----------|---------|------------|
| Touch-friendly buttons | [#touch-targets](#pattern-touch-targets) | Low |
| Swipe gesture on list | [#swipe-gesture](#pattern-swipe-gesture) | Medium |
| Long press menu | [#long-press](#pattern-long-press) | Medium |
| Haptic feedback | [#haptics](#pattern-haptics) | Low |
| Handle device notch | [#safe-areas](#pattern-safe-areas) | Low |
| Keyboard-aware layout | [#keyboard](#pattern-keyboard-handling) | Medium |
| Detect iOS/Android | [#platform](#pattern-platform-detection) | Low |
| Infinite scroll list | [#infinite-scroll](#pattern-infinite-scroll) | Medium |
| Large list performance | [#virtual-list](#pattern-virtual-list) | High |
| Optimistic updates | [#optimistic-updates](#pattern-optimistic-updates) | Medium |
| Offline queue | [#offline-queue](#pattern-offline-queue) | Medium |

---

## Decision: PWA First

| Capability | PWA | Native | Decision |
|------------|-----|--------|----------|
| Push notifications | iOS 16.4+, Android | Yes | PWA |
| Offline support | Service Worker | Yes | PWA |
| Camera/mic | getUserMedia | Yes | PWA |
| Haptic feedback | Vibration API | Yes | PWA |
| App Store | iOS 16.4+, Android | Yes | PWA |
| Native contacts | Limited | Yes | Later if needed |
| Native file system | Limited | Yes | Later if needed |

**Start with PWA. Add Capacitor wrapper only if native APIs become critical.**

---

## Performance Budgets

| Metric | Target | Measure With |
|--------|--------|--------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| JS Bundle (gzipped) | < 100KB | Build output |
| Cumulative Layout Shift | < 0.1 | Web Vitals |

---

## Pattern: Touch Targets

**Use when**: Any tappable element.

**Rule**: Minimum 44x44px touch area.

### Minimal Implementation

```css
.icon-button {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Reference Sizes

| Element | Minimum Size | Spacing |
|---------|--------------|---------|
| Buttons | 44x44px | 8px between |
| List items | 48px height | - |
| Form inputs | 44px height | 12px between |
| Checkboxes | 44x44px touch | - |

**Anti-patterns**:
- Don't make touch targets smaller than 44px
- Don't place touch targets closer than 8px

---

## Pattern: Swipe Gesture

**Use when**: List items need swipe-to-reveal actions.

### Svelte Action

```typescript
// $lib/actions/swipe.ts
export function swipe(node: HTMLElement, options?: {
  threshold?: number;
  direction?: 'left' | 'right' | 'both';
}) {
  const threshold = options?.threshold ?? 50;
  let startX = 0;

  function handleTouchStart(e: TouchEvent) {
    startX = e.touches[0].clientX;
  }

  function handleTouchEnd(e: TouchEvent) {
    const diff = e.changedTouches[0].clientX - startX;

    if (Math.abs(diff) > threshold) {
      const direction = diff > 0 ? 'right' : 'left';
      node.dispatchEvent(new CustomEvent(`swipe${direction}`));
    }
  }

  node.addEventListener('touchstart', handleTouchStart, { passive: true });
  node.addEventListener('touchend', handleTouchEnd, { passive: true });

  return {
    destroy() {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchend', handleTouchEnd);
    }
  };
}
```

### Usage

```svelte
<div use:swipe on:swipeleft={handleDelete}>
  <ListItem />
</div>
```

**Anti-patterns**:
- Don't use swipe on scrollable lists without careful conflict handling
- Don't make swipe the only way to access actions (add long-press fallback)

---

## Pattern: Long Press

**Use when**: Element needs context menu on long press.

### Svelte Action

```typescript
// $lib/actions/longPress.ts
export function longPress(node: HTMLElement, options?: {
  duration?: number;
  moveTolerance?: number;
}) {
  const duration = options?.duration ?? 500;
  const tolerance = options?.moveTolerance ?? 10;

  let timer: number;
  let startX = 0;
  let startY = 0;

  function handleStart(e: PointerEvent) {
    startX = e.clientX;
    startY = e.clientY;

    timer = setTimeout(() => {
      node.dispatchEvent(new CustomEvent('longpress'));
    }, duration);
  }

  function handleMove(e: PointerEvent) {
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);

    if (dx > tolerance || dy > tolerance) {
      clearTimeout(timer);
    }
  }

  function handleEnd() {
    clearTimeout(timer);
  }

  node.addEventListener('pointerdown', handleStart);
  node.addEventListener('pointermove', handleMove);
  node.addEventListener('pointerup', handleEnd);
  node.addEventListener('pointerleave', handleEnd);

  return {
    destroy() {
      clearTimeout(timer);
      node.removeEventListener('pointerdown', handleStart);
      node.removeEventListener('pointermove', handleMove);
      node.removeEventListener('pointerup', handleEnd);
      node.removeEventListener('pointerleave', handleEnd);
    }
  };
}
```

**Anti-patterns**:
- Don't use long press duration less than 400ms (conflicts with normal taps)
- Don't forget to cancel on movement (user might be scrolling)

---

## Pattern: Haptics

**Use when**: User action needs tactile feedback.

### Implementation

```typescript
// $lib/utils/haptics.ts
export type HapticType = 'light' | 'medium' | 'success' | 'warning' | 'error';

const patterns: Record<HapticType, number[]> = {
  light: [10],
  medium: [20],
  success: [10, 50, 10],
  warning: [30, 30, 30],
  error: [50, 30, 50],
};

export function haptic(type: HapticType = 'light') {
  if (!('vibrate' in navigator)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  navigator.vibrate(patterns[type]);
}
```

### When to Use

| Action | Haptic Type |
|--------|-------------|
| Tab bar tap | `light` |
| Toggle switch | `light` |
| Button press | `light` |
| Pull-to-refresh trigger | `medium` |
| Long press trigger | `medium` |
| Success (message sent) | `success` |
| Destructive action | `warning` |
| Validation error | `error` |

**Anti-patterns**:
- Don't use haptics on every interaction
- Don't rely on haptics alone (always have visual feedback)

---

## Pattern: Safe Areas

**Use when**: Layout needs to respect device notch, home indicator.

### Implementation

```css
.app-shell {
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

.bottom-nav {
  height: calc(56px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
}

.fixed-header {
  top: env(safe-area-inset-top, 0);
}
```

**Anti-patterns**:
- Don't hardcode notch heights
- Don't forget landscape orientation

---

## Pattern: Keyboard Handling

**Use when**: Form inputs need to stay visible when keyboard opens.

### Implementation

```svelte
<script lang="ts">
  let keyboardHeight = $state(0);

  $effect(() => {
    if (!('virtualKeyboard' in navigator)) return;

    const vk = navigator.virtualKeyboard;
    vk.overlaysContent = true;

    function handleGeometryChange() {
      keyboardHeight = vk.boundingRect.height;
    }

    vk.addEventListener('geometrychange', handleGeometryChange);
    return () => vk.removeEventListener('geometrychange', handleGeometryChange);
  });
</script>

<div class="chat-container" style="padding-bottom: {keyboardHeight}px">
  <MessageList />
</div>

<div class="chat-input fixed bottom-0" style="bottom: {keyboardHeight}px">
  <ChatInput />
</div>
```

**Anti-patterns**:
- Don't assume keyboard height is consistent across devices
- Don't animate input position too slowly (feels laggy)

---

## Pattern: Platform Detection

**Use when**: Feature needs platform-specific behavior.

### Implementation

```typescript
// $lib/stores/platform.ts
import { readable } from 'svelte/store';

interface Platform {
  ios: boolean;
  android: boolean;
  standalone: boolean;
  hasNotch: boolean;
}

export const platform = readable<Platform>({
  ios: false,
  android: false,
  standalone: false,
  hasNotch: false,
}, (set) => {
  if (typeof window === 'undefined') return;

  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua);
  const android = /Android/.test(ua);
  const standalone = window.matchMedia('(display-mode: standalone)').matches
    || (navigator as any).standalone === true;
  const hasNotch = ios && window.screen.height >= 812;

  set({ ios, android, standalone, hasNotch });
});
```

**Anti-patterns**:
- Don't use user agent for feature detection (use feature detection)
- Don't assume all iOS devices have notches

---

## Pattern: Infinite Scroll

**Use when**: List loads more items as user scrolls.

### Implementation

```svelte
<script lang="ts">
  let { items, loadMore, hasMore } = $props();
  let loading = $state(false);
  let sentinel: HTMLElement;

  $effect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loading = true;
          await loadMore();
          loading = false;
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  });
</script>

<div class="space-y-2">
  {#each items as item (item.id)}
    <ListItem {item} />
  {/each}

  <div bind:this={sentinel} />

  {#if loading}
    <Skeleton variant="list" count={3} />
  {/if}
</div>
```

**Anti-patterns**:
- Don't load on every scroll event (use IntersectionObserver)
- Don't forget to handle empty and error states

---

## Pattern: Virtual List

**Use when**: List has 100+ items and needs smooth scrolling.

### Implementation

```svelte
<script lang="ts">
  let { items, itemHeight = 72 } = $props();

  let scrollTop = $state(0);
  let containerHeight = $state(0);

  const visibleCount = $derived(Math.ceil(containerHeight / itemHeight) + 2);
  const startIndex = $derived(Math.floor(scrollTop / itemHeight));
  const visibleItems = $derived(items.slice(startIndex, startIndex + visibleCount));
  const offsetY = $derived(startIndex * itemHeight);
  const totalHeight = $derived(items.length * itemHeight);
</script>

<div
  class="overflow-y-auto"
  bind:clientHeight={containerHeight}
  onscroll={(e) => scrollTop = e.currentTarget.scrollTop}
>
  <div style="height: {totalHeight}px; position: relative;">
    <div style="transform: translateY({offsetY}px);">
      {#each visibleItems as item, i (item.id)}
        <div style="height: {itemHeight}px;">
          {@render children?.(item, startIndex + i)}
        </div>
      {/each}
    </div>
  </div>
</div>
```

**Anti-patterns**:
- Don't use virtual list for < 100 items (overhead not worth it)
- Don't forget to handle variable height items (more complex)

---

## Pattern: Optimistic Updates

**Use when**: Action should feel instant even before server confirms.

### Implementation

```svelte
<script lang="ts">
  import { haptic } from '$lib/utils/haptics';

  async function sendMessage(content: string) {
    // 1. Create optimistic message
    const optimisticId = crypto.randomUUID();
    const optimistic = {
      id: optimisticId,
      content,
      status: 'pending',
      sent_at: new Date().toISOString()
    };

    // 2. Add to UI immediately
    messages = [...messages, optimistic];
    haptic('light');

    // 3. Send to server
    try {
      const result = await live?.pushEventAsync('send_message', { content });

      // 4. Replace optimistic with real
      messages = messages.map(m =>
        m.id === optimisticId ? { ...result, status: 'sent' } : m
      );
      haptic('success');
    } catch (error) {
      // 5. Mark as failed
      messages = messages.map(m =>
        m.id === optimisticId ? { ...m, status: 'failed' } : m
      );
      haptic('error');
    }
  }
</script>
```

**Anti-patterns**:
- Don't use optimistic updates for destructive actions without confirmation
- Don't forget to handle failure states

---

## Pattern: Offline Queue

**Use when**: Actions should queue when offline and sync when online.

### Implementation

```typescript
// $lib/stores/offline.ts
import { writable, get } from 'svelte/store';

interface QueuedAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
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
        timestamp: Date.now()
      };
      queue.update(q => [...q, action]);
      return action.id;
    },

    remove(id: string) {
      queue.update(q => q.filter(a => a.id !== id));
    },

    async flush(handler: (action: QueuedAction) => Promise<void>) {
      const actions = get(queue);
      for (const action of actions) {
        try {
          await handler(action);
          this.remove(action.id);
        } catch (e) {
          // Keep in queue for retry
        }
      }
    }
  };
}

export const offlineQueue = createOfflineQueue();
```

**Anti-patterns**:
- Don't queue actions indefinitely (add expiry)
- Don't forget to show queued state in UI

---

## Loading States Reference

| Duration | Show |
|----------|------|
| 0-100ms | Nothing |
| 100-300ms | Button spinner |
| 300ms+ | Skeleton |

**Rule**: Never show spinner for content. Use skeletons.

---

## Verification Checklist

**Touch**:
- [ ] Touch targets >= 44x44px
- [ ] Haptic feedback on key actions
- [ ] Gestures don't conflict with scroll

**Layout**:
- [ ] Safe areas respected
- [ ] Keyboard doesn't cover inputs
- [ ] No horizontal scroll on mobile

**Performance**:
- [ ] Bundle < 100KB gzipped
- [ ] Skeleton loading (not spinners)
- [ ] Virtual list for long lists

**Offline**:
- [ ] Optimistic updates work
- [ ] Actions queue when offline
- [ ] Clear sync indicator

---

## Related Docs

- [animations.md](./animations.md) - Motion patterns
- [frontend-svelte.md](./frontend-svelte.md) - Component patterns

