/**
 * HeroVideo — looping background video for the hero section.
 * Video is decorative (aria-hidden) — the navy gradient overlay ensures text remains
 * readable even if the video fails to load. Falls back to poster image for browsers
 * that don't support HTML5 video or when the video hasn't loaded yet.
 *
 * The previous clip (Pixabay #40816, "Worker, Hard Work, Man, Builder, Work") showed a
 * labourer shovelling gravel/hardcore on a groundworks site — the client flagged it as
 * having nothing to do with the business, correctly: Atlas South sells electrical,
 * plumbing, HVAC and facilities work, not civil groundworks.
 *
 * Replaced with Pexels video #28886877, "Technician Operating Electrical Control Panel" —
 * an indoor commercial control-panel technician, tagged Electrical Engineering / HVAC
 * Controls / Maintenance / Technician on Pexels, which is squarely the hard-services work
 * this site is selling. Pexels License: free for commercial use, no attribution required.
 * Self-hosted in public/ (downloaded from Pexels' own download endpoint, ~6.9MB, 1920x1080,
 * 11s) rather than hotlinked, because that endpoint is styled as a user download
 * (Content-Disposition: attachment) and isn't a stable CDN URL meant for embedding —
 * self-hosting avoids depending on it staying reachable in exactly that form.
 *
 * The poster is the exact first-frame still Pexels generated for this same clip (not a
 * different photo), so there's no visible seam when the video takes over from the poster.
 */

interface HeroCarouselProps {
  children?: React.ReactNode;
}

const VIDEO_SRC = '/hero-electrical-panel.mp4';

/**
 * Poster image shown while the video loads — the exact first frame of VIDEO_SRC, so the
 * above-the-fold area is never blank and there's no jump-cut when playback starts.
 */
const VIDEO_POSTER = '/hero-electrical-panel-poster.jpg';

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
