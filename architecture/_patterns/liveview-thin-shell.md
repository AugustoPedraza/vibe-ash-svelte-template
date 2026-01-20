# Pattern: LiveView Thin Shell with Svelte Delegation

> Keep LiveView minimal - load data, handle events, delegate all UI to a single Svelte component

## Problem

When mixing LiveView and Svelte, it's tempting to split logic between them:
- Some UI in HEEx templates
- Some UI in Svelte components
- State scattered across both

This creates:
- Confusion about where logic lives
- Difficulty testing
- State synchronization issues

## Solution

Make LiveView a "thin shell" that only handles:
1. **Mount** - Initialize assigns, start async data loading
2. **Data loading** - Use `assign_async` for skeleton states
3. **Event handling** - Receive events from Svelte, update state
4. **Props building** - Serialize data for Svelte consumption

All UI rendering happens in a single Svelte component that receives status and data via props.

## Example

### LiveView (Thin Shell)

```elixir
defmodule MyAppWeb.ItemLive do
  @moduledoc """
  Item detail page - thin shell that delegates UI to Svelte.
  """
  use MyAppWeb, :live_view

  @impl true
  def mount(%{"id" => id}, _session, socket) do
    socket =
      socket
      |> assign(page_title: "Item")
      |> assign(item_id: id)
      |> assign_async(:item, fn -> load_item(id) end)

    {:ok, socket}
  end

  defp load_item(id) do
    case MyApp.Items.get(id) do
      {:ok, item} -> {:ok, %{item: item}}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def render(assigns) do
    ~H"""
    <.svelte
      name="features/items/ItemDetail"
      props={build_props(assigns)}
      socket={@socket}
    />
    """
  end

  defp build_props(assigns) do
    {status, item} = extract_status(assigns.item)

    %{
      status: status,
      item: serialize_item(item),
      csrfToken: Phoenix.Controller.get_csrf_token()
    }
  end

  # Status extraction (see async-result-extraction pattern)
  defp extract_status(%{loading: _}), do: {"loading", nil}
  defp extract_status(%{ok?: true, result: %{item: item}}), do: {"success", item}
  defp extract_status(%{failed: _}), do: {"error", nil}
  defp extract_status(_), do: {"loading", nil}

  # Serialize to plain maps for JSON
  defp serialize_item(nil), do: nil
  defp serialize_item(item) do
    %{
      id: item.id,
      name: item.name,
      # ... other fields
    }
  end

  # Event handlers
  @impl true
  def handle_event("delete", %{"id" => id}, socket) do
    case MyApp.Items.delete(id) do
      :ok -> {:noreply, push_navigate(socket, to: ~p"/items")}
      {:error, _} -> {:noreply, put_flash(socket, :error, "Delete failed")}
    end
  end

  def handle_event("retry", _params, socket) do
    socket = assign_async(socket, :item, fn -> load_item(socket.assigns.item_id) end)
    {:noreply, socket}
  end
end
```

### Svelte Component (All UI)

```svelte
<!-- components/features/items/ItemDetail.svelte -->
<script lang="ts">
  import { Screen, Skeleton, EmptyState, Button } from '$components/ui';
  import { pushEvent } from '$lib';

  interface Props {
    status: 'loading' | 'error' | 'success';
    item: { id: string; name: string } | null;
    csrfToken: string;
  }

  let { status, item, csrfToken }: Props = $props();

  function handleRetry() {
    pushEvent('retry', {});
  }

  function handleDelete() {
    if (item && confirm('Delete this item?')) {
      pushEvent('delete', { id: item.id });
    }
  }
</script>

<Screen>
  {#if status === 'loading'}
    <Skeleton variant="card" />
  {:else if status === 'error'}
    <EmptyState preset="error">
      {#snippet action()}
        <Button onclick={handleRetry}>Retry</Button>
      {/snippet}
    </EmptyState>
  {:else if item}
    <h1>{item.name}</h1>
    <Button variant="destructive" onclick={handleDelete}>Delete</Button>
  {/if}
</Screen>
```

## Benefits

| Aspect | Thin Shell Approach |
|--------|---------------------|
| **Testing** | LiveView tests for data/events, Svelte tests for UI |
| **State** | Single source of truth (LiveView assigns) |
| **Debugging** | Clear separation - data issues vs UI issues |
| **Reusability** | Svelte component can be used with different data sources |

## Rules

1. **One Svelte component per LiveView** - Don't mix HEEx and Svelte
2. **Props are the contract** - Define clear TypeScript interfaces
3. **Status is always passed** - Never assume success
4. **Serialize everything** - No Elixir structs in props
5. **Events flow up** - Svelte calls `pushEvent`, LiveView handles

## When to Use

- Any feature page with complex UI
- Pages with loading/error/empty states
- When you want Svelte's reactivity for the UI

## When NOT to Use

- Simple pages with minimal UI (use HEEx directly)
- Server-rendered static content
- When real-time updates from server are primary (use LiveView components)

## Tech Stack

`elixir` `phoenix` `liveview` `livesvelte` `svelte`

## Source

Discovered in: Syna / HOME-001
Date: 2026-01-20
