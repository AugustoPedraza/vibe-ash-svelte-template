/**
 * Gesture actions for Svelte
 * Use with use: directive
 *
 * @example
 * <div use:swipe on:swipeleft={prev} on:swiperight={next}>
 * <div use:longPress on:longpress={showMenu}>
 * <div use:pullToRefresh on:refresh={({ detail }) => { await load(); detail.done(); }}>
 */

export { swipe, type SwipeOptions, type SwipeEventDetail } from './swipe';
export { longPress, type LongPressOptions, type LongPressEventDetail } from './longpress';
export {
  pullToRefresh,
  type PullToRefreshOptions,
  type PullToRefreshEventDetail,
} from './pullToRefresh';
