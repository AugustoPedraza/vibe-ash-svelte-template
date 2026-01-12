/**
 * Swipe gesture action for Svelte
 * Usage: <div use:swipe on:swipeleft={handler} on:swiperight={handler}>
 */

export interface SwipeOptions {
  /** Minimum distance in px to trigger swipe (default: 50) */
  threshold?: number;
  /** Maximum time in ms for swipe gesture (default: 300) */
  timeout?: number;
  /** Prevent default touch behavior */
  preventDefault?: boolean;
}

export interface SwipeEventDetail {
  direction: 'left' | 'right' | 'up' | 'down';
  deltaX: number;
  deltaY: number;
  duration: number;
}

export function swipe(node: HTMLElement, options: SwipeOptions = {}) {
  const { threshold = 50, timeout = 300, preventDefault = false } = options;

  let startX: number;
  let startY: number;
  let startTime: number;

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!startTime) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const duration = Date.now() - startTime;

    // Check if gesture was quick enough
    if (duration > timeout) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine direction (only if above threshold)
    let direction: 'left' | 'right' | 'up' | 'down' | null = null;

    if (absX > absY && absX > threshold) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (absY > absX && absY > threshold) {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    if (direction) {
      if (preventDefault) e.preventDefault();

      const detail: SwipeEventDetail = { direction, deltaX, deltaY, duration };

      // Dispatch specific direction event
      node.dispatchEvent(new CustomEvent(`swipe${direction}`, { detail }));

      // Also dispatch generic swipe event
      node.dispatchEvent(new CustomEvent('swipe', { detail }));
    }
  }

  node.addEventListener('touchstart', handleTouchStart, { passive: true });
  node.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

  return {
    update(newOptions: SwipeOptions) {
      Object.assign(options, newOptions);
    },
    destroy() {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchend', handleTouchEnd);
    },
  };
}
