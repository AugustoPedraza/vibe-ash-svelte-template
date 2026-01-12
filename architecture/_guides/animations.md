# Animation Guide (Motion System)

> Consistent animation tokens. Pull these patterns when adding transitions to components.

## Quick Index

| I need animation for... | Pattern | Complexity |
|-------------------------|---------|------------|
| Modal/Dialog | [#modal-motion](#pattern-modal-motion) | Low |
| Bottom Sheet | [#sheet-motion](#pattern-sheet-motion) | Medium |
| Dropdown/Menu | [#dropdown-motion](#pattern-dropdown-motion) | Low |
| Toast notification | [#toast-motion](#pattern-toast-motion) | Low |
| Page navigation | [#page-motion](#pattern-page-motion) | Medium |
| Subtle feedback | [#subtle-motion](#pattern-subtle-motion) | Low |
| Spring physics | [#spring-motion](#pattern-spring-motion) | Medium |
| Reduced motion | [#reduced-motion](#pattern-reduced-motion) | Low |

---

## Core Rules

### Rule 1: Exit less-than Enter
Exit animations should be 67-85% of enter duration. Users want to dismiss quickly.

```
Enter: 300ms -> Exit: 200-250ms
Enter: 200ms -> Exit: 135-170ms
```

### Rule 2: Ease Out for Enter, Ease In for Exit
- **Enter**: `cubic-bezier(0, 0, 0.2, 1)` - settles gently into place
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)` - accelerates away

### Rule 3: Respect Reduced Motion
Always check user preference. Motion presets handle this automatically.

---

## Token Reference

### Duration Tokens

| Token | Value | Use For |
|-------|-------|---------|
| `instant` | 0ms | Immediate state changes |
| `fast` | 100ms | Micro-interactions |
| `normal` | 200ms | Standard transitions |
| `slow` | 300ms | Modals, sheets |
| `slower` | 400ms | Complex orchestrations |

### Component Durations

| Component | Enter | Exit | Ratio |
|-----------|-------|------|-------|
| Modal | 300ms | 250ms | 83% |
| Sheet | 300ms | 200ms | 67% |
| Dropdown | 200ms | 150ms | 75% |
| Toast | 200ms | 150ms | 75% |
| Page | 300ms | 250ms | 83% |
| Subtle | 150ms | 100ms | 67% |

### Easing Tokens

```typescript
const EASING = {
  enter: 'cubic-bezier(0, 0, 0.2, 1)',    // ease-out
  exit: 'cubic-bezier(0.4, 0, 1, 1)',      // ease-in
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
```

---

## Pattern: Modal Motion

**Use when**: Adding animation to modal or dialog component.

### Minimal Implementation

```svelte
<script>
  import { fly, fade } from 'svelte/transition';

  let { open = $bindable(false) } = $props();
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/50 z-overlay"
    transition:fade={{ duration: 200 }}
    onclick={() => open = false}
  />

  <!-- Modal -->
  <div
    class="fixed inset-x-4 top-1/2 -translate-y-1/2 z-modal"
    in:fly={{ y: 100, duration: 300 }}
    out:fly={{ y: 100, duration: 250 }}
  >
    {@render children?.()}
  </div>
{/if}
```

**Anti-patterns**:
- Don't use same duration for enter and exit
- Don't use arbitrary values like `duration: 275`

---

## Pattern: Sheet Motion

**Use when**: Adding animation to bottom sheet component.

### Minimal Implementation

```svelte
<script>
  import { fly } from 'svelte/transition';

  let { open = $bindable(false) } = $props();
</script>

{#if open}
  <div
    class="fixed bottom-0 inset-x-0 z-modal"
    in:fly={{ y: '100%', duration: 300 }}
    out:fly={{ y: '100%', duration: 200 }}
  >
    {@render children?.()}
  </div>
{/if}
```

### With Spring Physics

```svelte
<script lang="ts">
  import { spring } from 'svelte/motion';

  let { open = $bindable(false), snapPoints = [0.5, 0.9] } = $props();

  const position = spring(0, {
    stiffness: 0.15,
    damping: 0.8
  });
</script>

<div
  class="fixed bottom-0 inset-x-0 z-modal"
  style="transform: translateY({(1 - $position) * 100}%)"
>
  {@render children?.()}
</div>
```

**Anti-patterns**:
- Don't use linear easing for sheets (feels robotic)
- Don't forget velocity-based snap decisions

---

## Pattern: Dropdown Motion

**Use when**: Adding animation to dropdown menu or popover.

### Minimal Implementation

```svelte
<script>
  import { fly } from 'svelte/transition';

  let { open = $bindable(false) } = $props();
</script>

{#if open}
  <div
    class="absolute top-full mt-1"
    in:fly={{ y: -10, duration: 200 }}
    out:fly={{ y: -10, duration: 150 }}
  >
    {@render children?.()}
  </div>
{/if}
```

**Anti-patterns**:
- Don't use slow animations for dropdowns (feels sluggish)
- Don't animate from wrong origin (should feel connected to trigger)

---

## Pattern: Toast Motion

**Use when**: Adding animation to toast notifications.

### Minimal Implementation

```svelte
<script>
  import { fly } from 'svelte/transition';

  let { toasts } = $props();
</script>

<div class="fixed top-4 right-4 space-y-2">
  {#each toasts as toast (toast.id)}
    <div
      in:fly={{ x: 100, duration: 200 }}
      out:fly={{ x: 100, duration: 150 }}
    >
      {toast.message}
    </div>
  {/each}
</div>
```

**Anti-patterns**:
- Don't use bottom positioning for error toasts (may be hidden by keyboard)
- Don't use long durations (toasts should be snappy)

---

## Pattern: Page Motion

**Use when**: Adding transitions between page navigations.

### Minimal Implementation

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

**Anti-patterns**:
- Don't use View Transitions API (conflicts with LiveView)
- Don't forget to handle reduced motion preference

---

## Pattern: Subtle Motion

**Use when**: Adding micro-interactions for hover, press, focus states.

### Minimal Implementation

```svelte
<button class="active:scale-95 transition-transform duration-150">
  Click me
</button>
```

### With Spring Physics

```svelte
<script>
  import { spring } from 'svelte/motion';

  const buttonScale = spring(1, {
    stiffness: 0.3,
    damping: 0.8
  });
</script>

<button
  style="transform: scale({$buttonScale})"
  onpointerdown={() => buttonScale.set(0.95)}
  onpointerup={() => buttonScale.set(1)}
  onpointerleave={() => buttonScale.set(1)}
>
  Click me
</button>
```

**Anti-patterns**:
- Don't use spring for every micro-interaction (reserve for important ones)
- Don't make scale changes too dramatic (0.95-1.05 range is good)

---

## Pattern: Spring Motion

**Use when**: Animation needs physics-based, natural movement.

### Spring Presets

```typescript
const SPRING_PRESETS = {
  // Snappy - quick response, minimal oscillation
  snappy: { stiffness: 0.3, damping: 0.8 },

  // Default - balanced feel
  default: { stiffness: 0.15, damping: 0.8 },

  // Gentle - slow, smooth movement
  gentle: { stiffness: 0.1, damping: 0.9 },

  // Bouncy - playful, more oscillation
  bouncy: { stiffness: 0.2, damping: 0.6 },
};
```

**Anti-patterns**:
- Don't use spring for simple opacity changes (unnecessary complexity)
- Don't forget to clamp values to prevent overshooting

---

## Pattern: Reduced Motion

**Use when**: Any animation needs to respect user preferences.

### Minimal Implementation

```svelte
<script>
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
</script>

{#if open}
  <div
    transition:fly={{
      y: 100,
      duration: prefersReducedMotion ? 0 : 300
    }}
  >
    {@render children?.()}
  </div>
{/if}
```

### Store-based

```typescript
// $lib/stores/a11y.ts
import { readable } from 'svelte/store';

export const prefersReducedMotion = readable(false, (set) => {
  if (typeof window === 'undefined') return;

  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  set(query.matches);

  const handler = (e: MediaQueryListEvent) => set(e.matches);
  query.addEventListener('change', handler);

  return () => query.removeEventListener('change', handler);
});
```

**Anti-patterns**:
- Don't just reduce duration (often better to remove animation entirely)
- Don't assume reduced motion means no motion (opacity fades are usually fine)

---

## CSS Custom Properties

```css
:root {
  /* Durations */
  --motion-fast: 100ms;
  --motion-normal: 200ms;
  --motion-slow: 300ms;

  /* Component-specific */
  --motion-modal-enter: 300ms;
  --motion-modal-exit: 250ms;
  --motion-sheet-enter: 300ms;
  --motion-sheet-exit: 200ms;

  /* Easings */
  --motion-ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --motion-ease-exit: cubic-bezier(0.4, 0, 1, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-fast: 0ms;
    --motion-normal: 0ms;
    --motion-slow: 0ms;
    --motion-modal-enter: 0ms;
    --motion-modal-exit: 0ms;
  }
}
```

---

## Related Docs

- [mobile-ux.md](./mobile-ux.md) - Mobile gesture patterns
- [frontend-svelte.md](./frontend-svelte.md) - Component patterns

