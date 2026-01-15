# Visual Design System

> Pixel-perfect visual patterns for professional, polished PWA UI.

## Quick Index

| I need to... | Section |
|--------------|---------|
| Use shadows/elevation | [Elevation System](#elevation-system) |
| Add button feedback | [Micro-Interactions](#micro-interactions) |
| Make cards interactive | [Interactive Cards](#interactive-cards) |
| Add form validation feedback | [Error Animations](#error-animations) |
| Apply typography | [Typography Scale](#typography-scale) |
| Use spacing correctly | [Spacing System](#spacing-system) |
| Add loading effects | [Loading Patterns](#loading-patterns) |
| Avoid common mistakes | [Anti-Patterns](#anti-patterns) |

---

## Core Principles

### Pixel-Perfect Grid

All spacing aligns to a **4px baseline grid**:

```
4px  (space-1)  - Micro gap
8px  (space-2)  - Tight spacing
12px (space-3)  - Normal spacing
16px (space-4)  - Comfortable spacing
24px (space-6)  - Spacious spacing
32px (space-8)  - Section spacing
48px (space-12) - Page spacing
```

### Visual Hierarchy

Use elevation to communicate importance:

```
Background (flat)     ─────────────────────────
  │
  ├─ Cards (shadow-sm)   ┌─────────────┐
  │                      │  Raised     │
  ├─ Dropdowns (shadow-md)└─────────────┘
  │                           │
  └─ Modals (shadow-xl)       ▼
                         ┌─────────────┐
                         │  Overlay    │
                         └─────────────┘
```

---

## Elevation System

### Shadow Scale

| Level | Token | Use For |
|-------|-------|---------|
| xs | `shadow-xs` | Subtle depth, inputs |
| sm | `shadow-sm` | Cards, buttons |
| md | `shadow-md` | Dropdowns, hover states |
| lg | `shadow-lg` | Popovers, tooltips |
| xl | `shadow-xl` | Modals, dialogs |

### CSS Values

```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.04);
```

### Semantic Elevation

| Level | Shadow | Z-Index | Components |
|-------|--------|---------|------------|
| Flat | none | 0 | Page backgrounds |
| Raised | sm | 10 | Cards, buttons |
| Overlay | md | 20 | Dropdowns, popovers |
| Modal | xl | 50 | Modals, dialogs |

---

## Micro-Interactions

### Button Press Feedback

All buttons scale down on press for tactile feedback:

```svelte
<Button>Click me</Button>
<!-- Automatically applies active:scale-95 -->
```

**Implementation:**
```css
active:scale-95 transition-all duration-150
```

### Icon Button Press

Icon buttons use smaller scale for proportional feedback:

```svelte
<IconButton label="Close">
  <X />
</IconButton>
<!-- Automatically applies active:scale-90 -->
```

### Interactive Cards

Cards with the `interactive` prop lift on hover:

```svelte
<Card interactive onclick={handleClick}>
  <h3>Clickable Card</h3>
  <p>This card lifts on hover and responds to clicks.</p>
</Card>
```

**Behavior:**
- Hover: Lifts 2px, shadow increases to md
- Active: Returns to 1px lift
- Focus: Shows focus ring for keyboard users

**Implementation:**
```css
hover:shadow-md hover:-translate-y-0.5 transition-all duration-150
active:translate-y-0 active:shadow-sm
```

---

## Error Animations

### Form Field Shake

Shake the field on validation errors:

```svelte
<FormField
  label="Email"
  error={errors.email}
  shake
>
  <Input bind:value={email} invalid={!!errors.email} />
</FormField>
```

**Behavior:**
- Only shakes when error changes (not on initial render)
- Animation duration: 500ms
- Respects `prefers-reduced-motion`

### Success Feedback

Animate success alerts on mount:

```svelte
<Alert variant="success" animate>
  Your changes have been saved!
</Alert>
```

**Animation:** Scale-in with spring easing (300ms)

---

## Typography Scale

### Type Hierarchy

| Level | Size | Line-Height | Weight | Use For |
|-------|------|-------------|--------|---------|
| Display | 30px | 1.2 | 700 | Page titles |
| Heading | 24px | 1.33 | 600 | Section headings |
| Title | 20px | 1.4 | 600 | Card titles |
| Subtitle | 18px | 1.55 | 500 | Subtitles |
| Body | 16px | 1.5 | 400 | Body text |
| Caption | 14px | 1.43 | 400 | Helper text |
| Micro | 12px | 1.33 | 500 | Badges, labels |

### Typography Utility Classes

```svelte
<h1 class="text-display">Page Title</h1>
<h2 class="text-heading">Section Heading</h2>
<h3 class="text-title">Card Title</h3>
<p class="text-body">Body content</p>
<span class="text-caption">Helper text</span>
<span class="text-micro">BADGE</span>
```

### Letter Spacing

| Type | Tracking | Use For |
|------|----------|---------|
| Display | -0.05em | Large titles |
| Heading | -0.025em | Section headings |
| Body | 0 | Default text |
| Micro | 0.025em | All caps, badges |

---

## Spacing System

### 4px Baseline Grid

All vertical spacing aligns to 4px increments:

| Token | Value | Tailwind | Use For |
|-------|-------|----------|---------|
| space-1 | 4px | `gap-1`, `p-1` | Micro gap |
| space-2 | 8px | `gap-2`, `p-2` | Tight spacing |
| space-3 | 12px | `gap-3`, `p-3` | Normal spacing |
| space-4 | 16px | `gap-4`, `p-4` | Comfortable |
| space-6 | 24px | `gap-6`, `p-6` | Spacious |
| space-8 | 32px | `gap-8`, `p-8` | Section spacing |
| space-12 | 48px | `gap-12`, `p-12` | Page spacing |

### Component Spacing

| Component | Internal Padding | External Margin |
|-----------|-----------------|-----------------|
| Button | `px-4 py-2` (md) | - |
| Card | `p-4` (md) | `mb-4` between cards |
| Form field | `space-y-1.5` | `space-y-4` between fields |
| Section | `p-6` | `space-y-8` between sections |

### Optical Alignment

| Element | Rule |
|---------|------|
| Icons in buttons | Center vertically, 8px gap from text |
| Form labels | Left-aligned, 4px gap to input |
| Card content | 16px padding all sides |
| List items | 12px vertical, 16px horizontal |
| Touch targets | Minimum 44x44px, centered content |

---

## Component Dimensions

### Standard Heights

| Size | Height | Use For |
|------|--------|---------|
| sm | 32px | Secondary buttons, compact UI |
| md | 40px | Default buttons, inputs |
| lg | 48px | Primary CTAs, prominent inputs |
| touch | 44px | Minimum touch target |

### Component Specifications

| Component | Height | Padding | Border-Radius |
|-----------|--------|---------|---------------|
| Button (sm) | 32px | `px-3 py-1.5` | 6px |
| Button (md) | 40px | `px-4 py-2` | 8px |
| Button (lg) | 48px | `px-6 py-3` | 8px |
| Input | 40px | `px-3 py-2` | 6px |
| Card | auto | `p-4` | 8px |
| Badge | 20px | `px-2 py-0.5` | pill |
| Avatar (sm) | 32px | - | circle |
| Avatar (md) | 40px | - | circle |
| Avatar (lg) | 48px | - | circle |

---

## Loading Patterns

### Skeleton Pulse (Default)

Gentle pulse animation for content loading:

```svelte
<Skeleton variant="text" lines={3} />
<Skeleton variant="card" size="md" />
```

### Skeleton Shimmer

Shimmer effect for longer loads or image placeholders:

```svelte
<Skeleton variant="card" shimmer />
<Skeleton variant="rect" width="100%" height="200px" shimmer />
```

### When to Use Each

| Loading Type | Duration | Pattern |
|--------------|----------|---------|
| Button action | <1s | Button spinner |
| Content load | 1-3s | Skeleton pulse |
| Large content | 3s+ | Skeleton shimmer |
| Image load | Variable | Shimmer placeholder |

---

## Animation Tokens

### Durations

| Token | Value | Use For |
|-------|-------|---------|
| instant | 0ms | Immediate feedback |
| fast | 100ms | Press feedback |
| normal | 200ms | Standard transitions |
| slow | 300ms | Modals, sheets |
| slower | 400ms | Complex animations |

### Easing Functions

| Token | Curve | Use For |
|-------|-------|---------|
| ease-out | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| ease-in | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| ease-in-out | `cubic-bezier(0.4, 0, 0.2, 1)` | Toggle animations |
| ease-spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy feedback |

### Reduced Motion

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Color States

### Interactive State Overlays

| State | Light Mode | Dark Mode |
|-------|------------|-----------|
| Hover | `rgb(0 0 0 / 0.04)` | `rgb(255 255 255 / 0.04)` |
| Active | `rgb(0 0 0 / 0.08)` | `rgb(255 255 255 / 0.08)` |
| Focus | `rgb(0 0 0 / 0.12)` | `rgb(255 255 255 / 0.12)` |

### Semantic Colors

| Color | Use For |
|-------|---------|
| `primary` | CTAs, active states, links |
| `success` | Success messages, confirmations |
| `warning` | Warnings, caution states |
| `error` | Errors, destructive actions |
| `info` | Informational messages |

Each has a `-soft` variant for backgrounds:

```svelte
<div class="bg-success-soft text-success">
  Operation successful
</div>
```

---

## Anti-Patterns

### Visual Polish Mistakes

| Avoid | Why | Do Instead |
|-------|-----|------------|
| No press feedback | Feels unresponsive | Use Button/IconButton (auto-applied) |
| Static cards for clickables | Not discoverable | Add `interactive` prop |
| Inconsistent shadows | Visual chaos | Use shadow scale tokens |
| Custom animation timings | Inconsistency | Use duration tokens |
| Hardcoded spacing | Breaks grid | Use spacing tokens |
| Custom colors | Accessibility issues | Use semantic colors |

### Loading Mistakes

| Avoid | Why | Do Instead |
|-------|-----|------------|
| Spinners for content | Not native-like | Use Skeleton |
| No loading state | Feels broken | Always show placeholder |
| Blocking spinners | Poor UX | Use optimistic updates |

### Typography Mistakes

| Avoid | Why | Do Instead |
|-------|-----|------------|
| Custom font sizes | Breaks hierarchy | Use type scale |
| Different line heights | Vertical rhythm breaks | Use leading tokens |
| Bold for emphasis | Too heavy | Use font-medium |

---

## Implementation Checklist

### New Component

- [ ] Uses spacing tokens (4px grid)
- [ ] Uses shadow tokens for elevation
- [ ] Has proper focus states
- [ ] Has hover/active feedback
- [ ] Respects reduced motion
- [ ] Uses semantic colors

### Interactive Element

- [ ] Has `active:scale-95` (or 90 for icons)
- [ ] Has `transition-all duration-150`
- [ ] Has visible focus ring
- [ ] Touch target >= 44px

### Form

- [ ] Field spacing is `space-y-4`
- [ ] Labels have 4px gap to inputs
- [ ] Error shake enabled where appropriate
- [ ] Success feedback on submit

---

## Related Docs

- [design-tokens.md](./_patterns/design-tokens.md) - Token reference
- [animations.md](./animations.md) - Motion system
- [component-intent.md](./component-intent.md) - Component selection
- [mobile-ux.md](./mobile-ux.md) - Mobile patterns
