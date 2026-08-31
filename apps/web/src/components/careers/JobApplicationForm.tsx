import { useState } from 'react';
import { Mail, Loader2, FileText, X } from 'lucide-react';

interface JobApplicationFormProps {
  roleTitle?: string;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024; // matches the server's multer limit — checked
// client-side too so a candidate finds out before waiting on an upload that's guaranteed
// to be rejected.

function FileField({
  id,
  label,
  required,
  file,
  onChange,
}: {
  id: string;
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (picked && picked.size > MAX_FILE_BYTES) {
      setError('That file is over 5MB — please upload a smaller PDF.');
      onChange(null);
      e.target.value = '';
      return;
    }
    setError(null);
    onChange(picked);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy">
        {label} {required && <span className="text-red-600">*</span>}
        <span className="ml-1 font-normal text-slate-400">(PDF, max 5MB)</span>
      </label>

      {file ? (
        <div className="mt-1 flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-canvas-tint px-3 py-2 text-sm">
          <FileText className="h-4 w-4 shrink-0 text-accent-blue" />
          <span className="min-w-0 flex-1 truncate text-navy">{file.name}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            aria-label={`Remove ${label}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <input
          id={id}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleChange}
          required={required}
          aria-invalid={!!error}
          className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-accent-blue/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-blue focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Serious, full-screen application form — client feedback (2026-08-31): the previous
 * version was an accordion panel embedded inside the Careers listing card, which read as
 * an afterthought for a role a candidate should be taking seriously. It now lives on the
 * role's own page (CareerDetail.tsx) alongside the full job description, and accepts a
 * CV *and* a separate Cover Letter as real file uploads rather than one free-text box —
 * the free-text cover letter field is kept as an optional "anything else" note, not a
 * replacement for an uploaded letter.
 *
 * Storage note: uploaded files are still written to the API's local disk
 * (apps/api/src/routes/careers.ts), which is wiped on every Render redeploy — see that
 * file's header comment. Persistent object storage (Cloudinary/S3) was scoped and
 * deliberately deferred at the client's request (2026-08-31); this form and the backend
 * validation are otherwise already correct and ready to point at real storage later.
 */
export function JobApplicationForm({ roleTitle }: JobApplicationFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [cv, setCv] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const data = new FormData();
      data.append('fullName', fullName);
      data.append('email', email);
      data.append('phone', phone);
      if (message.trim()) data.append('coverLetter', message.trim());
      if (roleTitle) data.append('roleTitle', roleTitle);
      if (cv) data.append('cv', cv);
      if (coverLetterFile) data.append('coverLetterFile', coverLetterFile);

      const response = await fetch('/api/careers/apply', { method: 'POST', body: data });
      if (!response.ok) throw new Error('Failed to submit application');

      setStatus({ text: "Application submitted successfully — we'll be in touch soon.", tone: 'success' });
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setCv(null);
      setCoverLetterFile(null);
    } catch {
      setStatus({ text: 'Failed to submit application. Please try again.', tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-canvas p-6 sm:p-8">
      {status && (
        <div
          role="status"
          className={`rounded-lg p-3 text-sm ${
            status.tone === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {status.text}
        </div>
      )}

      <div>
        <label htmlFor="jobapp-fullName" className="block text-sm font-medium text-navy">
          Full name <span className="text-red-600">*</span>
        </label>
        <input
          id="jobapp-fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="jobapp-email" className="block text-sm font-medium text-navy">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="jobapp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          />
        </div>
        <div>
          <label htmlFor="jobapp-phone" className="block text-sm font-medium text-navy">
            Phone <span className="text-red-600">*</span>
          </label>
          <input
            id="jobapp-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FileField id="jobapp-cv" label="CV / Résumé" required file={cv} onChange={setCv} />
        <FileField id="jobapp-cover-letter" label="Cover Letter" file={coverLetterFile} onChange={setCoverLetterFile} />
      </div>

      <div>
        <label htmlFor="jobapp-message" className="block text-sm font-medium text-navy">
          Anything else you'd like us to know? <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="jobapp-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          placeholder="A short note to go alongside your CV and cover letter — not required if they cover it."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-accent-blue px-4 py-2 font-semibold text-white hover:bg-navy disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Submit application
          </>
        )}
      </button>
    </form>
  );
}
