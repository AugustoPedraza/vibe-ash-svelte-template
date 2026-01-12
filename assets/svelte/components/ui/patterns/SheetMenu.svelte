<script>
  /**
   * SheetMenu Component
   * Menu list for BottomSheet using CVA.
   *
   * @prop {Array<MenuItem>} items
   * @prop {string} [class] - Additional classes
   * @prop {(itemId: string) => void} [onSelect]
   * @prop {boolean} [showCancel=true]
   * @prop {() => void} [onCancel]
   *
   * MenuItem: { id, label, icon?, destructive?, disabled?, separator? }
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    items = [],
    class: className = '',
    onSelect = () => {},
    showCancel = true,
    onCancel = () => {},
  } = $props();

  const menuItemVariants = cva('w-full flex items-center gap-3 px-4 py-3 transition-colors', {
    variants: {
      variant: {
        default: 'text-foreground hover:bg-accent active:bg-accent',
        destructive: 'text-destructive hover:bg-destructive/10 active:bg-destructive/15',
        muted: 'text-muted-foreground hover:bg-accent active:bg-accent',
      },
      disabled: {
        true: 'opacity-40 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      disabled: false,
    },
  });

  // Group items by separators
  const groups = $derived.by(() => {
    const result = [[]];
    let currentGroup = 0;

    items.forEach((item) => {
      if (item.separator) {
        currentGroup++;
        result[currentGroup] = [];
      } else {
        result[currentGroup].push(item);
      }
    });

    return result.filter((g) => g.length > 0);
  });

  function getVariant(item) {
    if (item.destructive) return 'destructive';
    return 'default';
  }
</script>

<div class={cn('pt-1 pb-2', className)} role="menu">
  {#each groups as group, groupIndex (groupIndex)}
    {#if groupIndex > 0}
      <div class="h-px bg-border my-1" role="separator"></div>
    {/if}
    {#each group as item (item.id)}
      <button
        type="button"
        class={menuItemVariants({
          variant: getVariant(item),
          disabled: item.disabled,
        })}
        onclick={() => !item.disabled && onSelect(item.id)}
        disabled={item.disabled}
        role="menuitem"
      >
        {#if item.icon}
          <span
            class={cn(
              'w-5 h-5 flex-shrink-0',
              item.destructive ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {@render item.icon()}
          </span>
        {/if}
        <span class="text-sm font-medium">{item.label}</span>
      </button>
    {/each}
  {/each}

  {#if showCancel}
    <div class="h-px bg-border my-1" role="separator"></div>
    <button type="button" class={menuItemVariants({ variant: 'muted' })} onclick={onCancel} role="menuitem">
      <span class="text-sm font-medium">Cancel</span>
    </button>
  {/if}
</div>
