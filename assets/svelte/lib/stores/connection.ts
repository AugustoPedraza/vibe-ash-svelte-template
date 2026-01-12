/**
 * Connection Status Store
 *
 * Tracks the connection state between the client and Phoenix LiveView server.
 * Provides reactive state for showing offline banners, retry UI, etc.
 */
import { writable, derived, type Readable } from 'svelte/store';

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

interface ConnectionStore extends Readable<ConnectionState> {
  connected: () => void;
  disconnected: () => void;
  reconnecting: () => void;
  connecting: () => void;
  getReconnectAttempts: () => number;
  hasExceededMaxAttempts: () => boolean;
  resetAttempts: () => void;
}

const createConnectionStore = (): ConnectionStore => {
  const { subscribe, set } = writable<ConnectionState>('connecting');

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;

  return {
    subscribe,
    connected: () => {
      reconnectAttempts = 0;
      set('connected');
    },
    disconnected: () => {
      set('disconnected');
    },
    reconnecting: () => {
      reconnectAttempts++;
      set('reconnecting');
    },
    connecting: () => {
      set('connecting');
    },
    getReconnectAttempts: () => reconnectAttempts,
    hasExceededMaxAttempts: () => reconnectAttempts >= maxReconnectAttempts,
    resetAttempts: () => {
      reconnectAttempts = 0;
    },
  };
};

export const connectionStatus = createConnectionStore();

export const isConnected: Readable<boolean> = derived(
  connectionStatus,
  ($status) => $status === 'connected'
);

export const isOffline: Readable<boolean> = derived(
  connectionStatus,
  ($status) => $status === 'disconnected'
);

export const isConnecting: Readable<boolean> = derived(
  connectionStatus,
  ($status) => $status === 'connecting' || $status === 'reconnecting'
);

interface LiveSocket {
  getSocket: () => {
    onOpen: (callback: () => void) => void;
    onClose: (callback: () => void) => void;
    onError: (callback: () => void) => void;
  } | null;
}

export const initConnectionTracking = (liveSocket: LiveSocket): void => {
  if (!liveSocket) return;

  const socket = liveSocket.getSocket();
  socket?.onOpen(() => connectionStatus.connected());
  socket?.onClose(() => connectionStatus.disconnected());
  socket?.onError(() => connectionStatus.reconnecting());

  window.addEventListener('phx:page-loading-stop', () => {
    connectionStatus.connected();
  });

  window.addEventListener('online', () => {
    connectionStatus.connecting();
  });

  window.addEventListener('offline', () => {
    connectionStatus.disconnected();
  });
};
