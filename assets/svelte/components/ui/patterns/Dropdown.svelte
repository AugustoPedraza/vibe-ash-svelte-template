<script>
  /**
   * Dropdown Component
   * Menu with keyboard navigation using CVA.
   *
   * @prop {boolean} [open=false]
   * @prop {Array<{id: string, label: string, icon?: string, danger?: boolean, disabled?: boolean} | 'divider'>} [items=[]]
   * @prop {'left' | 'right'} [align='left']
   * @prop {string} [class] - Additional classes for menu
   * @prop {Snippet} [trigger] - Custom trigger
   * @prop {Snippet} [children] - Alternative to items
   * @prop {(item: {id: string, label: string}) => void} [onselect]
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    open = $bindable(false),
    items = [],
    align = 'left',
    class: className = '',
    trigger = undefined,
    children = undefined,
    onselect = undefined,
  } = $props();

  let focusedIndex = $state(-1);

  const menuVariants = cva(
    [
      'absolute z-dropdown mt-1',
      'min-w-40 max-w-72',
      'bg-popover text-popover-foreground rounded-lg',
      'border border-border shadow-lg py-1',
      'animate-scale-in origin-top',
    ],
    {
      variants: {
        align: {
          left: 'left-0',
          right: 'right-0',
        },
      },
      defaultVariants: {
        align: 'left',
      },
    }
  );

  const menuItemVariants = cva(
    'w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors duration-150',
    {
      variants: {
        state: {
          default: 'text-foreground hover:bg-accent',
          danger: 'text-destructive hover:bg-destructive/10',
          disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
          focused: 'bg-accent',
        },
      },
      defaultVariants: {
        state: 'default',
      },
    }
  );

  function handleToggle() {
    open = !open;
    if (open) focusedIndex = 0;
  }

  function handleClose() {
    open = false;
    focusedIndex = -1;
  }

  function handleSelect(item) {
    if (item.disabled) return;
    onselect?.(item);
    handleClose();
  }

  function handleKeydown(e) {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    const selectableItems = items.filter((item) => item !== 'divider' && !item.disabled);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        focusedIndex = Math.min(focusedIndex + 1, selectableItems.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusedIndex = Math.max(focusedIndex - 1, 0);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < selectableItems.length) {
          handleSelect(selectableItems[focusedIndex]);
        }
        break;
      case 'Tab':
        handleClose();
        break;
    }
  }

  function handleClickOutside() {
    if (open) handleClose();
  }

  function getItemState(item, isFocused) {
    if (item.disabled) return 'disabled';
    if (isFocused) return 'focused';
    if (item.danger) return 'danger';
    return 'default';
  }
</script>

<svelte:window onclick={open ? handleClickOutside : undefined} />

<div class="relative inline-block" role="presentation" onkeydown={handleKeydown}>
  <!-- Trigger -->
  {#if trigger}
    <button
      type="button"
      class="contents"
      onclick={(e) => {
        e.stopPropagation();
        handleToggle();
      }}
      aria-haspopup="menu"
      aria-expanded={open}
    >
      {@render trigger()}
    </button>
  {:else}
    <button
      type="button"
      class={cn(
        'p-2 rounded-md text-muted-foreground hover:bg-accent',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label="Open menu"
      onclick={(e) => {
        e.stopPropagation();
        handleToggle();
      }}
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
        />
      </svg>
    </button>
  {/if}

  <!-- Menu -->
  {#if open}
    <div class={cn(menuVariants({ align }), className)} role="menu" tabindex="-1">
      {#if children}
        {@render children()}
      {:else}
        {#each items as item, i (item === 'divider' ? `divider-${i}` : (item.id ?? i))}
          {#if item === 'divider'}
            <div class="h-px bg-border my-1" role="separator"></div>
          {:else}
            {@const selectableIndex = items
              .slice(0, i)
              .filter((it) => it !== 'divider' && !it.disabled).length}
            {@const isFocused = selectableIndex === focusedIndex && !item.disabled}
            <button
              type="button"
              class={menuItemVariants({ state: getItemState(item, isFocused) })}
              role="menuitem"
              disabled={item.disabled}
              onclick={() => handleSelect(item)}
            >
              {item.label}
            </button>
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</div>
