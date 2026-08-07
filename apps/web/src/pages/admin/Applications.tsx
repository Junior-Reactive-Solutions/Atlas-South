import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Mail, Phone } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { motion, AnimatePresence } from 'motion/react';
import { useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/admin/login');
          }
          return;
        }

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
  }, [navigate]);

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
              <motion.div
                key={app.id}
                layoutId={app.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="application-row"
              >
                <motion.button
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  whileHover={{ backgroundColor: 'rgb(248, 250, 252)' }}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent-blue"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-navy">{app.fullName}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${app.email}`} className="hover:text-accent-blue">
                            {app.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${app.phone}`} className="hover:text-accent-blue">
                            {app.phone}
                          </a>
                        </div>
                        {app.roleTitle && (
                          <div className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {app.roleTitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === app.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-200 bg-slate-50 p-4">
                        {app.coverLetter && (
                          <div className="mb-4">
                            <h3 className="mb-2 font-semibold text-navy">Cover Letter</h3>
                            <p className="whitespace-pre-wrap text-sm text-slate-700">{app.coverLetter}</p>
                          </div>
                        )}

                        {app.cvFileName && (
                          <div className="flex items-center gap-2 rounded-lg bg-white p-3">
                            <FileText className="h-5 w-5 text-accent-blue" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-navy">{app.cvFileName}</p>
                              <p className="text-xs text-slate-600">CV Document</p>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
                          <a
                            href={`mailto:${app.email}?subject=Re: Your job application`}
                            className="flex-1 rounded-lg bg-accent-blue px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Reply via Email
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
