import type { LucideProps } from 'lucide-react';
import { ICON_REGISTRY } from './icon-registry.js';

export type IconName = string;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  /** Set only when the icon is the SOLE content of a control with no visible text. */
  label?: string;
}

/**
 * Enforces the icon accessibility pattern from docs/build/01-BRAND-SYSTEM.md §5:
 * decorative icons paired with visible text are hidden from assistive tech by default;
 * an icon standing in for a label gets one explicitly via `label`. This makes it
 * structurally hard to repeat the audit finding of un-hidden emoji being read aloud
 * literally by screen readers ("shield emoji") — there is no path through this
 * component that skips one of the two accessible states.
 *
 * Icon resolution goes through the explicit ICON_REGISTRY (see icon-registry.ts) —
 * never lucide-react's blanket `icons` map, which bundles all ~1,500 icons regardless
 * of use. Adding a new icon means adding it to that registry first.
 */
export function Icon({ name, label, ...props }: IconProps) {
  const LucideIcon = ICON_REGISTRY[name];
  if (!LucideIcon) {
    if (typeof globalThis !== 'undefined' && (globalThis as any).DEV) {
      // eslint-disable-next-line no-console
      console.warn(`Icon "${name}" is not in ICON_REGISTRY — add it in icon-registry.ts`);
    }
    return null;
  }

  return label ? (
    <LucideIcon aria-label={label} {...props} />
  ) : (
    <LucideIcon aria-hidden="true" focusable="false" {...props} />
  );
}
