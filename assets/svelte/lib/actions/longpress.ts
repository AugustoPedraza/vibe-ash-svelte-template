/**
 * Long press gesture action for Svelte
 * Usage: <div use:longPress on:longpress={handler}>
 */

export interface LongPressOptions {
  /** Duration in ms to trigger long press (default: 500) */
  duration?: number;
  /** Trigger haptic feedback on long press */
  haptic?: boolean;
}

export interface LongPressEventDetail {
  x: number;
  y: number;
  duration: number;
}

export function longPress(node: HTMLElement, options: LongPressOptions = {}) {
  const { duration = 500, haptic: useHaptic = true } = options;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let startX: number;
  let startY: number;
  let triggered = false;

  function handleStart(e: TouchEvent | MouseEvent) {
    triggered = false;

    // Get coordinates
    if ('touches' in e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    } else {
      startX = e.clientX;
      startY = e.clientY;
    }

    timer = setTimeout(() => {
      triggered = true;

      // Trigger haptic if available and enabled
      if (useHaptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(20);
        } catch {
          // Ignore
        }
      }

      const detail: LongPressEventDetail = {
        x: startX,
        y: startY,
        duration,
      };

      node.dispatchEvent(new CustomEvent('longpress', { detail }));
    }, duration);
  }

  function handleMove(e: TouchEvent | MouseEvent) {
    if (!timer) return;

    // Get current coordinates
    let currentX: number;
    let currentY: number;

    if ('touches' in e) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    // Cancel if moved too far (10px threshold)
    const distance = Math.sqrt(
      Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
    );

    if (distance > 10) {
      cancel();
    }
  }

  function handleEnd(e: Event) {
    if (triggered) {
      // Prevent click after long press
      e.preventDefault();
    }
    cancel();
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  // Touch events
  node.addEventListener('touchstart', handleStart, { passive: true });
  node.addEventListener('touchmove', handleMove, { passive: true });
  node.addEventListener('touchend', handleEnd);
  node.addEventListener('touchcancel', cancel);

  // Mouse events (for desktop testing)
  node.addEventListener('mousedown', handleStart);
  node.addEventListener('mousemove', handleMove);
  node.addEventListener('mouseup', handleEnd);
  node.addEventListener('mouseleave', cancel);

  return {
    update(newOptions: LongPressOptions) {
      Object.assign(options, newOptions);
    },
    destroy() {
      cancel();
      node.removeEventListener('touchstart', handleStart);
      node.removeEventListener('touchmove', handleMove);
      node.removeEventListener('touchend', handleEnd);
      node.removeEventListener('touchcancel', cancel);
      node.removeEventListener('mousedown', handleStart);
      node.removeEventListener('mousemove', handleMove);
      node.removeEventListener('mouseup', handleEnd);
      node.removeEventListener('mouseleave', cancel);
    },
  };
}
