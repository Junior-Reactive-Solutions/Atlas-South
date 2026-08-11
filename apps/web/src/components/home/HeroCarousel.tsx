/**
 * HeroVideo — looping background video for the hero section.
 * Video is decorative (aria-hidden) — the navy gradient overlay ensures text remains
 * readable even if the video fails to load. Falls back to poster image for browsers
 * that don't support HTML5 video or when the video hasn't loaded yet.
 *
 * Source: Pixabay (royalty-free, free for commercial use, no attribution required)
 * Video: "Worker, Hard Work, Man, Builder, Work" — 4K · 18s loop · ID 40816
 */

interface HeroCarouselProps {
  children?: React.ReactNode;
}

const VIDEO_SRC =
  'https://cdn.pixabay.com/video/2020/06/01/40816-426939512_large.mp4';

/**
 * Poster image shown while the video loads — one of the original hero images
 * so the above-the-fold area is never blank.
 */
const VIDEO_POSTER =
  'https://images.unsplash.com/photo-1694521787193-9293daeddbaa?auto=format&fit=crop&w=1920&q=60';

export function HeroCarousel({ children }: HeroCarouselProps) {
  return (
    <div className="relative overflow-hidden bg-navy">
      {/* Static poster on small screens — a looping 4K video autoplaying on mobile
          data is a real bandwidth/battery cost for no visible benefit at that size.
          `hidden md:block` swaps to the actual video from the tablet breakpoint up. */}
      <img
        src={VIDEO_POSTER}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover md:hidden"
      />
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={VIDEO_POSTER}
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full object-cover md:block"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Navy gradient overlay — ensures hero text is always readable */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/40"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
