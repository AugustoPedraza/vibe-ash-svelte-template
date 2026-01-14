# Desktop UX Patterns

> Responsive desktop patterns for mobile-first PWAs.

## Quick Index

| If you need... | Section |
|----------------|---------|
| Breakpoint system | [#breakpoint-system](#breakpoint-system) |
| Content width constraints | [#content-width](#content-width) |
| Desktop navigation | [#desktop-navigation](#desktop-navigation) |
| Split-pane layouts | [#split-pane-layouts](#split-pane-layouts) |
| Component transformations | [#component-transformations](#component-transformations) |
| Anti-patterns | [#desktop-anti-patterns](#desktop-anti-patterns) |
| Testing matrix | [#testing-matrix](#testing-matrix) |

---

## Core Philosophy

> **Mobile-first, desktop-enhanced.**

This framework is built mobile-first. Desktop is a progressive enhancement, not the primary target. The goal is to make the PWA feel natural on wide screens without losing the mobile-optimized experience.

### Key Principles

| Principle | Rule |
|-----------|------|
| **Content-first** | Never stretch content to fill space |
| **Consistent navigation** | Desktop sidebar maps to mobile tabs |
| **Readable width** | 65-75 characters per line (~1024px max) |
| **Reduce clicks** | Split-pane for list-detail on desktop |
| **Progressive disclosure** | Same info, adapted presentation |

---

## Breakpoint System

Following Material Design 3 Window Size Classes:

| Class | Tailwind | Width | Layout Strategy |
|-------|----------|-------|-----------------|
| **Compact** | (default) | 0-599px | Single column, bottom nav |
| **Medium** | `md:` | 600-839px | Navigation rail, optional 2-col |
| **Expanded** | `lg:` | 840-1023px | Full sidebar, split-pane |
| **Large** | `xl:` | 1024px+ | Constrained width, enhanced split |

### When Each Applies

```
COMPACT (Mobile)     MEDIUM (Tablet)      EXPANDED (Desktop)   LARGE (Wide Desktop)
0-599px              600-839px            840-1023px           1024px+
┌─────────────┐      ┌─────────────┐      ┌────┬────────┐      ┌────┬───────────┐
│   Header    │      │   Header    │      │    │ Header │      │    │  Header   │
├─────────────┤      ├─────────────┤      │Rail├────────┤      │Side├───────────┤
│             │      │             │      │    │        │      │bar │           │
│   Content   │      │   Content   │      │    │Content │      │    │  Content  │
│             │      │             │      │    │        │      │    │ (max 1024)|
├─────────────┤      ├─────────────┤      │    │        │      │    │           │
│  Tab Bar    │      │  Tab Bar    │      │    │        │      │    │           │
└─────────────┘      └─────────────┘      └────┴────────┘      └────┴───────────┘
```

### CSS Custom Properties

```css
:root {
  --content-max-width: 1024px;
  --sidebar-width: 280px;
  --rail-width: 72px;
  --app-max-width: 1304px;
  --centered-content-width: 640px;
}
```

### Tailwind Breakpoint Reference

```css
/* Default (mobile) */
.element { /* compact styles */ }

/* 600px+ (tablet/medium) */
@screen md {
  .element { /* medium styles */ }
}

/* 840px+ (desktop/expanded) */
@screen lg {
  .element { /* expanded styles */ }
}

/* 1024px+ (wide desktop/large) */
@screen xl {
  .element { /* large styles */ }
}
```

---

## Content Width

### The Problem

Wide screens make content unreadable:
- Line length > 80 chars = eye strain
- Stretched layouts feel empty
- Touch targets become hunt-and-peck

### The Solution

**Constrained content** with deliberate width limits:

| Element | Max Width | Rationale |
|---------|-----------|-----------|
| Main content | **1024px** | Optimal reading width (65-70 chars) |
| Sidebar | **280px** | Room for icons + labels + badges |
| Nav rail (collapsed) | **72px** | Icons only, minimal footprint |
| Centered forms | **640px** | Single-column focus |
| Card grids | **1024px** | Content area, 3-4 columns |
| Total app | **~1304px** | Content + sidebar |

### Layout Patterns

**Standard Desktop (Wide Content)**
```
+--------+-------------------------------------------+
| Sidebar|        DesktopHeader                      |
|  280px +-------------------------------------------+
|        |                                           |
|        |        Page Content (max 1024px)          |
|        |        centered in remaining space        |
|        |                                           |
+--------+-------------------------------------------+
```

**Split-Pane (List-Detail)**
```
+--------+------------------+------------------------+
| Sidebar| List Panel       | Detail Panel           |
|  280px |  (~380px)        |  (remaining, centered) |
+--------+------------------+------------------------+
```

**Centered Form**
```
+--------+-------------------------------------------+
| Sidebar|                                           |
|  280px |              [Form Card]                  |
|        |              (max 640px)                  |
|        |              centered                     |
+--------+-------------------------------------------+
```

### Responsive Width Classes

```svelte
<!-- Full width on mobile, constrained on desktop -->
<div class="w-full xl:max-w-[var(--content-max-width)] xl:mx-auto">
  {@render children()}
</div>

<!-- Centered form container -->
<div class="w-full md:max-w-[var(--centered-content-width)] md:mx-auto">
  <Card>
    <form>...</form>
  </Card>
</div>
```

---

## Desktop Navigation

### Navigation Transformation

| Viewport | Component | Behavior |
|----------|-----------|----------|
| Compact | BottomTabBar | Fixed at bottom, 3-5 tabs |
| Medium | Navigation Rail | Collapsed sidebar, icons + labels |
| Expanded+ | Sidebar | Full sidebar with groups |

### Sidebar Structure

```
+-------------------------+
|    [Logo] App Name      |  ← Brand section (h-16)
+-------------------------+
|                         |
| Main                    |  ← Primary nav group
|   > Dashboard           |
|   > Projects       (3)  |  ← Badge for counts
|   > Inbox               |
|                         |
| Team                    |  ← Secondary nav group
|   > Members             |
|   > Settings            |
|                         |
+-------------------------+
|                         |
| [Avatar] User Name      |  ← User section
| Settings | Sign out     |
+-------------------------+
```

### Navigation Item States

| State | Visual |
|-------|--------|
| Default | `text-muted-foreground` |
| Hover | `bg-accent text-accent-foreground` |
| Active | `bg-primary/10 text-primary font-medium` |
| With badge | Badge right-aligned |
| Disabled | `opacity-50 pointer-events-none` |

### Desktop Header Structure

```
+----------------------------------------------------------+
| [Breadcrumb or Page Title]          [Actions] [User Menu] |
+----------------------------------------------------------+
```

| Section | Content |
|---------|---------|
| Left | Page title OR breadcrumb trail |
| Center | (Empty or search bar) |
| Right | Page actions, notifications, user dropdown |

### When to Show What

| Viewport | Bottom Tabs | Nav Rail | Full Sidebar | Desktop Header |
|----------|-------------|----------|--------------|----------------|
| Compact | Yes | No | No | No (use AppHeader) |
| Medium | No | Yes | No | Yes |
| Expanded+ | No | No | Yes | Yes |

---

## Split-Pane Layouts

### When to Use Split-Pane

| Screen Type | Use Split-Pane? | Rationale |
|-------------|-----------------|-----------|
| Lists (inbox, projects) | **Yes** | Reduces navigation, shows detail in place |
| Settings | **Yes** | Categories left, options right |
| Forms (create, edit) | **No** | Center the form, focus on input |
| Dashboard | **No** | Use card grid instead |
| Single detail view | **No** | Center with max-width |

### Split-Pane Structure

```
+------------------+------------------------+
| List Panel       | Detail Panel           |
|  (fixed width)   |  (flexible)            |
|                  |                        |
| [Search...]      |                        |
| ───────────────  |      Detail Content    |
| > Item A         |      (centered if      |
| > Item B  [*]    |       narrow content)  |
| > Item C         |                        |
|                  |                        |
+------------------+------------------------+
     ~380px              remaining
```

### Panel Widths

| Panel | Width | Notes |
|-------|-------|-------|
| List panel | 320-400px | Fixed, room for item preview |
| Detail panel | Remaining | Flexible, content centered if narrow |
| Minimum detail | 480px | Don't split if viewport too narrow |

### Split-Pane Behavior

| State | List Panel | Detail Panel |
|-------|------------|--------------|
| No selection | Shows list | EmptyState: "Select an item" |
| Item selected | Highlights selected | Shows item detail |
| Mobile (<lg) | Full screen | Full screen (navigate to detail) |

### Selection Pattern

```typescript
// Split-pane selection state
let selectedId = $state<string | null>(null);

// On desktop: select shows in detail panel
// On mobile: select navigates to detail route
function handleSelect(id: string) {
  if (isDesktop) {
    selectedId = id;
  } else {
    goto(`/projects/${id}`);
  }
}
```

---

## Component Transformations

### Overview

| Component | Compact (Mobile) | Expanded+ (Desktop) |
|-----------|------------------|---------------------|
| BottomTabBar | Visible | Hidden |
| Sidebar | Hidden | Visible |
| Modal | Bottom sheet | Centered dialog |
| BottomSheet | Drag-up sheet | Side drawer OR dialog |
| List | Single column | Grid OR split-pane |
| Form | Full-width | Centered (640px max) |
| Cards | Stacked | 2-4 column grid |

### Modal Transformation

**Mobile (Compact)**
- Position: Bottom of screen
- Animation: Slide up
- Width: Full viewport
- Corners: Rounded top only

**Desktop (Expanded+)**
- Position: Centered
- Animation: Scale in
- Width: 400-600px (size variant)
- Corners: Fully rounded

```svelte
<div class={cn(
  'bg-surface rounded-lg shadow-lg',
  // Mobile: bottom sheet style
  'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:rounded-t-xl max-md:rounded-b-none',
  // Desktop: centered dialog
  'md:relative md:max-w-md md:mx-auto md:rounded-xl'
)}>
```

### BottomSheet Transformation Options

On desktop, BottomSheet can transform to:

| Option | When to Use |
|--------|-------------|
| **Centered dialog** | Confirmations, small selections |
| **Side drawer** | Filters, extended menus |
| **Keep as sheet** | Complex content, multi-step |

### List to Grid Transformation

**Mobile (Compact)**: Vertical list
```
+------------------+
| [Item 1        ] |
| [Item 2        ] |
| [Item 3        ] |
+------------------+
```

**Desktop (Expanded+)**: Responsive grid
```
+------------------------------------------+
| [Item 1]  [Item 2]  [Item 3]  [Item 4]   |
| [Item 5]  [Item 6]  [Item 7]  [Item 8]   |
+------------------------------------------+
```

```svelte
<div class="
  grid gap-4
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
">
  {#each items as item}
    <Card>{item.name}</Card>
  {/each}
</div>
```

---

## Desktop Anti-Patterns

### Layout Anti-Patterns

| Don't | Why | Do Instead |
|-------|-----|------------|
| Full-width content on xl+ | Unreadable line lengths | Max-width constraint (1024px) |
| Fixed sidebar on mobile | Wastes precious viewport | Show only on md+ |
| Hide sidebar on xl+ | Wastes space, inconsistent | Always show on expanded+ |
| Multi-column forms | Reading order unclear | Single column, centered |

### Navigation Anti-Patterns

| Don't | Why | Do Instead |
|-------|-----|------------|
| Hover-only menus | No hover on touch | Click/tap alternatives |
| Dropdown primary nav | Hidden = forgotten | Persistent sidebar |
| Different nav structure | Cognitive load | Same items, adapted display |

### Interaction Anti-Patterns

| Don't | Why | Do Instead |
|-------|-----|------------|
| Tooltip-only info | Not accessible | Inline or expandable |
| Right-click menus | Users expect left-click | Dropdown or context menu |
| Drag-only reorder | No mobile fallback | Reorder mode with buttons |
| Hover previews | No touch equivalent | Click to preview |

### Width Anti-Patterns

| Don't | Why | Do Instead |
|-------|-----|------------|
| Percentage widths only | Unpredictable on wide | Max-width constraints |
| Same card size on all | Wastes space OR cramped | Responsive columns |
| Stretch images to fill | Distorted aspect ratio | Object-fit: cover |

---

## Testing Matrix

### Viewport Sizes to Test

| Viewport | Width | Represents | Focus |
|----------|-------|------------|-------|
| Mobile S | 375px | iPhone SE | Core mobile layout |
| Mobile L | 428px | iPhone 14 Pro Max | Large mobile |
| Tablet P | 768px | iPad portrait | Navigation rail |
| Tablet L | 1024px | iPad landscape | Desktop minimum |
| Desktop | 1280px | Common laptop | Split-pane |
| Desktop L | 1440px | Common monitor | Full layout |
| Desktop XL | 1920px | Full HD monitor | Max constraints |

### Checklist by Breakpoint

#### Compact (<600px)
- [ ] Bottom tab bar visible and functional
- [ ] Sidebar hidden
- [ ] Content full-width
- [ ] Modals slide from bottom
- [ ] Touch targets 44px+

#### Medium (600-839px)
- [ ] Bottom tabs hidden
- [ ] Navigation rail visible (if implemented) OR sidebar
- [ ] Content still full-width
- [ ] Forms begin to center

#### Expanded (840-1023px)
- [ ] Full sidebar visible
- [ ] Desktop header shows
- [ ] Split-pane activates for lists
- [ ] Modals centered

#### Large (1024px+)
- [ ] Content constrained to 1024px
- [ ] White space on sides (margins)
- [ ] Grids show 3-4 columns
- [ ] All desktop patterns active

### Visual Regression Checkpoints

| Screen | Compact | Medium | Expanded | Large |
|--------|---------|--------|----------|-------|
| Dashboard | Stacked | 2-col | 3-col | 4-col |
| List view | List | List | Split | Split |
| Form | Full | Centered | Centered | Centered |
| Settings | List | List | Split | Split |
| Modal | Bottom | Bottom | Center | Center |

---

## Related Docs

- [mobile-ux.md](./mobile-ux.md) - Mobile-first patterns (read first)
- [wireframe-patterns.md](./wireframe-patterns.md) - Screen templates
- [adaptive-layouts.md](../_patterns/adaptive-layouts.md) - Layout transformations
- [desktop-navigation.md](../_patterns/desktop-navigation.md) - Sidebar/header patterns
- [component-intent.md](./component-intent.md) - Component selection
