/**
 * Page Visibility Store
 *
 * Tracks whether the page is in foreground or background.
 * Used for pausing polling, animations, and saving battery on mobile.
 */
import { writable, derived, type Readable } from 'svelte/store';

export type VisibilityState = 'visible' | 'hidden';

const createVisibilityStore = (): Readable<VisibilityState> => {
  const initial: VisibilityState =
    typeof document !== 'undefined' ? (document.visibilityState as VisibilityState) : 'visible';

  const { subscribe, set } = writable<VisibilityState>(initial);

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      set(document.visibilityState as VisibilityState);
    });

    window.addEventListener('pageshow', () => set('visible'));
    window.addEventListener('pagehide', () => set('hidden'));
    window.addEventListener('focus', () => set('visible'));
    window.addEventListener('blur', () => set('hidden'));
  }

  return { subscribe };
};

export const visibility = createVisibilityStore();

export const isBackground: Readable<boolean> = derived(visibility, ($v) => $v === 'hidden');

export const isForeground: Readable<boolean> = derived(visibility, ($v) => $v === 'visible');

export const runWhenVisible = (callback: () => void, interval = 1000): (() => void) => {
  let timerId: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    if (!timerId) {
      timerId = setInterval(callback, interval);
    }
  };

  const stop = () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  const unsubscribe = visibility.subscribe(($v) => {
    if ($v === 'visible') {
      start();
      callback();
    } else {
      stop();
    }
  });

  return () => {
    stop();
    unsubscribe();
  };
};

export const pauseWhenHidden = (node: HTMLElement): { destroy: () => void } => {
  const unsubscribe = isBackground.subscribe(($hidden) => {
    node.style.animationPlayState = $hidden ? 'paused' : 'running';
  });

  return { destroy: unsubscribe };
};
