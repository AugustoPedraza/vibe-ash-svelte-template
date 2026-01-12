<script>
  /**
   * Textarea Component
   * Multi-line text input with CVA variant management.
   *
   * @prop {'sm' | 'md' | 'lg'} [size='md']
   * @prop {string} [value='']
   * @prop {string} [placeholder='']
   * @prop {boolean} [invalid=false] - Error state
   * @prop {boolean} [disabled=false]
   * @prop {boolean} [readonly=false]
   * @prop {string} [id] - For label association
   * @prop {string} [name]
   * @prop {number} [rows=4]
   * @prop {number} [maxlength]
   * @prop {boolean} [resizable=true]
   * @prop {string} [class] - Additional classes
   * @prop {(e: Event) => void} [oninput]
   * @prop {(e: Event) => void} [onblur]
   * @prop {(e: Event) => void} [onfocus]
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    size = 'md',
    value = $bindable(''),
    placeholder = '',
    invalid = false,
    disabled = false,
    readonly = false,
    id = undefined,
    name = undefined,
    rows = 4,
    maxlength = undefined,
    resizable = true,
    class: className = '',
    oninput = undefined,
    onblur = undefined,
    onfocus = undefined,
  } = $props();

  const textareaVariants = cva(
    [
      'w-full',
      'bg-background text-foreground',
      'border rounded-md',
      'transition-colors duration-150',
      'placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed',
      'read-only:bg-muted',
    ],
    {
      variants: {
        size: {
          sm: 'px-3 py-2 text-sm',
          md: 'px-4 py-3 text-sm',
          lg: 'px-4 py-4 text-base',
        },
        invalid: {
          true: 'border-destructive focus:ring-destructive',
          false: 'border-input',
        },
        resizable: {
          true: 'resize-y',
          false: 'resize-none',
        },
      },
      defaultVariants: {
        size: 'md',
        invalid: false,
        resizable: true,
      },
    }
  );
</script>

<textarea
  {id}
  {name}
  {placeholder}
  {disabled}
  {readonly}
  {rows}
  {maxlength}
  bind:value
  class={cn(textareaVariants({ size, invalid, resizable }), className)}
  aria-invalid={invalid}
  {oninput}
  {onblur}
  {onfocus}
></textarea>
