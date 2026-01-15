# Component Intent Catalog

> Guide for WHEN to use each component based on user intent, not just HOW to implement them.

---

## Quick Index

| I need to... | Section |
|--------------|---------|
| Choose any component | [#quick-decision-matrix](#quick-decision-matrix) |
| Design navigation | [#navigation-components](#navigation-components) |
| Add actions/buttons | [#action-components](#action-components) |
| Select from options | [#selection-components](#selection-components) |
| Display content | [#content-components](#content-components) |
| Show feedback | [#feedback-components](#feedback-components) |
| Collect input | [#input-components](#input-components) |
| Show overlays | [#overlay-components](#overlay-components) |
| Handle states | [#state-components](#state-components) |
| **Desktop decisions** | [#mobile-vs-desktop-decisions](#mobile-vs-desktop-decisions) |
| **Visual polish** | [#visual-polish-decisions](#visual-polish-decisions) |

**Complements:**
- [ux-design-philosophy.md](./ux-design-philosophy.md) - WHY behind decisions
- [wireframe-patterns.md](./wireframe-patterns.md) - Screen templates
- [mobile-ux.md](./mobile-ux.md) - Implementation patterns

---

## Quick Decision Matrix

### Master Intent-to-Component Map (2024-2025)

| User Intent | Use | NOT |
|-------------|-----|-----|
| Navigate between sections | `BottomTabBar` | Hamburger menu |
| Go back to previous | `AppHeader` (showBack) | Button alone |
| Perform primary action | `Button` (primary) | Badge |
| Perform destructive action | `Button` (danger) + `Modal` | Inline without confirm |
| Select from 2-4 options | Segmented control | Dropdown |
| Select from 5-7 options | Chips / radio buttons | Dropdown |
| Select from 8+ options | `BottomSheet` with search | Dropdown |
| Toggle a setting | `Toggle` | Dropdown single-select |
| View a data item | `Card` | Modal for display |
| Fill out a form | `FormField` + `Input` | Modal for each field |
| See status/category | `Badge` | Alert for labels |
| Wait for data (>1s) | `Skeleton` | Spinner |
| Wait for data (<1s) | Button spinner | Full skeleton |
| Handle empty state | `EmptyState` | Blank screen |
| Handle error state | `EmptyState` (error) + retry | Nothing |
| Quick action menu | `BottomSheet` | Centered modal |
| Confirm critical action | `Modal` | Toast |
| Multiple related actions | FAB Menu | Speed dial (deprecated) |

---

## Navigation Components

### Components: `BottomTabBar`, `AppHeader`

### Intent Matrix

| Component | User Intent | Signals to User | Max Complexity |
|-----------|-------------|-----------------|----------------|
| `BottomTabBar` | Switch between main sections | "These are your top-level destinations" | 3-5 tabs |
| `AppHeader` | Know location, go back, access actions | "You are here; you can go back" | 1 title + 2 actions |
| Swipe gesture | Quick back navigation | "You can go back with gesture" | 1 direction |

### Decision Tree

```
User needs to navigate...
│
├── Between major app sections? (Home, Profile, Inbox)
│   └── YES → BottomTabBar
│             - 3-5 tabs maximum
│             - Icons required, labels recommended
│             - Badge support for notifications
│
├── Back to previous screen?
│   ├── Within a detail flow? → AppHeader with showBack=true
│   ├── After completing action? → Server-side navigation
│   └── Quick gesture? → Swipe right action
│
├── To contextual actions on current page?
│   ├── 1-2 actions? → AppHeader actions slot
│   └── More actions? → BottomSheet
│
└── Between sub-sections of a page? (Chat, Files, Tasks)
    ├── 2-4 options? → Segmented control (inline tabs)
    └── More options? → BottomSheet
```

### Composition Patterns

| Pattern | Components | Purpose |
|---------|------------|---------|
| **App Shell** | `AppHeader` + content + `BottomTabBar` | Standard mobile structure |
| **Detail Page** | `AppHeader` (showBack) + content | Drill-down from list |
| **Header + Overflow** | `AppHeader` + `BottomSheet` trigger | Many contextual actions |

### Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Hamburger as primary nav | 65% lower engagement | `BottomTabBar` |
| More than 5 tabs | Cognitive overload | "More" tab pattern |
| Modal for navigation | Disrupts mental model | Routing |
| `BottomTabBar` + `BottomSheet` overlap | Gesture conflicts | Dismiss sheet first |
| Back button in tab bar | Tabs for sections, not history | `AppHeader` showBack |

### Complexity Limits

| Component | Limit | When Exceeded |
|-----------|-------|---------------|
| `BottomTabBar` | 5 tabs | Use "More" tab with secondary nav |
| `AppHeader` actions | 2 icons | Overflow into `BottomSheet` |
| Page depth | 3-4 levels | Flatten hierarchy |

---

## Action Components

### Components: `Button`, `IconButton`, FAB, FAB Menu

### Intent Matrix

| Component | User Intent | Signals to User | Max Per Screen |
|-----------|-------------|-----------------|----------------|
| `Button` (primary) | Main action | "This is what you should do" | 1 |
| `Button` (secondary) | Alternative action | "Here's another option" | 2-3 |
| `Button` (ghost) | Low-emphasis action | "Available but not primary" | Unlimited |
| `Button` (danger) | Destructive action | "Caution - can't be undone" | Always with confirm |
| `IconButton` | Quick single action | "Tap for this action" | Context-dependent |
| FAB | Primary creation action | "Create new item" | 1 |
| FAB Menu | Multiple related actions | "Choose an action" | 1 |

### Decision Tree

```
User needs to take an action...
│
├── Is this THE primary action on the page?
│   └── YES → Button variant="primary"
│             - Full width on mobile forms
│             - Only ONE per view
│
├── Is this destructive? (delete, remove, leave)
│   └── YES → Button variant="danger"
│             - ALWAYS pair with Modal confirmation
│
├── Is this cancel/dismiss?
│   └── YES → Button variant="ghost" or "secondary"
│
├── Is space constrained? (toolbar, card header)
│   └── YES → IconButton
│             - Must have aria-label
│             - 44x44px minimum touch target
│
├── Is this a floating creation action?
│   ├── Single action? → FAB
│   └── Multiple related? → FAB Menu (NOT speed dial)
│
└── Are there multiple actions for one item?
    ├── List item? → Swipe gesture OR long-press sheet
    └── Card? → Overflow `IconButton` + `BottomSheet`
```

### Button Variant Selection

| Scenario | Variant | Size | fullWidth |
|----------|---------|------|-----------|
| Form submit | primary | md/lg | true on mobile |
| Secondary action | secondary | md | false |
| Cancel/dismiss | ghost | md | false |
| Delete/remove | danger | md | false |
| Toolbar action | ghost | icon | false |
| Floating action | primary | lg (FAB) | false |

### Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Multiple primary buttons | Confuses priority | One primary + secondary/ghost |
| Danger without confirm | Accidental destruction | Modal or BottomSheet confirm |
| Icon-only without aria-label | Accessibility failure | Always add aria-label |
| Speed dial FAB | Deprecated in M3 | FAB Menu |
| Loading on ghost buttons | Low-value feedback | Reserve loading for primary |

### Complexity Limits

| Component | Limit | When Exceeded |
|-----------|-------|---------------|
| Buttons in a row | 3 | Group into `BottomSheet` |
| FAB Menu items | 5-7 | Split into categories |
| Actions per Card | 2 visible | Overflow to sheet |

---

## Selection Components

### Components: Segmented Control, Chips, `BottomSheet` with list

### Intent Matrix (NO DROPDOWNS ON MOBILE)

| Item Count | Component | Rationale |
|------------|-----------|-----------|
| 2-4 | Segmented control | All options visible |
| 5-7 | Chips or radio buttons | Scannable without scrolling |
| 8+ | `BottomSheet` + search | Scrollable with filtering |

### Decision Tree

```
User needs to select from options...
│
├── How many options?
│   ├── 2-4 → Segmented control
│   │         - All options visible at once
│   │         - Good for filters, view toggles
│   │
│   ├── 5-7 → Chips (single-select) or radio buttons
│   │         - Visible without scrolling
│   │         - Good for categories, settings
│   │
│   └── 8+ → BottomSheet with list
│             - Add search for 15+ items
│             - Scrollable, filterable
│
├── Multiple selections allowed?
│   └── YES → BottomSheet with checkboxes
│             - Show selection count
│             - "Done" button to confirm
│
└── Needs search/filtering?
    └── YES → BottomSheet with Input at top
```

### Anti-Patterns (CRITICAL)

| Avoid | Why | Instead |
|-------|-----|---------|
| **Dropdown menus** | 60% slower on mobile | Segmented/chips/sheet |
| Multi-select dropdown | Hard to use on touch | BottomSheet + checkboxes |
| Dropdown for 2 options | Overkill | Toggle or segmented |
| Date dropdown (3 fields) | Tedious | Native date picker |

### Composition Patterns

| Pattern | Components | Purpose |
|---------|------------|---------|
| **Filter chips** | Horizontal scroll chips | Quick filtering |
| **Settings group** | Radio buttons + labels | Mutually exclusive options |
| **Country selector** | `BottomSheet` + search | Large option list |
| **Multi-select** | `BottomSheet` + checkboxes | Multiple choices |

---

## Content Components

### Components: `Card`, `Avatar`, `Badge`

### Intent Matrix

| Component | User Intent | Signals to User | Max Complexity |
|-----------|-------------|-----------------|----------------|
| `Card` (elevated) | View highlighted content | "This is important" | 3 sections max |
| `Card` (outlined) | View standard item | "One item in a list" | 3 sections max |
| `Card` (flat) | View subdued content | "Background info" | 2 sections max |
| `Avatar` | Identify person/entity | "This represents someone" | Size = importance |
| `Badge` | See status/category | "This item has this property" | 2 per item typical |

### Decision Tree

```
Displaying content...
│
├── Is this a single item with rich details?
│   ├── Featured/important? → Card variant="elevated"
│   ├── Standard item? → Card variant="outlined"
│   └── Background info? → Card variant="flat"
│
├── Is this a list of items?
│   ├── Rich details per item? → Cards in list
│   ├── Simple data rows? → List rows (no Card)
│   └── 100+ items? → Virtual list
│
├── Showing a person or entity?
│   └── Avatar with size based on importance
│       - sm: lists
│       - md: cards
│       - lg: profile views
│
└── Showing status/category/count?
    └── Badge with appropriate variant
        - success: active, live, online
        - warning: pending, draft
        - error: failed, offline
        - neutral: category label
```

### Badge Variant Selection

| Status | Variant | Example |
|--------|---------|---------|
| Active/Live/Online | success | "Active" |
| Pending/Draft/Waiting | warning | "Pending" |
| Error/Failed/Offline | error | "Failed" |
| Info/New/Updated | info | "New" |
| Neutral/Category | neutral | "Category" |
| Feature/Pro | primary | "Pro" |

### Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Cards nested in Cards | Visual confusion | Flat hierarchy, sections |
| 3+ Badges per item | Information overload | Prioritize 1-2 most important |
| Avatar without fallback | Broken images | Always provide initials |
| Inconsistent Card variants | Visual chaos | One variant per list |

---

## Feedback Components

### Components: `Alert`, `EmptyState`, Toast

### Intent Matrix

| Component | User Intent | Signals to User | Max Complexity |
|-----------|-------------|-----------------|----------------|
| `Alert` (error) | Understand what went wrong | "This failed for this reason" | 1 title + description |
| `Alert` (warning) | Be cautioned | "Proceed with caution" | 1 title + description |
| `Alert` (success) | Confirm action worked | "Your action succeeded" | 1 title + description |
| `Alert` (info) | Learn something | "Here's info to know" | 1 title + description |
| Toast | Get ephemeral feedback | "Something happened" | Single message |
| `EmptyState` | Understand absence | "Nothing here (yet)" | Title + desc + CTA |

### Decision Tree

```
Providing feedback...
│
├── About a specific action they just took?
│   ├── Success? → Toast (ephemeral) OR Alert (if important)
│   ├── Failure? → Alert (error) inline near action
│   └── Warning before action? → Alert (warning) inline
│
├── About page/section state?
│   ├── No data exists? → EmptyState preset="default"
│   ├── Search found nothing? → EmptyState preset="search"
│   ├── Error loading data? → EmptyState preset="error"
│   ├── Offline? → EmptyState preset="offline"
│   └── All done? → EmptyState preset="success"
│
├── About an item's status?
│   └── Badge with appropriate variant
│
└── Ephemeral (should auto-dismiss)?
    ├── YES → Toast (5 seconds default)
    └── NO → Alert with dismissible=false
```

### Empty State Presets

| Scenario | Preset | Action |
|----------|--------|--------|
| No data yet | default | CTA to create first item |
| Search no results | search | Suggest alternatives |
| Error loading | error | Retry button |
| Offline | offline | Connection indicator |
| All done | success | Next step suggestion |

### Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Modal for error messages | Too disruptive | Alert inline or Toast |
| Toast for field errors | Not associated with field | FormField error |
| Alert for minor success | Alert fatigue | Toast |
| Empty page with nothing | User confusion | Always EmptyState |
| Stacking multiple Alerts | Visual overload | Consolidate |

---

## Input Components

### Components: `Input`, `Textarea`, `Toggle`, `FormField`

### Intent Matrix

| Component | User Intent | Signals to User | Max |
|-----------|-------------|-----------------|-----|
| `Input` (text) | Enter short text | "Type something here" | ~100 chars |
| `Input` (email/tel/url) | Enter formatted text | "Type this format" | Format-specific |
| `Input` (search) | Find something | "Search for items" | Query |
| `Textarea` | Enter long text | "Write more here" | No limit |
| `Toggle` | Turn something on/off | "This is on or off" | Single decision |
| `FormField` | Enter labeled data | "This field needs data" | Label + input + error |

### Decision Tree

```
User needs to provide input...
│
├── Simple on/off choice?
│   └── Toggle with label and description
│
├── Selecting from options?
│   └── See Selection Components (NOT dropdown)
│
├── Text entry?
│   ├── Short (name, email, phone)? → Input with appropriate type
│   │   - type="email" for emails
│   │   - type="tel" for phones
│   │   - inputmode="numeric" for numbers
│   │
│   ├── Long (bio, message)? → Textarea
│   └── Search query? → Input type="search" with icon
│
└── Needs validation feedback?
    └── Wrap in FormField
        - Set required if mandatory
        - Pass error prop for validation
```

### Input Type Selection

| Data | Input Type | inputmode |
|------|------------|-----------|
| Email | email | email |
| Phone | tel | tel |
| Numbers | text | numeric |
| URL | url | url |
| Password | password | - |
| Search | search | search |

### Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Dropdown for selection | 60% slower | Segmented/chips/sheet |
| Input without FormField | Missing label/error | Always wrap |
| Modal for each field | Disruptive | Single form page |
| `phx-change` on inputs | Round-trip latency | Svelte-only validation |

### Complexity Limits

| Component | Limit | When Exceeded |
|-----------|-------|---------------|
| Form fields per screen | 7-10 | Multi-step form |
| Toggles in a row | 5 | Group into categories |
| Textarea lines visible | 4-6 | Auto-grow or scroll |

---

## Overlay Components

### Components: `Modal`, `BottomSheet`

### Intent Matrix

| Component | User Intent | Signals to User | Max |
|-----------|-------------|-----------------|-----|
| `Modal` | Focus on critical task | "Complete this first" | 1 focused task |
| `BottomSheet` | See more options/details | "Here's more context" | 50-92% screen |

### Decision Tree

```
Need to show overlay content...
│
├── Critical/blocking action? (confirm delete, payment)
│   └── Modal
│       - size="sm" for confirms
│       - size="md" for forms
│       - Always closeable (escape, backdrop, X)
│
├── Additional options/details? (non-blocking)
│   ├── Quick action list (3-7 items)? → BottomSheet
│   ├── More content/options? → BottomSheet
│   └── Form or wizard? → BottomSheet (fitContent) OR Modal
│
├── Selection from large list?
│   ├── 8+ options? → BottomSheet with list
│   └── Needs search? → BottomSheet with Input + list
│
└── Mobile-specific:
    ├── Expects gesture dismissal? → BottomSheet (has drag)
    └── Thumb-friendly? → BottomSheet (bottom of screen)
```

### Composition Patterns

| Pattern | Components | Purpose |
|---------|------------|---------|
| **Delete Confirm** | Button (danger) + Modal | Safe destructive action |
| **Mobile Menu** | IconButton + BottomSheet | Touch-friendly actions |
| **Selection Sheet** | FormField trigger + BottomSheet | Many options |

### Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Modal for navigation | Modals for tasks only | Routing |
| Centered modals on mobile | Not thumb-friendly | BottomSheet |
| Nested overlays | UX nightmare | Flatten or wizard |
| BottomSheet for simple confirm | Overkill | Modal size="sm" |

---

## State Components

### Components: `Skeleton`, `EmptyState`

### Intent Matrix

| Component | User Intent | Signals to User |
|-----------|-------------|-----------------|
| `Skeleton` (text) | Wait for text | "Text is coming" |
| `Skeleton` (card) | Wait for card | "Card is coming" |
| `Skeleton` (avatar) | Wait for avatar | "Person info coming" |
| `EmptyState` | Understand empty | "Nothing here yet" |

### Decision Tree

```
Showing loading or empty state...
│
├── Data currently loading?
│   └── Skeleton
│       - Match expected content shape exactly
│       - variant="card" for cards
│       - variant="avatar" for user rows
│       - variant="text" with lines for paragraphs
│
├── Data loaded but empty?
│   ├── Initial empty? → EmptyState preset="default" + create CTA
│   ├── Search empty? → EmptyState preset="search" + suggestions
│   └── All done? → EmptyState preset="success"
│
└── Loading failed?
    ├── Network error? → EmptyState preset="offline"
    └── Server error? → EmptyState preset="error" + retry
```

### Loading Duration Rules

| Duration | Show |
|----------|------|
| 0-100ms | Nothing (avoid flash) |
| 100ms-1s | Button spinner only |
| 1s+ | Skeleton |

### Skeleton Variant Selection

| Loading Content | Variant | Props |
|-----------------|---------|-------|
| Text paragraph | text | lines={3} |
| Single line | text | lines={1} |
| User avatar + name | avatar | - |
| Card | card | size="md" |
| Profile picture | circle | size="lg" |
| Button placeholder | button | size="md" |

### Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Spinner for content | Not native-like | Skeleton |
| Skeleton doesn't match | Layout shift | Match exact shape |
| Blank while loading | Feels broken | Skeleton immediately |
| EmptyState without action | Dead end | Always provide CTA |

---

## Cross-Category Patterns

### Common Page Compositions

| Page Type | Component Stack |
|-----------|-----------------|
| **List Page** | AppHeader + Skeleton/EmptyState + Card list + BottomTabBar |
| **Detail Page** | AppHeader (showBack) + Skeleton/content + actions |
| **Form Page** | AppHeader + FormFields + Button (submit) |
| **Settings Page** | AppHeader + Toggle list + Card sections |
| **Profile Page** | AppHeader + Avatar (lg) + Card sections |

### Universal Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
|--------------|--------------|------------------|
| Spinner anywhere | Not native-like | Skeleton for content, button spinner for actions |
| Modal for navigation | Disrupts mental model | Router-based navigation |
| Dropdown on mobile | 60% slower | Segmented/chips/sheet |
| Multiple primary buttons | Unclear priority | One primary per view |
| Nested overlays | UX confusion | Flatten or steps |
| Form without validation | User frustration | FormField + inline errors |
| Empty state without CTA | Dead end | Always offer next action |
| Icon-only without label | Accessibility failure | aria-label always |

### Mobile vs Desktop Decisions

> For comprehensive desktop patterns, see [desktop-ux.md](./desktop-ux.md).

| User Intent | Mobile (Compact) | Desktop (Expanded+) |
|-------------|------------------|---------------------|
| Primary navigation | `BottomTabBar` | `Sidebar` |
| Secondary navigation | `AppHeader` actions | `DesktopHeader` actions |
| Action menu | `BottomSheet` | `Dropdown` |
| Multi-select | `BottomSheet` + checkboxes | `BottomSheet` or dialog |
| Form input | Full-width | Centered (max 640px) |
| List browsing | Single column | Split-pane or grid |
| View detail | Navigate to page | Show in split-pane |
| Modal content | Bottom sheet (slide up) | Centered dialog (scale in) |
| Quick menu | `BottomSheet` | `Dropdown` |
| Date picker | Native date input | Calendar popup |
| Long form | Multi-step with progress | Single page (if fits) |
| Context menu | Long-press + `BottomSheet` | Right-click + `Dropdown` |
| Tooltip | Tap to reveal OR omit | Hover |
| Data table | Cards or list view | Table with columns |
| Settings | Grouped list | Split-pane (categories left) |
| Dashboard | Stacked cards | Responsive grid (3-4 cols) |

### Desktop Layout Decisions

| Screen Type | Use Split-Pane? | Content Width |
|-------------|-----------------|---------------|
| Lists (inbox, projects) | Yes | Full + detail panel |
| Settings | Yes | Categories left, form right |
| Forms (create, edit) | No | Centered (640px max) |
| Dashboard | No | Full (1024px max), use grid |
| Detail view | Context-dependent | Centered or in split |

### Breakpoint Behavior

| Viewport | Navigation | Layout | Modal Style |
|----------|------------|--------|-------------|
| Compact (<600px) | BottomTabBar | Single column | Bottom sheet |
| Medium (600-839px) | Sidebar | Optional split | Bottom or center |
| Expanded (840px+) | Sidebar | Split-pane active | Centered dialog |
| Large (1024px+) | Sidebar | Max-width constrained | Centered dialog |

---

## Visual Polish Decisions

> For comprehensive visual system details, see [visual-design-system.md](./visual-design-system.md).

### Micro-Interaction Decisions

| User Intent | Visual Feedback | Component Feature |
|-------------|-----------------|-------------------|
| Press a button | Scale down briefly | `Button` has `active:scale-95` |
| Press icon button | Scale down (smaller) | `IconButton` has `active:scale-90` |
| Hover clickable card | Lift and shadow | `Card` with `interactive` prop |
| Submit form with error | Shake field | `FormField` with `shake` prop |
| See success confirmation | Pop-in animation | `Alert` with `animate` prop |
| Wait for content | Pulse or shimmer | `Skeleton` with optional `shimmer` prop |

### Elevation Decisions

| Element Type | Shadow Level | Token |
|--------------|--------------|-------|
| Page background | None | flat |
| Cards, buttons | Subtle | `shadow-sm` |
| Dropdown menus | Medium | `shadow-md` |
| Popovers, tooltips | Elevated | `shadow-lg` |
| Modals, dialogs | High | `shadow-xl` |

### Loading State Decisions

| Load Duration | Use | Pattern |
|---------------|-----|---------|
| <1s | Button spinner | `Button` with `loading` prop |
| 1-3s | Skeleton pulse | `Skeleton` default |
| 3s+ | Skeleton shimmer | `Skeleton` with `shimmer` prop |
| Image load | Shimmer placeholder | `Skeleton variant="rect" shimmer` |

### Animation Duration Decisions

| Action Type | Duration | Token |
|-------------|----------|-------|
| Button press | 100ms | `--duration-fast` |
| Hover effects | 150ms | `--duration-hover` |
| State changes | 200ms | `--duration-normal` |
| Modal open/close | 300ms | `--duration-slow` |

---

## Related Docs

- [ux-design-philosophy.md](./ux-design-philosophy.md) - WHY behind decisions
- [wireframe-patterns.md](./wireframe-patterns.md) - Screen templates
- [mobile-ux.md](./mobile-ux.md) - Mobile implementation patterns
- [desktop-ux.md](./desktop-ux.md) - Desktop patterns and layouts
- [visual-design-system.md](./visual-design-system.md) - Visual polish and design tokens
- [adaptive-layouts.md](../_patterns/adaptive-layouts.md) - Layout transformations
- [frontend-svelte.md](./frontend-svelte.md) - Component implementation
