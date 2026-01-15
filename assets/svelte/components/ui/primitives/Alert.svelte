<script lang="ts">
  /**
   * Alert Component
   * Displays contextual feedback messages with consistent styling.
   *
   * @prop {'error' | 'warning' | 'success' | 'info'} [variant='info'] - Alert type
   * @prop {string} [title] - Optional title for the alert
   * @prop {boolean} [dismissible=false] - Whether alert can be dismissed
   * @prop {boolean} [animate=false] - Enable success-pop animation on mount
   * @prop {string} [class] - Additional classes
   */
  import { cn } from '$lib/utils.js';
  import { AlertTriangle, CheckCircle, Info, X } from '@lucide/svelte';

  type Variant = 'error' | 'warning' | 'success' | 'info';

  interface Props {
    variant?: Variant;
    title?: string;
    dismissible?: boolean;
    animate?: boolean;
    class?: string;
    ondismiss?: () => void;
    children?: import('svelte').Snippet;
  }

  let {
    variant = 'info',
    title,
    dismissible = false,
    animate = false,
    class: className = '',
    ondismiss,
    children,
  }: Props = $props();

  let dismissed = $state(false);

  const variantStyles: Record<Variant, string> = {
    error: 'bg-error-soft border-error/30 text-error',
    warning: 'bg-warning-soft border-warning/30 text-warning',
    success: 'bg-success-soft border-success/30 text-success',
    info: 'bg-info-soft border-info/30 text-info',
  };

  const variantIcons = {
    error: AlertTriangle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
  };

  function handleDismiss() {
    dismissed = true;
    ondismiss?.();
  }

  const IconComponent = $derived(variantIcons[variant]);
</script>

{#if !dismissed}
  <div
    class={cn(
      'flex items-start gap-3 p-3 border rounded-lg text-sm',
      variantStyles[variant],
      animate && 'animate-success-pop',
      className
    )}
    role="alert"
  >
    <IconComponent class="h-5 w-5 shrink-0 mt-0.5" strokeWidth={2} aria-hidden="true" />

    <div class="flex-1 min-w-0">
      {#if title}
        <p class="font-medium">{title}</p>
      {/if}
      {#if children}
        <div class={title ? 'mt-1 opacity-90' : ''}>
          {@render children()}
        </div>
      {/if}
    </div>

    {#if dismissible}
      <button
        type="button"
        class="shrink-0 p-1 -m-1 rounded hover:bg-black/5 transition-colors"
        onclick={handleDismiss}
        aria-label="Dismiss alert"
      >
        <X class="h-4 w-4" strokeWidth={2} />
      </button>
    {/if}
  </div>
{/if}
