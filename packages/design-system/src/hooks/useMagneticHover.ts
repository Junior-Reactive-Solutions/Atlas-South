import { useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion } from '../tokens/motion.js';

interface MagneticHoverOptions {
  /** Distance in px from the element's centre at which the pull starts. */
  radius?: number;
  /** Maximum translation in px at the very centre of the radius. */
  strength?: number;
}

/**
 * Attaches a subtle "magnetic" pull to a button — as the cursor comes within `radius` of
 * the element's centre, the element translates a few pixels toward it; leaving the radius
 * resets it. One implementation, reused everywhere a primary CTA wants this (Hero,
 * CtaBand, Packages Subscribe buttons, page-bottom CTAs) so the feel is identical sitewide
 * rather than several hand-tuned copies drifting apart — see docs/build/02-ANIMATION-SYSTEM.md
 * §2 on this being an enforceable standard, not a per-page choice.
 *
 * Deliberately restrained: a handful of pixels of pull, nothing that could be mistaken for
 * the button actually moving away from a click target. Listens on `document` rather than
 * the element itself so the pull begins before the cursor even reaches the button, which
 * is what makes it read as "magnetic" rather than a hover effect.
 *
 * No-ops entirely under prefers-reduced-motion — this is exactly the kind of ambient,
 * non-essential motion that setting exists to disable.
 */
export function useMagneticHover<T extends HTMLElement>({
  radius = 90,
  strength = 10,
}: MagneticHoverOptions = {}): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        const pull = (1 - dist / radius) * strength;
        const tx = dist === 0 ? 0 : (dx / dist) * pull;
        const ty = dist === 0 ? 0 : (dy / dist) * pull;
        el!.style.transform = `translate(${tx}px, ${ty}px)`;
      } else {
        el!.style.transform = '';
      }
    }

    function handleLeaveWindow() {
      el!.style.transform = '';
    }

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeaveWindow);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeaveWindow);
      el.style.transform = '';
    };
  }, [radius, strength]);

  return ref;
}
