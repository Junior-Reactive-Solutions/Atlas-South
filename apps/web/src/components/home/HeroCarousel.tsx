import { useEffect, useState } from 'react';
import { animate } from 'animejs';

/**
 * Hero carousel — cycles through multiple background images with fade transitions.
 * Per docs/build/03-HERO-SECTION-SPEC.md hero imagery sourcing.
 */

interface HeroImage {
  desktop: string;
  mobile: string;
  alt: string;
}

const HERO_IMAGES: HeroImage[] = [
  {
    desktop:
      'https://images.unsplash.com/photo-1694521787193-9293daeddbaa?auto=format&fit=crop&w=1920&q=80',
    mobile:
      'https://images.unsplash.com/photo-1694521787193-9293daeddbaa?auto=format&fit=crop&w=800&h=1000&crop=faces&q=80',
    alt: 'Professional tradesperson on site',
  },
  {
    desktop:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80',
    mobile:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&h=1000&crop=faces&q=80',
    alt: 'Team coordination and planning',
  },
  {
    desktop:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80',
    mobile:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&h=1000&crop=faces&q=80',
    alt: 'Facility management excellence',
  },
];

interface HeroCarouselProps {
  children?: React.ReactNode;
}

export function HeroCarousel({ children }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    animate('.hero-carousel-image', {
      opacity: [0.5, 1],
      duration: 1000,
      easing: 'easeInOutQuad',
    });
  }, [currentIndex]);

  const currentImage = HERO_IMAGES[currentIndex];
  const srcSet = isMobile ? currentImage.mobile : currentImage.desktop;

  return (
    <div className="relative overflow-hidden bg-navy">
      <picture>
        <source media="(max-width: 767px)" srcSet={currentImage.mobile} />
        <img
          key={currentIndex}
          src={srcSet}
          alt={currentImage.alt}
          aria-hidden="true"
          width={1920}
          height={1080}
          className="hero-carousel-image absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      </picture>

      {/* Navy gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/40" aria-hidden="true" />

      {/* Carousel indicators */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {HERO_IMAGES.map((image, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1} of ${HERO_IMAGES.length}: ${image.alt}`}
            aria-current={idx === currentIndex ? 'page' : undefined}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex ? 'w-8 bg-accent-blue' : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
