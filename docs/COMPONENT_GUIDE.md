# Component Creation Guide

> Guidelines for creating consistent Svelte components.

## Component Hierarchy

```
assets/svelte/components/
├── ui/                    # Design System (reusable, stateless)
│   ├── primitives/        # Atoms: Button, Input, Badge
│   ├── compounds/         # Molecules: Card, FormField
│   └── patterns/          # Organisms: Modal, Sheet
│
└── features/              # Business Features (stateful)
    └── {domain}/          # Domain-specific components
```

---

## Component Types

### Primitives (Atoms)

Single-purpose, no dependencies on other components.

```svelte
<!-- Button.svelte -->
<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type Size = 'sm' | 'md' | 'lg';

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    children
  }: {
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    children?: import('svelte').Snippet;
  } = $props();
</script>

<button class="btn btn-{variant} btn-{size}" {disabled}>
  {#if loading}
    <span class="spinner" />
  {/if}
  {@render children?.()}
</button>
```

### Compounds (Molecules)

Combine primitives into reusable patterns.

```svelte
<!-- FormField.svelte -->
<script lang="ts">
  let {
    label,
    error,
    required = false,
    children
  }: {
    label: string;
    error?: string;
    required?: boolean;
    children?: import('svelte').Snippet;
  } = $props();
</script>

<div class="form-field">
  <label class="label">
    {label}
    {#if required}<span class="text-error">*</span>{/if}
  </label>

  {@render children?.()}

  {#if error}
    <span class="error-text">{error}</span>
  {/if}
</div>
```

### Patterns (Organisms)

Complex, self-contained UI patterns.

```svelte
<!-- Modal.svelte -->
<script lang="ts">
  import { fly, fade } from 'svelte/transition';

  let {
    open = $bindable(false),
    title,
    children,
    footer
  }: {
    open?: boolean;
    title: string;
    children?: import('svelte').Snippet;
    footer?: import('svelte').Snippet;
  } = $props();
</script>

{#if open}
  <div class="modal-backdrop" transition:fade onclick={() => open = false} />
  <div class="modal" in:fly={{ y: 100 }} out:fly={{ y: 100 }}>
    <header>{title}</header>
    <main>{@render children?.()}</main>
    {#if footer}
      <footer>{@render footer?.()}</footer>
    {/if}
  </div>
{/if}
```

### Feature Components

Stateful, domain-specific, connected to LiveView.

```svelte
<!-- LoginForm.svelte -->
<script lang="ts">
  import { FormField, Input, Button } from '$lib/components/ui';

  let { live } = $props();

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function handleSubmit() {
    loading = true;
    error = null;

    try {
      await live?.pushEventAsync('login', { email, password });
    } catch (e) {
      error = 'Something went wrong';
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit|preventDefault={handleSubmit}>
  <FormField label="Email" required>
    <Input type="email" bind:value={email} />
  </FormField>

  <FormField label="Password" required>
    <Input type="password" bind:value={password} />
  </FormField>

  {#if error}
    <Alert variant="error">{error}</Alert>
  {/if}

  <Button type="submit" variant="primary" {loading}>
    Sign In
  </Button>
</form>
```

---

## Props Pattern

Always use TypeScript interfaces with `$props()`.

```svelte
<script lang="ts">
  // Define types
  type Variant = 'default' | 'primary' | 'danger';

  // Define props with defaults
  let {
    variant = 'default',
    disabled = false,
    onclick,
    children
  }: {
    variant?: Variant;
    disabled?: boolean;
    onclick?: () => void;
    children?: import('svelte').Snippet;
  } = $props();
</script>
```

---

## Snippets (Not Slots)

Use Svelte 5 snippets for composition.

```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { header, children, footer }: {
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  } = $props();
</script>

<div class="card">
  {#if header}
    <div class="card-header">{@render header()}</div>
  {/if}

  <div class="card-body">{@render children?.()}</div>

  {#if footer}
    <div class="card-footer">{@render footer()}</div>
  {/if}
</div>
```

Usage:

```svelte
<Card>
  {#snippet header()}
    <h2>Title</h2>
  {/snippet}

  <p>Content here</p>

  {#snippet footer()}
    <Button>Save</Button>
  {/snippet}
</Card>
```

---

## State Guidelines

| State Type | Where | How |
|------------|-------|-----|
| UI state | Component | `$state()` |
| Shared UI | Svelte store | `writable()` |
| Server data | LiveView | Props from `live` |
| Computed | Component | `$derived()` |

---

## Checklist

Before creating a component:

- [ ] Does an existing component do this?
- [ ] Is this UI or feature component?
- [ ] What props does it need?
- [ ] Does it need loading/error/empty states?
- [ ] Does it need accessibility attributes?
- [ ] Is touch target >= 44x44px?

