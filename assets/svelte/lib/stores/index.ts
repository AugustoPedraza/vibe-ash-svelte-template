/**
 * Store Exports
 *
 * Central export point for all Svelte stores.
 */

// Connection status (online/offline/reconnecting)
export {
  connectionStatus,
  isConnected,
  isOffline,
  isConnecting,
  initConnectionTracking,
  type ConnectionState,
} from './connection';

// Page visibility (foreground/background)
export {
  visibility,
  isBackground,
  isForeground,
  runWhenVisible,
  pauseWhenHidden,
  type VisibilityState,
} from './visibility';

// Real-time store factory
export {
  createRealtimeStore,
  registerStore,
  unregisterStore,
  getStore,
  handleStoreSync,
  RealtimeStoreHook,
  type SyncAction,
  type StorePayload,
  type RealtimeStore,
  type RealtimeStoreOptions,
  type OptimisticResult,
} from './realtime';

// Offline queue
export {
  offlineQueue,
  pendingActionsCount,
  hasPendingActions,
  initOfflineSync,
  withOfflineSupport,
  type QueuedAction,
} from './offline';

// PWA install prompt
export { canInstall, isInstalled, promptInstall } from './pwa';
