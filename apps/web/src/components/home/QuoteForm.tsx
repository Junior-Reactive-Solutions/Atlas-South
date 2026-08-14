import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { CreateEnquirySchema, ALL_SERVICES, type CreateEnquiryInput } from '@atlas-south/shared';
import { Icon, useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';

/**
 * Carries intent from a pricing-tier "Get started" click (Packages.tsx) through to this
 * form, rather than dropping it at a generic contact page — a `?package=` query param
 * pre-fills the message field naming the tier, so what someone was about to buy survives
 * the navigation. Client-only: no backend schema change, `message` is already free text.
 */
function prefilledMessageFromQuery(searchParams: URLSearchParams): string {
  const pkg = searchParams.get('package');
  return pkg ? `I'm interested in the ${pkg} package.` : '';
}

/**
 * Quote form — docs/build/06-PAGE-SPECIFICATIONS.md "Quote form section".
 * Collects enquiry details and submits to /api/enquiries per docs/build/08-ADMIN-PANEL-SPEC.md §5.
 * Client-side validation uses the same schema as the API, so behaviour is identical before/after network.
 * Honeypot field (companyWebsite) is hidden from users; any filled value signals bot submission
 * and the form silently accepts but drops it on the server per docs/build/07-SECURITY.md §3.
 */
export function QuoteForm() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<Partial<CreateEnquiryInput>>({
    fullName: '',
    email: '',
    phone: '',
    serviceId: undefined,
    message: prefilledMessageFromQuery(searchParams),
    sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
    companyWebsite: '', // honeypot
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll-triggered fade+rise for the form card, matching the public-site card language
  // (Testimonials, Footer columns) rather than appearing with no motion at all.
  const root = useAnimationScope((self) => {
    self?.add('reveal', () => {
      animate('.quote-form-card', {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: DURATION.slow,
        ease: EASE.standard,
      });
      animate('.quote-form-field', {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: stagger(STAGGER_GAP),
        duration: DURATION.base,
        ease: EASE.standard,
      });
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.currentTarget;
    const fieldValue = type === 'checkbox' ? (e.currentTarget as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear error for this field as user corrects it
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate on client using the same schema as the API
      const validated = CreateEnquirySchema.parse({
        ...formData,
        agreedToPrivacyPolicy: formData.agreedToPrivacyPolicy ?? false,
      });

      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.details?.fieldErrors) {
          setErrors(
            Object.entries(errorData.details.fieldErrors).reduce(
              (acc, [field, msgs]) => ({
                ...acc,
                [field]: Array.isArray(msgs) ? msgs[0] : msgs,
              }),
              {},
            ),
          );
        } else {
          setErrors({ submit: 'Failed to submit enquiry. Please try again.' });
        }
      } else {
        setSubmitted(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          serviceId: undefined,
          message: '',
          sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
          companyWebsite: '',
        });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      if (err instanceof Error) {
        // Zod validation error
        try {
          const parsed = JSON.parse(err.message);
          if (Array.isArray(parsed)) {
            const newErrors: Record<string, string> = {};
            parsed.forEach((issue) => {
              const field = issue.path?.join('.');
              if (field) newErrors[field] = issue.message;
            });
            setErrors(newErrors);
          }
        } catch {
          setErrors({ submit: err.message });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section aria-label="Quote form" className="bg-navy py-16 text-white sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-success/15">
              <Icon name="badge-check" size={32} className="text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Enquiry submitted</h2>
              <p className="mt-1 text-white/80">
                We'll be in touch within 24 hours. Check your email for a confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={root} aria-label="Quote form" className="bg-navy py-16 text-white sm:py-20">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          {/* text-white is load-bearing: index.css applies `text-navy` to every h1-h4
              globally, so without it this heading renders navy on the navy panel and is
              invisible — which it had been on every page carrying the quote form. */}
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Get a free quote
          </h2>
          <p className="mt-2 text-white/80">
            Tell us about your project. We'll respond within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="quote-form-card space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          {errors.submit && (
            <div className="rounded-lg bg-error/10 p-4 text-sm text-error">{errors.submit}</div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="quote-form-field">
              <label htmlFor="fullName" className="block text-sm font-medium">
                Full name *
              </label>
              <div className="relative mt-2">
                <Icon name="user" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  aria-invalid={!!errors.fullName}
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full min-h-[44px] rounded-lg border bg-white/10 py-2 pl-10 pr-4 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 ${
                    errors.fullName ? 'border-error ring-error/50' : 'border-white/20 focus:ring-accent-blue'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" className="mt-1 text-sm text-error" role="alert">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="quote-form-field">
              <label htmlFor="email" className="block text-sm font-medium">
                Email *
              </label>
              <div className="relative mt-2">
                <Icon name="mail" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full min-h-[44px] rounded-lg border bg-white/10 py-2 pl-10 pr-4 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-error ring-error/50' : 'border-white/20 focus:ring-accent-blue'
                  }`}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="quote-form-field">
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone *
              </label>
              <div className="relative mt-2">
                <Icon name="phone" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  aria-invalid={!!errors.phone}
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full min-h-[44px] rounded-lg border bg-white/10 py-2 pl-10 pr-4 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-error ring-error/50' : 'border-white/20 focus:ring-accent-blue'
                  }`}
                />
              </div>
              {errors.phone && (
                <p id="phone-error" className="mt-1 text-sm text-error" role="alert">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="quote-form-field">
              <label htmlFor="serviceId" className="block text-sm font-medium">
                Service type
              </label>
              <div className="relative mt-2">
                <Icon name="wrench" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <select
                  id="serviceId"
                  name="serviceId"
                  value={formData.serviceId || ''}
                  onChange={handleChange}
                  className="w-full min-h-[44px] appearance-none rounded-lg border border-white/20 bg-white/10 py-2 pl-10 pr-4 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <option value="" className="text-navy">Select a service...</option>
                  {ALL_SERVICES.map((service) => (
                    <option key={service.id} value={service.id} className="text-navy">
                      {service.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="quote-form-field">
            <label htmlFor="message" className="block text-sm font-medium">
              Message *
            </label>
            <div className="relative mt-2">
              <Icon name="message-square" size={18} className="pointer-events-none absolute left-3 top-3 text-white/40" />
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                aria-describedby={errors.message ? 'message-error' : undefined}
                aria-invalid={!!errors.message}
                value={formData.message}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-white/10 py-2 pl-10 pr-4 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 ${
                  errors.message ? 'border-error ring-error/50' : 'border-white/20 focus:ring-accent-blue'
                }`}
              />
            </div>
            {errors.message && (
              <p id="message-error" className="mt-1 text-sm text-error" role="alert">
                {errors.message}
              </p>
            )}
          </div>

          {/* Honeypot field — hidden from users, catches bots */}
          <input
            type="text"
            name="companyWebsite"
            value={formData.companyWebsite}
            onChange={handleChange}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="quote-form-field flex items-start gap-3">
            <input
              id="agreedToPrivacyPolicy"
              name="agreedToPrivacyPolicy"
              type="checkbox"
              required
              aria-describedby={errors.agreedToPrivacyPolicy ? 'agreedToPrivacyPolicy-error' : undefined}
              aria-invalid={!!errors.agreedToPrivacyPolicy}
              checked={formData.agreedToPrivacyPolicy}
              onChange={handleChange}
              className="mt-1 rounded border-white/20 bg-white/10 text-accent-blue focus:ring-accent-blue"
            />
            <label htmlFor="agreedToPrivacyPolicy" className="text-sm leading-relaxed text-white/80">
              I agree to the{' '}
              <a href="/legal/privacy" className="font-medium text-accent-blue hover:underline">
                Privacy Policy
              </a>{' '}
              *
            </label>
          </div>
          {errors.agreedToPrivacyPolicy && (
            <p id="agreedToPrivacyPolicy-error" className="text-sm text-error" role="alert">
              {errors.agreedToPrivacyPolicy}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="quote-form-field group flex w-full items-center justify-center gap-2 rounded-lg bg-accent-blue px-6 py-3 font-semibold text-white transition-all hover:scale-[1.01] hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                Get a free quote
                <Icon name="arrow-right" size={18} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
