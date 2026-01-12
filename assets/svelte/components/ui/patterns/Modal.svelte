<script>
  /**
   * Modal Component
   * Overlay dialog using CVA variant management.
   *
   * @prop {boolean} [open=false] - Controls visibility
   * @prop {string} [title] - Modal title
   * @prop {'sm' | 'md' | 'lg' | 'full'} [size='md']
   * @prop {boolean} [closeOnBackdrop=true]
   * @prop {boolean} [showClose=true]
   * @prop {string} [class] - Additional classes
   * @prop {Snippet} [header] - Custom header
   * @prop {Snippet} [footer] - Footer slot
   * @prop {Snippet} [children] - Main content
   * @prop {() => void} [onclose]
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    open = $bindable(false),
    title = '',
    size = 'md',
    closeOnBackdrop = true,
    showClose = true,
    class: className = '',
    header = undefined,
    footer = undefined,
    children,
    onclose = undefined,
  } = $props();

  const modalVariants = cva(
    [
      'relative w-full',
      'bg-background rounded-t-xl sm:rounded-xl',
      'shadow-xl flex flex-col',
      'max-h-[90vh] sm:max-h-[85vh]',
      'animate-slide-up sm:animate-scale-in',
    ],
    {
      variants: {
        size: {
          sm: 'max-w-sm',
          md: 'max-w-md',
          lg: 'max-w-lg',
          full: 'max-w-full mx-4',
        },
      },
      defaultVariants: {
        size: 'md',
      },
    }
  );

  function handleClose() {
    open = false;
    onclose?.();
  }

  function handleBackdropClick() {
    if (closeOnBackdrop) {
      handleClose();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
  <div
    class="fixed inset-0 z-modal flex items-end sm:items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/50 animate-fade-in"
      onclick={handleBackdropClick}
      aria-hidden="true"
    ></div>

    <!-- Modal Content -->
    <div class={cn(modalVariants({ size }), className)}>
      <!-- Header -->
      {#if header}
        <div class="shrink-0 px-6 pt-4 pb-3 border-b border-border">
          {@render header()}
        </div>
      {:else if title || showClose}
        <div
          class="shrink-0 px-6 pt-4 pb-3 flex items-center justify-between border-b border-border"
        >
          {#if title}
            <h2 id="modal-title" class="text-lg font-semibold text-foreground">{title}</h2>
          {:else}
            <div></div>
          {/if}

          {#if showClose}
            <button
              type="button"
              class="p-2 -mr-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              onclick={handleClose}
              aria-label="Close"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      {/if}

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-6 overscroll-contain">
        {@render children?.()}
      </div>

      <!-- Footer -->
      {#if footer}
        <div class="shrink-0 px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
