# Adaptive Layouts Pattern

> Layout transformations for responsive PWAs.

## Quick Index

| If you need... | Section |
|----------------|---------|
| Navigation transformation | [#navigation-transformation](#navigation-transformation) |
| Modal transformation | [#modal-transformation](#modal-transformation) |
| BottomSheet transformation | [#bottomsheet-transformation](#bottomsheet-transformation) |
| List transformation | [#list-transformation](#list-transformation) |
| Form transformation | [#form-transformation](#form-transformation) |
| Decision matrix | [#layout-decision-matrix](#layout-decision-matrix) |

---

## Layout Decision Matrix

| Screen Type | Compact (<600px) | Medium (600-839px) | Expanded (840px+) |
|-------------|------------------|--------------------|--------------------|
| **Dashboard** | Stacked cards | 2-column grid | 3-4 column grid |
| **List view** | Full-width list | Full-width list | List-detail split |
| **Detail view** | Full-width | Full-width | In split-pane OR centered |
| **Form** | Full-width | Centered (640px) | Centered (640px) |
| **Settings** | Full-width list | Full-width list | List-detail split |
| **Modal** | Bottom sheet | Bottom sheet | Centered dialog |
| **Menus** | BottomSheet | BottomSheet | Dropdown |

---

## Navigation Transformation

### Visibility Rules

| Viewport | BottomTabBar | Navigation Rail | Sidebar | Desktop Header |
|----------|--------------|-----------------|---------|----------------|
| Compact | **Visible** | Hidden | Hidden | Hidden |
| Medium | Hidden | **Visible** (optional) | **Visible** | **Visible** |
| Expanded+ | Hidden | Hidden | **Visible** | **Visible** |

### Implementation Pattern

```svelte
<!-- AppShell.svelte - Responsive navigation wrapper -->
<script lang="ts">
  import { page } from '$app/stores';

  interface Props {
    children: Snippet;
  }

  let { children } = $props();
</script>

<div class="min-h-screen flex">
  <!-- Sidebar: hidden on mobile, visible on md+ -->
  <aside class="hidden md:flex flex-col w-[280px] border-r bg-background">
    <Sidebar />
  </aside>

  <div class="flex-1 flex flex-col">
    <!-- Desktop header: hidden on mobile -->
    <header class="hidden md:flex h-14 border-b bg-background">
      <DesktopHeader />
    </header>

    <!-- Mobile header: visible only on mobile -->
    <header class="md:hidden">
      <AppHeader />
    </header>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      {@render children()}
    </main>

    <!-- Bottom tabs: visible only on mobile -->
    <nav class="md:hidden">
      <BottomTabBar />
    </nav>
  </div>
</div>
```

### Navigation Item Mapping

Ensure consistent navigation across breakpoints:

| Mobile Tab | Desktop Sidebar Item |
|------------|---------------------|
| Home (icon) | Dashboard (icon + label) |
| Projects (icon) | Projects (icon + label + badge) |
| Inbox (icon + badge) | Inbox (icon + label + badge) |
| Profile (icon) | User section (avatar + dropdown) |

---

## Modal Transformation

### Behavior by Viewport

| Viewport | Position | Animation | Width | Corners |
|----------|----------|-----------|-------|---------|
| Compact | Bottom | Slide up | 100% | Top only |
| Medium | Bottom OR Center | Slide up OR Scale | 100% OR max-w | Top OR Full |
| Expanded+ | Center | Scale in | max-w-sm/md/lg | Full |

### Implementation

```svelte
<!-- Modal.svelte - Responsive modal -->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { cva } from 'class-variance-authority';

  const modalVariants = cva(
    'bg-surface shadow-lg overflow-hidden',
    {
      variants: {
        size: {
          sm: 'md:max-w-sm',
          md: 'md:max-w-md',
          lg: 'md:max-w-lg',
        }
      },
      defaultVariants: {
        size: 'md'
      }
    }
  );

  let { open, size = 'md', children } = $props();
</script>

{#if open}
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/50 z-40" onclick={close} />

  <!-- Modal container -->
  <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
    <div class={cn(
      modalVariants({ size }),
      // Mobile: bottom sheet style
      'w-full rounded-t-xl md:rounded-xl',
      // Mobile animation
      'animate-slide-up md:animate-scale-in',
      // Max height
      'max-h-[90vh] md:max-h-[85vh]'
    )}>
      {@render children()}
    </div>
  </div>
{/if}
```

### Modal Position Guidelines

| Content Type | Mobile Position | Desktop Position |
|--------------|-----------------|------------------|
| Confirmation | Bottom | Center |
| Form input | Bottom (keyboard) | Center |
| Selection list | Bottom | Center |
| Full content | Fullscreen | Center (lg) |

---

## BottomSheet Transformation

### Options for Desktop

| Option | When to Use | Example |
|--------|-------------|---------|
| **Keep as sheet** | Complex multi-step content | Multi-select with preview |
| **Centered dialog** | Simple selections, confirmations | Date picker, confirm delete |
| **Side drawer** | Filters, extended menus | Filter panel, settings menu |
| **Dropdown** | Simple action menus | More options menu |

### Decision Tree

```
Is it a simple menu (< 6 items)?
├── Yes → Use Dropdown on desktop
└── No → Is it filters or settings?
    ├── Yes → Use Side Drawer on desktop
    └── No → Is it a simple selection?
        ├── Yes → Use Centered Dialog
        └── No → Keep as BottomSheet (elevated)
```

### Implementation Pattern

```svelte
<!-- ResponsiveSheet.svelte -->
<script lang="ts">
  import { BottomSheet } from '$lib/components/ui/patterns';
  import { Dialog } from '$lib/components/ui/patterns';

  interface Props {
    open: boolean;
    desktopMode?: 'sheet' | 'dialog' | 'drawer';
    children: Snippet;
  }

  let { open, desktopMode = 'dialog', children } = $props();

  // Detect viewport (could use a store)
  let isDesktop = $state(false);

  $effect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(min-width: 768px)');
      isDesktop = mq.matches;
      mq.addEventListener('change', (e) => isDesktop = e.matches);
    }
  });
</script>

{#if isDesktop && desktopMode === 'dialog'}
  <Dialog bind:open>
    {@render children()}
  </Dialog>
{:else}
  <BottomSheet bind:open>
    {@render children()}
  </BottomSheet>
{/if}
```

---

## List Transformation

### Transformation Options

| Content Type | Mobile | Desktop |
|--------------|--------|---------|
| **Navigable list** (inbox, projects) | Single column | Split-pane |
| **Browsable grid** (gallery, products) | 2-column grid | 3-4 column grid |
| **Data table** | Card list | Table with columns |
| **Settings** | Grouped list | Split-pane |

### Split-Pane Pattern

```svelte
<!-- SplitPane.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    listWidth?: string;
    children: Snippet;       // List content
    detail?: Snippet;        // Detail content
  }

  let { listWidth = '380px', children, detail } = $props();
</script>

<div class="h-full flex">
  <!-- List panel -->
  <div class={cn(
    'w-full lg:w-[var(--list-width)] lg:border-r overflow-auto',
    detail && 'lg:flex-shrink-0'
  )} style:--list-width={listWidth}>
    {@render children()}
  </div>

  <!-- Detail panel (desktop only) -->
  {#if detail}
    <div class="hidden lg:flex flex-1 overflow-auto">
      {@render detail()}
    </div>
  {/if}
</div>
```

### Responsive Grid Pattern

```svelte
<!-- ResponsiveGrid.svelte -->
<script lang="ts">
  interface Props {
    columns?: { sm?: number; md?: number; lg?: number; xl?: number };
    gap?: string;
    children: Snippet;
  }

  let {
    columns = { sm: 1, md: 2, lg: 3, xl: 4 },
    gap = 'gap-4',
    children
  } = $props();
</script>

<div class={cn(
  'grid',
  gap,
  `grid-cols-${columns.sm}`,
  columns.md && `md:grid-cols-${columns.md}`,
  columns.lg && `lg:grid-cols-${columns.lg}`,
  columns.xl && `xl:grid-cols-${columns.xl}`
)}>
  {@render children()}
</div>
```

### Table to Cards Pattern

**Desktop**: Full table with columns
```
+----------+----------+----------+----------+
| Name     | Status   | Date     | Actions  |
+----------+----------+----------+----------+
| Item A   | Active   | Jan 10   | Edit     |
| Item B   | Draft    | Jan 8    | Edit     |
+----------+----------+----------+----------+
```

**Mobile**: Card list
```
+--------------------------------+
| Item A                    [•••]|
| Status: Active | Jan 10        |
+--------------------------------+
| Item B                    [•••]|
| Status: Draft | Jan 8          |
+--------------------------------+
```

```svelte
<!-- ResponsiveTable.svelte -->
<script lang="ts">
  let { data, columns } = $props();
</script>

<!-- Desktop: Table -->
<div class="hidden md:block overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr>
        {#each columns as col}
          <th>{col.header}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as row}
        <tr>
          {#each columns as col}
            <td>{row[col.key]}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<!-- Mobile: Card list -->
<div class="md:hidden space-y-2">
  {#each data as row}
    <Card padding="sm">
      <div class="font-medium">{row.name}</div>
      <div class="text-sm text-muted-foreground">
        {row.status} | {row.date}
      </div>
    </Card>
  {/each}
</div>
```

---

## Form Transformation

### Form Width Guidelines

| Form Type | Mobile | Desktop |
|-----------|--------|---------|
| Login/Register | Full-width | Centered, max 400px |
| Settings | Full-width | Centered, max 640px |
| Create/Edit | Full-width | Centered, max 640px |
| Multi-step | Full-width | Centered, max 640px |
| Complex/Multi-column | Single column | Still single column |

### Implementation

```svelte
<!-- FormContainer.svelte -->
<script lang="ts">
  interface Props {
    width?: 'sm' | 'md' | 'lg';
    children: Snippet;
  }

  let { width = 'md', children } = $props();

  const widths = {
    sm: 'max-w-sm',   // 384px - login forms
    md: 'max-w-xl',   // 640px - standard forms
    lg: 'max-w-2xl'   // 768px - complex forms
  };
</script>

<div class="w-full px-4 md:px-0">
  <div class={cn(
    'mx-auto',
    widths[width]
  )}>
    {@render children()}
  </div>
</div>
```

### Form Layout Examples

**Login Form (sm)**
```
+-----------------------------------+
|           [Logo]                  |
|                                   |
|      Welcome back                 |
|                                   |
|   [Email...................]      |
|   [Password................]      |
|                                   |
|        [Sign In]                  |
|                                   |
|   Forgot password? | Sign up      |
+-----------------------------------+
         max-w-sm (384px)
```

**Settings Form (md)**
```
+-----------------------------------------------+
|  Profile Settings                             |
|  ─────────────────────────────────────────    |
|                                               |
|  Display Name                                 |
|  [John Doe...........................]        |
|                                               |
|  Email                                        |
|  [john@example.com..................]         |
|                                               |
|  Bio                                          |
|  [                                  ]         |
|  [                                  ]         |
|                                               |
|              [Cancel]  [Save Changes]         |
+-----------------------------------------------+
                max-w-xl (640px)
```

---

## Content Container Pattern

### Generic Content Width Wrapper

```svelte
<!-- ContentContainer.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    width?: 'narrow' | 'default' | 'wide' | 'full';
    padding?: boolean;
    center?: boolean;
    children: Snippet;
  }

  let {
    width = 'default',
    padding = true,
    center = true,
    children
  } = $props();

  const widths = {
    narrow: 'max-w-xl',      // 640px - forms
    default: 'max-w-4xl',    // 1024px - content
    wide: 'max-w-6xl',       // 1152px - dashboards
    full: 'max-w-none'       // no limit
  };
</script>

<div class={cn(
  'w-full',
  center && 'mx-auto',
  padding && 'px-4 md:px-6',
  widths[width]
)}>
  {@render children()}
</div>
```

### Usage Examples

```svelte
<!-- Dashboard with wide content -->
<ContentContainer width="wide">
  <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}>
    <MetricCard />
    <MetricCard />
    <MetricCard />
    <MetricCard />
  </ResponsiveGrid>
</ContentContainer>

<!-- Settings form with narrow content -->
<ContentContainer width="narrow">
  <Card>
    <SettingsForm />
  </Card>
</ContentContainer>

<!-- List with split-pane -->
<ContentContainer width="full" padding={false}>
  <SplitPane>
    <ProjectList />
    {#snippet detail()}
      <ProjectDetail />
    {/snippet}
  </SplitPane>
</ContentContainer>
```

---

## Viewport Store Pattern

### Reactive Viewport Detection

```typescript
// $lib/stores/viewport.ts
import { readable } from 'svelte/store';

export type ViewportClass = 'compact' | 'medium' | 'expanded' | 'large';

export const viewport = readable<ViewportClass>('compact', (set) => {
  if (typeof window === 'undefined') return;

  const breakpoints = {
    large: window.matchMedia('(min-width: 1024px)'),
    expanded: window.matchMedia('(min-width: 840px)'),
    medium: window.matchMedia('(min-width: 600px)'),
  };

  function update() {
    if (breakpoints.large.matches) set('large');
    else if (breakpoints.expanded.matches) set('expanded');
    else if (breakpoints.medium.matches) set('medium');
    else set('compact');
  }

  Object.values(breakpoints).forEach(mq =>
    mq.addEventListener('change', update)
  );
  update();

  return () => {
    Object.values(breakpoints).forEach(mq =>
      mq.removeEventListener('change', update)
    );
  };
});

// Derived helpers
export const isCompact = derived(viewport, $v => $v === 'compact');
export const isMobile = derived(viewport, $v => $v === 'compact' || $v === 'medium');
export const isDesktop = derived(viewport, $v => $v === 'expanded' || $v === 'large');
```

### Usage

```svelte
<script lang="ts">
  import { viewport, isDesktop } from '$lib/stores/viewport';
</script>

{#if $isDesktop}
  <Sidebar />
{:else}
  <BottomTabBar />
{/if}

<!-- Or use CSS classes with Tailwind -->
<div class="md:hidden">Mobile only</div>
<div class="hidden md:block">Desktop only</div>
```

---

## Checklist

### Layout Implementation

- [ ] AppShell handles navigation transformation
- [ ] Content width constrained on xl+
- [ ] Forms center on md+
- [ ] Split-pane activates on lg+
- [ ] Modals transform at md breakpoint

### Testing

- [ ] Test all screen types at each breakpoint
- [ ] Verify navigation consistency
- [ ] Check content readability on wide screens
- [ ] Validate touch targets on tablet

---

## Related Docs

- [desktop-ux.md](../_guides/desktop-ux.md) - Desktop UX patterns overview
- [desktop-navigation.md](./desktop-navigation.md) - Sidebar/header patterns
- [mobile-ux.md](../_guides/mobile-ux.md) - Mobile-first patterns
- [wireframe-patterns.md](../_guides/wireframe-patterns.md) - Screen templates
