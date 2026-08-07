import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';

interface JobApplicationFormProps {
  roleTitle?: string;
}

export function JobApplicationForm({ roleTitle }: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    file: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('coverLetter', formData.coverLetter);
      if (roleTitle) data.append('roleTitle', roleTitle);
      if (formData.file) data.append('cv', formData.file);

      const response = await fetch('/api/careers/apply', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setMessage({ text: "Application submitted successfully! We'll be in touch soon.", tone: 'success' });
      setFormData({ fullName: '', email: '', phone: '', coverLetter: '', file: null });
    } catch {
      setMessage({ text: 'Failed to submit application. Please try again.', tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.tone === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="jobapp-fullName" className="block text-sm font-medium text-navy">
          Full name
        </label>
        <input
          id="jobapp-fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          aria-invalid={false}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="jobapp-email" className="block text-sm font-medium text-navy">
            Email
          </label>
          <input
            id="jobapp-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            aria-invalid={false}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          />
        </div>
        <div>
          <label htmlFor="jobapp-phone" className="block text-sm font-medium text-navy">
            Phone
          </label>
          <input
            id="jobapp-phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            aria-invalid={false}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="jobapp-coverLetter" className="block text-sm font-medium text-navy">
          Cover letter
        </label>
        <textarea
          id="jobapp-coverLetter"
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleChange}
          rows={4}
          aria-invalid={false}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          placeholder="Tell us about yourself and why you're interested in this role..."
        />
      </div>

      <div>
        <label htmlFor="jobapp-cv" className="block text-sm font-medium text-navy">
          Upload CV (PDF)
        </label>
        <input
          id="jobapp-cv"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          aria-invalid={false}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        />
        {formData.file && <p className="mt-1 text-xs text-slate">{formData.file.name}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-accent-blue px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Mail className="mr-2 inline-block h-4 w-4" />
            Submit application
          </>
        )}
      </button>
    </form>
  );
}
