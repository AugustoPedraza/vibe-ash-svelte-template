# Architecture Documentation

> AI-friendly architecture docs for Phoenix/Ash + Svelte 5 applications.

## Reading Guide

### First Time? Read These in Order

| # | Doc | Time | Purpose |
|---|-----|------|---------|
| 1 | [_fundamentals/quick-reference.md](./_fundamentals/quick-reference.md) | 5 min | Core decisions, anti-patterns |
| 2 | [_fundamentals/responsibility.md](./_fundamentals/responsibility.md) | 3 min | Who owns what |
| 3 | [_fundamentals/naming.md](./_fundamentals/naming.md) | 2 min | Naming conventions |

### Implementing a Feature?

| Backend | Frontend | Mobile |
|---------|----------|--------|
| [backend-ash.md](./_guides/backend-ash.md) | [frontend-svelte.md](./_guides/frontend-svelte.md) | [mobile-ux.md](./_guides/mobile-ux.md) |

### Need a Specific Pattern?

| Pattern | Doc |
|---------|-----|
| Authentication | [_patterns/auth.md](./_patterns/auth.md) |
| Error handling | [_patterns/errors.md](./_patterns/errors.md) |
| Forms | [_patterns/forms.md](./_patterns/forms.md) |
| Lists & tables | [_patterns/lists.md](./_patterns/lists.md) |
| Navigation | [_patterns/navigation.md](./_patterns/navigation.md) |
| Notifications | [_patterns/notifications.md](./_patterns/notifications.md) |
| Offline support | [_patterns/offline.md](./_patterns/offline.md) |
| Testing | [_patterns/testing.md](./_patterns/testing.md) |

### Before Committing?

| Checklist | When |
|-----------|------|
| [_checklists/feature-review.md](./_checklists/feature-review.md) | Every feature |
| [_checklists/deployment.md](./_checklists/deployment.md) | Before deploy |

### Don't Do This

| Domain | Anti-patterns |
|--------|---------------|
| Elixir/Phoenix | [_anti-patterns/elixir.md](./_anti-patterns/elixir.md) |
| Svelte | [_anti-patterns/svelte.md](./_anti-patterns/svelte.md) |
| PWA/Mobile | [_anti-patterns/pwa.md](./_anti-patterns/pwa.md) |
| Animations | [_anti-patterns/animations.md](./_anti-patterns/animations.md) |

---

## Document Types

| Prefix | Type | How to Read |
|--------|------|-------------|
| `_fundamentals/` | Core decisions | Read first, in order |
| `_guides/` | Implementation | Read when building that feature |
| `_patterns/` | Specific solutions | Read on-demand |
| `_anti-patterns/` | What NOT to do | Read alongside guides |
| `_checklists/` | Verification | Read before commit/deploy |

---

## The Golden Rule

> **Backend owns truth, frontend owns experience.**

- **LiveView**: Routing, auth, data fetching, PubSub, server events
- **Svelte**: Forms, animations, gestures, optimistic updates, offline

---

## Keyword Search

See [_index.md](./_index.md) for searchable keyword index.
