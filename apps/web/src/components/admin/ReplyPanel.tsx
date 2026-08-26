import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

interface ReplyPanelProps {
  /** e.g. `/api/admin/enquiries/${id}/reply` or `/api/admin/applications/${id}/reply` */
  endpoint: string;
  /** First name only, for the "Hi James," the panel previews before sending. */
  recipientFirstName: string;
  recipientEmail: string;
  defaultSubject: string;
}

/**
 * Compose-and-send panel for the admin's "Reply" action on an Enquiry or Job Application —
 * shared between Enquiries.tsx and Applications.tsx rather than duplicated, since the flow
 * (subject, message, send, confirm) is identical for both; only the endpoint and default
 * subject differ per caller.
 *
 * Sends through the API (routes/admin/enquiries.ts, routes/admin/applications.ts), which
 * renders the message into the themed HTML template (lib/emailThemes.ts) and sends via
 * Resend — this replaces the previous `mailto:` link, which handed the reply off to
 * whatever email client (or none) was configured on the admin's machine, with no themed
 * template and no record that a reply was actually sent.
 */
export function ReplyPanel({ endpoint, recipientFirstName, recipientEmail, defaultSubject }: ReplyPanelProps) {
  const { authFetch } = useAuth();
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSend() {
    if (!message.trim()) return;
    setStatus('sending');
    try {
      const res = await authFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) throw new Error('Send failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        Reply sent to {recipientEmail}.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <label
          htmlFor={`reply-subject-${endpoint}`}
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Subject
        </label>
        <input
          id={`reply-subject-${endpoint}`}
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/25"
        />
      </div>
      <div>
        <label
          htmlFor={`reply-message-${endpoint}`}
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Message to {recipientFirstName}
        </label>
        <textarea
          id={`reply-message-${endpoint}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Write your reply — it'll be sent in Atlas South's branded email template."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/25"
        />
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600">
          Couldn't send that reply — check that email sending is configured, then try again.
        </p>
      )}
      <button
        onClick={handleSend}
        disabled={status === 'sending' || !message.trim()}
        className="flex items-center gap-2 rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {status === 'sending' ? 'Sending…' : 'Send reply'}
      </button>
    </div>
  );
}
