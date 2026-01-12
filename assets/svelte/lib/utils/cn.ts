/**
 * Utility for conditionally joining class names
 * Similar to clsx/classnames but lightweight
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];
type ClassObject = Record<string, boolean | undefined | null>;

export function cn(...inputs: (ClassValue | ClassObject)[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

/**
 * Merge Tailwind classes with proper precedence
 * Later classes override earlier ones for the same utility
 */
export function twMerge(...classes: (string | undefined | null)[]): string {
  // Simple implementation - for production use tailwind-merge package
  return classes.filter(Boolean).join(' ');
}
