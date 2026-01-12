# CLAUDE.md - AI Assistant Context

> This file provides context for AI assistants working on this codebase.

## Project Overview

This is a Phoenix application using:
- **Backend**: Elixir 1.17+, Phoenix 1.8, Ash Framework 3.x
- **Frontend**: Svelte 5 via LiveSvelte, Tailwind CSS 4
- **Database**: PostgreSQL 16+

## Architecture Documentation

The `architecture/` directory contains authoritative technical documentation.

### Reading Order for AI

1. **Always read first**: `architecture/_fundamentals/quick-reference.md`
2. **Check anti-patterns**: `architecture/_anti-patterns/` (parallel with implementation)
3. **Implementation guide**: `architecture/_guides/` (based on task type)
4. **Before commit**: `architecture/_checklists/feature-review.md`

### Document Types

| Prefix | Purpose | When to Read |
|--------|---------|--------------|
| `_fundamentals/` | Core decisions | Every task |
| `_guides/` | Implementation | When building features |
| `_patterns/` | Specific solutions | On-demand |
| `_anti-patterns/` | What NOT to do | Parallel with guides |
| `_checklists/` | Verification | Before commit |

---

## Critical Commands

```bash
# ALWAYS run after making changes
mix compile --warnings-as-errors
cd assets && npm run check

# Run tests
mix test
```

---

## Component Library

UI components are in `assets/svelte/components/ui/`:

| Type | Location | Components |
|------|----------|------------|
| Primitives | `primitives/` | Button, Input, Badge, Avatar, Skeleton, etc. |
| Compounds | `compounds/` | Card, FormField, AppHeader, BottomTabBar |
| Patterns | `patterns/` | Modal, BottomSheet, Dropdown, EmptyState |

### Usage

```svelte
<script>
  import { Button, Input, Card } from '$lib/components/ui';
</script>
```

---

## Stores

Reactive stores in `assets/svelte/lib/stores/`:

| Store | Purpose |
|-------|---------|
| `realtime` | Sync with PubSub |
| `offline` | Queue actions offline |
| `connection` | Track socket state |
| `visibility` | Track page focus |
| `pwa` | Install prompt state |

---

## The Golden Rule

> **Backend owns truth, frontend owns experience.**

| LiveView | Svelte |
|----------|--------|
| Routing, auth, data | Forms, animations, gestures |
| PubSub, business logic | Optimistic updates, offline |

---

## Anti-Patterns (CRITICAL)

### Never Do This

| ❌ Don't | ✅ Do Instead |
|----------|---------------|
| Load data in `mount/3` | Use `assign_async` |
| Use `phx-change` on forms | Svelte-only forms |
| Show spinners | Show skeletons |
| Forget error states | Handle all states |

See `architecture/_anti-patterns/` for complete list.

---

## Svelte 5 Patterns

This project uses Svelte 5 runes:

```svelte
<script lang="ts">
  // Props
  let { name, onSave } = $props<{ name: string; onSave: () => void }>();

  // State
  let count = $state(0);

  // Derived
  const doubled = $derived(count * 2);

  // Effect (use sparingly)
  $effect(() => {
    document.title = `Count: ${count}`;
  });
</script>
```

### Snippets (Not Slots)

```svelte
<!-- Using snippets -->
<Card>
  {#snippet header()}
    <h2>Title</h2>
  {/snippet}
  Content here
</Card>
```

---

## Before Submitting Code

- [ ] Read relevant `_guides/` doc for your task
- [ ] Check `_anti-patterns/` for your domain
- [ ] Run `mix compile --warnings-as-errors`
- [ ] Run `cd assets && npm run check`
- [ ] Review `_checklists/feature-review.md`
