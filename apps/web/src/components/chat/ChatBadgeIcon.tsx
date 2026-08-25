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
 * logo and footer already use) set into a circular badge with a small speech-bubble tail,
 * so the launcher reads as "this is Atlas South, and it opens a chat" rather than a generic
 * bot icon a visitor has to decode.
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
      {/* Speech-bubble tail — a same-colour square rotated 45deg, tucked behind the main
          disc so only its outer corner peeks past the circle's edge. */}
      <div
        className="absolute rounded-[3px] transition-colors duration-300"
        style={{
          width: size * 0.24,
          height: size * 0.24,
          background: discFill,
          left: size * 0.04,
          bottom: -size * 0.04,
          transform: 'rotate(45deg)',
        }}
        aria-hidden="true"
      />
      {/* Main disc */}
      <div
        className="absolute inset-0 rounded-full transition-colors duration-300"
        style={{ background: discFill }}
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
          className="absolute rounded-full border-2 border-white bg-emerald-500"
          style={{ width: size * 0.24, height: size * 0.24, right: -1, bottom: -1 }}
          aria-hidden="true"
        >
          <span className="absolute inset-[-4px] animate-ping rounded-full border border-emerald-400 opacity-70" />
        </span>
      )}
    </div>
  );
}
