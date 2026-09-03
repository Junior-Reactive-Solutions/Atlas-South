import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { FileText, Calendar, Mail, Phone, Eye } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { motion, AnimatePresence } from 'motion/react';
import { useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';
import { ReplyPanel } from '../../components/admin/ReplyPanel.js';
import { DetailDrawer, DetailField } from '../../components/admin/DetailDrawer.js';

interface JobApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  roleTitle: string | null;
  coverLetter: string | null;
  cvFileName: string | null;
  coverLetterFileName: string | null;
  createdAt: string;
}

export function AdminApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await authFetch('/api/admin/applications');
        if (!response.ok) return;

        const data = await response.json();
        setApplications(data.sort((a: JobApplication, b: JobApplication) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [authFetch]);

  /**
   * Permanently removes an application record. The confirmation spells out that the CV is
   * not stored here — since 2026-09-02 documents are emailed to the careers inbox and
   * never written to the server, so a full erasure request means deleting this row AND
   * that email. Saying so at the point of deletion is the only place someone will read it.
   */
  const deleteApplication = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Permanently delete the application from ${name}? This cannot be undone.\n\nNote: the CV and cover letter are not stored here — they were emailed to the careers inbox. Delete that email too if this is an erasure request.`,
      )
    )
      return;
    try {
      const response = await authFetch(`/api/admin/applications/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setApplications((current) => current.filter((a) => a.id !== id));
        setSelected((current) => (current && current.id === id ? null : current));
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const root = useAnimationScope(
    (self) => {
      self?.add('reveal', () => {
        animate('.application-row', {
          opacity: [0, 1],
          translateY: [24, 0],
          delay: stagger(STAGGER_GAP),
          duration: DURATION.slow,
          ease: EASE.standard,
        });
      });
    },
    [isLoading],
  );

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div ref={root} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-navy">Job Applications</h1>
        <div className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">No job applications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {applications.map((app) => (
              <motion.button
                key={app.id}
                layoutId={app.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ backgroundColor: 'rgb(248, 250, 252)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={() => setSelected(app)}
                className="application-row w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent-blue"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-navy">{app.fullName}</p>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {app.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {app.phone}
                      </div>
                      {app.roleTitle && (
                        <div className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {app.roleTitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                    <Eye className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <DetailDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.fullName ?? ''}
        subtitle={
          selected
            ? new Date(selected.createdAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : undefined
        }
        footer={
          selected && (
            <div className="space-y-3">
              <ReplyPanel
                endpoint={`/api/admin/applications/${selected.id}/reply`}
                recipientFirstName={selected.fullName.split(' ')[0]}
                recipientEmail={selected.email}
                defaultSubject={`Re: your application — ${selected.roleTitle ?? 'Atlas South Careers'}`}
              />
              {/* Quiet text button, not a primary one — replying is the routine action and
                  this is the irreversible one. The warning names the email explicitly
                  because the CV lives there, not here: deleting this row does not remove
                  the documents. */}
              <button
                type="button"
                onClick={() => deleteApplication(selected.id, selected.fullName)}
                className="text-xs font-medium text-red-700 hover:underline"
              >
                Delete this application permanently
              </button>
            </div>
          )
        }
      >
        {selected && (
          <dl>
            <DetailField label="Role applied for">
              {selected.roleTitle || <span className="italic text-slate-400">Not specified</span>}
            </DetailField>
            <DetailField label="Email">
              <a href={`mailto:${selected.email}`} className="text-accent-blue hover:underline">
                {selected.email}
              </a>
            </DetailField>
            <DetailField label="Phone">
              <a href={`tel:${selected.phone}`} className="text-accent-blue hover:underline">
                {selected.phone}
              </a>
            </DetailField>
            {(selected.cvFileName || selected.coverLetterFileName) && (
              <DetailField label="Documents">
                {/* Not downloadable from here by design. Uploads are attached to the email
                    sent to the careers inbox at submission and are never stored on the
                    server, so this panel names what was received and points at where it
                    actually is. The previous download buttons hit routes that are now 410 —
                    and before that were mostly serving files already lost to a deploy. */}
                <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                  {selected.cvFileName && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 shrink-0 text-accent-blue" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy">
                        {selected.cvFileName}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">CV</span>
                    </div>
                  )}
                  {selected.coverLetterFileName && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 shrink-0 text-accent-blue" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy">
                        {selected.coverLetterFileName}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">Cover letter</span>
                    </div>
                  )}
                  <p className="border-t border-slate-200 pt-2 text-xs text-slate-600">
                    Emailed to the careers inbox when this application was submitted. Documents
                    aren&rsquo;t stored on the server — search that mailbox for{' '}
                    <span className="font-medium">{selected.fullName}</span> to open them.
                  </p>
                </div>
              </DetailField>
            )}
            <DetailField label="Note">
              {selected.coverLetter ? (
                <p className="whitespace-pre-wrap leading-relaxed">{selected.coverLetter}</p>
              ) : (
                <span className="italic text-slate-400">No additional note submitted</span>
              )}
            </DetailField>
          </dl>
        )}
      </DetailDrawer>
    </div>
  );
}
