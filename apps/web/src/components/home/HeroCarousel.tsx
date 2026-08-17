/**
 * HeroVideo — looping background video for the hero section.
 * Video is decorative (aria-hidden) — the navy gradient overlay ensures text remains
 * readable even if the video fails to load. Falls back to poster image for browsers
 * that don't support HTML5 video or when the video hasn't loaded yet.
 *
 * Client-supplied clip (2026-08-17): a technician in hi-vis and a hard hat walking an
 * indoor plant-room aisle with a tablet, inspecting distribution boards / control panels
 * and HVAC ductwork — squarely the hard-services work this site sells (electrical,
 * plumbing, HVAC, facilities). Replaces the previous Pexels clip.
 *
 * The source file is AI-generated (an on-screen "KlingAI 3.0" watermark, bottom-right,
 * confirmed this on inspection) rather than filmed footage — flagged to the client before
 * use. `crop=1280:660:0:0` removes the watermark strip entirely (checked across multiple
 * timestamps in the clip, not just the first frame); re-encoded at CRF 23 for web delivery,
 * which also dropped the file from the original 8.6MB down to ~1.3MB. Re-run the same crop
 * against apps/web/public/hero-plant-room-inspection.mp4's untouched source if this ever
 * needs re-encoding — the crop coordinates are specific to this clip's frame, not a
 * general-purpose value.
 *
 * The poster is the exact first frame of the CROPPED video (not the original), so there's
 * no watermark flash and no visible seam when the video takes over from the poster.
 */

interface HeroCarouselProps {
  children?: React.ReactNode;
}

const VIDEO_SRC = '/hero-plant-room-inspection.mp4';

/**
 * Poster image shown while the video loads — the exact first frame of VIDEO_SRC, so the
 * above-the-fold area is never blank and there's no jump-cut when playback starts.
 */
const VIDEO_POSTER = '/hero-plant-room-inspection-poster.jpg';

export function HeroCarousel({ children }: HeroCarouselProps) {
  return (
    <div className="relative overflow-hidden bg-navy">
      {/*
        `object-right` below the md breakpoint is the fix for a real mobile bug, not a
        stylistic preference. This clip's subject (the technician, the switchgear, the
        ductwork) all sits in the RIGHT portion of a 1280x660 landscape frame; its left
        third is a flat dark wall. Cropping a landscape frame into a tall mobile viewport
        with the default `object-position: center` therefore kept the wall and threw away
        every recognisable part of the shot — the client correctly reported the mobile hero
        as showing "only the wall". Anchoring the crop to the right keeps the subject.

        The video now plays on mobile too. It previously rendered as a static poster below
        md, because the original clip was 6.9MB and autoplaying that on mobile data was a
        real cost for no benefit. The current clip is ~1.3MB — about the weight of one hero
        photograph — so that trade-off no longer holds, and a single element avoids the
        poster and video disagreeing about their crop. `poster` still paints instantly
        before the first frame decodes, and it's the same frame, so there's no jump.
      */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={VIDEO_POSTER}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-right md:object-center"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Navy gradient overlay — ensures hero text is always readable */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/40"
        aria-hidden="true"
      />

      {/* Decorative brand-blue glow shapes — per docs/build/01-BRAND-SYSTEM.md's dark-panel
          recipe, `--color-brand-blue` is explicitly sanctioned for "decorative shapes" in
          the hero. Placed top-right where the gradient is lightest (§3 of the hero spec:
          "transparent at the top-right"), well clear of the left-aligned headline, so
          they add graphic depth without ever crossing text or lowering contrast. Purely
          decorative — aria-hidden, and their drift animation (Hero.tsx) is skipped under
          prefers-reduced-motion. Sized with vw/vh + blur so they scale with the viewport
          instead of needing separate mobile/desktop values. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-decor-orb absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-brand-blue/25 blur-3xl" />
        <div className="hero-decor-orb absolute -right-10 top-1/3 h-64 w-64 rounded-full bg-brand-blue/20 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
