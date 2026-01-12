<script>
  /**
   * EmptyState Component
   * Empty data display with presets.
   *
   * @prop {'default' | 'search' | 'error' | 'success' | 'offline'} [preset='default']
   * @prop {string} [title] - Custom title
   * @prop {string} [description] - Custom description
   * @prop {string} [class] - Additional classes
   * @prop {Snippet} [icon] - Custom icon
   * @prop {Snippet} [action] - Action button
   * @prop {Snippet} [children] - Additional content
   */
  import { cn } from '$lib/utils.js';

  let {
    preset = 'default',
    title = '',
    description = '',
    class: className = '',
    icon = undefined,
    action = undefined,
    children,
  } = $props();

  const presets = {
    default: {
      title: 'No items yet',
      description: 'Get started by creating your first item.',
      icon: 'inbox',
    },
    search: {
      title: 'No results found',
      description: 'Try adjusting your search or filters.',
      icon: 'search',
    },
    error: {
      title: 'Something went wrong',
      description: 'Please try again or contact support.',
      icon: 'error',
    },
    success: {
      title: 'All done!',
      description: "You've completed all your tasks.",
      icon: 'check',
    },
    offline: {
      title: "You're offline",
      description: 'Check your connection and try again.',
      icon: 'wifi',
    },
  };

  const config = $derived(presets[preset]);
  const displayTitle = $derived(title || config.title);
  const displayDescription = $derived(description || config.description);

  const icons = {
    inbox:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />',
    search:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />',
    error:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />',
    check:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />',
    wifi: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />',
  };
</script>

<div class={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
  <!-- Icon -->
  <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
    {#if icon}
      {@render icon()}
    {:else}
      <svg
        class="w-8 h-8 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- Trusted SVG paths from internal icons object -->
        {@html icons[config.icon]}
      </svg>
    {/if}
  </div>

  <!-- Title -->
  <h3 class="text-base font-semibold text-foreground mb-1">
    {displayTitle}
  </h3>

  <!-- Description -->
  <p class="text-sm text-muted-foreground max-w-sm mb-6">
    {displayDescription}
  </p>

  <!-- Custom content -->
  {#if children}
    <div class="mb-6">
      {@render children()}
    </div>
  {/if}

  <!-- Action -->
  {#if action}
    <div>
      {@render action()}
    </div>
  {/if}
</div>
