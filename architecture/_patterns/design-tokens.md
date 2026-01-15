# Design Tokens Reference

> Quick reference for all design tokens with copy-paste values.

## Shadows

```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.06);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.04);
```

**Usage:**

| Token | Tailwind | Use For |
|-------|----------|---------|
| xs | `shadow-xs` | Subtle depth |
| sm | `shadow-sm` | Cards, inputs |
| md | `shadow-md` | Hover, dropdowns |
| lg | `shadow-lg` | Popovers |
| xl | `shadow-xl` | Modals |

---

## Typography

### Font Sizes

```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Letter Spacing

```css
--tracking-tighter: -0.05em;  /* Display */
--tracking-tight: -0.025em;   /* Headings */
--tracking-normal: 0;
--tracking-wide: 0.025em;     /* Micro */
```

---

## Spacing (4px Grid)

```css
--space-px: 1px;
--space-0: 0;
--space-0-5: 0.125rem;  /* 2px */
--space-1: 0.25rem;     /* 4px */
--space-1-5: 0.375rem;  /* 6px */
--space-2: 0.5rem;      /* 8px */
--space-2-5: 0.625rem;  /* 10px */
--space-3: 0.75rem;     /* 12px */
--space-3-5: 0.875rem;  /* 14px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-7: 1.75rem;     /* 28px */
--space-8: 2rem;        /* 32px */
--space-9: 2.25rem;     /* 36px */
--space-10: 2.5rem;     /* 40px */
--space-11: 2.75rem;    /* 44px */
--space-12: 3rem;       /* 48px */
--space-14: 3.5rem;     /* 56px */
--space-16: 4rem;       /* 64px */
```

---

## Component Heights

```css
--height-sm: 2rem;       /* 32px */
--height-md: 2.5rem;     /* 40px */
--height-lg: 3rem;       /* 48px */
--height-touch: 2.75rem; /* 44px */
```

---

## Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* pill/circle */
```

---

## Animation Durations

```css
--duration-instant: 0ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;

/* Micro-interactions */
--duration-press: 100ms;
--duration-hover: 150ms;
--duration-focus: 150ms;
```

---

## Easing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## Interaction Feedback

```css
/* Scale transforms */
--scale-press: 0.95;
--scale-press-sm: 0.90;
--scale-hover-lift: 1.02;

/* Translate transforms */
--lift-hover: -2px;
--lift-active: -1px;

/* Opacity states */
--opacity-disabled: 0.5;
--opacity-hover: 0.9;
--opacity-muted: 0.6;
```

---

## State Colors

```css
/* Light mode */
--state-hover: rgb(0 0 0 / 0.04);
--state-active: rgb(0 0 0 / 0.08);
--state-focus: rgb(0 0 0 / 0.12);
--state-selected: rgb(0 0 0 / 0.08);

/* Dark mode */
--state-hover: rgb(255 255 255 / 0.04);
--state-active: rgb(255 255 255 / 0.08);
--state-focus: rgb(255 255 255 / 0.12);
--state-selected: rgb(255 255 255 / 0.08);
```

---

## Z-Index Scale

```css
--z-hide: -1;
--z-base: 0;
--z-raised: 10;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-popover: 1040;
--z-modal-backdrop: 1050;
--z-modal: 1060;
--z-tooltip: 1070;
--z-toast: 1080;
```

---

## Animation Classes

```css
.animate-shake       /* Error feedback */
.animate-shimmer     /* Loading shimmer */
.animate-success-pop /* Success feedback */
.animate-pulse-subtle
.animate-fade-in
.animate-slide-up
.animate-scale-in
```

---

## Utility Classes

```css
/* Press feedback */
.press-feedback      /* Button press (scale-95) */
.press-feedback-sm   /* Icon press (scale-90) */

/* Hover effects */
.hover-lift          /* Card hover (lift + shadow) */

/* Focus */
.focus-ring          /* Visible focus ring */

/* Typography */
.text-display
.text-heading
.text-title
.text-subtitle
.text-body
.text-caption
.text-micro

/* Safe areas (PWA) */
.pb-safe
.pt-safe
.pl-safe
.pr-safe
```

---

## Copy-Paste Patterns

### Button Press Feedback

```css
transition-all duration-150
active:scale-95
```

### Card Hover Lift

```css
transition-all duration-150
hover:shadow-md hover:-translate-y-0.5
active:translate-y-0 active:shadow-sm
```

### Focus Ring

```css
focus-visible:outline-none
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

### Disabled State

```css
disabled:pointer-events-none disabled:opacity-50
```
