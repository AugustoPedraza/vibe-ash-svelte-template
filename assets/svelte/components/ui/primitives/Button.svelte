<script>
  /**
   * Button Component
   * Primary interactive element using CVA for variant management.
   *
   * @prop {'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'} [variant='primary']
   * @prop {'sm' | 'md' | 'lg' | 'icon'} [size='md']
   * @prop {boolean} [loading=false] - Shows loading spinner
   * @prop {boolean} [disabled=false]
   * @prop {boolean} [fullWidth=false]
   * @prop {'button' | 'submit' | 'reset'} [type='button']
   * @prop {string} [ariaLabel] - For icon-only buttons
   * @prop {string} [class] - Additional classes (merged with tailwind-merge)
   * @prop {() => void} [onclick]
   * @prop {Snippet} [children]
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';
  import { LoaderCircle } from '@lucide/svelte';

  let {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    type = 'button',
    ariaLabel = undefined,
    class: className = '',
    onclick = undefined,
    children,
  } = $props();

  /**
   * Button variants using CVA
   * Defines all variant combinations in a type-safe, maintainable way
   */
  const buttonVariants = cva(
    // Base classes applied to all buttons
    [
      'inline-flex items-center justify-center',
      'font-medium whitespace-nowrap select-none',
      'transition-all duration-150',
      'active:scale-95', // Press feedback
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    {
      variants: {
        variant: {
          primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
          secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
          outline:
            'bg-background text-foreground shadow-sm border border-input hover:bg-accent hover:text-accent-foreground',
          ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
          danger: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
        },
        size: {
          sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
          md: 'h-10 px-4 text-sm gap-2 rounded-md',
          lg: 'h-12 px-6 text-base gap-2 rounded-lg',
          icon: 'h-10 w-10 rounded-md',
        },
        fullWidth: {
          true: 'w-full',
          false: '',
        },
      },
      defaultVariants: {
        variant: 'primary',
        size: 'md',
        fullWidth: false,
      },
    }
  );
</script>

<button
  {type}
  class={cn(buttonVariants({ variant, size, fullWidth }), className)}
  disabled={disabled || loading}
  aria-label={ariaLabel}
  aria-busy={loading}
  {onclick}
>
  {#if loading}
    <LoaderCircle class="animate-spin h-4 w-4" aria-hidden="true" />
  {/if}
  {@render children?.()}
</button>
