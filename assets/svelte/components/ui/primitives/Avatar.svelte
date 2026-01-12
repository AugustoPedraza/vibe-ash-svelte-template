<script>
  /**
   * Avatar Component
   * User representation using CVA variant management.
   *
   * @prop {string} [src] - Image URL
   * @prop {string} [alt=''] - Alt text for image
   * @prop {string} [initials] - Fallback initials (e.g., "JD")
   * @prop {'xs' | 'sm' | 'md' | 'lg' | 'xl'} [size='md']
   * @prop {'circle' | 'square'} [shape='circle']
   * @prop {'online' | 'offline' | 'busy' | 'away' | null} [status=null]
   * @prop {string} [class] - Additional classes
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    src = '',
    alt = '',
    initials = '',
    size = 'md',
    shape = 'circle',
    status = null,
    class: className = '',
  } = $props();

  const avatarVariants = cva('object-cover bg-muted', {
    variants: {
      size: {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  });

  const statusVariants = cva('absolute bottom-0 right-0 rounded-full border-background', {
    variants: {
      status: {
        online: 'bg-success',
        offline: 'bg-muted-foreground',
        busy: 'bg-destructive',
        away: 'bg-warning',
      },
      size: {
        xs: 'w-1.5 h-1.5 border',
        sm: 'w-2 h-2 border',
        md: 'w-2.5 h-2.5 border-2',
        lg: 'w-3 h-3 border-2',
        xl: 'w-3.5 h-3.5 border-2',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  });

  const displayInitials = $derived(
    initials ||
      alt
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
  );
</script>

<div class={cn('relative inline-flex', className)}>
  {#if src}
    <img {src} {alt} class={avatarVariants({ size, shape })} />
  {:else}
    <div
      class={cn(
        avatarVariants({ size, shape }),
        'text-muted-foreground flex items-center justify-center font-medium'
      )}
      aria-label={alt}
    >
      {displayInitials || '?'}
    </div>
  {/if}

  {#if status}
    <span class={statusVariants({ status, size })} aria-label={status}></span>
  {/if}
</div>
