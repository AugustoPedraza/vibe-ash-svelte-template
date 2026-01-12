# vibe-ash-svelte-template

> Phoenix + Ash + Svelte 5 template with AI-friendly architecture documentation

A GitHub template repository for building modern web applications with:

- **Backend**: Elixir, Phoenix 1.8+, Ash Framework 3.x
- **Frontend**: Svelte 5 (runes), Tailwind CSS 4
- **Mobile**: PWA-first, offline-capable

## Quick Start

### Using as GitHub Template

```bash
# Create a new repo from this template
gh repo create my-app --template your-org/vibe-ash-svelte-template

# Clone and setup
git clone https://github.com/your-org/my-app
cd my-app

# Replace placeholder names
find . -type f \( -name "*.ex" -o -name "*.exs" \) -exec sed -i 's/MyApp/YourApp/g' {} \;
find . -type f \( -name "*.ex" -o -name "*.exs" \) -exec sed -i 's/my_app/your_app/g' {} \;

# Install dependencies
mix deps.get
cd assets && npm install

# Start development
mix phx.server
```

## What's Included

### Architecture Documentation (`architecture/`)

AI-friendly documentation structure:

| Folder | Purpose | When to Read |
|--------|---------|--------------|
| `_fundamentals/` | Core decisions, patterns | First, always |
| `_guides/` | Implementation guides | When building features |
| `_patterns/` | Specific solutions | On-demand |
| `_anti-patterns/` | What to avoid | During code review |
| `_checklists/` | Quality gates | Before commit |

Start with `architecture/README.md` for navigation.

### UI Components (`assets/svelte/components/ui/`)

19 ready-to-use components:

**Primitives**: Button, Input, Textarea, Icon, Badge, Skeleton, Avatar, Alert, Toggle

**Compounds**: Card, FormField, IconButton, AppHeader, BottomTabBar

**Patterns**: Modal, BottomSheet, Dropdown, EmptyState, SheetMenu

### Shadcn Components (`assets/svelte/lib/shadcn/`)

89 headless primitive components for building custom UI.

### Stores (`assets/svelte/lib/stores/`)

Reactive stores for common patterns:

- `connection.ts` - Online/offline detection
- `offline.ts` - Offline action queue
- `realtime.ts` - PubSub integration
- `visibility.ts` - Page visibility
- `pwa.ts` - PWA installation

### Actions (`assets/svelte/lib/actions/`)

Gesture actions for mobile:

- `swipe.ts` - Swipe gestures
- `longpress.ts` - Long press detection
- `pullToRefresh.ts` - Pull to refresh

### Utilities (`assets/svelte/lib/utils/`)

- `cn.ts` - Class name merging
- `haptics.ts` - Haptic feedback
- `platform.ts` - Platform detection

## Usage

### Import Components

```svelte
<script>
  import { Button, Input, Card, Modal } from '$lib/components/ui';
  import { swipe, haptic, connectionStore } from '$lib';
</script>

<Card>
  <Input placeholder="Enter name" />
  <Button variant="primary">Submit</Button>
</Card>
```

### Use Gestures

```svelte
<div use:swipe on:swipeleft={prev} on:swiperight={next}>
  Swipeable content
</div>

<div use:longPress on:longpress={showMenu}>
  Long press me
</div>
```

### Use Stores

```svelte
<script>
  import { connectionStore, offlineQueueStore } from '$lib';
</script>

{#if !$connectionStore.online}
  <Banner>You're offline. Changes will sync when connected.</Banner>
{/if}
```

## Project Structure

```
├── architecture/           # AI-friendly documentation
│   ├── _fundamentals/     # Core patterns (read first)
│   ├── _guides/           # Implementation guides
│   ├── _patterns/         # Specific solutions
│   ├── _anti-patterns/    # What to avoid
│   └── _checklists/       # Quality gates
│
├── assets/svelte/
│   ├── components/ui/     # UI component library
│   └── lib/
│       ├── actions/       # Gesture actions
│       ├── stores/        # Reactive stores
│       ├── utils/         # Utilities
│       └── shadcn/        # Headless components
│
├── docs/
│   ├── COMPONENT_GUIDE.md # Component creation guide
│   ├── UX_PATTERNS.md     # UX decision framework
│   └── domain/            # Project-specific docs
│
├── lib/                   # Elixir backend (your code)
├── config/                # Phoenix configuration
├── priv/                  # Migrations, static assets
└── test/                  # Tests
```

## Design Principles

1. **Backend owns truth, frontend owns experience**
2. **Show structure, not spinners** (use skeletons)
3. **Optimistic by default** (update UI immediately)
4. **Offline-capable** (queue actions when disconnected)
5. **Touch-first** (44x44px minimum targets)

## Documentation

- [Architecture Overview](architecture/README.md)
- [Component Guide](docs/COMPONENT_GUIDE.md)
- [UX Patterns](docs/UX_PATTERNS.md)

## License

MIT
