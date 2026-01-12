/**
 * Utility functions
 */

// Class name utilities
export { cn, twMerge } from './cn';

// Haptic feedback
export { haptic, HapticType, supportsHaptics, withHaptic } from './haptics';

// Platform detection
export {
  platform,
  detectPlatform,
  isIOS,
  isAndroid,
  isStandalone,
  isMobile,
  isTouch,
  type PlatformInfo,
} from './platform';
