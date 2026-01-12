<script>
  /**
   * Toggle Component
   * Switch control using CVA variant management.
   *
   * @prop {boolean} [checked=false] - Toggle state
   * @prop {string} [label] - Label text
   * @prop {string} [description] - Description below label
   * @prop {'sm' | 'md' | 'lg'} [size='md']
   * @prop {boolean} [disabled=false]
   * @prop {string} [class] - Additional classes
   * @prop {(checked: boolean) => void} [onchange]
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    checked = $bindable(false),
    label = '',
    description = '',
    size = 'md',
    disabled = false,
    class: className = '',
    onchange = undefined,
  } = $props();

  const trackVariants = cva(
    [
      'relative shrink-0 rounded-full',
      'transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    ],
    {
      variants: {
        size: {
          sm: 'w-9 h-5',
          md: 'w-11 h-6',
          lg: 'w-14 h-7',
        },
        checked: {
          true: 'bg-primary',
          false: 'bg-input',
        },
      },
      defaultVariants: {
        size: 'md',
        checked: false,
      },
    }
  );

  const thumbVariants = cva(
    'absolute top-1 left-1 bg-white rounded-full shadow-sm transition-transform duration-150',
    {
      variants: {
        size: {
          sm: 'w-3.5 h-3.5',
          md: 'w-4 h-4',
          lg: 'w-5 h-5',
        },
      },
      defaultVariants: {
        size: 'md',
      },
    }
  );

  // Thumb translation when checked
  const thumbTranslate = {
    sm: 'translate-x-4',
    md: 'translate-x-5',
    lg: 'translate-x-7',
  };

  function handleToggle() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }
</script>

<label
  class={cn(
    'inline-flex items-start gap-3',
    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    className
  )}
>
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label || 'Toggle'}
    {disabled}
    class={trackVariants({ size, checked })}
    onclick={handleToggle}
    onkeydown={handleKeydown}
  >
    <span class={cn(thumbVariants({ size }), checked && thumbTranslate[size])} aria-hidden="true"
    ></span>
  </button>

  {#if label || description}
    <div class="pt-0.5">
      {#if label}
        <span class="text-sm font-medium text-foreground">{label}</span>
      {/if}
      {#if description}
        <p class="text-xs text-muted-foreground mt-0.5">{description}</p>
      {/if}
    </div>
  {/if}
</label>
