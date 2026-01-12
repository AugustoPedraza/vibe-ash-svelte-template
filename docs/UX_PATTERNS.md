# UX Patterns

> Decision framework for consistent user experience.

## Core Principles

1. **Backend owns truth, frontend owns experience**
2. **Show structure, not spinners** (use skeletons)
3. **Optimistic by default** (update UI immediately)
4. **Offline-capable** (queue actions when disconnected)
5. **Touch-first** (44x44px minimum targets)

---

## Loading States

| Duration | Show |
|----------|------|
| 0-100ms | Nothing |
| 100-300ms | Button spinner only |
| 300ms+ | Skeleton loader |

### Implementation

```svelte
{#if loading}
  <Skeleton variant="card" />
{:else if error}
  <EmptyState preset="error" title="Failed to load">
    <Button onclick={retry}>Try again</Button>
  </EmptyState>
{:else if data.length === 0}
  <EmptyState preset="default" title="No items yet" />
{:else}
  {#each data as item}
    <ItemCard {item} />
  {/each}
{/if}
```

---

## Button Placement

| Position | Button Type |
|----------|-------------|
| Left | Secondary, Cancel |
| Right | Primary, Destructive |

```svelte
<div class="flex justify-end gap-3">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Save</Button>
</div>
```

---

## Confirmation Patterns

### Destructive Actions

Always require confirmation for irreversible actions.

```svelte
<Button variant="danger" onclick={() => showConfirm = true}>
  Delete
</Button>

<Modal bind:open={showConfirm} title="Delete item?">
  <p>This cannot be undone.</p>

  {#snippet footer()}
    <Button variant="secondary" onclick={() => showConfirm = false}>
      Cancel
    </Button>
    <Button variant="danger" onclick={handleDelete}>
      Delete
    </Button>
  {/snippet}
</Modal>
```

---

## Form Patterns

### Layout

- Single column (not multi-column)
- Labels above inputs (not floating)
- Required fields marked with *
- Error messages inline below field

### Validation

- Validate on blur
- Show errors inline
- Don't prevent typing
- Clear error when user fixes it

```svelte
<FormField label="Email" error={errors.email} required>
  <Input
    type="email"
    bind:value={email}
    onblur={() => validateEmail()}
    invalid={!!errors.email}
  />
</FormField>
```

---

## Error Messages

### Rules

- **Positive**: Tell users what TO DO
- **Specific**: Say exactly what's needed
- **Brief**: Max 5-7 words
- **Human**: What a helpful person would say

| Don't | Do |
|-------|------|
| "Invalid email format" | "Check your email" |
| "Password must be 6+ characters" | "Use 6 or more characters" |
| "Field is required" | "Required" |
| "Operation failed" | "Something went wrong" |

---

## Empty States

### Presets

```svelte
<!-- Default - No data yet -->
<EmptyState
  preset="default"
  title="No projects yet"
  description="Create your first project to get started"
>
  <Button variant="primary">Create Project</Button>
</EmptyState>

<!-- Search - No results -->
<EmptyState
  preset="search"
  title="No matches found"
  description="Try different keywords"
/>

<!-- Error - Something went wrong -->
<EmptyState
  preset="error"
  title="Couldn't load data"
  description="Please try again"
>
  <Button onclick={retry}>Retry</Button>
</EmptyState>

<!-- Offline -->
<EmptyState
  preset="offline"
  title="You're offline"
  description="Check your connection"
/>
```

---

## Feedback

### Success

- Brief toast (auto-dismiss in 3-5s)
- Haptic feedback (light)
- Visual confirmation (checkmark)

### Error

- Persistent until dismissed or fixed
- Clear explanation
- Action to resolve
- Haptic feedback (error)

### Progress

- Show skeleton during load
- Optimistic UI for actions
- Progress bar for long operations

---

## Accessibility

### Required

- [ ] Focus visible on all interactive elements
- [ ] `aria-label` on icon-only buttons
- [ ] Color not used alone for meaning
- [ ] Touch targets >= 44x44px
- [ ] Form inputs have labels
- [ ] Respects `prefers-reduced-motion`

### Keyboard

- Tab through all interactive elements
- Enter/Space activates buttons
- Escape closes modals
- Arrow keys for lists/tabs

---

## Mobile Specific

### Safe Areas

```css
.app-shell {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Touch Targets

- Minimum 44x44px
- 8px spacing between targets
- List items 48px height minimum

### Gestures

- Swipe to reveal actions
- Pull to refresh
- Long press for context menu

---

## Checklist

Before shipping UI:

- [ ] Loading state (skeleton)
- [ ] Error state (with retry)
- [ ] Empty state (helpful message)
- [ ] Success feedback (toast)
- [ ] Keyboard accessible
- [ ] Touch targets >= 44px
- [ ] Works offline (or gracefully degrades)

