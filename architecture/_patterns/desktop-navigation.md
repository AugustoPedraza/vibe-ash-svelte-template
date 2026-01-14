# Desktop Navigation Pattern

> Sidebar and header patterns for desktop PWAs.

## Quick Index

| If you need... | Section |
|----------------|---------|
| Sidebar structure | [#sidebar-structure](#sidebar-structure) |
| Navigation rail | [#navigation-rail](#navigation-rail) |
| Desktop header | [#desktop-header](#desktop-header) |
| Nav item states | [#navigation-item-states](#navigation-item-states) |
| Grouping patterns | [#grouping-patterns](#grouping-patterns) |

---

## Overview

Desktop navigation replaces mobile's BottomTabBar with a persistent sidebar and header.

| Viewport | Navigation | Position |
|----------|------------|----------|
| Compact (<600px) | BottomTabBar | Fixed bottom |
| Medium (600-839px) | Navigation Rail | Fixed left |
| Expanded+ (840px+) | Full Sidebar | Fixed left |

---

## Sidebar Structure

### Anatomy

```
+-------------------------+
|    BRAND SECTION        |  h-16 (64px)
|    [Logo] App Name      |
+-------------------------+
|                         |
|    PRIMARY NAV          |  flex-1
|    ─────────────────    |
|    > Dashboard          |
|    > Projects      (3)  |
|    > Inbox              |
|                         |
|    SECONDARY NAV        |
|    ─────────────────    |
|    > Team               |
|    > Reports            |
|                         |
|    UTILITY NAV          |
|    ─────────────────    |
|    > Settings           |
|    > Help               |
|                         |
+-------------------------+
|    USER SECTION         |  h-16 (64px)
|    [Avatar] User Name   |
|    Settings | Sign out  |
+-------------------------+
```

### Dimensions

| Element | Size | Notes |
|---------|------|-------|
| Sidebar width | 280px | `--sidebar-width` |
| Brand section | h-16 (64px) | Logo + app name |
| Nav item | h-10 (40px) | Comfortable tap target |
| Group label | h-8 (32px) | Uppercase, smaller text |
| User section | h-16+ (64px+) | Avatar + dropdown |
| Padding | px-3 | Item horizontal padding |

### Implementation

```svelte
<!-- Sidebar.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { page } from '$app/stores';

  interface NavItem {
    label: string;
    href: string;
    icon: Component;
    badge?: number;
  }

  interface NavGroup {
    label?: string;
    items: NavItem[];
  }

  interface Props {
    groups: NavGroup[];
    user?: { name: string; avatar?: string };
  }

  let { groups, user } = $props();
</script>

<aside class="
  hidden md:flex flex-col
  w-[280px] h-screen
  bg-background border-r border-border
  fixed left-0 top-0
">
  <!-- Brand Section -->
  <div class="h-16 flex items-center gap-3 px-4 border-b border-border">
    <Logo class="w-8 h-8" />
    <span class="font-semibold text-lg">App Name</span>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto py-4">
    {#each groups as group}
      <NavGroup label={group.label}>
        {#each group.items as item}
          <NavItem
            href={item.href}
            icon={item.icon}
            badge={item.badge}
            active={$page.url.pathname === item.href}
          >
            {item.label}
          </NavItem>
        {/each}
      </NavGroup>
    {/each}
  </nav>

  <!-- User Section -->
  {#if user}
    <div class="border-t border-border p-4">
      <UserMenu {user} />
    </div>
  {/if}
</aside>
```

---

## Navigation Rail

Collapsed sidebar for medium viewports (600-839px).

### Anatomy

```
+--------+
| [Logo] |  h-16
+--------+
|  [🏠]  |
|  Home  |
+--------+
|  [📁]  |
|  Proj  |
+--------+
|  [📥]  |
| Inbox  |
+--------+
|        |
|        |  flex-1
+--------+
|  [⚙️]  |
| Sett.  |
+--------+
|  [👤]  |
+--------+
```

### Dimensions

| Element | Size |
|---------|------|
| Rail width | 72px |
| Icon | 24px |
| Label | text-xs |
| Item | h-14 (56px) |

### Implementation

```svelte
<!-- NavigationRail.svelte -->
<script lang="ts">
  interface NavItem {
    label: string;
    href: string;
    icon: Component;
    badge?: number;
  }

  let { items } = $props<{ items: NavItem[] }>();
</script>

<aside class="
  hidden sm:flex md:hidden
  flex-col items-center
  w-[72px] h-screen
  bg-background border-r border-border
  fixed left-0 top-0
">
  <!-- Logo -->
  <div class="h-16 flex items-center justify-center">
    <Logo class="w-8 h-8" />
  </div>

  <!-- Navigation -->
  <nav class="flex-1 py-4 space-y-2">
    {#each items as item}
      <a
        href={item.href}
        class={cn(
          'flex flex-col items-center justify-center',
          'w-14 h-14 rounded-lg',
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          $page.url.pathname === item.href && 'bg-primary/10 text-primary'
        )}
      >
        <svelte:component this={item.icon} class="w-6 h-6" />
        <span class="text-xs mt-1 truncate max-w-[56px]">{item.label}</span>
        {#if item.badge}
          <Badge variant="destructive" class="absolute -top-1 -right-1 h-5 min-w-5">
            {item.badge > 99 ? '99+' : item.badge}
          </Badge>
        {/if}
      </a>
    {/each}
  </nav>
</aside>
```

---

## Desktop Header

### Anatomy

```
+------------------------------------------------------------------+
| [≡] Page Title / Breadcrumb         [🔔] [?] [Avatar ▼]          |
+------------------------------------------------------------------+
  ↑                                    ↑
  Left section                         Right section
  - Menu toggle (optional)             - Notifications
  - Page title or breadcrumb           - Help
                                       - User dropdown
```

### Variants

**Simple Header (Page Title)**
```
+------------------------------------------------------------------+
| Dashboard                                        [🔔] [Avatar ▼] |
+------------------------------------------------------------------+
```

**Breadcrumb Header**
```
+------------------------------------------------------------------+
| Projects > Alpha > Settings                      [🔔] [Avatar ▼] |
+------------------------------------------------------------------+
```

**Header with Actions**
```
+------------------------------------------------------------------+
| Projects                    [Search...] [Filter] [+ New Project] |
+------------------------------------------------------------------+
```

### Implementation

```svelte
<!-- DesktopHeader.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
    children?: Snippet;       // For custom content
    actions?: Snippet;        // Right-side actions
  }

  let { title, breadcrumbs, children, actions } = $props();
</script>

<header class="
  hidden md:flex items-center justify-between
  h-14 px-6
  bg-background border-b border-border
">
  <!-- Left: Title or Breadcrumb -->
  <div class="flex items-center gap-2">
    {#if breadcrumbs}
      <nav class="flex items-center gap-1 text-sm">
        {#each breadcrumbs as crumb, i}
          {#if i > 0}
            <ChevronRight class="w-4 h-4 text-muted-foreground" />
          {/if}
          {#if crumb.href}
            <a href={crumb.href} class="text-muted-foreground hover:text-foreground">
              {crumb.label}
            </a>
          {:else}
            <span class="text-foreground font-medium">{crumb.label}</span>
          {/if}
        {/each}
      </nav>
    {:else if title}
      <h1 class="text-lg font-semibold">{title}</h1>
    {:else if children}
      {@render children()}
    {/if}
  </div>

  <!-- Right: Actions -->
  <div class="flex items-center gap-2">
    {#if actions}
      {@render actions()}
    {/if}

    <!-- Notifications -->
    <IconButton variant="ghost" aria-label="Notifications">
      <Bell class="w-5 h-5" />
    </IconButton>

    <!-- User Menu -->
    <UserDropdown />
  </div>
</header>
```

---

## Navigation Item States

### Visual States

| State | Styles |
|-------|--------|
| **Default** | `text-muted-foreground` |
| **Hover** | `bg-accent text-accent-foreground` |
| **Active** | `bg-primary/10 text-primary font-medium` |
| **Focused** | `ring-2 ring-ring ring-offset-2` |
| **Disabled** | `opacity-50 pointer-events-none` |

### Implementation

```svelte
<!-- NavItem.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { cva } from 'class-variance-authority';

  const navItemVariants = cva(
    'flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-colors',
    {
      variants: {
        state: {
          default: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          active: 'bg-primary/10 text-primary font-medium',
          disabled: 'text-muted-foreground opacity-50 pointer-events-none',
        }
      },
      defaultVariants: {
        state: 'default'
      }
    }
  );

  interface Props {
    href: string;
    icon?: Component;
    badge?: number;
    active?: boolean;
    disabled?: boolean;
    children: Snippet;
  }

  let { href, icon, badge, active = false, disabled = false, children } = $props();

  const state = $derived(
    disabled ? 'disabled' : active ? 'active' : 'default'
  );
</script>

<a
  {href}
  class={navItemVariants({ state })}
  aria-current={active ? 'page' : undefined}
  aria-disabled={disabled}
>
  {#if icon}
    <svelte:component this={icon} class="w-5 h-5 flex-shrink-0" />
  {/if}

  <span class="flex-1 truncate">
    {@render children()}
  </span>

  {#if badge}
    <Badge variant="secondary" class="ml-auto">
      {badge > 99 ? '99+' : badge}
    </Badge>
  {/if}
</a>
```

---

## Grouping Patterns

### Group Types

| Type | Purpose | Visual |
|------|---------|--------|
| **Primary** | Main app sections | Top of sidebar, prominent |
| **Secondary** | Supporting features | Below primary, separator |
| **Utility** | Settings, help, admin | Bottom area, subtle |

### Implementation

```svelte
<!-- NavGroup.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    label?: string;
    collapsible?: boolean;
    defaultOpen?: boolean;
    children: Snippet;
  }

  let {
    label,
    collapsible = false,
    defaultOpen = true,
    children
  } = $props();

  let open = $state(defaultOpen);
</script>

<div class="px-3 mb-4">
  {#if label}
    {#if collapsible}
      <button
        onclick={() => open = !open}
        class="
          flex items-center justify-between w-full
          h-8 px-0
          text-xs font-medium uppercase tracking-wider
          text-muted-foreground
          hover:text-foreground
        "
      >
        {label}
        <ChevronDown class={cn(
          'w-4 h-4 transition-transform',
          !open && '-rotate-90'
        )} />
      </button>
    {:else}
      <div class="h-8 flex items-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    {/if}
  {/if}

  {#if open || !collapsible}
    <div class="space-y-1">
      {@render children()}
    </div>
  {/if}
</div>
```

### Full Sidebar Example

```svelte
<Sidebar>
  <!-- Primary Navigation -->
  <NavGroup>
    <NavItem href="/dashboard" icon={Home} active={$page.url.pathname === '/dashboard'}>
      Dashboard
    </NavItem>
    <NavItem href="/projects" icon={Folder} badge={3}>
      Projects
    </NavItem>
    <NavItem href="/inbox" icon={Inbox} badge={12}>
      Inbox
    </NavItem>
  </NavGroup>

  <!-- Secondary Navigation -->
  <NavGroup label="Team">
    <NavItem href="/team/members" icon={Users}>
      Members
    </NavItem>
    <NavItem href="/team/reports" icon={BarChart}>
      Reports
    </NavItem>
  </NavGroup>

  <!-- Utility Navigation (at bottom) -->
  <div class="mt-auto">
    <NavGroup label="Support">
      <NavItem href="/settings" icon={Settings}>
        Settings
      </NavItem>
      <NavItem href="/help" icon={HelpCircle}>
        Help & Feedback
      </NavItem>
    </NavGroup>
  </div>
</Sidebar>
```

---

## User Section

### Dropdown Menu Pattern

```svelte
<!-- UserMenu.svelte -->
<script lang="ts">
  import { Dropdown, DropdownItem, DropdownDivider } from '$lib/components/ui/patterns';

  interface Props {
    user: {
      name: string;
      email: string;
      avatar?: string;
    };
  }

  let { user } = $props();
  let open = $state(false);
</script>

<Dropdown bind:open>
  {#snippet trigger()}
    <button class="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent">
      <Avatar src={user.avatar} fallback={user.name[0]} size="sm" />
      <div class="flex-1 text-left">
        <div class="text-sm font-medium">{user.name}</div>
        <div class="text-xs text-muted-foreground truncate">{user.email}</div>
      </div>
      <ChevronDown class="w-4 h-4 text-muted-foreground" />
    </button>
  {/snippet}

  <DropdownItem href="/profile">
    <User class="w-4 h-4" />
    Profile
  </DropdownItem>
  <DropdownItem href="/settings">
    <Settings class="w-4 h-4" />
    Settings
  </DropdownItem>
  <DropdownDivider />
  <DropdownItem onclick={handleLogout} variant="danger">
    <LogOut class="w-4 h-4" />
    Sign out
  </DropdownItem>
</Dropdown>
```

---

## Navigation Mapping

Ensure mobile tabs map to desktop sidebar items:

| Mobile Tab | Icon | Desktop Sidebar | Group |
|------------|------|-----------------|-------|
| Home | `Home` | Dashboard | Primary |
| Projects | `Folder` | Projects | Primary |
| Inbox | `Inbox` | Inbox | Primary |
| Profile | `User` | User Section | Footer |
| Settings | `Settings` | Settings | Utility |

### Mapping Pattern

```typescript
// navigation.ts - Shared navigation config
export const navigation = {
  primary: [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Projects', href: '/projects', icon: Folder },
    { label: 'Inbox', href: '/inbox', icon: Inbox },
  ],
  secondary: [
    { label: 'Team', href: '/team', icon: Users },
    { label: 'Reports', href: '/reports', icon: BarChart },
  ],
  utility: [
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Help', href: '/help', icon: HelpCircle },
  ]
};

// Use in both BottomTabBar (primary only) and Sidebar (all groups)
```

---

## Responsive Behavior

### CSS Classes

```css
/* Sidebar: visible on md+, hidden on mobile */
.sidebar {
  @apply hidden md:flex;
}

/* Bottom tabs: visible on mobile, hidden on md+ */
.bottom-tabs {
  @apply md:hidden;
}

/* Rail: visible on sm-md, hidden otherwise */
.nav-rail {
  @apply hidden sm:flex md:hidden;
}

/* Main content offset */
.main-content {
  @apply md:ml-[280px]; /* Sidebar width */
}

/* Or with nav rail */
.main-content-with-rail {
  @apply sm:ml-[72px] md:ml-[280px];
}
```

---

## Checklist

### Sidebar Implementation

- [ ] Brand section with logo and app name
- [ ] Primary navigation group
- [ ] Secondary navigation groups (if needed)
- [ ] Utility navigation at bottom
- [ ] User section with dropdown
- [ ] Active state highlighting
- [ ] Badge support for counts

### Desktop Header

- [ ] Page title or breadcrumbs
- [ ] Right-side actions slot
- [ ] Notification button
- [ ] User dropdown

### Navigation Consistency

- [ ] Mobile tabs map to sidebar items
- [ ] Same icons used across platforms
- [ ] Consistent badge behavior
- [ ] Active route highlighting works

---

## Related Docs

- [desktop-ux.md](../_guides/desktop-ux.md) - Desktop UX overview
- [adaptive-layouts.md](./adaptive-layouts.md) - Layout transformations
- [navigation.md](./navigation.md) - General navigation patterns
- [mobile-ux.md](../_guides/mobile-ux.md) - Mobile navigation patterns
