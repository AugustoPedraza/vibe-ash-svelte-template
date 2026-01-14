# User Messaging & Error Reporting Guide

> Unified system for user-facing messages, toast notifications, and error tracking.

## Quick Index

| If you need... | Section | Time |
|----------------|---------|------|
| Error classification | [#error-classification](#error-classification) | 2 min |
| Copy system | [#copy-system](#copy-system) | 3 min |
| Toast bridge | [#toast-bridge](#toast-bridge-liveview--svelte-sonner) | 3 min |
| Sentry setup | [#sentry-integration](#sentry-integration) | 5 min |
| Logging | [#structured-logging](#structured-logging) | 2 min |

**Related:** [errors.md](../_patterns/errors.md) for base error handling patterns.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER-FACING MESSAGES                         │
│                                                                   │
│  Copy Modules          Toast System          Error Display        │
│  ┌─────────────┐      ┌─────────────┐       ┌─────────────┐     │
│  │ Elixir Copy │      │ push_toast  │       │ Field-level │     │
│  │ (backend)   │─────▶│ (LiveView)  │──────▶│ (inline)    │     │
│  └─────────────┘      └──────┬──────┘       └─────────────┘     │
│         │                    │                     ▲             │
│         ▼                    ▼                     │             │
│  ┌─────────────┐      ┌─────────────┐       ┌─────────────┐     │
│  │ TS Copy     │      │ Svelte      │       │ Toast       │     │
│  │ (frontend)  │      │ Sonner      │◀──────│ (global)    │     │
│  └─────────────┘      └─────────────┘       └─────────────┘     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     ERROR TRACKING (INVISIBLE)                   │
│                                                                   │
│  ┌─────────────┐      ┌─────────────┐       ┌─────────────┐     │
│  │ Ash Error   │      │ ErrorHelper │       │ Sentry      │     │
│  │ (backend)   │─────▶│ classify    │──────▶│ (if system) │     │
│  └─────────────┘      └─────────────┘       └─────────────┘     │
│                                                    ▲             │
│  ┌─────────────┐      ┌─────────────┐              │             │
│  │ JS Error    │─────▶│ Error       │──────────────┘             │
│  │ (frontend)  │      │ Boundary    │                            │
│  └─────────────┘      └─────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Classification

Every error falls into exactly one category. This determines what the user sees and whether it's reported.

| Category | Example | User Sees | Sentry? | Log Level |
|----------|---------|-----------|---------|-----------|
| **User Error** | Invalid email format | Field-level hint | No | debug |
| **Auth Error** | Session expired | Toast + redirect | No | info |
| **Business Error** | Duplicate email | Toast with guidance | No | info |
| **System Error** | DB connection failed | Generic toast | **Yes** | error |

### Classification Helper

```elixir
defmodule MyAppWeb.ErrorHelpers do
  @moduledoc "Error classification and formatting"

  # Classification
  def classify(%Ash.Error.Invalid{}), do: :user_error
  def classify(%Ash.Error.Forbidden{}), do: :auth_error
  def classify(%Ash.Error.Query.NotFound{}), do: :business_error
  def classify(_), do: :system_error

  # Should this be reported to Sentry?
  def should_report?(:system_error), do: true
  def should_report?(_), do: false

  # Format for user display (see _patterns/errors.md for full implementation)
  def format_ash_errors(%Ash.Error.Invalid{errors: errors}) do
    # ... field-level error extraction
  end
end
```

### Decision Tree

```
Error occurs
    │
    ├─ Ash.Error.Invalid? ──────► User Error ──► Field hints, no toast
    │
    ├─ Ash.Error.Forbidden? ────► Auth Error ──► Toast + redirect to /login
    │
    ├─ Ash.Error.NotFound? ─────► Business ────► Toast with guidance
    │
    └─ Everything else ─────────► System ──────► Generic toast + Sentry
```

---

## Copy System

Centralized, human-friendly strings for all user-facing messages. **Never hardcode strings.**

### Backend Copy Modules

```
lib/my_app_web/copy/
├── copy.ex           # Main module (re-exports all)
├── auth.ex           # Auth flow messages
├── errors.ex         # Error state messages
└── toasts.ex         # Toast/notification messages
```

**`lib/my_app_web/copy/toasts.ex`:**

```elixir
defmodule MyAppWeb.Copy.Toasts do
  @moduledoc "Toast notification copy"

  def session_expired, do: "Your session has expired"
  def login_required, do: "Sign in to continue"
  def logout_success, do: "You've been signed out"
  def save_success, do: "Changes saved"
  def save_error, do: "Couldn't save changes"
  def generic_error, do: "Something went wrong"
end
```

**`lib/my_app_web/copy/auth.ex`:**

```elixir
defmodule MyAppWeb.Copy.Auth do
  @moduledoc "Authentication flow copy"

  def wrong_credentials, do: "Wrong email or password"
  def email_required, do: "Enter your email"
  def password_required, do: "Enter your password"
  def password_too_short, do: "Use 6 or more characters"
end
```

**`lib/my_app_web/copy/errors.ex`:**

```elixir
defmodule MyAppWeb.Copy.Errors do
  @moduledoc "Error state copy"

  def not_found, do: "We couldn't find that"
  def no_access, do: "You don't have access"
  def generic, do: "Something went wrong"
  def offline, do: "You're offline"
  def try_again, do: "Please try again"
end
```

**`lib/my_app_web/copy/copy.ex`:**

```elixir
defmodule MyAppWeb.Copy do
  @moduledoc "Re-exports all copy modules"

  defdelegate session_expired, to: MyAppWeb.Copy.Toasts
  defdelegate login_required, to: MyAppWeb.Copy.Toasts
  # ... etc
end
```

### Frontend Copy (TypeScript)

Mirror the backend structure:

```
assets/svelte/lib/copy/
├── index.ts          # Re-exports all
├── auth.ts           # Auth messages
├── errors.ts         # Error messages
└── toasts.ts         # Toast messages
```

**`assets/svelte/lib/copy/toasts.ts`:**

```typescript
export const toasts = {
  sessionExpired: "Your session has expired",
  loginRequired: "Sign in to continue",
  logoutSuccess: "You've been signed out",
  saveSuccess: "Changes saved",
  saveError: "Couldn't save changes",
  genericError: "Something went wrong",
} as const;
```

### Usage Pattern

```elixir
# Backend
import MyAppWeb.Copy.Toasts

push_toast(socket, :error, session_expired())
```

```svelte
<!-- Frontend -->
<script>
  import { toasts } from '$lib/copy';
</script>

<p>{toasts.genericError}</p>
```

### Copy Guidelines

Follow these rules for all user-facing strings:

| Rule | Bad | Good |
|------|-----|------|
| **Positive** | "Invalid email" | "Check your email" |
| **Specific** | "Error occurred" | "Couldn't save changes" |
| **Brief** | "The password you entered is too short" | "Use 6 or more characters" |
| **Human** | "Authentication failed" | "Wrong email or password" |

---

## Toast Bridge (LiveView → Svelte Sonner)

Use [Svelte Sonner](https://sonner.emilkowal.ski/svelte) for all toast notifications. This replaces Phoenix flash for a consistent UI.

### Backend Helper

```elixir
defmodule MyAppWeb.ToastHelpers do
  @moduledoc "Push toast notifications to Svelte Sonner"

  import Phoenix.LiveView

  @type toast_type :: :success | :error | :warning | :info
  @type toast_opts :: [duration: integer(), id: String.t()]

  @doc "Push a toast notification to the client"
  @spec push_toast(Phoenix.LiveView.Socket.t(), toast_type(), String.t(), toast_opts()) ::
          Phoenix.LiveView.Socket.t()
  def push_toast(socket, type, message, opts \\ []) do
    push_event(socket, "toast", %{
      type: type,
      message: message,
      duration: opts[:duration] || 4000,
      id: opts[:id] || nil
    })
  end
end
```

### LiveView Hook

```javascript
// assets/js/hooks/toast.js
import { toast } from 'svelte-sonner';

export const ToastHook = {
  mounted() {
    this.handleEvent("toast", ({ type, message, duration, id }) => {
      const options = { duration };
      if (id) options.id = id;

      switch (type) {
        case 'success':
          toast.success(message, options);
          break;
        case 'error':
          toast.error(message, options);
          break;
        case 'warning':
          toast.warning(message, options);
          break;
        case 'info':
        default:
          toast.info(message, options);
          break;
      }
    });
  }
};
```

### Register Hook

```javascript
// assets/js/app.js
import { ToastHook } from './hooks/toast';

const hooks = {
  ...getHooks(components),
  Toast: ToastHook
};

let liveSocket = new LiveSocket("/live", Socket, {
  hooks,
  // ...
});
```

### Add Toaster Component

```svelte
<!-- In your root layout or App.svelte -->
<script>
  import { Toaster } from 'svelte-sonner';
</script>

<Toaster
  position="top-right"
  toastOptions={{
    style: 'background: var(--surface); color: var(--text);'
  }}
/>

<slot />
```

### Usage

```elixir
# In LiveView
import MyAppWeb.ToastHelpers
import MyAppWeb.Copy.Toasts

def handle_event("save", params, socket) do
  case MyApp.Items.update(params) do
    {:ok, _item} ->
      {:noreply, push_toast(socket, :success, save_success())}

    {:error, _} ->
      {:noreply, push_toast(socket, :error, save_error())}
  end
end
```

---

## Sentry Integration

Report system errors (only) to Sentry. User/auth/business errors are not reported.

### Backend Setup

**Add to `mix.exs`:**

```elixir
defp deps do
  [
    {:sentry, "~> 10.0"},
    {:hackney, "~> 1.8"}
  ]
end
```

**Add to `config/config.exs`:**

```elixir
config :logger, Sentry.LoggerBackend,
  capture_log_messages: true,
  level: :error
```

**Add to `config/runtime.exs`:**

```elixir
if config_env() in [:prod, :staging] do
  config :sentry,
    dsn: System.get_env("SENTRY_DSN"),
    environment_name: config_env(),
    enable_source_code_context: true,
    root_source_code_paths: [File.cwd!()]
end
```

### Frontend Setup

**Add to `package.json`:**

```json
{
  "dependencies": {
    "@sentry/svelte": "^8.0.0"
  }
}
```

**Add to `assets/js/app.js`:**

```javascript
import * as Sentry from "@sentry/svelte";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: window.SENTRY_DSN, // Injected in root.html.heex
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1
  });
}
```

**Add to `root.html.heex`:**

```heex
<script>
  window.SENTRY_DSN = "<%= System.get_env("SENTRY_DSN") %>";
</script>
```

### Conditional Reporting

```elixir
defmodule MyAppWeb.LogHelpers do
  require Logger
  alias MyAppWeb.ErrorHelpers

  def log_error(action, error, metadata \\ []) do
    category = ErrorHelpers.classify(error)

    Logger.error("action=#{action} category=#{category}",
      error: inspect(error),
      metadata
    )

    # Only report system errors to Sentry
    if ErrorHelpers.should_report?(category) do
      Sentry.capture_exception(error, extra: Keyword.put(metadata, :action, action))
    end
  end
end
```

---

## Structured Logging

Consistent, queryable log format for debugging and monitoring.

### Configuration

```elixir
# config/config.exs
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id, :user_id, :action]
```

### Log Helper

```elixir
defmodule MyAppWeb.LogHelpers do
  require Logger

  @doc "Log an action with structured metadata"
  def log_action(action, metadata \\ []) do
    Logger.info("action=#{action}", metadata)
  end

  @doc "Log an error with classification and optional Sentry reporting"
  def log_error(action, error, metadata \\ []) do
    category = MyAppWeb.ErrorHelpers.classify(error)

    Logger.error("action=#{action} category=#{category}",
      Keyword.merge(metadata, error: inspect(error))
    )

    if MyAppWeb.ErrorHelpers.should_report?(category) do
      Sentry.capture_exception(error, extra: Keyword.put(metadata, :action, action))
    end
  end
end
```

### Usage

```elixir
import MyAppWeb.LogHelpers

# Normal operation
log_action("user_login", user_id: user.id)

# Error with automatic classification
log_error("create_item", error, user_id: user.id, item_type: "project")
```

### Log Output Example

```
2024-01-15 10:23:45.123 request_id=abc123 user_id=456 [info] action=user_login
2024-01-15 10:23:46.789 request_id=abc123 user_id=456 [error] action=create_item category=system_error error=%RuntimeError{...}
```

---

## Implementation Checklist

### New Project Setup

```
[ ] Install dependencies (sentry, svelte-sonner)
[ ] Create copy modules (lib/my_app_web/copy/)
[ ] Create error helpers (lib/my_app_web/helpers/error_helpers.ex)
[ ] Create toast helpers (lib/my_app_web/helpers/toast_helpers.ex)
[ ] Create log helpers (lib/my_app_web/helpers/log_helpers.ex)
[ ] Register ToastHook in app.js
[ ] Add Toaster component to root layout
[ ] Configure Sentry (config + env vars)
[ ] Add SENTRY_DSN to deployment env
```

### Per-Feature Checklist

```
[ ] All user-facing strings use Copy modules
[ ] Errors are classified (user/auth/business/system)
[ ] User errors → field-level hints
[ ] Auth errors → toast + redirect
[ ] Business errors → toast with guidance
[ ] System errors → generic toast + Sentry
[ ] Success actions → success toast
[ ] Structured logging with metadata
```

---

## Related Docs

- [_patterns/errors.md](../_patterns/errors.md) - Base error handling pattern
- [_patterns/auth.md](../_patterns/auth.md) - Authentication errors
- [docs/UX_COPY.md](../../docs/UX_COPY.md) - Copy guidelines reference
