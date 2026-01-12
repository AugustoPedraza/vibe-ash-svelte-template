/**
 * PWA Store - Install Prompt Handling
 *
 * Provides stores and functions for managing PWA installation:
 * - canInstall: Whether the app can be installed (install prompt available)
 * - isInstalled: Whether the app is already installed (standalone mode)
 * - promptInstall(): Trigger the install prompt
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { canInstall, isInstalled, promptInstall } from '$lib/stores/pwa';
 * </script>
 *
 * {#if $canInstall && !$isInstalled}
 *   <Button on:click={promptInstall}>Install App</Button>
 * {/if}
 * ```
 */

import { writable } from 'svelte/store';

// Type for the BeforeInstallPromptEvent (not in standard TypeScript lib)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Deferred install prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;

/** Whether the install prompt is available */
export const canInstall = writable(false);

/** Whether the app is already installed (running in standalone mode) */
export const isInstalled = writable(false);

// Only run browser-specific code if we're in the browser
if (typeof window !== 'undefined') {
  // Capture install prompt before it's shown
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    canInstall.set(true);
  });

  // Detect when app is installed
  window.addEventListener('appinstalled', () => {
    isInstalled.set(true);
    canInstall.set(false);
    deferredPrompt = null;
  });

  // Check if already running in standalone mode (installed)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    isInstalled.set(true);
  }

  // Also check for iOS standalone mode
  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) {
    isInstalled.set(true);
  }
}

/**
 * Trigger the PWA install prompt
 * @returns true if user accepted, false if dismissed or not available
 */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user's response
  const { outcome } = await deferredPrompt.userChoice;

  // Clear the deferred prompt
  deferredPrompt = null;
  canInstall.set(false);

  return outcome === 'accepted';
}
