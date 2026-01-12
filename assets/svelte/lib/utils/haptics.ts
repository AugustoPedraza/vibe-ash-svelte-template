/**
 * Haptic feedback utilities for mobile PWA
 * Uses the Vibration API where available
 */

export enum HapticType {
  /** Light tap - for selections, toggles */
  LIGHT = 'light',
  /** Medium impact - for button presses */
  MEDIUM = 'medium',
  /** Heavy impact - for significant actions */
  HEAVY = 'heavy',
  /** Success feedback */
  SUCCESS = 'success',
  /** Warning feedback */
  WARNING = 'warning',
  /** Error feedback */
  ERROR = 'error',
  /** Selection changed */
  SELECTION = 'selection',
}

/** Vibration patterns in milliseconds */
const HAPTIC_PATTERNS: Record<HapticType, number[]> = {
  [HapticType.LIGHT]: [10],
  [HapticType.MEDIUM]: [20],
  [HapticType.HEAVY]: [30],
  [HapticType.SUCCESS]: [10, 50, 10],
  [HapticType.WARNING]: [20, 100, 20],
  [HapticType.ERROR]: [30, 50, 30, 50, 30],
  [HapticType.SELECTION]: [5],
};

/** Check if haptics are supported */
export function supportsHaptics(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/** Check user preference for reduced motion */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Trigger haptic feedback
 * Respects user preferences and gracefully degrades
 */
export function haptic(type: HapticType = HapticType.LIGHT): void {
  // Respect reduced motion preference
  if (prefersReducedMotion()) return;

  // Check support
  if (!supportsHaptics()) return;

  try {
    const pattern = HAPTIC_PATTERNS[type] || HAPTIC_PATTERNS[HapticType.LIGHT];
    navigator.vibrate(pattern);
  } catch {
    // Silently fail - haptics are enhancement only
  }
}

/**
 * Create a haptic-enabled click handler
 * Wraps your handler with haptic feedback
 */
export function withHaptic<T extends (...args: unknown[]) => unknown>(
  handler: T,
  type: HapticType = HapticType.LIGHT
): T {
  return ((...args: Parameters<T>) => {
    haptic(type);
    return handler(...args);
  }) as T;
}
