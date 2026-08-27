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
            <ReplyPanel
              endpoint={`/api/admin/applications/${selected.id}/reply`}
              recipientFirstName={selected.fullName.split(' ')[0]}
              recipientEmail={selected.email}
              defaultSubject={`Re: your application — ${selected.roleTitle ?? 'Atlas South Careers'}`}
            />
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
            {selected.cvFileName && (
              <DetailField label="CV">
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
                  <FileText className="h-5 w-5 shrink-0 text-accent-blue" />
                  <span className="truncate text-sm font-medium text-navy">{selected.cvFileName}</span>
                </div>
              </DetailField>
            )}
            <DetailField label="Cover letter">
              {selected.coverLetter ? (
                <p className="whitespace-pre-wrap leading-relaxed">{selected.coverLetter}</p>
              ) : (
                <span className="italic text-slate-400">No cover letter submitted</span>
              )}
            </DetailField>
          </dl>
        )}
      </DetailDrawer>
    </div>
  );
}
