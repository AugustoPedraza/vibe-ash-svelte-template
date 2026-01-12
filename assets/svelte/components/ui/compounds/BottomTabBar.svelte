<script>
  /**
   * BottomTabBar Component
   * Mobile navigation with CVA variant management.
   *
   * @prop {Array<{id: string, label: string, icon: Snippet, badge?: number}>} tabs
   * @prop {string} activeTab - Currently active tab ID
   * @prop {string} [class] - Additional classes
   * @prop {(tabId: string) => void} [onSelect]
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    tabs = [],
    activeTab = $bindable(''),
    class: className = '',
    onSelect = () => {},
  } = $props();

  const tabVariants = cva(
    ['flex flex-col items-center gap-1 px-4 py-2 min-w-16', 'transition-colors relative'],
    {
      variants: {
        active: {
          true: 'text-primary',
          false: 'text-muted-foreground hover:text-foreground/70',
        },
      },
      defaultVariants: {
        active: false,
      },
    }
  );

  function handleSelect(tabId) {
    activeTab = tabId;
    onSelect(tabId);
  }
</script>

<nav class={cn('bg-background border-t border-accent pb-safe', className)}>
  <div class="flex justify-around">
    {#each tabs as tab (tab.id)}
      <button
        type="button"
        class={tabVariants({ active: activeTab === tab.id })}
        onclick={() => handleSelect(tab.id)}
        aria-current={activeTab === tab.id ? 'page' : undefined}
      >
        <div class="relative">
          {@render tab.icon?.()}
          {#if tab.badge && tab.badge > 0}
            <span
              class={cn(
                'absolute -top-1.5 -right-1.5 min-w-4 h-4',
                'flex items-center justify-center',
                'text-xs font-bold bg-destructive text-white rounded-full px-1'
              )}
            >
              {tab.badge > 99 ? '99+' : tab.badge}
            </span>
          {/if}
        </div>
        <span class="text-xs font-medium">{tab.label}</span>
      </button>
    {/each}
  </div>
</nav>

<style>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
</style>
