# Naming Conventions

> Consistent naming across backend and frontend.

## Quick Index

| If you need... | Section | Time |
|----------------|---------|------|
| Elixir naming | [#backend](#backend-elixir) | 1 min |
| Svelte naming | [#frontend](#frontend-svelte) | 1 min |
| PubSub topics | [#pubsub](#pubsub-topic-naming) | 1 min |

---

## Backend (Elixir)

| Type | Convention | Example |
|------|------------|---------|
| Domain | `MyApp.{Context}` | `MyApp.Accounts` |
| Resource | `MyApp.{Context}.{Entity}` | `MyApp.Accounts.User` |
| LiveView | `MyAppWeb.{Feature}Live` | `MyAppWeb.ChatLive` |
| LiveComponent | `MyAppWeb.{Feature}Component` | `MyAppWeb.MessageComponent` |
| Controller | `MyAppWeb.{Entity}Controller` | `MyAppWeb.SessionController` |
| Channel | `MyAppWeb.{Topic}Channel` | `MyAppWeb.ProjectChannel` |
| Action | `verb_noun` | `:create_user`, `:send_message` |
| Read Action | `get_*`, `list_*` | `:get_by_id`, `:list_active` |
| Notifier | `{Entity}Notifier` | `MessageNotifier` |
| Change | `{Verb}{Noun}` | `HashPassword`, `SetTimestamp` |

---

## Frontend (Svelte)

| Type | Convention | Example |
|------|------------|---------|
| UI Component | `PascalCase` | `Button.svelte` |
| Feature Component | `{Feature}{Type}.svelte` | `ChatMessage.svelte` |
| Store | `{name}Store.ts` | `connectionStore.ts` |
| Type/Interface | `PascalCase` | `MessagePayload` |
| Copy Key | `{feature}.{page}.{element}` | `auth.login.button` |

---

## Shared Concepts

| Concept | Backend | Frontend |
|---------|---------|----------|
| Entity | Ash Resource | TypeScript Interface |
| Command | Ash Action | `pushEvent()` |
| Event | PubSub message | `handleEvent()` |
| Query | Read Action | Props from LiveView |

---

## File Structure

```
lib/
├── my_app/                       # Ash domains (business logic)
│   └── [domain]/
│       ├── [domain].ex           # Domain module
│       └── resources/            # Ash resources
└── my_app_web/
    ├── components/
    │   ├── core_components.ex    # Phoenix defaults
    │   └── ui_components.ex      # App components
    ├── live/
    │   └── [feature]_live.ex
    └── router.ex

assets/svelte/components/
├── ui/                           # Base components
└── features/                     # Feature-specific
```

---

## PubSub Topic Naming

| Topic Pattern | Example | Use Case |
|---------------|---------|----------|
| `user:{id}:notifications` | `user:abc123:notifications` | User-specific notifications |
| `channel:{id}` | `channel:xyz789` | Channel messages |
| `project:{id}` | `project:def456` | Project-wide events |
| `presence:{room}` | `presence:room:lobby` | Presence tracking |

---

## Related Docs

- [quick-reference.md](./quick-reference.md) - Core patterns
- [responsibility.md](./responsibility.md) - Frontend/Backend ownership
- [backend-ash.md](../_guides/backend-ash.md) - Ash resource patterns

