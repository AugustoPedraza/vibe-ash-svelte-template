<script lang="ts">
  /**
   * Icon Component
   * Thin wrapper around Lucide icons with standardized sizing.
   *
   * Usage:
   *   <Icon icon={Check} />
   *   <Icon icon={User} size="lg" class="text-primary" />
   *   <Icon icon={ArrowRight} size="sm" />
   *
   * Import icons from lucide:
   *   import { Check, User, ArrowRight } from '@lucide/svelte';
   *
   * @prop {Component} icon - Lucide icon component
   * @prop {'xs' | 'sm' | 'md' | 'lg' | 'xl'} [size='md'] - Icon size
   * @prop {string} [label] - Accessible label (sr-only)
   * @prop {string} [class] - Additional classes
   * @prop {number} [strokeWidth] - Stroke width (default: 2)
   */
  import { cn } from '$lib/utils.js';
  import type { Component } from 'svelte';

  // Icon size classes following 4px base scale
  const sizes = {
    xs: 12, // 12px - tiny indicators
    sm: 16, // 16px - inline with text
    md: 20, // 20px - default, buttons
    lg: 24, // 24px - headers, prominent
    xl: 32, // 32px - hero/empty states
  } as const;

  interface Props {
    icon: Component;
    size?: keyof typeof sizes;
    label?: string;
    strokeWidth?: number;
    class?: string;
  }

  let {
    icon: IconComponent,
    size = 'md',
    label,
    strokeWidth = 2,
    class: className = '',
  }: Props = $props();

  const pixelSize = $derived(sizes[size]);
</script>

<IconComponent
  size={pixelSize}
  {strokeWidth}
  class={cn('shrink-0', className)}
  aria-hidden={!label}
  aria-label={label}
/>
