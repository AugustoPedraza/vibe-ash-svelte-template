# Native Mobile Patterns (PWA)

> Achieving native-like mobile UX in PWA. Users don't ask for these patterns - they just expect them.

## Quick Index

| Pattern | Android | iOS | Section |
|---------|---------|-----|---------|
| Background uploads | Full | Pauses when backgrounded | [#background-processing](#background-processing) |
| Draft persistence | Full | Full | [#draft-persistence](#draft-persistence) |
| Camera/Mic | Full | Full | [#media-capture](#media-capture) |
| Haptic feedback | Full | iOS 18 workaround | [#haptic-feedback](#haptic-feedback) |
| Push notifications | Full | iOS 16.4+ (home screen) | [#push-notifications](#push-notifications) |
| File pickers | Full | Full | [#file-access](#file-access) |
| Sharing | Full | Full | [#sharing](#sharing) |

---

## Platform Capability Matrix (2025)

### Background & Offline

| API | Android/Chrome | iOS Safari | Impact |
|-----|----------------|------------|--------|
| Background Sync | Full | NOT supported | Cannot auto-sync when backgrounded |
| Background Fetch | Full | NOT supported | Cannot continue uploads in background |
| Service Worker (bg) | Continues | Stops within seconds | iOS kills SW on background |
| IndexedDB | Excellent | ~50MB, may evict after 7 days | Use `navigator.storage.persist()` |
| localStorage | 5-10MB | ~5MB | Reliable for small critical data |

### Media & Sensors

| Feature | Android | iOS Safari | Notes |
|---------|---------|------------|-------|
| Camera/Mic | Full | Full (since 13.0) | `getUserMedia()` |
| MediaRecorder | Full | Needs Settings toggle | iOS: Settings > Safari > Advanced |
| Lock screen controls | Full | Full (since 15.0) | MediaSession API |
| Background audio | Continues | Pauses | Cannot achieve on iOS without Capacitor |
| Vibration | Full | NOT supported | Use visual feedback on iOS |
| Motion sensors | Full | Permission required | iOS needs `DeviceMotionEvent.requestPermission()` |
| Proximity sensor | No | No | Requires Capacitor |

### Sharing & Communication

| Feature | Android | iOS Safari | Notes |
|---------|---------|------------|-------|
| Web Share | Full | Full (since 12.1) | Share to other apps |
| Share files | Full | Full (since 15.0) | Share photos/videos |
| Contact picker | Full | No | Android only |
| Push notifications | Full | iOS 16.4+ (home screen) | Must be installed PWA |

---

## Background Processing

> **Use when**: Uploads, message sending, any action that should survive app backgrounding.

### The Reality

| Platform | Behavior |
|----------|----------|
| Android | Uploads continue in background via Background Sync/Fetch |
| iOS | Uploads PAUSE when backgrounded, resume when user returns |

### Implementation Pattern

#### Test First (TDD)

```typescript
// tests/upload-manager.test.ts
import { describe, it, expect, vi } from 'vitest';
import { UploadManager } from '$lib/stores/uploads';

describe('UploadManager', () => {
  it('should save progress when visibility changes to hidden', async () => {
    const manager = new UploadManager();
    const file = new Blob(['test'], { type: 'text/plain' });

    const uploadId = await manager.createUpload({ file, filename: 'test.txt' });

    // Simulate backgrounding
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'hidden' });

    const progress = manager.getProgress(uploadId);
    expect(progress.savedToStorage).toBe(true);
  });

  it('should resume from last chunk after interruption', async () => {
    const manager = new UploadManager();

    // Simulate interrupted upload with 3 of 5 chunks done
    localStorage.setItem('upload_progress_123', JSON.stringify({
      id: '123',
      uploadedChunks: [0, 1, 2],
      totalChunks: 5,
      status: 'paused'
    }));

    const progress = manager.getProgress('123');
    expect(progress.uploadedChunks.length).toBe(3);
    expect(progress.canResume).toBe(true);
  });
});
```

#### Implementation

```typescript
// $lib/stores/uploads.ts
import { writable, get } from 'svelte/store';
import { visibility } from './visibility';
import { isConnected } from './connection';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const MAX_RETRIES = 3;

interface UploadProgress {
  id: string;
  filename: string;
  totalSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'failed';
  serverUploadId?: string;
  createdAt: number;
  updatedAt: number;
  retries: number;
}

export class UploadManager {
  private uploads = writable<Map<string, UploadProgress>>(new Map());
  private abortControllers = new Map<string, AbortController>();

  constructor() {
    this.initVisibilityHandler();
    this.restoreFromStorage();
  }

  private initVisibilityHandler() {
    visibility.subscribe((state) => {
      if (state === 'hidden') {
        this.saveAllProgress();
      } else {
        this.checkForResumableUploads();
      }
    });
  }

  async createUpload(config: { file: File | Blob; filename: string }): Promise<string> {
    const id = crypto.randomUUID();
    const totalChunks = Math.ceil(config.file.size / CHUNK_SIZE);

    const progress: UploadProgress = {
      id,
      filename: config.filename,
      totalSize: config.file.size,
      totalChunks,
      uploadedChunks: [],
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      retries: 0,
    };

    // Store file chunks in IndexedDB
    await this.storeFileChunks(id, config.file);

    // Save progress to localStorage
    this.saveProgress(progress);

    // Start if online and foreground
    if (get(isConnected) && document.visibilityState === 'visible') {
      this.startUpload(id);
    }

    return id;
  }

  private saveProgress(progress: UploadProgress) {
    localStorage.setItem(`upload_progress_${progress.id}`, JSON.stringify(progress));
  }

  private saveAllProgress() {
    const current = get(this.uploads);
    for (const [id, progress] of current) {
      if (progress.status === 'uploading') {
        progress.status = 'paused';
        this.saveProgress(progress);
      }
    }
  }

  getProgress(id: string): UploadProgress | null {
    const stored = localStorage.getItem(`upload_progress_${id}`);
    return stored ? JSON.parse(stored) : null;
  }

  async resumeUpload(id: string) {
    const progress = this.getProgress(id);
    if (!progress || progress.status === 'completed') return;

    progress.status = 'uploading';
    this.saveProgress(progress);

    // Resume from last uploaded chunk
    await this.uploadFromChunk(id, progress.uploadedChunks.length);
  }

  pauseUpload(id: string) {
    const controller = this.abortControllers.get(id);
    controller?.abort();

    const progress = this.getProgress(id);
    if (progress) {
      progress.status = 'paused';
      this.saveProgress(progress);
    }
  }
}

export const uploadManager = new UploadManager();
```

### UX Guidelines

| Platform | Show This |
|----------|-----------|
| iOS | "Keep the app open while uploading" |
| Android | "Upload will continue in the background" |
| Both (paused) | "Upload paused - tap to resume" |
| Both (failed) | "Upload failed - tap to retry" |

---

## Draft Persistence

> **Use when**: Any text input that should survive crashes, battery death, navigation.

### The Reality

| Scenario | Result |
|----------|--------|
| User types, battery dies | Draft recovered on reopen |
| User types, force closes app | Draft recovered on reopen |
| User navigates away | Draft preserved |
| Phone storage full | localStorage fallback works |

### Implementation Pattern

#### Test First (TDD)

```typescript
// tests/draft-store.test.ts
describe('DraftStore', () => {
  it('should recover draft after simulated crash', async () => {
    const store = new DraftStore();

    // Write draft
    await store.save({
      contextType: 'message',
      contextId: 'room-123',
      content: 'Hello world'
    });

    // Simulate crash by creating new instance (clearing memory)
    const newStore = new DraftStore();
    const recovered = await newStore.recover();

    expect(recovered).toHaveLength(1);
    expect(recovered[0].content).toBe('Hello world');
  });

  it('should debounce saves to avoid performance issues', async () => {
    const store = new DraftStore();
    const saveSpy = vi.spyOn(store, 'persistToStorage');

    // Rapid typing simulation
    for (let i = 0; i < 10; i++) {
      await store.save({ contextType: 'message', contextId: 'room-123', content: `text ${i}` });
    }

    // Wait for debounce
    await new Promise(r => setTimeout(r, 600));

    // Should have debounced to fewer calls
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });
});
```

#### Implementation

```typescript
// $lib/stores/drafts.ts
import { writable, get } from 'svelte/store';

interface Draft {
  id: string;
  contextType: 'message' | 'post' | 'comment';
  contextId: string;
  content: string;
  savedAt: number;
  version: number;
}

const STORAGE_KEY = 'pwa_drafts';
const DEBOUNCE_LS = 500;  // localStorage: fast, frequent
const DEBOUNCE_IDB = 2000; // IndexedDB: slower, durable

export class DraftStore {
  private cache = new Map<string, Draft>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private getKey(type: string, id: string): string {
    return `${type}:${id}`;
  }

  async save(draft: Omit<Draft, 'id' | 'savedAt' | 'version'>): Promise<void> {
    const key = this.getKey(draft.contextType, draft.contextId);
    const existing = this.cache.get(key);

    const fullDraft: Draft = {
      ...draft,
      id: existing?.id || crypto.randomUUID(),
      savedAt: Date.now(),
      version: (existing?.version || 0) + 1,
    };

    // 1. Update memory immediately
    this.cache.set(key, fullDraft);

    // 2. Debounced localStorage save
    this.debouncedSave(key, fullDraft, DEBOUNCE_LS, 'localStorage');

    // 3. Debounced IndexedDB save
    this.debouncedSave(key, fullDraft, DEBOUNCE_IDB, 'indexedDB');
  }

  private debouncedSave(key: string, draft: Draft, delay: number, target: string) {
    const timerKey = `${target}:${key}`;
    const existing = this.debounceTimers.get(timerKey);
    if (existing) clearTimeout(existing);

    this.debounceTimers.set(timerKey, setTimeout(() => {
      if (target === 'localStorage') {
        this.saveToLocalStorage(draft);
      } else {
        this.saveToIndexedDB(draft);
      }
    }, delay));
  }

  private saveToLocalStorage(draft: Draft) {
    try {
      const all = this.getAllFromLocalStorage();
      all[this.getKey(draft.contextType, draft.contextId)] = draft;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  }

  async recover(): Promise<Draft[]> {
    const recovered: Draft[] = [];

    // 1. Try localStorage first (most reliable)
    const lsDrafts = this.getAllFromLocalStorage();
    for (const draft of Object.values(lsDrafts)) {
      recovered.push(draft);
    }

    // 2. Check IndexedDB for any missing/newer
    const idbDrafts = await this.getAllFromIndexedDB();
    for (const draft of idbDrafts) {
      const key = this.getKey(draft.contextType, draft.contextId);
      const existing = recovered.find(d =>
        d.contextType === draft.contextType && d.contextId === draft.contextId
      );

      if (!existing || draft.version > existing.version) {
        if (existing) {
          const idx = recovered.indexOf(existing);
          recovered[idx] = draft;
        } else {
          recovered.push(draft);
        }
      }
    }

    return recovered;
  }
}

export const draftStore = new DraftStore();
```

---

## Media Capture

> **Use when**: Camera, microphone, photo/video recording.

### The Reality

| Feature | Android | iOS Safari | Notes |
|---------|---------|------------|-------|
| Camera preview | Full | Full | `getUserMedia()` |
| Take photo | Full | Full | Canvas capture |
| Record video | Full | Needs toggle | iOS: Settings > Safari > Advanced > MediaRecorder |
| Record audio | Full | Full | MediaRecorder API |
| Front/back switch | Full | Full | `facingMode` constraint |

### Implementation Pattern

#### Test First (TDD)

```typescript
// tests/camera.test.ts
describe('Camera access', () => {
  it('should handle permission denied gracefully', async () => {
    // Mock getUserMedia to reject
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValue(
      new DOMException('Permission denied', 'NotAllowedError')
    );

    const { result, error } = await requestCamera();

    expect(result).toBeNull();
    expect(error).toBe('permission_denied');
  });

  it('should switch between front and back camera', async () => {
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] };
    const getUserMediaSpy = vi.spyOn(navigator.mediaDevices, 'getUserMedia')
      .mockResolvedValue(mockStream as any);

    await switchCamera('front');
    expect(getUserMediaSpy).toHaveBeenCalledWith(
      expect.objectContaining({ video: { facingMode: 'user' } })
    );

    await switchCamera('back');
    expect(getUserMediaSpy).toHaveBeenCalledWith(
      expect.objectContaining({ video: { facingMode: 'environment' } })
    );
  });
});
```

#### Implementation

```typescript
// $lib/utils/camera.ts
type CameraError = 'permission_denied' | 'not_supported' | 'in_use' | 'unknown';

interface CameraResult {
  stream: MediaStream | null;
  error: CameraError | null;
}

export async function requestCamera(facing: 'front' | 'back' = 'back'): Promise<CameraResult> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { stream: null, error: 'not_supported' };
  }

  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: facing === 'front' ? 'user' : 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return { stream, error: null };
  } catch (e) {
    if (e instanceof DOMException) {
      switch (e.name) {
        case 'NotAllowedError':
          return { stream: null, error: 'permission_denied' };
        case 'NotFoundError':
        case 'NotSupportedError':
          return { stream: null, error: 'not_supported' };
        case 'NotReadableError':
          return { stream: null, error: 'in_use' };
      }
    }
    return { stream: null, error: 'unknown' };
  }
}

export function capturePhoto(video: HTMLVideoElement): Blob | null {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.85);
  });
}
```

---

## Haptic Feedback

> **Use when**: Button taps, toggles, confirmations, errors.

### The Reality

| Platform | Support | Pattern |
|----------|---------|---------|
| Android | Full | Vibration API |
| iOS Safari | NOT supported | Use visual feedback |
| iOS 18+ | Workaround | Hidden checkbox trick |

### Implementation Pattern

```typescript
// $lib/utils/haptics.ts
export type HapticType = 'light' | 'medium' | 'success' | 'warning' | 'error';

const patterns: Record<HapticType, number[]> = {
  light: [10],
  medium: [20],
  success: [10, 50, 10],
  warning: [30, 30, 30],
  error: [50, 30, 50],
};

export function haptic(type: HapticType = 'light'): void {
  // Respect reduced motion preference
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Try Vibration API (Android)
  if ('vibrate' in navigator) {
    navigator.vibrate(patterns[type]);
    return;
  }

  // iOS 18+ workaround
  if (isIOS18OrLater()) {
    triggerIOSHaptic();
  }

  // Otherwise: no haptic, rely on visual feedback
}

function isIOS18OrLater(): boolean {
  const match = navigator.userAgent.match(/OS (\d+)/);
  return match ? parseInt(match[1]) >= 18 : false;
}

function triggerIOSHaptic(): void {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.setAttribute('switch', '');
  checkbox.id = `haptic-${Date.now()}`;
  checkbox.style.cssText = 'position:absolute;opacity:0;pointer-events:none;';

  const label = document.createElement('label');
  label.setAttribute('for', checkbox.id);

  document.body.appendChild(checkbox);
  document.body.appendChild(label);

  label.click();

  requestAnimationFrame(() => {
    checkbox.remove();
    label.remove();
  });
}
```

### Usage Guidelines

| Action | Haptic Type | Visual Backup |
|--------|-------------|---------------|
| Button tap | `light` | Press animation |
| Toggle switch | `light` | Color change |
| Pull-to-refresh trigger | `medium` | Bounce animation |
| Success (sent, saved) | `success` | Checkmark animation |
| Error (failed) | `error` | Shake animation |
| Destructive action | `warning` | Red highlight |

---

## Push Notifications

> **Use when**: Upload completion, new messages, important events.

### The Reality

| Platform | Support | Requirements |
|----------|---------|--------------|
| Android | Full | Standard PWA |
| iOS 16.4+ | Supported | Must be installed to home screen |
| iOS < 16.4 | No | Use in-app notifications |

### Backend Implementation (Phoenix)

```elixir
# lib/my_app/push/web_push.ex
defmodule MyApp.Push.WebPush do
  @vapid_subject "mailto:support@yourapp.com"

  def send(user_id, notification) do
    case get_subscription(user_id) do
      nil -> {:error, :no_subscription}
      subscription ->
        payload = Jason.encode!(%{
          title: notification.title,
          body: notification.body,
          data: %{url: notification.url}
        })

        WebPushEncryption.send_web_push(payload, subscription, vapid_options())
    end
  end

  defp vapid_options do
    %{
      subject: @vapid_subject,
      public_key: System.get_env("VAPID_PUBLIC_KEY"),
      private_key: System.get_env("VAPID_PRIVATE_KEY")
    }
  end
end
```

### Frontend Implementation

```typescript
// $lib/utils/push.ts
export async function subscribeToPush(vapidPublicKey: string): Promise<boolean> {
  if (!('PushManager' in window)) {
    console.log('Push not supported');
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  });

  // Send subscription to backend
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth'))
      }
    })
  });

  return true;
}
```

---

## File Access

> **Use when**: Photo/video selection, file uploads.

### Implementation Pattern

```svelte
<!-- FilePickerInput.svelte -->
<script lang="ts">
  interface Props {
    accept?: 'image' | 'video' | 'audio' | 'any';
    capture?: 'camera' | 'camcorder' | 'microphone' | false;
    multiple?: boolean;
    onFiles: (files: File[]) => void;
  }

  let { accept = 'any', capture = false, multiple = false, onFiles }: Props = $props();

  const acceptMap = {
    image: 'image/*',
    video: 'video/*',
    audio: 'audio/*',
    any: '*/*'
  };

  function handleChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length > 0) {
      onFiles(files);
    }
    input.value = ''; // Reset for same file selection
  }
</script>

<input
  type="file"
  accept={acceptMap[accept]}
  capture={capture || undefined}
  {multiple}
  onchange={handleChange}
  class="hidden"
/>
```

---

## Sharing

> **Use when**: Share content to other apps.

### Implementation Pattern

```typescript
// $lib/utils/share.ts
interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export async function share(data: ShareData): Promise<boolean> {
  if (!navigator.share) {
    // Fallback: copy to clipboard
    if (data.url) {
      await navigator.clipboard.writeText(data.url);
      return true;
    }
    return false;
  }

  // Check if files can be shared (Web Share 2.0)
  if (data.files?.length && !navigator.canShare?.({ files: data.files })) {
    // Remove files if not supported
    delete data.files;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      // User cancelled - not an error
      return false;
    }
    throw e;
  }
}
```

---

## When to Consider Capacitor

If these features are **critical** to your app, consider adding Capacitor:

| Feature | PWA Reality | Capacitor Adds |
|---------|-------------|----------------|
| Background audio | Pauses on iOS | True background playback |
| Proximity sensor | No support | Full access |
| Bluetooth | Android only | iOS support |
| NFC | Android only | iOS support |
| Deep linking | Limited | Full support |
| App Store presence | PWA store only | Full App Store |

**Recommendation**: Start with PWA. Add Capacitor only when a specific native feature becomes critical for your core use case.

---

## Verification Checklist

### Before Shipping Native-Like Features

- [ ] Tested on real iOS device (not just simulator)
- [ ] Tested on real Android device
- [ ] Handles permission denied gracefully
- [ ] Has visual feedback fallback (for missing haptics)
- [ ] Shows platform-appropriate messaging
- [ ] Works offline (or degrades gracefully)
- [ ] Upload progress saves on backgrounding
- [ ] Drafts recover after crash

---

## Related Docs

- [mobile-ux.md](../_guides/mobile-ux.md) - Touch patterns, gestures
- [offline.md](./offline.md) - Offline queue patterns
- [pwa.md](../_anti-patterns/pwa.md) - Common PWA mistakes
