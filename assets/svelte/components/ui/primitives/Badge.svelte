<script>
  /**
   * Badge Component
   * Status indicators using CVA variant management.
   *
   * @prop {'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'} [variant='neutral']
   * @prop {'sm' | 'md'} [size='sm']
   * @prop {boolean} [dot=false] - Show dot indicator
   * @prop {string} [class] - Additional classes
   * @prop {Snippet} [children]
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let { variant = 'neutral', size = 'sm', dot = false, class: className = '', children } = $props();

  const badgeVariants = cva('inline-flex items-center font-medium rounded-full', {
    variants: {
      variant: {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        success: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        error: 'bg-destructive/10 text-destructive',
        info: 'bg-info-soft text-info',
        neutral: 'bg-muted text-muted-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'sm',
    },
  });

  const dotColors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
    info: 'bg-info',
    neutral: 'bg-muted-foreground',
  };
</script>

{#if dot}
  <span class={cn('inline-flex items-center gap-1.5', badgeVariants({ size }), className)}>
    <span class={cn('w-2 h-2 rounded-full', dotColors[variant])} aria-hidden="true"></span>
    {@render children?.()}
  </span>
{:else}
  <span class={cn(badgeVariants({ variant, size }), className)}>
    {@render children?.()}
  </span>
{/if}
