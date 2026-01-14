# UX Design Philosophy

> The WHY behind mobile-first UX decisions. Read this to make informed component and layout choices.

---

## Quick Index

| I need to understand... | Section |
|-------------------------|---------|
| Mobile vs desktop thinking | [#mobile-first-mindset](#mobile-first-mindset) |
| Choosing action prominence | [#user-intent-framework](#user-intent-framework) |
| How much to show per screen | [#cognitive-load-management](#cognitive-load-management) |
| What to emphasize visually | [#data-hierarchy-principles](#data-hierarchy-principles) |
| Where users look on mobile | [#attention-flow-design](#attention-flow-design) |
| Desktop patterns to avoid | [#mobile-anti-patterns](#mobile-anti-patterns) |
| Quick decision tables | [#decision-frameworks](#decision-frameworks) |

**Complements:** This doc explains WHY. For HOW, see:
- [mobile-ux.md](./mobile-ux.md) - Implementation patterns
- [component-intent.md](./component-intent.md) - Component selection
- [wireframe-patterns.md](./wireframe-patterns.md) - Screen templates

---

## Mobile-First Mindset

Mobile UX is fundamentally different from desktop web. Users have different contexts, constraints, and expectations.

### The Context Shift

| Desktop User | Mobile User |
|--------------|-------------|
| Dedicated attention | Interrupted attention |
| Mouse precision (1px) | Thumb imprecision (44px) |
| Horizontal viewport | Vertical viewport |
| Keyboard shortcuts | Gesture vocabulary |
| Multi-window | Single focus |
| Sitting, stable | Moving, one-handed |
| Large display real estate | Precious screen space |

### Mobile-First Principles

| Principle | Meaning | Evidence |
|-----------|---------|----------|
| **Thumb-first** | Design for one-handed use | 18% usage increase (Wroblewski) |
| **Glanceable** | Information at a glance | Key data without scrolling |
| **Interruptible** | Assume interruption | Auto-save, maintain state |
| **Touch-native** | Native gesture vocabulary | Swipe to delete, pull to refresh |
| **Bandwidth-aware** | Assume poor connectivity | Optimistic updates, offline queue |

### The Thumb Zone

```
     HARD          OK           HARD
    ┌─────────────────────────────────┐
    │                                 │
    │          STRETCH                │  <- Rare actions, settings
    │                                 │
    ├─────────────────────────────────┤
    │                                 │
    │           EASY                  │  <- Secondary actions
    │                                 │
    ├─────────────────────────────────┤
    │                                 │
    │        NATURAL                  │  <- Primary actions here
    │                                 │
    └─────────────────────────────────┘
           (Right thumb shown)
```

### Thumb Zone Action Placement

| Action Frequency | Placement | Examples |
|------------------|-----------|----------|
| Very frequent (10+/session) | Bottom center, natural zone | Send, like, navigate |
| Frequent (3-10/session) | Easy zone, bottom corners | Filter, search, new |
| Occasional (1-3/session) | Upper area, OK zone | Settings, profile |
| Rare (<1/session) | Top corners, stretch zone | Account, help |

### Native App Patterns to Embrace

| Pattern | Why It Works | Implementation |
|---------|--------------|----------------|
| Bottom navigation | Thumb-reachable | BottomTabBar (3-5 tabs) |
| Pull-to-refresh | Intuitive refresh | Custom pull gesture |
| Swipe actions | Fast, discoverable | Swipe action on list items |
| Bottom sheets | Context without navigation | BottomSheet component |
| Haptic feedback | Confirms interaction | Vibration API |

### Web Patterns to Avoid on Mobile

| Desktop Pattern | Why It Fails | Mobile Alternative |
|-----------------|--------------|-------------------|
| Hover menus | No hover on touch | Tap menus, bottom sheets |
| Right-click context | No right-click | Long press, swipe reveal |
| Tiny close buttons | Hard to tap | Large dismiss zones |
| Horizontal scroll tables | Awkward thumb motion | Card-based lists |
| Fixed sidebars | Wastes viewport | Collapsible drawer |
| Multi-column forms | Hard to focus | Single column always |

---

## User Intent Framework

Every screen has a purpose. Identify it, then design around it.

### The Intent Hierarchy

```
┌─────────────────────────────────────────┐
│  PRIMARY INTENT                         │
│  What users came here to DO             │
│  (One thing. Maximum prominence.)       │
├─────────────────────────────────────────┤
│  SECONDARY INTENT                       │
│  What users might also need             │
│  (2-3 things. Visible but secondary.)   │
├─────────────────────────────────────────┤
│  TERTIARY INTENT                        │
│  Edge cases and advanced options        │
│  (Hidden behind menus, settings.)       │
└─────────────────────────────────────────┘
```

### Intent Identification Questions

Ask these in order:

1. **Why did the user navigate here?** (Primary intent)
2. **What would block them from completing that?** (Required supporting)
3. **What might they want to do next?** (Secondary intent)
4. **What power users might need?** (Tertiary intent)

### Intent-to-Component Mapping

| Intent Level | Component Choice | Visual Weight |
|--------------|------------------|---------------|
| Primary | FAB, prominent button, primary CTA | High contrast, large |
| Secondary | Standard buttons, text links | Normal weight |
| Tertiary | Overflow menu, settings | Hidden, muted |

### Screen-by-Screen Intent Examples

| Screen | Primary Intent | Secondary | Tertiary |
|--------|---------------|-----------|----------|
| Inbox | Read/respond to messages | Search, filter | Archive, settings |
| Dashboard | View key metrics | Navigate to details | Customize layout |
| Profile | Edit personal info | View activity | Delete account |
| Chat | Send message | View info, media | Report, block |
| Project list | Open a project | Create new | Sort, bulk actions |

### Intent Conflicts (Red Flags)

If you cannot identify ONE primary intent, the screen is trying to do too much.

| Symptom | Problem | Solution |
|---------|---------|----------|
| Multiple prominent CTAs | Competing primaries | Pick one, demote others |
| Everything feels important | No hierarchy | Establish clear primary |
| User confusion in testing | Intent unclear | Simplify scope |
| "Kitchen sink" screen | Feature creep | Split into screens |

### Decision Framework: Should This Be on This Screen?

```
Is this the PRIMARY reason users visit this screen?
├─ YES → Make it prominent, easy to reach
└─ NO
   ├─ Is it required to complete the primary task?
   │  ├─ YES → Keep visible, but secondary
   │  └─ NO
   │     ├─ Do 20%+ of users need it?
   │     │  ├─ YES → Keep, but less prominent
   │     │  └─ NO → Move to menu/settings
```

---

## Cognitive Load Management

Users cannot process unlimited information. Respect their mental bandwidth.

### Cognitive Load Principles

**DON'T:** "Limit to 7±2 items" (misapplication of Miller's Law)

**DO:** "Chunk information into digestible groups using whitespace, headings, and progressive disclosure"

Miller's Law is about **chunking information for working memory**, not imposing arbitrary numeric limits.

### Maximum Complexity Guidelines

| Element Type | Guideline | Rationale |
|--------------|-----------|-----------|
| Navigation tabs | 3-5 | More causes decision paralysis |
| Primary actions | 1 per screen | Multiple primaries = no primary |
| Form fields visible | 5-7 | More requires scrolling = context loss |
| List item data points | 3-4 | More overwhelms scanning |
| Settings categories | 5-7 | More requires chunking |
| Onboarding steps | 3-5 | More causes drop-off |

### When to Split vs. Progressive Disclosure

| Approach | Use When | Example |
|----------|----------|---------|
| **Split into screens** | Tasks are sequential | Multi-step wizard |
| **Progressive disclosure** | Information is optional | "Show advanced options" |
| **Lazy loading** | Data is vast | Infinite scroll list |
| **Modal/sheet** | Action is contextual | Quick edit without navigation |

### Decision Tree: Split or Disclose?

```
Does the user need this to complete their primary task?
├─ YES → Keep on same screen (possibly collapsed)
└─ NO
   ├─ Is it a separate workflow?
   │  ├─ YES → New screen with navigation
   │  └─ NO → Progressive disclosure (accordion, "more" link)
```

### Reducing Cognitive Load

| Pattern | How It Helps | Implementation |
|---------|--------------|----------------|
| **Smart defaults** | Fewer decisions | Pre-select common options |
| **Progressive disclosure** | Information on demand | Accordion, expandable sections |
| **Contextual help** | Learning in context | Inline hints, not documentation links |
| **Visual grouping** | Chunking related items | Cards, whitespace, dividers |
| **Recognition over recall** | Show, don't ask to remember | Autocomplete, recent items |
| **Consistent patterns** | Transferable knowledge | Same gestures across app |

### Form-Specific Guidelines

| Guideline | Reasoning |
|-----------|-----------|
| Single column only | Predictable eye flow |
| One question per screen (complex forms) | Focus + progress feeling |
| Group related fields | Chunking reduces perceived complexity |
| Show validation inline | Immediate feedback, no modal errors |
| Mark required, not optional | Most fields should be required |
| Auto-advance where possible | Reduce tap count |

### Decision Fatigue Prevention

| Cause | Solution |
|-------|----------|
| Too many options | Curate. Show "recommended" or "popular" |
| Equal visual weight | Create hierarchy through size, color |
| Unclear consequences | Preview outcomes before committing |
| Fear of wrong choice | Allow easy undo, show "you can change later" |

---

## Data Hierarchy Principles

What information matters most? Design should answer this visually.

### Visual Weight Distribution

```
                HIGH WEIGHT
    ┌─────────────────────────────────┐
    │  Size: Large                    │
    │  Color: High contrast           │
    │  Position: Top/center           │
    │  Typography: Bold, larger       │
    ├─────────────────────────────────┤
    │  Size: Medium                   │  MEDIUM WEIGHT
    │  Color: Normal contrast         │
    │  Position: Content area         │
    │  Typography: Regular            │
    ├─────────────────────────────────┤
    │  Size: Small                    │  LOW WEIGHT
    │  Color: Muted                   │
    │  Position: Peripheral           │
    │  Typography: Smaller, lighter   │
    └─────────────────────────────────┘
```

### The Squint Test

Squint at your screen until you cannot read text. What stands out?

- **Should be:** Primary content, primary action
- **Should NOT be:** Decoration, secondary actions, labels

### Information Hierarchy by Data Type

| Data Type | Hierarchy Level | Visual Treatment |
|-----------|-----------------|------------------|
| Identity (name, avatar) | Primary | Large, prominent |
| Status (online, urgent) | Primary | Color-coded badge |
| Key metric | Primary | Large number, unit smaller |
| Timestamp | Secondary | Relative ("2h ago"), muted |
| Metadata | Tertiary | Small, muted |
| System info | Hidden | Accessible but not visible |

### Primary vs. Supporting Information

| Screen | Primary Info | Supporting Info | Hidden Info |
|--------|--------------|-----------------|-------------|
| Message list | Sender, preview | Time, unread count | Message ID |
| User profile | Name, avatar | Bio, stats | User ID, created at |
| Transaction | Amount, status | Date, recipient | Transaction hash |
| Notification | Title, source | Time | Notification ID |

### Action Prominence Rules

| Action Type | Visual Treatment | Position |
|-------------|------------------|----------|
| Primary CTA | Filled button, primary color | Thumb zone, prominent |
| Secondary action | Outline or text button | Near primary, less weight |
| Destructive action | Red color, confirmation required | Hidden behind menu or swipe |
| Navigation | Icon or text, consistent placement | Tab bar, header |

### Card Content Hierarchy

```
┌─────────────────────────────────────────┐
│ [Avatar] Name               Timestamp   │ <- Identity + when
│                                         │
│ Primary content text or headline        │ <- Main information
│                                         │
│ Secondary details, metadata             │ <- Supporting context
│                                         │
│ [Icon] Action   [Icon] Action   ...     │ <- Available actions
└─────────────────────────────────────────┘
```

---

## Attention Flow Design

Understanding where users look helps place information strategically.

### Mobile Scan Patterns

Unlike desktop, mobile users tend to scan vertically with brief horizontal sweeps.

```
Desktop (F-pattern)         Mobile (I-pattern + sweeps)
─────────────────           ─────────────────
████████████████            ████████████████
██████████                  │      │       │
████████████████            │      ▼       │
██████                      ├──────────────┤
████████████                │      │       │
████                        │      ▼       │
                            └──────────────┘
```

### Mobile Attention Zones

```
┌─────────────────────────────────────────┐
│              STATUS BAR                 │ <- System (time, battery)
├─────────────────────────────────────────┤
│              APP HEADER                 │ <- Where am I? (title, back)
├─────────────────────────────────────────┤
│                                         │
│           FIRST VIEWPORT                │ <- PRIMARY ATTENTION
│         (above the fold)                │    Most important here
│                                         │
├─────────────────────────────────────────┤
│                                         │
│           SCROLL CONTENT                │ <- Secondary content
│                                         │
├─────────────────────────────────────────┤
│              TAB BAR                    │ <- Navigation (peripheral)
└─────────────────────────────────────────┘
```

### First Viewport Rules

The first viewport (before scrolling) must answer:

1. **Where am I?** (Page title, context)
2. **What can I do here?** (Primary action visible)
3. **What's most important?** (Key content/status)

### Focus Points and Rest Areas

| Element | Purpose |
|---------|---------|
| **Focus points** | Draw attention, important information |
| **Rest areas** | Visual breathing room, prevent overwhelm |

### Using Whitespace as Hierarchy

| Whitespace Amount | Signal |
|-------------------|--------|
| Large gaps | Section boundaries, major groupings |
| Medium gaps | Item separation within groups |
| Small gaps | Related elements (label + input) |
| No gap | Unified element (icon + text) |

### Entry Point Design

Where should the user's eye land first?

| Screen Type | Ideal Entry Point |
|-------------|-------------------|
| List | First list item |
| Detail | Primary content (image, headline) |
| Form | First input field |
| Dashboard | Key metric or status |
| Empty state | Call to action |

### Scroll Indicators

Users need to know content continues below the fold.

| Pattern | When to Use |
|---------|-------------|
| Partial item visible | List content below |
| Gradient fade | Content continues |
| "Scroll for more" | Long content, first-time users |
| Pull-to-refresh hint | List can be refreshed |

---

## Mobile Anti-Patterns

Desktop patterns that fail on mobile, and what to do instead.

### Navigation Anti-Patterns

| Desktop Pattern | Why It Fails | Mobile Alternative |
|-----------------|--------------|-------------------|
| Hamburger menu as primary nav | Hidden = forgotten (65% lower engagement) | Bottom tab bar |
| Deep nesting (3+ levels) | Lost in hierarchy | Flat structure, search |
| Breadcrumbs | Wastes vertical space | Back button + title |
| Mega menus | Cannot hover | Category pages |
| Fixed sidebars | Steals viewport | Slide-out drawer |

### Interaction Anti-Patterns

| Desktop Pattern | Why It Fails | Mobile Alternative |
|-----------------|--------------|-------------------|
| Hover states for information | No hover on touch | Tap to reveal, long press |
| Double-click | Not discoverable | Single tap + confirmation |
| Drag-and-drop complex | Imprecise on touch | Tap to select, then move |
| Right-click menus | No right-click | Long press, swipe reveal |
| Tiny close buttons | Hard to tap | Large tap areas, swipe |
| Carousel auto-advance | Users are swiping | Manual control only |

### Layout Anti-Patterns

| Desktop Pattern | Why It Fails | Mobile Alternative |
|-----------------|--------------|-------------------|
| Multi-column forms | Reading order unclear | Single column always |
| Horizontal scrolling tables | Awkward gesture | Card-based, vertical |
| Fixed headers (tall) | Steals content space | Collapse on scroll |
| Sidebar + content | Not enough width | Tab-based separation |
| Modal dialogs (large) | Feels trapped | Bottom sheets |

### Content Anti-Patterns

| Desktop Pattern | Why It Fails | Mobile Alternative |
|-----------------|--------------|-------------------|
| Long paragraphs | TL;DR on mobile | Scannable bullets |
| Dense data tables | Cannot scan | Cards with key data |
| Inline editing tables | Too small | Edit screen or modal |
| Tooltip explanations | No hover | Inline hints, help screens |
| Multiple CTAs same row | Hierarchy unclear | Stack vertically |

### Selection Anti-Patterns

| Desktop Pattern | Why It Fails | Mobile Alternative |
|-----------------|--------------|-------------------|
| Dropdown menus | 60% slower on mobile | Segmented (2-4), chips (5-7), sheet (8+) |
| Multi-select dropdown | Hard to use | BottomSheet with checkboxes |
| Date picker dropdowns | Tedious selection | Native date input |
| Country code as text input | Error-prone | Searchable sheet |

### Loading Anti-Patterns

| Desktop Pattern | Why It Fails | Mobile Alternative |
|-----------------|--------------|-------------------|
| Full-page spinner | Perceived 40% slower | Skeleton loaders |
| Spinner for all loading | Blocks interaction | Button spinner for <1s |
| No loading indicator | Feels broken | Always show feedback |

### iOS vs Android Considerations

| Pattern | iOS Convention | Android Convention | PWA Recommendation |
|---------|----------------|--------------------|--------------------|
| Primary action | Top right (historically) | FAB or bottom | Bottom (thumb-friendly) |
| Back gesture | Swipe from left edge | System back button | Support both |
| Pull-to-refresh | Native feel | Native feel | Implement custom |
| Switches | iOS-style toggle | Material switch | Platform-agnostic toggle |
| Alerts | Centered modal | Bottom sheet OK | Bottom sheet preferred |

### When to Break Platform Conventions

| Break When | Example | Rationale |
|------------|---------|-----------|
| Consistency across platforms matters | Same app on iOS + Android | Brand consistency |
| Native convention is poor UX | Tiny iOS date picker | Better alternatives exist |
| Users expect web behavior | External links | Don't fight mental model |

### Keep Platform Conventions For

| Keep When | Example | Rationale |
|-----------|---------|-----------|
| System integration | Share sheet, camera | User expects native |
| Accessibility | System font scaling | Respect user preferences |
| Navigation | Back gesture | Muscle memory |

---

## Decision Frameworks

Quick-reference tables for common UX decisions.

### Component Selection Framework

| User Need | Component | Not This |
|-----------|-----------|----------|
| Navigate between sections | BottomTabBar | Hamburger menu |
| Choose from 2-4 options | Segmented control | Dropdown |
| Choose from 5-7 options | Chips / radio buttons | Dropdown |
| Choose from 8+ options | BottomSheet with search | Dropdown |
| Contextual actions | BottomSheet | Alert dialog |
| Confirm destructive action | Alert (modal) | Toast |
| Show status/feedback | Toast | Alert (modal) |
| Edit item inline | BottomSheet | New page navigation |
| Show supplementary info | Accordion/expandable | Tooltip |

### Action Placement Framework

| Action Type | Position | Visual |
|-------------|----------|--------|
| Most common action | Bottom center/right | Primary button/FAB |
| Secondary actions | Bottom, flanking primary | Secondary buttons |
| Navigation | Bottom tab bar | Icons + labels |
| Page-specific settings | Header right | Icon button |
| Back/cancel | Header left | Icon or text |
| Destructive | Swipe reveal or menu | Red, requires confirmation |

### Loading State Framework

| Duration | Show | Component |
|----------|------|-----------|
| 0-100ms | Nothing | N/A |
| 100ms-1s | Button spinner | Loading prop on Button |
| 1s+ | Skeleton | Skeleton component |
| Indeterminate | Skeleton | Skeleton with subtle animation |

### Empty State Framework

| Scenario | Tone | Action |
|----------|------|--------|
| First use | Encouraging | Primary CTA to start |
| Search no results | Helpful | Suggest alternatives |
| Error loading | Apologetic | Retry button |
| All done | Celebratory | Next step suggestion |
| Offline | Informative | Show cached or wait indicator |

### Error Display Framework

| Error Type | Display | User Action |
|------------|---------|-------------|
| Field validation | Inline below field | Fix input |
| Form submission failed | Toast + inline errors | Fix and retry |
| Network error | Toast | Auto-retry or manual |
| Server error | Full-screen empty state | Retry or contact support |
| Auth expired | Redirect + toast | Re-authenticate |

### Screen Complexity Assessment

Count these elements. If total > 12, simplify.

| Element | Count |
|---------|-------|
| Primary actions | Should be 1 |
| Secondary actions | Max 3 |
| Form fields visible | Max 7 |
| Navigation items | Max 5 |
| Data points per item | Max 4 |
| Visual sections | Max 4 |

**Total guideline:** Keep under 12 distinct decision points per screen.

---

## Touch Target Standards

### Standards Hierarchy

| Standard | Size | Use Case |
|----------|------|----------|
| WCAG 2.2 AA (legal minimum) | 24x24px | Baseline compliance |
| Apple HIG | 44x44pt | iOS platform target |
| Material Design 3 | 48x48dp | Android platform target |
| WCAG 2.1 AAA (enhanced) | 44x44px | Best practice |

### Spacing Requirements

| Element | Minimum Spacing |
|---------|-----------------|
| Between touch targets | 8px |
| Touch target padding | 12px |
| Icon within touch target | Centered |

---

## Dark Mode Design

### Color Requirements

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | #FFFFFF | #121212 (not pure black) |
| Surface | #F5F5F5 | #1E1E1E |
| Primary text | #000000 | #FFFFFF |
| Secondary text | #666666 | #A0A0A0 |
| Contrast ratio | 4.5:1 min | 4.5:1 min |

### Dark Mode Anti-Patterns

| Avoid | Why | Instead |
|-------|-----|---------|
| Pure black (#000000) | Halation effect (47% of users) | #121212 or darker gray |
| Pure white text on black | Eye strain | Off-white (#E0E0E0) |
| Same colors both modes | Poor contrast | Adjust for dark surfaces |
| Ignoring system preference | User frustration | Respect `prefers-color-scheme` |

---

## Accessibility Motion

### Reduced Motion Requirements

Always respect `prefers-reduced-motion`:

| When Reduced Motion Enabled | Do |
|-----------------------------|----|
| Animations | Reduce duration to <100ms or remove |
| Parallax effects | Remove entirely |
| Auto-playing animations | Stop or remove |
| Essential motion (loading) | Keep, but simplify |
| Page transitions | Instant or fade only |

### Implementation

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Verification Checklists

### Pre-Design Checklist

- [ ] Primary user intent identified
- [ ] Secondary intents listed (max 3)
- [ ] Tertiary intents documented (for menu/settings)
- [ ] Thumb zone placements planned
- [ ] First viewport content prioritized

### Design Review Checklist

- [ ] Single primary action per screen
- [ ] Touch targets >= 24px (WCAG AA), ideally 44-48px
- [ ] First viewport answers: where, what, why
- [ ] Data hierarchy clear (squint test)
- [ ] Cognitive load reasonable (< 12 decision points)
- [ ] Error states designed
- [ ] Empty states designed
- [ ] Loading states designed (skeleton, not spinner for >1s)
- [ ] Dark mode supported
- [ ] Reduced motion respected

### Platform Checklist

- [ ] Works with one hand (thumb zone)
- [ ] No hover-dependent features
- [ ] Gestures have button alternatives
- [ ] Safe areas respected
- [ ] Keyboard does not cover inputs
- [ ] Works in portrait and landscape

### Accessibility Checklist

- [ ] Touch targets meet minimum size (24px+)
- [ ] Color is not the only indicator
- [ ] Focus states visible
- [ ] Labels on all inputs
- [ ] Reduced motion respected
- [ ] Contrast ratios met (4.5:1)

---

## Related Docs

### Implementation Guides (HOW)

- [mobile-ux.md](./mobile-ux.md) - Touch targets, gestures, platform patterns
- [animations.md](./animations.md) - Motion tokens and timing
- [component-intent.md](./component-intent.md) - Component selection guide
- [wireframe-patterns.md](./wireframe-patterns.md) - Screen templates

### Anti-Patterns (WHAT NOT TO DO)

- [pwa.md](../_anti-patterns/pwa.md) - PWA-specific mistakes
- [svelte.md](../_anti-patterns/svelte.md) - Frontend mistakes

### Components (WITH WHAT)

See `assets/svelte/components/ui/` for:
- `primitives/` - Button, Input, Skeleton, etc.
- `compounds/` - Card, FormField, BottomTabBar
- `patterns/` - Modal, BottomSheet, EmptyState

---

## Sources

| Source | Used For |
|--------|----------|
| Apple Human Interface Guidelines | iOS patterns, touch targets |
| Material Design 3 | Android patterns, component specs |
| Nielsen Norman Group | Usability research, scan patterns |
| WCAG 2.2 | Accessibility standards |
| Baymard Institute | Form usability research |
| Laws of UX | Cognitive principles |
| Luke Wroblewski | Thumb zone research |
