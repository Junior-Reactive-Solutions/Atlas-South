interface ChatBadgeIconProps {
  /** Theme of the page section currently sitting behind the badge — 'dark' means a navy
   * band (footer, CTA, stats strip), so the badge itself must go light to stay visible. */
  theme: 'light' | 'dark';
  size?: number;
  /** Small pulsing "online" dot — shown on the floating trigger, omitted inside the open
   * panel header where a static dot next to "Online now" text already covers it. */
  showStatusDot?: boolean;
}

/**
 * The chatbot's own mark — not a stock speech-bubble icon. It's the real Atlas South "AS"
 * symbol (apps/web/public/brand/symbol.svg / symbol-light.svg — the same two files the nav
 * logo and footer already use) set into a plain circular badge, so the launcher reads as
 * "this is Atlas South" rather than a generic bot icon a visitor has to decode. An earlier
 * version added a speech-bubble tail (a rotated square poking past the circle's edge) to
 * spell out "this opens a chat" — dropped on review: it read as a stray corner rather than
 * a tail, and every contemporary chat launcher (Intercom, Crisp, Drift) makes the same call
 * — a plain circle plus the pulsing status dot below is enough to say "chat, available now"
 * without fighting the badge's own shape.
 *
 * Colour inverts based on `theme`: a white disc + the navy/blue symbol.svg over a dark
 * section, a navy disc + the white/blue symbol-light.svg over a light one — always the
 * variant with contrast against its own disc, and always contrast against the page behind
 * it. Pairs with useSectionTheme, which supplies `theme` by sampling what's actually
 * rendered behind the widget's fixed position.
 */
export function ChatBadgeIcon({ theme, size = 56, showStatusDot = false }: ChatBadgeIconProps) {
  const isOverDark = theme === 'dark';
  const discFill = isOverDark ? '#ffffff' : '#002484';
  const symbolSrc = isOverDark ? '/brand/symbol.svg' : '/brand/symbol-light.svg';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Main disc. The boxShadow is a fixed (non-adaptive) white ring + dark contact
          shadow — belt-and-suspenders on top of the fill inversion above. Fill inversion
          handles the common case (a tagged navy section vs. everything else) correctly;
          this ring is what keeps the badge legible against backgrounds that were never
          tagged at all — photos, client-uploaded imagery, a future section nobody thought
          to mark up. A white rim reads as a highlight against virtually anything except a
          pure-white page, and pure white is exactly the case the disc's own navy fill
          already handles on its own. */}
      <div
        className="absolute inset-0 rounded-full transition-colors duration-300"
        style={{
          background: discFill,
          boxShadow: '0 0 0 2.5px rgba(255,255,255,0.92), 0 6px 16px rgba(0,0,0,0.3)',
        }}
        aria-hidden="true"
      />
      {/* The actual Atlas South mark, centred */}
      <img
        src={symbolSrc}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: size * 0.5, height: 'auto' }}
      />
      {showStatusDot && (
        <span
          className="absolute rounded-full border-2 border-white bg-success"
          style={{ width: size * 0.24, height: size * 0.24, right: -1, bottom: -1 }}
          aria-hidden="true"
        >
          <span className="absolute inset-[-4px] animate-ping rounded-full border border-success opacity-70" />
        </span>
      )}
    </div>
  );
}
