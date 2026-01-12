/**
 * Pull to refresh gesture action for Svelte
 * Usage: <div use:pullToRefresh on:refresh={({ detail }) => { await load(); detail.done(); }}>
 */

export interface PullToRefreshOptions {
  /** Distance in px to trigger refresh (default: 80) */
  threshold?: number;
  /** Maximum pull distance in px (default: 120) */
  maxPull?: number;
  /** Only trigger when scrolled to top */
  requireScrollTop?: boolean;
}

export interface PullToRefreshEventDetail {
  /** Call when refresh is complete to reset the UI */
  done: () => void;
}

export function pullToRefresh(node: HTMLElement, options: PullToRefreshOptions = {}) {
  const { threshold = 80, maxPull = 120, requireScrollTop = true } = options;

  let startY: number | null = null;
  let currentPull = 0;
  let isRefreshing = false;

  // Create pull indicator element
  const indicator = document.createElement('div');
  indicator.className = 'pull-to-refresh-indicator';
  indicator.style.cssText = `
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%) translateY(-100%);
    transition: transform 0.2s ease-out;
    padding: 12px;
    opacity: 0.7;
  `;
  indicator.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  `;

  // Ensure parent is positioned
  const parentPosition = getComputedStyle(node).position;
  if (parentPosition === 'static') {
    node.style.position = 'relative';
  }
  node.appendChild(indicator);

  function canPull(): boolean {
    if (!requireScrollTop) return true;
    // Check if at scroll top
    return node.scrollTop <= 0;
  }

  function handleTouchStart(e: TouchEvent) {
    if (isRefreshing) return;
    if (!canPull()) return;

    startY = e.touches[0].clientY;
  }

  function handleTouchMove(e: TouchEvent) {
    if (startY === null || isRefreshing) return;
    if (!canPull()) {
      startY = null;
      return;
    }

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0) {
      // Pulling down
      e.preventDefault();

      // Apply resistance
      currentPull = Math.min(deltaY * 0.5, maxPull);

      // Update indicator
      const progress = Math.min(currentPull / threshold, 1);
      indicator.style.transform = `translateX(-50%) translateY(${currentPull - 24}px)`;
      indicator.style.opacity = String(progress);

      // Rotate arrow when threshold reached
      const arrow = indicator.querySelector('svg');
      if (arrow) {
        arrow.style.transform = currentPull >= threshold ? 'rotate(180deg)' : '';
        arrow.style.transition = 'transform 0.2s ease-out';
      }
    }
  }

  function handleTouchEnd() {
    if (startY === null || isRefreshing) return;

    if (currentPull >= threshold) {
      // Trigger refresh
      isRefreshing = true;

      // Show loading state
      indicator.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"/>
        </svg>
      `;
      indicator.style.transform = `translateX(-50%) translateY(${threshold - 24}px)`;

      const detail: PullToRefreshEventDetail = {
        done: () => {
          isRefreshing = false;
          indicator.style.transform = 'translateX(-50%) translateY(-100%)';
          indicator.style.opacity = '0';

          // Reset indicator
          setTimeout(() => {
            indicator.innerHTML = `
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            `;
          }, 200);
        },
      };

      node.dispatchEvent(new CustomEvent('refresh', { detail }));
    } else {
      // Reset
      indicator.style.transform = 'translateX(-50%) translateY(-100%)';
      indicator.style.opacity = '0';
    }

    startY = null;
    currentPull = 0;
  }

  node.addEventListener('touchstart', handleTouchStart, { passive: true });
  node.addEventListener('touchmove', handleTouchMove, { passive: false });
  node.addEventListener('touchend', handleTouchEnd);
  node.addEventListener('touchcancel', handleTouchEnd);

  return {
    update(newOptions: PullToRefreshOptions) {
      Object.assign(options, newOptions);
    },
    destroy() {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', handleTouchEnd);
      node.removeEventListener('touchcancel', handleTouchEnd);
      indicator.remove();
    },
  };
}
