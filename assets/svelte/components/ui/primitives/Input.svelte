<script>
  /**
   * Input Component
   * Text input with CVA variant management.
   *
   * @prop {'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'} [type='text']
   * @prop {'sm' | 'md' | 'lg'} [size='md']
   * @prop {string} [value='']
   * @prop {string} [placeholder='']
   * @prop {boolean} [invalid=false] - Error state
   * @prop {boolean} [disabled=false]
   * @prop {boolean} [readonly=false]
   * @prop {string} [id] - For label association
   * @prop {string} [name]
   * @prop {string} [autocomplete]
   * @prop {string} [inputmode] - Virtual keyboard hint
   * @prop {number} [maxlength]
   * @prop {boolean} [textCenter=false]
   * @prop {string} [class] - Additional classes
   * @prop {(e: Event) => void} [oninput]
   * @prop {(e: Event) => void} [onblur]
   * @prop {(e: Event) => void} [onfocus]
   * @prop {(e: KeyboardEvent) => void} [onkeydown]
   */
  import { cva } from 'class-variance-authority';
  import { cn } from '$lib/utils.js';

  let {
    type = 'text',
    size = 'md',
    value = $bindable(''),
    placeholder = '',
    invalid = false,
    disabled = false,
    readonly = false,
    id = undefined,
    name = undefined,
    autocomplete = undefined,
    inputmode = undefined,
    maxlength = undefined,
    textCenter = false,
    class: className = '',
    oninput = undefined,
    onblur = undefined,
    onfocus = undefined,
    onkeydown = undefined,
  } = $props();

  const inputVariants = cva(
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
          sm: 'h-8 px-3 text-sm',
          md: 'h-10 px-4 text-sm',
          lg: 'h-12 px-4 text-base',
        },
        invalid: {
          true: 'border-destructive focus:ring-destructive',
          false: 'border-input',
        },
        textCenter: {
          true: 'text-center',
          false: '',
        },
      },
      defaultVariants: {
        size: 'md',
        invalid: false,
        textCenter: false,
      },
    }
  );
</script>

<input
  {type}
  {id}
  {name}
  {placeholder}
  {disabled}
  {readonly}
  {autocomplete}
  {inputmode}
  {maxlength}
  bind:value
  class={cn(inputVariants({ size, invalid, textCenter }), className)}
  aria-invalid={invalid}
  {oninput}
  {onblur}
  {onfocus}
  {onkeydown}
/>
