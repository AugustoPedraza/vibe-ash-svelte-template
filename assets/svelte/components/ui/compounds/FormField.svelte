<script>
  /**
   * FormField Component
   * Label + input wrapper with error/helper text.
   *
   * @prop {string} [label] - Field label text
   * @prop {string} [error] - Error message
   * @prop {string} [helper] - Helper text
   * @prop {boolean} [required=false] - Required indicator
   * @prop {boolean} [shake=false] - Enable shake animation on error
   * @prop {string} [id] - ID for label association
   * @prop {string} [class] - Additional classes
   * @prop {Snippet} [children] - Input element
   */
  import { cn } from '$lib/utils.js';

  let {
    label = '',
    error = '',
    helper = '',
    required = false,
    shake = false,
    id = undefined,
    class: className = '',
    children,
  } = $props();

  const fieldId = $derived(id || `field-${Math.random().toString(36).slice(2, 9)}`);

  // Track error changes to trigger shake animation
  let prevError = $state('');
  let shouldShake = $state(false);

  $effect(() => {
    if (shake && error && error !== prevError) {
      shouldShake = true;
      const timer = setTimeout(() => {
        shouldShake = false;
      }, 500);
      return () => clearTimeout(timer);
    }
    prevError = error;
  });
  const helperId = $derived(`${fieldId}-helper`);
  const errorId = $derived(`${fieldId}-error`);
</script>

<div class={cn('space-y-1.5', shouldShake && 'animate-shake', className)}>
  {#if label}
    <label for={fieldId} class="block text-sm font-medium text-foreground">
      {label}
      {#if required}
        <span class="text-destructive ml-0.5" aria-hidden="true">*</span>
      {/if}
    </label>
  {/if}

  <div>
    {@render children?.()}
  </div>

  {#if error}
    <p
      id={errorId}
      class="text-xs text-destructive flex items-center gap-1"
      role="alert"
      aria-live="polite"
    >
      <svg
        class="w-3.5 h-3.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {error}
    </p>
  {:else if helper}
    <p id={helperId} class="text-xs text-muted-foreground">
      {helper}
    </p>
  {/if}
</div>
