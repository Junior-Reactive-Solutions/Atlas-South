import { useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';
import { animate, stagger } from 'animejs';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Atlas South transformed our emergency response protocols. The team understood our facility needs immediately and delivered solutions that actually work.",
    author: 'David Pritchard',
    role: 'Facilities Manager, Healthcare Trust',
  },
  {
    quote:
      "Professional, reliable, and thorough. They've been our trusted partner for over 5 years. No service call has ever left us wondering.",
    author: 'Sarah Chen',
    role: 'Operations Director, Shopping Centre',
  },
  {
    quote:
      "When our sprinkler system failed at 2 AM, Atlas South had an engineer on site within 40 minutes. That's the service standard we expect.",
    author: 'Michael Okafor',
    role: 'Risk Manager, Corporate Head Office',
  },
];

/**
 * Testimonials section — docs/build/06-PAGE-SPECIFICATIONS.md "Testimonials row".
 * Displays client quotes in a scrollable grid with staggered animation on load.
 * Placeholder testimonials here per Sprint 3; replace with real client feedback once confirmed.
 */
export function Testimonials() {
  const root = useAnimationScope((self) => {
    self?.add('reveal', () => {
      animate('.testimonial-card', {
        opacity: [0, 1],
        translateY: [24, 0],
        delay: stagger(STAGGER_GAP),
        duration: DURATION.slow,
        ease: EASE.standard,
      });
    });
  }, []);

  return (
    <section ref={root} aria-label="Client testimonials" className="bg-canvas-tint py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <p className="font-display text-sm uppercase tracking-widest text-accent-blue">
            What our clients say
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">
            Trusted by leading organisations
          </h2>
          <p className="mt-4 text-slate">
            Over 700 clients rely on Atlas South for critical building services.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.author}
              className="testimonial-card rounded-lg border border-border bg-canvas p-6 shadow-sm"
            >
              <blockquote>
                <p className="text-sm italic text-slate">"{testimonial.quote}"</p>
                <footer className="mt-4 text-sm">
                  <p className="font-semibold text-navy">{testimonial.author}</p>
                  <p className="text-slate">{testimonial.role}</p>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
