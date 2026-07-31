import { useState } from 'react';
import { CreateEnquirySchema, ALL_SERVICES, type CreateEnquiryInput } from '@atlas-south/shared';
import { Icon } from '@atlas-south/design-system';

/**
 * Quote form — docs/build/06-PAGE-SPECIFICATIONS.md "Quote form section".
 * Collects enquiry details and submits to /api/enquiries per docs/build/08-ADMIN-PANEL-SPEC.md §5.
 * Client-side validation uses the same schema as the API, so behaviour is identical before/after network.
 * Honeypot field (companyWebsite) is hidden from users; any filled value signals bot submission
 * and the form silently accepts but drops it on the server per docs/build/07-SECURITY.md §3.
 */
export function QuoteForm() {
  const [formData, setFormData] = useState<Partial<CreateEnquiryInput>>({
    fullName: '',
    email: '',
    phone: '',
    serviceId: undefined,
    message: '',
    sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/',
    companyWebsite: '', // honeypot
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-4">
            <Icon name="badge-check" size={32} className="text-success" />
            <div>
              <h2 className="text-2xl font-bold">Enquiry submitted</h2>
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
    <section aria-label="Quote form" className="bg-navy py-16 text-white sm:py-20">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Get a free quote</h2>
          <p className="mt-2 text-white/80">
            Tell us about your project. We'll respond within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="rounded-lg bg-error/10 p-4 text-sm text-error">{errors.submit}</div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium">
                Full name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                  errors.fullName ? 'border-error ring-error/50' : 'border-white/20 focus:ring-accent-blue'
                }`}
              />
              {errors.fullName && <p className="mt-1 text-sm text-error">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-error ring-error/50' : 'border-white/20 focus:ring-accent-blue'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className={`mt-2 w-full rounded-lg border bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                  errors.phone ? 'border-error ring-error/50' : 'border-white/20 focus:ring-accent-blue'
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="serviceId" className="block text-sm font-medium">
                Service type
              </label>
              <select
                id="serviceId"
                name="serviceId"
                value={formData.serviceId || ''}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                <option value="">Select a service...</option>
                {ALL_SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className={`mt-2 w-full rounded-lg border bg-white/10 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 ${
                errors.message ? 'border-error ring-error/50' : 'border-white/20 focus:ring-accent-blue'
              }`}
            />
            {errors.message && <p className="mt-1 text-sm text-error">{errors.message}</p>}
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

          <div className="flex items-start gap-3">
            <input
              id="agreedToPrivacyPolicy"
              name="agreedToPrivacyPolicy"
              type="checkbox"
              required
              checked={formData.agreedToPrivacyPolicy}
              onChange={handleChange}
              className="mt-1 rounded border-white/20 bg-white/10 text-accent-blue focus:ring-accent-blue"
            />
            <label htmlFor="agreedToPrivacyPolicy" className="text-sm leading-relaxed text-white/80">
              I agree to the{' '}
              <a href="/privacy" className="font-medium text-accent-blue hover:underline">
                Privacy Policy
              </a>{' '}
              *
            </label>
          </div>
          {errors.agreedToPrivacyPolicy && (
            <p className="text-sm text-error">{errors.agreedToPrivacyPolicy}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-accent-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-blue disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Get a free quote'}
          </button>
        </form>
      </div>
    </section>
  );
}
