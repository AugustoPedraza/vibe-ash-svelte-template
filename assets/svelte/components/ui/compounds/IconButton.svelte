<script>
  /**
   * IconButton Component
   * Icon-only button using CVA variant management.
   *
   * @prop {string} [label] - Aria label (required for accessibility)
   * @prop {'ghost' | 'primary'} [variant='ghost']
   * @prop {'sm' | 'md' | 'lg'} [size='md']
   * @prop {boolean} [disabled=false]
   * @prop {string} [class] - Additional classes
   * @prop {() => void} [onclick] - Click handler
   * @prop {Snippet} [children] - Icon content (SVG)
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    label = '',
    variant = 'ghost',
    size = 'md',
    disabled = false,
    class: className = '',
    onclick = undefined,
    children,
  } = $props();

  const iconButtonVariants = cva(
    [
      'inline-flex items-center justify-center rounded-lg',
      'transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    {
      variants: {
        variant: {
          ghost: 'text-foreground/70 hover:bg-muted active:bg-accent',
          primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        },
        size: {
          sm: 'p-1.5 [&>svg]:w-4 [&>svg]:h-4',
          md: 'p-2 [&>svg]:w-5 [&>svg]:h-5',
          lg: 'p-3 [&>svg]:w-6 [&>svg]:h-6',
        },
      },
      defaultVariants: {
        variant: 'ghost',
        size: 'md',
      },
    }
  );
</script>

<button
  type="button"
  class={cn(iconButtonVariants({ variant, size }), className)}
  {disabled}
  {onclick}
  aria-label={label}
>
  {@render children?.()}
</button>
