# Error Handling Pattern

> Unified error flow from Ash to LiveView to Svelte.

## Quick Index

| If you need... | Section | Time |
|----------------|---------|------|
| Error types | [#ash-error-types](#ash-error-types) | 1 min |
| LiveView handling | [#liveview-pattern](#liveview-error-handling) | 3 min |
| Logging | [#logging-patterns](#logging-patterns) | 2 min |
| Flash/Toast | [#flash-messages](#flash-messages) | 2 min |
| Frontend display | [#svelte-patterns](#svelte-error-display) | 2 min |

---

## Error Flow

```
Ash Action -> LiveView (handle + log) -> Svelte (display)
                    |
                    v
                 Logger
```

---

## Ash Error Types

| Error Type | When Raised | User Message |
|------------|-------------|--------------|
| `Ash.Error.Invalid` | Validation failed | Field-specific errors |
| `Ash.Error.Query.NotFound` | Resource not found | "Not found" or silent |
| `Ash.Error.Forbidden` | Policy denied | "You don't have access" |
| `Ash.Error.Framework` | Internal error | "Something went wrong" |

---

## LiveView Error Handling

### Basic Pattern

```elixir
def handle_event("create_item", params, socket) do
  case MyApp.Items.create(params, actor: socket.assigns.current_user) do
    {:ok, item} ->
      socket
      |> put_flash(:success, "Item created")
      |> push_navigate(to: ~p"/items/#{item.id}")
      |> then(&{:noreply, &1})

    {:error, %Ash.Error.Invalid{} = error} ->
      # Validation errors -> field-level display
      field_errors = format_ash_errors(error)

      socket
      |> push_event("form:errors", %{errors: field_errors})
      |> then(&{:noreply, &1})

    {:error, %Ash.Error.Forbidden{}} ->
      # Auth error -> global message
      socket
      |> put_flash(:error, "You don't have access to do that")
      |> then(&{:noreply, &1})

    {:error, error} ->
      # Unexpected error -> log + generic message
      Logger.error("Unexpected error",
        error: inspect(error),
        user_id: socket.assigns.current_user.id
      )

      socket
      |> put_flash(:error, "Something went wrong. Please try again.")
      |> then(&{:noreply, &1})
  end
end
```

### Error Formatting Helper

```elixir
defmodule MyAppWeb.ErrorHelpers do
  def format_ash_errors(%Ash.Error.Invalid{errors: errors}) do
    Enum.reduce(errors, %{}, fn error, acc ->
      case error do
        %Ash.Error.Changes.InvalidAttribute{field: field, message: message} ->
          Map.put(acc, to_string(field), humanize_message(message))

        %Ash.Error.Changes.Required{field: field} ->
          Map.put(acc, to_string(field), "Required")

        _ ->
          acc
      end
    end)
  end

  def format_ash_errors(_), do: %{}

  defp humanize_message("has already been taken"), do: "Already in use"
  defp humanize_message("must have the @ sign and no spaces"), do: "Check your email"
  defp humanize_message("must be at least" <> _), do: "Too short"
  defp humanize_message(msg), do: msg
end
```

---

## Logging Patterns

### Structured Logging

```elixir
# config/config.exs
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id, :user_id, :module, :function]
```

### Error Levels

| Level | When to Use | Examples |
|-------|-------------|----------|
| `:debug` | Detailed flow info | "Validation passed" |
| `:info` | Normal operations | "User logged in" |
| `:warning` | Recoverable issues | "Rate limit approached" |
| `:error` | Failed operations | "Database error" |

### What to Log

```elixir
# Good - Structured, no sensitive data
Logger.error("Payment failed",
  user_id: user.id,
  amount: amount,
  error_code: error.code
)

# Bad - Unstructured, contains sensitive data
Logger.error("Payment failed for user #{user.email}")
```

---

## Flash Messages

### Flash Types

| Type | Use Case | Toast Style |
|------|----------|-------------|
| `:info` | Neutral information | Default |
| `:success` | Action completed | Green |
| `:warning` | Caution needed | Yellow |
| `:error` | Action failed | Red |

### Toast Store

```typescript
// toastStore.ts
import { writable } from 'svelte/store';

interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,

    add(toast: Omit<Toast, 'id'>) {
      const id = crypto.randomUUID();
      const duration = toast.duration ?? 5000;

      update(toasts => [...toasts, { ...toast, id }]);

      if (duration > 0) {
        setTimeout(() => this.remove(id), duration);
      }
    },

    remove(id: string) {
      update(toasts => toasts.filter(t => t.id !== id));
    }
  };
}

export const toastStore = createToastStore();
```

### Flash to Toast Integration

```svelte
<script>
  import { toastStore } from '$lib/stores/toast';

  let { live } = $props();

  $effect(() => {
    if (live) {
      live.handleEvent('flash', ({ type, message }) => {
        toastStore.add({ type, message });
      });
    }
  });
</script>
```

---

## Svelte Error Display

### Global Errors (Toast)

```svelte
<Toast />
```

### Field-Level Errors

```svelte
<FormField label="Email" error={fieldErrors.email} required>
  <Input
    type="email"
    bind:value={email}
    invalid={!!fieldErrors.email}
  />
</FormField>
```

### Error Boundaries

```svelte
<script>
  import { EmptyState, Button } from '$lib/components/ui';

  let { children, fallback } = $props();
  let error = $state(null);
</script>

{#if error}
  {#if fallback}
    {@render fallback(error)}
  {:else}
    <EmptyState
      preset="error"
      title="Something went wrong"
      description="We've logged this issue."
    >
      <Button onclick={() => error = null}>Try again</Button>
    </EmptyState>
  {/if}
{:else}
  {@render children()}
{/if}
```

---

## Frontend Logger

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context: LogContext = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  };

  if (import.meta.env.DEV) {
    const colors = { debug: 'gray', info: 'blue', warn: 'orange', error: 'red' };
    console[level === 'debug' ? 'log' : level](
      `%c[${level.toUpperCase()}]`,
      `color: ${colors[level]}`,
      message,
      context
    );
    return;
  }

  if (level === 'error') {
    console.error(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => log('debug', msg, ctx),
  info: (msg: string, ctx?: LogContext) => log('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => log('error', msg, ctx)
};
```

---

## Checklist

**Backend:**
- [ ] All Ash action results are pattern-matched
- [ ] Errors are logged with structured metadata
- [ ] Sensitive data is never logged
- [ ] User-facing messages are human-friendly

**Frontend:**
- [ ] Global errors show as toast
- [ ] Field errors show inline
- [ ] Error boundaries catch component crashes
- [ ] Offline actions are queued and retried

---

## Related Docs

- [user-messaging.md](../_guides/user-messaging.md) - Copy system, Svelte Sonner, Sentry
- [backend-ash.md](../_guides/backend-ash.md) - Ash patterns
- [auth.md](./auth.md) - Auth errors

