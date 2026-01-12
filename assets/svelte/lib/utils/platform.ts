/**
 * Platform detection utilities
 * Detect iOS, Android, standalone PWA, etc.
 */

export interface PlatformInfo {
  /** Running on iOS (iPhone, iPad) */
  ios: boolean;
  /** Running on Android */
  android: boolean;
  /** Running as installed PWA (standalone) */
  standalone: boolean;
  /** Running in Safari */
  safari: boolean;
  /** Running in Chrome */
  chrome: boolean;
  /** Touch device */
  touch: boolean;
  /** Mobile viewport */
  mobile: boolean;
}

/** Detect current platform */
export function detectPlatform(): PlatformInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    // SSR fallback
    return {
      ios: false,
      android: false,
      standalone: false,
      safari: false,
      chrome: false,
      touch: false,
      mobile: false,
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true;

  return {
    ios: /iphone|ipad|ipod/.test(ua),
    android: /android/.test(ua),
    standalone,
    safari: /safari/.test(ua) && !/chrome/.test(ua),
    chrome: /chrome/.test(ua) && !/edge/.test(ua),
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    mobile: window.innerWidth < 768,
  };
}

/** Reactive platform store */
import { readable, type Readable } from 'svelte/store';

export const platform: Readable<PlatformInfo> = readable(detectPlatform(), (set) => {
  if (typeof window === 'undefined') return;

  const update = () => set(detectPlatform());

  // Update on resize (mobile breakpoint)
  window.addEventListener('resize', update);

  // Update on display mode change
  const mq = window.matchMedia('(display-mode: standalone)');
  mq.addEventListener('change', update);

  return () => {
    window.removeEventListener('resize', update);
    mq.removeEventListener('change', update);
  };
});

/** Convenience getters */
export const isIOS = (): boolean => detectPlatform().ios;
export const isAndroid = (): boolean => detectPlatform().android;
export const isStandalone = (): boolean => detectPlatform().standalone;
export const isMobile = (): boolean => detectPlatform().mobile;
export const isTouch = (): boolean => detectPlatform().touch;
