/**
 * UI Component Library
 *
 * @example
 * import { Button, Input, Card, Modal } from '$lib/components/ui';
 */

// Primitives (Atoms)
export { default as Alert } from './primitives/Alert.svelte';
export { default as Avatar } from './primitives/Avatar.svelte';
export { default as Badge } from './primitives/Badge.svelte';
export { default as Button } from './primitives/Button.svelte';
export { default as Icon } from './primitives/Icon.svelte';
export { default as Input } from './primitives/Input.svelte';
export { default as Skeleton } from './primitives/Skeleton.svelte';
export { default as Textarea } from './primitives/Textarea.svelte';
export { default as Toggle } from './primitives/Toggle.svelte';

// Compounds (Molecules)
export { default as AppHeader } from './compounds/AppHeader.svelte';
export { default as BottomTabBar } from './compounds/BottomTabBar.svelte';
export { default as Card } from './compounds/Card.svelte';
export { default as FormField } from './compounds/FormField.svelte';
export { default as IconButton } from './compounds/IconButton.svelte';

// Patterns (Organisms)
export { default as BottomSheet } from './patterns/BottomSheet.svelte';
export { default as Dropdown } from './patterns/Dropdown.svelte';
export { default as EmptyState } from './patterns/EmptyState.svelte';
export { default as Modal } from './patterns/Modal.svelte';
export { default as SheetMenu } from './patterns/SheetMenu.svelte';
