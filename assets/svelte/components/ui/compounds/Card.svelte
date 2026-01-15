<script>
  /**
   * Card Component
   * Container with CVA variant management.
   *
   * @prop {'elevated' | 'outlined' | 'flat'} [variant='outlined']
   * @prop {'sm' | 'md' | 'lg' | 'none'} [padding='md']
   * @prop {boolean} [interactive=false] - Enable hover lift effect
   * @prop {string} [title] - Optional card title
   * @prop {string} [description] - Optional description
   * @prop {Snippet} [header] - Custom header slot
   * @prop {Snippet} [footer] - Footer slot
   * @prop {Snippet} [actions] - Actions slot
   * @prop {Snippet} [children] - Main content
   * @prop {string} [class] - Additional classes
   * @prop {() => void} [onclick] - Click handler (for interactive cards)
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    variant = 'outlined',
    padding = 'md',
    interactive = false,
    title = '',
    description = '',
    header = undefined,
    footer = undefined,
    actions = undefined,
    children,
    class: className = '',
    onclick = undefined,
  } = $props();

  const cardVariants = cva('rounded-lg overflow-hidden', {
    variants: {
      variant: {
        elevated: 'bg-card text-card-foreground shadow-card border-0',
        outlined: 'bg-card text-card-foreground border border-border shadow-sm',
        flat: 'bg-muted text-foreground border-0',
      },
      interactive: {
        true: [
          'cursor-pointer',
          'transition-all duration-150',
          'hover:shadow-md hover:-translate-y-0.5', // Hover lift
          'active:translate-y-0 active:shadow-sm',   // Press feedback
        ],
        false: '',
      },
    },
    defaultVariants: {
      variant: 'outlined',
      interactive: false,
    },
  });

  // Using 8px grid: sm=8px, md=16px, lg=24px
  const paddings = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };
</script>

<div
  class={cn(cardVariants({ variant, interactive }), className)}
  role={interactive ? 'button' : undefined}
  tabindex={interactive ? 0 : undefined}
  {onclick}
  onkeydown={interactive ? (e) => e.key === 'Enter' && onclick?.() : undefined}
>
  {#if header}
    <div class={cn('border-b border-border', paddings[padding])}>
      {@render header()}
    </div>
  {:else if title || description}
    <div class={cn('border-b border-border', paddings[padding])}>
      {#if title}
        <h3 class="text-base font-semibold text-foreground">{title}</h3>
      {/if}
      {#if description}
        <p class="text-sm text-muted-foreground mt-1">{description}</p>
      {/if}
    </div>
  {/if}

  <div class={paddings[padding]}>
    {@render children?.()}
  </div>

  {#if actions}
    <div
      class={cn('border-t border-border flex items-center justify-end gap-2', paddings[padding])}
    >
      {@render actions()}
    </div>
  {/if}

  {#if footer}
    <div class={cn('border-t border-border', paddings[padding])}>
      {@render footer()}
    </div>
  {/if}
</div>
