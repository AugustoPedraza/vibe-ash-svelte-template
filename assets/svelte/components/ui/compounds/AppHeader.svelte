<script lang="ts">
  /**
   * AppHeader Component
   * iOS-style navigation header with CVA.
   *
   * @prop {string} title - Page title (centered)
   * @prop {boolean} [showBack=false]
   * @prop {string} [backLabel='Back']
   * @prop {string} [class] - Additional classes
   * @prop {() => void} [onBack]
   * @prop {Snippet} [actions] - Right-side action buttons
   */
  import { cn } from '$lib/utils.js';
  import { ChevronLeft } from '@lucide/svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    showBack?: boolean;
    backLabel?: string;
    class?: string;
    onBack?: () => void;
    actions?: Snippet;
  }

  let {
    title = '',
    showBack = false,
    backLabel = 'Back',
    class: className = '',
    onBack = () => {},
    actions,
  }: Props = $props();
</script>

<header class={cn('bg-background border-b border-accent', className)}>
  <div class="relative flex items-center justify-center h-14 px-4">
    <!-- Left side: Back button -->
    <div class="absolute left-2 flex items-center">
      {#if showBack}
        <button
          type="button"
          class={cn(
            'flex items-center gap-1 px-2 py-1.5 -ml-2 rounded-lg',
            'text-primary hover:bg-muted active:bg-accent transition-colors'
          )}
          onclick={onBack}
          aria-label="Go back"
        >
          <ChevronLeft class="h-5 w-5" strokeWidth={2.5} />
          <span class="text-base font-medium">{backLabel}</span>
        </button>
      {/if}
    </div>

    <!-- Center: Title -->
    <h1 class="text-base font-semibold text-foreground truncate max-w-[50%]">
      {title}
    </h1>

    <!-- Right side: Actions -->
    <div class="absolute right-2 flex items-center gap-1">
      {@render actions?.()}
    </div>
  </div>
</header>
