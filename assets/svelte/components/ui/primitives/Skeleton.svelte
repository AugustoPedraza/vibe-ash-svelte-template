<script>
  /**
   * Skeleton Component
   * Loading placeholders using CVA variant management.
   *
   * @prop {'text' | 'circle' | 'rect' | 'card' | 'avatar' | 'button'} [variant='text']
   * @prop {'sm' | 'md' | 'lg'} [size='md']
   * @prop {boolean} [animate=true] - Enable animation
   * @prop {boolean} [shimmer=false] - Use shimmer instead of pulse animation
   * @prop {number} [lines=1] - For text variant
   * @prop {string} [width] - Custom width
   * @prop {string} [height] - Custom height
   * @prop {string} [class] - Additional classes
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    variant = 'text',
    size = 'md',
    animate = true,
    shimmer = false,
    lines = 1,
    width = '',
    height = '',
    class: className = '',
  } = $props();

  const baseVariants = cva('bg-muted', {
    variants: {
      animation: {
        pulse: 'animate-pulse',
        shimmer: 'animate-shimmer',
        none: '',
      },
    },
    defaultVariants: {
      animation: 'pulse',
    },
  });

  // Determine animation type
  const animationType = $derived(
    !animate ? 'none' : shimmer ? 'shimmer' : 'pulse'
  );

  // Text skeleton heights
  const textHeights = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5',
  };

  // Avatar/circle sizes
  const avatarSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  // Button sizes
  const buttonSizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  // Card sizes
  const cardSizes = {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-48',
  };

  const base = $derived(baseVariants({ animation: animationType }));
</script>

<!-- eslint-disable svelte/no-inline-styles -- Dynamic width/height required for skeleton sizing -->
{#if variant === 'text'}
  <div class={cn('space-y-2', className)} style:width={width || undefined}>
    {#each Array(lines) as _, i}
      <div
        class={cn(
          base,
          textHeights[size],
          'rounded-sm',
          i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
        )}
        style:height={height || undefined}
        aria-hidden="true"
      ></div>
    {/each}
  </div>
{:else if variant === 'circle'}
  <div
    class={cn(base, avatarSizes[size], 'rounded-full', className)}
    style:width={width || undefined}
    style:height={height || width || undefined}
    aria-hidden="true"
  ></div>
{:else if variant === 'avatar'}
  <div class={cn('flex items-center gap-3', className)} aria-hidden="true">
    <div class={cn(base, avatarSizes[size], 'rounded-full')}></div>
    <div class="space-y-2 flex-1">
      <div class={cn(base, 'h-4 rounded w-32')}></div>
      <div class={cn(base, 'h-3 rounded w-24')}></div>
    </div>
  </div>
{:else if variant === 'button'}
  <div
    class={cn(base, buttonSizes[size], 'rounded-md', className)}
    style:width={width || undefined}
    style:height={height || undefined}
    aria-hidden="true"
  ></div>
{:else if variant === 'card'}
  <div
    class={cn(base, cardSizes[size], 'rounded-lg w-full', className)}
    style:width={width || undefined}
    style:height={height || undefined}
    aria-hidden="true"
  ></div>
{:else if variant === 'rect'}
  <div
    class={cn(base, 'rounded-md', className)}
    style:width={width || '100%'}
    style:height={height || '100px'}
    aria-hidden="true"
  ></div>
{/if}
