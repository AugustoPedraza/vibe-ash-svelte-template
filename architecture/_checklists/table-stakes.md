# Table Stakes Checklist

> Implicit features users expect but never request. Use during planning to catch scope gaps.

---

## Quick Index

| I'm speccing... | Check these table stakes |
|-----------------|-------------------------|
| Media upload/capture | [#media](#media) |
| CRUD feature | [#crud](#crud) |
| Form/input | [#forms](#forms) |
| List/feed | [#lists](#lists) |
| Auth flow | [#auth](#auth) |
| Navigation | [#navigation](#navigation) |
| Notifications | [#notifications](#notifications) |
| Search | [#search](#search) |
| Settings | [#settings](#settings) |
| Social features | [#social](#social) |
| Payments | [#payments](#payments) |

---

## How to Use This Checklist

### For PMs Writing Specs

1. **Identify the trigger feature** - What is the user explicitly asking for?
2. **Scan the table stakes column** - These are implicit requirements (include in scope)
3. **Check the gaps column** - These are commonly missed (decide per project)
4. **Apply universal stakes** - Loading, error, empty, offline apply to everything

### Quick Decision Rule

| Column | Action |
|--------|--------|
| **Table Stakes** | Include in scope (users expect these) |
| **Common Gaps** | Decide per project (nice-to-have or future) |
| **Universal Stakes** | Always include (non-negotiable) |

---

## Core Domains

### Media

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **Upload photo** | Preview before upload, crop/rotate option, compression, progress indicator, cancel button | Resume interrupted uploads, error recovery with retry, file size limits with clear message, format validation |
| **Upload video** | Thumbnail preview, duration limit indicator, background upload status | iOS pauses in background (warn user), chunked upload for large files, transcode progress |
| **View image** | Pinch-to-zoom, swipe between images in gallery, double-tap to zoom | Blur-up placeholder, broken image fallback, aspect ratio preservation |
| **Play media** | Play/pause, progress scrubber, volume control, elapsed/total time | Lock screen controls, resume position, buffering indicator |
| **Record audio** | Recording indicator, elapsed timer, pause/resume, playback before send | Permission denied handling, microphone-in-use error, storage warning |
| **Camera capture** | Front/back camera toggle, flash control, preview before confirm | Permission denied flow, camera-in-use error, shutter feedback |
| **Gallery/album** | Grid view, selection mode (multi-select), sort by date | Lazy loading, empty gallery state, selection count indicator |

---

### CRUD

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **Create item** | Success confirmation, navigate to created item OR stay on list, form clears | Draft auto-save, duplicate detection, offline queue with pending indicator |
| **Read/view item** | Skeleton loading (not spinner), error state with retry, pull-to-refresh | Not found (404) handling, access denied state, stale data indicator |
| **Update item** | Pre-filled form with current values, dirty state detection, confirmation | Conflict detection (someone else edited), version history, cancel confirmation if dirty |
| **Delete item** | Confirmation dialog, success feedback, list updates immediately | Undo option (soft delete), cascade warnings ("deletes X items"), bulk delete progress |
| **List items** | If create exists: expect edit, delete | Archive/restore as alternative to hard delete, bulk actions toolbar, duplicate action |

---

### Forms

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **Input field** | Clear error on correction, label always visible, required indicator (*) | Keyboard type matching (email, phone, number), paste handling, autocomplete attributes |
| **Form validation** | Instant feedback on blur (not submit), field-level errors below input | Server error mapping to specific fields, retain valid data on error, accessibility (aria-invalid) |
| **Form submission** | Loading state on button, disable resubmit, success feedback | Network error handling with retry, timeout handling, partial success |
| **Multi-step form** | Progress indicator, back navigation preserves data, skip to step | Draft persistence across steps, validation per step before proceeding |
| **Long form** | Section headers, keyboard doesn't cover current field, submit visible | Scroll to first error, save draft periodically |
| **Date/time input** | Native picker on mobile, manual entry option, format hint | Timezone handling, relative dates ("tomorrow"), range validation |

---

### Lists

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **View list** | Skeleton loading (multiple rows), empty state with action CTA, pull-to-refresh | Error state with retry, offline indicator, item count/total |
| **Paginated list** | Page indicators or infinite scroll trigger, loading more indicator | End of list indicator, return to top button, preserve scroll on back |
| **Infinite scroll** | Auto-load near bottom, skeleton while loading more | Error loading more (with retry), memory management for very long lists |
| **Sortable list** | Current sort indicator, ascending/descending toggle, remember preference | Multiple sort fields, sort persists in URL (deep linking) |
| **Filterable list** | Active filter count/indicator, clear all filters | No results for filter (different from empty), saved filters |
| **Searchable list** | Recent searches, clear search button, results count | No results state with suggestions, minimum character requirement |
| **Selectable list** | Select all/none, selection count, bulk action bar | Selection persists across pages, select all across all pages |

---

### Auth

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **Login** | Password visibility toggle, remember me option, forgot password link | Lockout after attempts, session expiry handling, redirect to intended destination |
| **Registration** | Password strength indicator, terms acceptance, email format validation | Email verification flow, username availability check, welcome email |
| **Forgot password** | Email sent confirmation, rate limiting feedback, check spam hint | Token expiry messaging, success page after reset, security notification |
| **Logout** | Confirmation if unsaved data, success message, redirect to public page | Logout from all devices option, clear local storage/cache |
| **Session management** | Auto-logout warning, session expired handling | Active sessions list, logout specific device, last activity timestamp |
| **Account deletion** | Confirmation with consequences, re-enter password, grace period | Data export before deletion, cancellation during grace period, GDPR compliance |
| **Password change** | Current password required, strength validation | Email notification of change, recent password reuse prevention |

---

### Navigation

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **Tab navigation** | Active tab indicator, badge for unread/pending, smooth transitions | Preserve tab state on return, deep link to specific tab, lazy load inactive tabs |
| **Back navigation** | Returns to previous screen, preserves scroll position, swipe-back gesture | Confirm if unsaved changes, stack depth handling, exit app confirmation |
| **Deep linking** | URL reflects current state, shareable URLs, bookmarkable | Handle invalid/expired links, auth gate then redirect, UTM preservation |
| **Page transitions** | Direction-aware animation (forward/back), no flash of content | Skeleton during transition, abort on rapid navigation |
| **Breadcrumbs** | Clickable path, current page indicated, truncation for long paths | Mobile-friendly collapse, dynamic breadcrumbs |
| **Menu/drawer** | Swipe to open/close, outside tap to close, focus trap | Keyboard navigation, current section highlight, scroll lock on body |

---

## Extended Domains

### Notifications

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **View notifications** | Unread count badge, read/unread visual distinction, timestamp | Group by type/source, mark all read, pagination |
| **Notification item** | Tap navigates to context, mark as read on view, relative timestamps | Swipe to dismiss, undo dismiss, action buttons (approve/reject) |
| **Notification preferences** | Per-type toggles, email vs push vs in-app, quiet hours | Test notification button, restore defaults |
| **Push notifications** | Permission request with explanation, badge on app icon | Permission denied recovery, iOS home screen requirement messaging |
| **Notification center** | Clear all read, filter by type | Search notifications, bulk actions |

---

### Search

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **Search input** | Recent searches, clear button, search on enter | Debounced search, minimum characters, search within context |
| **Search results** | Result count, highlight matching text, result type indicators | No results with suggestions, faceted results, relevance vs recency |
| **Search suggestions** | As-you-type suggestions, recent searches, popular searches | Category suggestions, "did you mean", query correction |
| **Advanced search** | Multiple criteria, date ranges, specific fields | Save search, share search URL |

---

### Settings

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **View settings** | Current value visible, grouped by category | Reset to defaults, setting descriptions/help text, search settings |
| **Change setting** | Instant save (or explicit save button), success feedback | Validation for invalid values, dependent settings handling |
| **Account settings** | Email, password, profile info | Two-factor auth, login history, connected accounts |
| **Privacy settings** | Data visibility, sharing preferences, analytics opt-out | Data export, delete my data, cookie preferences |
| **Display settings** | Theme (light/dark/system), language | Font size/accessibility, reduce motion, compact mode |

---

### Social

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **Share item** | Native share sheet (mobile), copy link | Share with message, share analytics, share preview |
| **React to item** | Instant visual feedback, reaction count, your reaction highlighted | Undo reaction, see who reacted, reaction summary |
| **Comment** | Optimistic add, edit own comment, delete own comment | Reply/thread, mention users, comment notifications |
| **Follow/subscribe** | Toggle state, follower count | Notification preference, batch follow, suggested follows |
| **Like/favorite** | Toggle state, count update, liked items list | Unlike confirmation, like notification to author |

---

### Payments

| Trigger | Table Stakes (Implicit) | Common Gaps |
|---------|-------------------------|-------------|
| **Checkout** | Order summary, price breakdown, secure badge | Promo code field, multiple payment methods, guest checkout |
| **Payment form** | Card format validation, expiry validation, CVV help | Save card option, billing address auto-fill, 3D Secure flow |
| **Payment processing** | Loading state, don't close warning, success confirmation | Failed payment retry, timeout handling, duplicate prevention |
| **Receipt/confirmation** | Email receipt, order number, print/download option | Receipt history, send to different email, tax invoice |
| **Billing history** | Transaction list, download invoices | Disputed transaction flow, refund request |
| **Subscription** | Current plan display, renewal date, usage if applicable | Cancel subscription, downgrade warnings, grace period |
| **Refund** | Refund status, timeline, receipt | Partial refund, refund reason, refund policy link |
| **Failed payment** | Clear error message, retry option, update payment method | Dunning emails, grace period, service interruption warning |

---

## Universal Stakes (Every Feature)

These apply to **every feature** regardless of domain.

| Category | User Expects | PM Must Spec |
|----------|-------------|--------------|
| **Loading** | See structure immediately | Skeleton variant matches content type |
| **Empty** | Know why empty, what to do | Different states: no data vs filtered vs error |
| **Error** | Understand problem, fix it | Human-friendly message, retry action, don't lose user data |
| **Offline** | App still works | Queue actions, show pending indicator, sync status |
| **Mobile** | Tappable, readable, smooth | 44px touch targets, safe areas, keyboard handling |
| **Accessibility** | Usable by everyone | Keyboard nav, screen reader, sufficient contrast |
| **Performance** | Instant feedback | Optimistic updates, lazy loading |

---

## The 4 States Rule

Every data-driven UI element must handle these states:

| State | User Sees | Implementation |
|-------|-----------|----------------|
| **Loading** | Content structure | Skeleton loader (not spinner) |
| **Empty** | Helpful message + action | EmptyState component with CTA |
| **Error** | Problem + recovery | Human message + retry button |
| **Success** | Data + available actions | Content with action affordances |

**If your spec doesn't address all 4 states, it's incomplete.**

### Empty State Variants

| Scenario | User Message | Has CTA? |
|----------|--------------|----------|
| No data yet | "Nothing here yet" | Yes - create first item |
| Filtered to empty | "No matches for filters" | Yes - clear filters |
| Search no results | "No results for 'query'" | Yes - try different search |
| Error loading | "Something went wrong" | Yes - retry |
| Access denied | "You don't have access" | Maybe - request access |

---

## Checklist Usage Examples

### Example 1: PM specs "upload voice memo"

1. Find **Media** section
2. Look at "Record audio" row
3. **Table Stakes** to include:
   - Recording indicator
   - Elapsed timer
   - Pause/resume
   - Playback before send
4. **Gaps** to consider:
   - Permission denied handling
   - Microphone-in-use error
   - Storage warning
5. **Universal stakes**:
   - Loading: Show recording UI skeleton
   - Error: Handle permission denied, mic errors
   - Success: Playback with send/discard options

### Example 2: PM specs "contact management"

1. Find **CRUD** section
2. Check all CRUD operations
3. **If speccing "create contact"**, also spec:
   - Edit contact
   - Delete contact
   - List contacts
4. **Table Stakes** for create:
   - Success confirmation
   - Form clears on success
5. **Gaps** to consider:
   - Duplicate detection
   - Offline queue
6. **Universal stakes** for list:
   - Loading: Skeleton rows
   - Empty: "No contacts yet" + Add button
   - Error: Retry loading

---

## Related Docs

- [feature-review.md](./feature-review.md) - Code-level review checklist (for developers)
- [deployment.md](./deployment.md) - Deployment verification
- [mobile-ux.md](../_guides/mobile-ux.md) - Mobile UX patterns
- [native-mobile.md](../_patterns/native-mobile.md) - Platform constraints
