import { useEffect, useState } from 'react';

/**
 * Reports whether a dark section (bg-navy, tagged `data-widget-theme="dark"`) currently
 * sits behind a fixed-position element at approximately (x, y) in viewport coordinates.
 * Used by the chat widget to invert its own colour so it never gets drowned out — a white
 * badge over the navy footer/CTA bands, a navy badge over everything else.
 *
 * Sampling strategy: `document.elementFromPoint` at a point just outside the widget's own
 * hit area (offset up-and-left from where the caller says the widget sits), so the probe
 * hits real page content instead of the widget's own DOM. Re-checked on scroll/resize
 * (rAF-throttled) rather than every frame — the section behind a fixed corner element only
 * changes when the page moves.
 */
export function useSectionTheme(offsetX = 200, offsetY = 50): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;

    function check() {
      const x = window.innerWidth - offsetX;
      const y = window.innerHeight - offsetY;
      const el = document.elementFromPoint(x, y);
      let node: Element | null = el;
      let found: 'light' | 'dark' = 'light';
      while (node) {
        const attr = node.getAttribute?.('data-widget-theme');
        if (attr === 'dark' || attr === 'light') {
          found = attr;
          break;
        }
        node = node.parentElement;
      }
      setTheme((prev) => (prev !== found ? found : prev));
    }

    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        check();
        ticking = false;
      });
    }

    check();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [offsetX, offsetY]);

  return theme;
}
