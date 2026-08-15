import { useId, useState } from 'react';

interface CompareSliderProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Accessible name for the slider control, e.g. "Before and after: rewired panel". */
  label: string;
}

/**
 * Drag-to-reveal before/after comparison — see apps/web/src/content/imagery.ts for which
 * service pages this appears on and why (only the ones with a genuine visual
 * transformation story: plumbing, electricals, commercial cleaning).
 *
 * Built on a real `<input type="range">` rather than hand-rolled pointer/ARIA-slider
 * logic — it's the same interaction (drag a handle between two bounds), and the native
 * control gives keyboard support (arrow keys), touch dragging, and screen-reader
 * announcements for free. The range input is stretched invisibly over the full image and
 * drives the visible split line + grip via its value; visually it reads as a custom
 * compare slider, but every input method a real `<input type="range">` supports still
 * works exactly as expected.
 */
export function CompareSlider({ before, after, beforeLabel = 'Before', afterLabel = 'After', label }: CompareSliderProps) {
  const [split, setSplit] = useState(50);
  const id = useId();

  return (
    <div className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-xl bg-navy">
      {/* Before — full image, sits underneath */}
      <img src={before} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <span className="absolute bottom-3 left-3 rounded bg-black/45 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
        {beforeLabel}
      </span>

      {/* After — clipped to the current split, sits on top */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
        <img src={after} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <span className="absolute bottom-3 right-3 rounded bg-accent-blue/90 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {afterLabel}
        </span>
      </div>

      {/* Visible split line + grip — purely decorative, positioned from the same state
          the input drives; pointer-events-none so drags always land on the input below. */}
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
        style={{ left: `${split}%`, transform: 'translateX(-1px)' }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M5 4L1 8l4 4M11 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={split}
        onChange={(e) => setSplit(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
      />
    </div>
  );
}
