# Wireframe Pattern Library

> Practical screen templates for mobile-first PWA design. Copy and adapt these patterns.

---

## Quick Index

| I need a... | Section |
|-------------|---------|
| List/browse screen | [#list-screen](#list-screen) |
| Detail/view screen | [#detail-screen](#detail-screen) |
| Form/action screen | [#action-screen](#action-screen) |
| Empty/error state | [#empty-error-states](#empty-error-states) |
| Onboarding flow | [#onboarding](#onboarding) |
| Header pattern | [#header-patterns](#header-patterns) |
| Footer pattern | [#footer-patterns](#footer-patterns) |
| Screen flow | [#screen-flows](#screen-flows) |

**Complements:**
- [ux-design-philosophy.md](./ux-design-philosophy.md) - WHY behind decisions
- [component-intent.md](./component-intent.md) - Component selection
- [mobile-ux.md](./mobile-ux.md) - Implementation patterns

---

## List Screen

**Purpose:** Display collections of items for browsing, filtering, and selection.

### Template

```
+----------------------------------------+
| [<] Title                    [?] [...] |  <- AppHeader (56px)
+----------------------------------------+
| [Search input............] [Filter]    |  <- Search bar (48px)
+----------------------------------------+
| [All] [New] [Category] [...]           |  <- Filter chips (40px)
+----------------------------------------+
|                                        |
| +------------------------------------+ |
| | [A] Item Title                     | |  <- List item (72px min)
| |     Subtitle / metadata      [>]   | |
| +------------------------------------+ |
|                                        |
| +------------------------------------+ |
| | [B] Item Title                     | |
| |     Subtitle / metadata      [>]   | |
| +------------------------------------+ |
|                                        |
| +------------------------------------+ |
| | [C] Item Title                     | |
| |     Subtitle / metadata      [>]   | |
| +------------------------------------+ |
|                                        |
|          (Infinite scroll)             |
|                                        |
|                                 (+)    |  <- FAB (optional)
+----------------------------------------+
|  [Home] [Search] [Add] [Inbox] [Me]    |  <- BottomTabBar (56px + safe)
+----------------------------------------+
```

### Component Mapping

| Zone | Component | Notes |
|------|-----------|-------|
| Header | `AppHeader` | `showBack`, `actions` slot |
| Search | `Input` | `type="search"`, leading icon |
| Filters | `Badge` group | Horizontal scroll |
| List Items | `Card` or custom | `variant="flat"`, swipeable |
| Loading | `Skeleton` | `variant="avatar"` |
| Empty | `EmptyState` | `preset="search"` or `preset="default"` |
| FAB | FAB component | Single primary action |
| Navigation | `BottomTabBar` | 3-5 tabs |

### Variations

**With Search Active:**
```
+----------------------------------------+
| [X] Search query...                    |  <- Search takes over
+----------------------------------------+
| Recent:                                |
| - Previous search 1                    |
| - Previous search 2                    |
|                                        |
| Suggestions:                           |
| - Suggested term 1                     |
| - Suggested term 2                     |
+----------------------------------------+
```

**Grid Layout:**
```
+----------------------------------------+
| Title                                  |
+----------------------------------------+
| +--------+  +--------+  +--------+     |
| |  Card  |  |  Card  |  |  Card  |     |
| |   1    |  |   2    |  |   3    |     |
| +--------+  +--------+  +--------+     |
|                                        |
| +--------+  +--------+  +--------+     |
| |  Card  |  |  Card  |  |  Card  |     |
| |   4    |  |   5    |  |   6    |     |
| +--------+  +--------+  +--------+     |
+----------------------------------------+
```

---

## Detail Screen

**Purpose:** Display comprehensive information about a single entity.

### Template

```
+----------------------------------------+
| [<] Back          Item Name      [...] |  <- AppHeader
+----------------------------------------+
|                                        |
|     +----------------------------+     |
|     |                            |     |
|     |         [HERO IMAGE]       |     |  <- Media (16:9 ratio)
|     |          or Avatar         |     |
|     |                            |     |
|     +----------------------------+     |
|                                        |
|  Primary Title                         |
|  Secondary info / status     [Badge]   |
|                                        |
+----------------------------------------+
|  [Overview] [Details] [Activity]       |  <- Inline tabs (optional)
+----------------------------------------+
|                                        |
|  Section Header                        |
|  +----------------------------------+  |
|  | Label                      Value |  |  <- Info row (48px)
|  +----------------------------------+  |
|  | Label                      Value |  |
|  +----------------------------------+  |
|  | Label                      Value |  |
|  +----------------------------------+  |
|                                        |
|  Section Header                        |
|  +----------------------------------+  |
|  |  Description text that may       |  |
|  |  wrap to multiple lines...       |  |
|  +----------------------------------+  |
|                                        |
+----------------------------------------+
|                                        |
|  [ Secondary ]         [ Primary ]     |  <- Sticky footer
|                                        |
+----------------------------------------+
```

### Component Mapping

| Zone | Component | Notes |
|------|-----------|-------|
| Header | `AppHeader` | `showBack: true`, contextual actions |
| Hero | `<img>` or `Avatar` | `aspect-ratio`, skeleton on load |
| Title Area | Typography | h1 + muted subtitle |
| Tabs | Custom tab component | Preserve scroll per tab |
| Info Rows | Custom list | 48px height, right-aligned values |
| Description | `Card` | `variant="flat"`, `padding="md"` |
| Actions | `Button` | Sticky if critical |

### Variations

**Profile View:**
```
+----------------------------------------+
| [<]                              [...]  |
+----------------------------------------+
|                                        |
|              [AVATAR]                  |  <- Large, centered
|           John Smith                   |
|           @johnsmith                   |
|                                        |
|     Following: 234    Followers: 567   |
|                                        |
|         [ Follow ]  [ Message ]        |
|                                        |
+----------------------------------------+
|  [Posts] [Media] [Likes]               |
+----------------------------------------+
|                                        |
|  Post content...                       |
|                                        |
+----------------------------------------+
```

**Media Detail:**
```
+----------------------------------------+
|                              [X]       |  <- Close button
+----------------------------------------+
|                                        |
|                                        |
|     +----------------------------+     |
|     |                            |     |
|     |       [FULL IMAGE]         |     |  <- Pinch to zoom
|     |                            |     |
|     +----------------------------+     |
|                                        |
|                                        |
+----------------------------------------+
|  Caption text here                     |
|  Posted by User • 2h ago               |
+----------------------------------------+
|  [Like]  [Comment]  [Share]  [Save]    |
+----------------------------------------+
```

---

## Action Screen

**Purpose:** Capture user input through forms or confirmations.

### Single-Step Form

```
+----------------------------------------+
| [Cancel]        Create         [Save]  |  <- AppHeader
+----------------------------------------+
|                                        |
|  +----------------------------------+  |
|  | Label *                          |  |  <- FormField
|  | +------------------------------+ |  |
|  | | Input value                  | |  |  <- Input (44px min)
|  | +------------------------------+ |  |
|  | Helper text or error message    |  |
|  +----------------------------------+  |
|                                        |
|  +----------------------------------+  |
|  | Label                            |  |
|  | +------------------------------+ |  |
|  | | Selected option           [v]| |  |  <- BottomSheet trigger
|  | +------------------------------+ |  |
|  +----------------------------------+  |
|                                        |
|  +----------------------------------+  |
|  | Label                            |  |
|  | +------------------------------+ |  |
|  | | Textarea for longer...       | |  |
|  | | content that wraps           | |  |
|  | +------------------------------+ |  |
|  +----------------------------------+  |
|                                        |
|  +----------------------------------+  |
|  | Toggle setting           [ ON ]  |  |  <- Toggle row
|  +----------------------------------+  |
|                                        |
+----------------------------------------+
|                                        |
|       [ Save Changes ]                 |  <- Primary action (sticky)
|                                        |
+----------------------------------------+
```

### Multi-Step Form

```
+----------------------------------------+
| [<]             Step 1 of 3            |  <- AppHeader
+----------------------------------------+
|  [ * ]----[   ]----[   ]               |  <- Progress indicator
+----------------------------------------+
|                                        |
|  Step Title                            |
|  Brief description of this step        |
|                                        |
|  +----------------------------------+  |
|  | Field 1 *                        |  |
|  | +------------------------------+ |  |
|  | | Input                        | |  |
|  | +------------------------------+ |  |
|  +----------------------------------+  |
|                                        |
|  +----------------------------------+  |
|  | Field 2                          |  |
|  | +------------------------------+ |  |
|  | | Input                        | |  |
|  | +------------------------------+ |  |
|  +----------------------------------+  |
|                                        |
+----------------------------------------+
|                                        |
|      [Back]            [Continue]      |  <- Navigation
|                                        |
+----------------------------------------+
```

### Component Mapping

| Zone | Component | Notes |
|------|-----------|-------|
| Header | `AppHeader` | Cancel/Back left, Save/action right |
| Progress | Custom | Dots or bar, show current step |
| Form Fields | `FormField` + `Input` | Single column, stack vertically |
| Toggles | `Toggle` | Full-width row with label |
| Selection | BottomSheet trigger | NOT dropdown |
| Actions | `Button` | Sticky footer, primary right-aligned |

---

## Empty/Error States

### Default Empty

```
+----------------------------------------+
|                                        |
|                                        |
|           ( O )                        |  <- Icon (64px)
|                                        |
|      No items yet                      |  <- Title
|  Create your first item                |  <- Description
|       to get started                   |
|                                        |
|        [ Get Started ]                 |  <- Primary CTA
|                                        |
|                                        |
+----------------------------------------+
```

### Search Empty

```
+----------------------------------------+
|                                        |
|           (  ?  )                      |
|                                        |
|   No results for "query"               |
|                                        |
|   Try different terms or               |
|   check your spelling                  |
|                                        |
|     [ Clear search ]                   |
|                                        |
+----------------------------------------+
```

### Error State

```
+----------------------------------------+
|                                        |
|           ( ! )                        |
|                                        |
|    Something went wrong                |
|                                        |
|   We couldn't load this page.          |
|   Please try again.                    |
|                                        |
|          [ Retry ]                     |
|                                        |
+----------------------------------------+
```

### Offline State

```
+----------------------------------------+
|                                        |
|        ( ))) )                         |  <- Signal icon
|                                        |
|    You're offline                      |
|                                        |
|   Check your connection                |
|   and try again                        |
|                                        |
|          [ Retry ]                     |
|                                        |
+----------------------------------------+
```

### Success/Complete State

```
+----------------------------------------+
|                                        |
|           ( ✓ )                        |
|                                        |
|       All done!                        |
|                                        |
|   You've completed all your            |
|   tasks for today.                     |
|                                        |
|     [ See completed ]                  |
|                                        |
+----------------------------------------+
```

---

## Onboarding

### Template

```
+----------------------------------------+
|                                   Skip |  <- Optional skip
+----------------------------------------+
|                                        |
|                                        |
|     +----------------------------+     |
|     |                            |     |
|     |       [ILLUSTRATION]       |     |  <- Visual (40% height)
|     |                            |     |
|     +----------------------------+     |
|                                        |
|                                        |
|           Feature Title                |  <- Centered title
|                                        |
|    Brief description explaining        |  <- Centered description
|    the value proposition of            |
|    this feature clearly                |
|                                        |
|                                        |
|             [ o ] [ o ] [ * ]          |  <- Page indicators
|                                        |
+----------------------------------------+
|                                        |
|           [ Continue ]                 |  <- Primary action
|                                        |
+----------------------------------------+
```

### Rules

- 3-5 screens maximum
- One concept per screen
- Visual takes 40% of screen
- Large, readable text
- Skip option visible but not prominent
- Final screen has CTA to main app

---

## Header Patterns

### Standard

```
+----------------------------------------+
| [<] Title                        [...] |
+----------------------------------------+
```

### Large Title (iOS-style)

```
+----------------------------------------+
| [<]                              [...] |
+----------------------------------------+
| Large Title                            |
+----------------------------------------+
```
Collapses to standard on scroll.

### Search Header

```
+----------------------------------------+
| [Search input.....................] [X]|
+----------------------------------------+
```

### Contextual

```
+----------------------------------------+
| [Cancel]        Title           [Save] |
+----------------------------------------+
```

### Selection Mode

```
+----------------------------------------+
| [Cancel]     3 selected         [Done] |
+----------------------------------------+
```

---

## Footer Patterns

### Single Action

```
+----------------------------------------+
|                                        |
|            [ Primary Action ]          |
|                                        |
+----------------------------------------+
```

### Dual Actions

```
+----------------------------------------+
|                                        |
|    [Secondary]         [Primary]       |
|                                        |
+----------------------------------------+
```

### Chat Input

```
+----------------------------------------+
|  [Input message...............] [Send] |
+----------------------------------------+
```

### Destructive Confirmation

```
+----------------------------------------+
|                                        |
|  [ Cancel ]          [ Delete ]        |
|                                        |
+----------------------------------------+
```

### Rules

- ALWAYS include `safe-area-inset-bottom` padding
- Primary action on right or full-width
- Destructive actions use error color
- Height: 56px + safe area minimum

---

## FAB Placement

```
+----------------------------------------+
|                                        |
|  List content                          |
|                                        |
|                                        |
|                                        |
|                                 (+)    |  <- 16px from edge
|                                        |
+----------------------------------------+
|  [Tab] [Tab] [Tab] [Tab]               |
+----------------------------------------+

FAB: 16px from right, 16px above tab bar
Size: 56px diameter
```

---

## Screen Flows

### List to Detail

```
List Screen              -->        Detail Screen
+------------------+                +------------------+
| Title            |                | [<] Item Title   |
+------------------+                +------------------+
| [Search...]      |                |                  |
+------------------+   TAP ITEM     |  [HERO IMAGE]    |
| > Item A         |  ---------->   |                  |
| > Item B [*]     |                |  Item B Title    |
| > Item C         |                |  Details...      |
+------------------+                +------------------+
| [Tab bar]        |                | [Tab bar]        |
+------------------+                +------------------+

Animation: fly in from right (x: 30px, 300ms)
Back: fly out to right (x: 30px, 250ms)
```

### Create Flow

```
Step 1               Step 2               Step 3 (Review)
+----------------+   +----------------+   +----------------+
| Step 1 of 3    |   | Step 2 of 3    |   | Step 3 of 3    |
+----------------+   +----------------+   +----------------+
| [*]--[ ]--[ ]  |   | [*]--[*]--[ ]  |   | [*]--[*]--[*]  |
+----------------+   +----------------+   +----------------+
|                |   |                |   |                |
| Name: ____     |   | Details: ___   |   | Review:        |
|                |   |                |   | Name: Foo      |
| Email: ____    |   | Options: ___   |   | Email: bar@... |
|                |   |                |   |                |
+----------------+   +----------------+   +----------------+
|   [Continue]   |   | [Back] [Cont.] |   | [Back] [Save]  |
+----------------+   +----------------+   +----------------+
```

### Search Flow

```
Initial                Search Active         Results
+----------------+     +----------------+    +----------------+
| Title    [Q]   |     | [X] Search... |    | [X] "query"    |
+----------------+     +----------------+    +----------------+
|                |     |                |    | [Filters]      |
| Browse items   | --> | Recent:        | -> +----------------+
|                |     | - Query 1      |    | Result 1       |
| ...            |     | - Query 2      |    | Result 2       |
|                |     |                |    | Result 3       |
+----------------+     | Suggestions:   |    +----------------+
| [Tab bar]      |     | - Suggest 1    |    | [Tab bar]      |
+----------------+     +----------------+    +----------------+
```

---

## Spacing and Rhythm

### Base Unit: 8px Grid

| Element | Spacing |
|---------|---------|
| Screen padding (horizontal) | 16px |
| Between sections | 24px |
| Between related items | 8px |
| Between list items | 1px border or 8px gap |
| Input/button height | 44-48px min |
| List item height | 72px min (with avatar) |
| Card padding | 16px |

### Vertical Rhythm

```
+----------------------------------------+
|             16px padding               |
+----------------------------------------+
| Section Header                         |  <- 8px below header
| +----------------------------------+   |
| | List Item (72px)                 |   |  <- Items touch or 1px
| +----------------------------------+   |
| | List Item (72px)                 |   |
| +----------------------------------+   |
|             24px spacing               |  <- Between sections
| Section Header                         |
| +----------------------------------+   |
| | Content                          |   |
| +----------------------------------+   |
+----------------------------------------+
```

---

## Data Density Guidelines

### Items Per View

| Context | Visible Items |
|---------|---------------|
| Feed (cards) | 2-3 complete, show partial 4th |
| List (rows) | 5-7 (72px items) |
| Grid (thumbnails) | 6-9 (2-3 columns) |
| Compact list | 8-10 (48px items) |

### Fields Per Form

| Form Type | Max Fields |
|-----------|------------|
| Login | 2-3 |
| Registration | 4-5 (split if more) |
| Profile edit | 5-6 (group into sections) |
| Complex form | 3-4 per step |

### Actions Per Screen

| Location | Max |
|----------|-----|
| Header | 2 |
| Footer | 2 |
| FAB | 1 |
| Per list item | 2-3 (via swipe/long-press) |

---

## Safe Areas

```
With Notch (iOS):
+------------------------+
|   safe-area-inset-top  |  <- Status bar / notch
+------------------------+
| Header                 |
+------------------------+
|                        |
| Content                |
|                        |
+------------------------+
| Footer                 |
+------------------------+
| safe-area-inset-bottom |  <- Home indicator
+------------------------+
```

### CSS

```css
.app-shell {
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.bottom-nav {
  height: calc(56px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## Adaptive Layouts (Foldable)

### Window Size Classes

| Class | Width | Layout |
|-------|-------|--------|
| Compact | <600dp | Single pane |
| Medium | 600-840dp | Optional split |
| Expanded | >840dp | List-detail split |

### Expanded Layout

```
+---------------------------+---------------------------+
| [<] List                  | Detail                    |
+---------------------------+---------------------------+
| [Search...]               |                           |
+---------------------------+   [HERO IMAGE]            |
| > Item A                  |                           |
| > Item B [*] <-- selected |   Item B Title            |
| > Item C                  |   Details...              |
| > Item D                  |                           |
|                           |   [ Action ]              |
+---------------------------+---------------------------+
| [Tab bar]                                             |
+-------------------------------------------------------+
```

---

## Dark Mode Schemes

### Color Mapping

| Element | Light | Dark |
|---------|-------|------|
| Background | #FFFFFF | #121212 |
| Surface | #F5F5F5 | #1E1E1E |
| Card | #FFFFFF | #2D2D2D |
| Primary text | #000000 | #FFFFFF |
| Secondary text | #666666 | #A0A0A0 |
| Divider | #E0E0E0 | #3D3D3D |

### Visual Example

```
Light Mode:                  Dark Mode:
+------------------+         +------------------+
| [White Header]   |         | [Dark Header]    |
+------------------+         +------------------+
|                  |         |                  |
| [White Card]     |         | [Dark Card]      |
|  Black text      |         |  White text      |
|  Gray metadata   |         |  Gray metadata   |
|                  |         |                  |
| [White Card]     |         | [Dark Card]      |
|                  |         |                  |
+------------------+         +------------------+
| [Tab bar]        |         | [Tab bar]        |
+------------------+         +------------------+
```

---

## Quick Reference

### Screen Type Decision

| User Goal | Screen Type | Key Components |
|-----------|-------------|----------------|
| Browse many items | List | Search, Filters, Infinite scroll |
| View one item | Detail | Hero, Tabs, Info rows |
| Create/edit | Action | Form fields, Validation |
| Configure | Settings | Grouped toggles |
| Learn feature | Onboarding | Illustrations, Pagination |

### Layout Rules

| Rule | Always | Never |
|------|--------|-------|
| Touch targets | >= 44x44px | < 24px |
| Safe areas | Use `env()` | Hardcode values |
| Primary action | Bottom 50% | Top of screen |
| Form fields | Single column | Multi-column mobile |
| Loading | Skeleton | Spinner for content |
| Empty states | With CTA | Blank screen |

---

## Related Docs

- [ux-design-philosophy.md](./ux-design-philosophy.md) - WHY behind decisions
- [component-intent.md](./component-intent.md) - Component selection
- [mobile-ux.md](./mobile-ux.md) - Implementation patterns
- [animations.md](./animations.md) - Motion patterns
