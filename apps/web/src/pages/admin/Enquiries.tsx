import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { ArrowRight, Trash2, Reply, Eye } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { motion, AnimatePresence } from 'motion/react';
import { useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';
import { ReplyPanel } from '../../components/admin/ReplyPanel.js';
import { DetailDrawer, DetailField } from '../../components/admin/DetailDrawer.js';

interface Enquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  serviceId: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  notes: string | null;
  sourcePage: string;
  createdAt: string;
}

type Status = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';

const STATUS_LABELS: Record<Status, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

const STATUS_COLORS: Record<Status, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-purple-100 text-purple-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await authFetch('/api/admin/enquiries');
        if (!response.ok) return;

        const data = await response.json();
        setEnquiries(data);
      } catch (error) {
        console.error('Error fetching enquiries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnquiries();
  }, [authFetch]);

  const openEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setNotes(enquiry.notes ?? '');
  };

  const saveNotes = async () => {
    if (!selectedEnquiry) return;
    setNotesSaving(true);
    try {
      const response = await authFetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      });
      if (response.ok) {
        setEnquiries(enquiries.map((e) =>
          e.id === selectedEnquiry.id ? { ...e, notes } : e,
        ));
        setSelectedEnquiry({ ...selectedEnquiry, notes });
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setNotesSaving(false);
    }
  };

  const updateStatus = async (id: string, newStatus: Status) => {
    try {
      const response = await authFetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
      }
    } catch (error) {
      console.error('Error updating enquiry:', error);
    }
  };

  /**
   * Permanently removes an enquiry. Confirms first, because unlike a status change this
   * cannot be undone — the row holds the enquirer's name, email and phone, and the delete
   * is a hard one precisely so an erasure request actually erases.
   */
  const deleteEnquiry = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete the enquiry from ${name}? This cannot be undone.`)) return;
    try {
      const response = await authFetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setEnquiries((current) => current.filter((e) => e.id !== id));
        setSelectedEnquiry((current) => (current && current.id === id ? null : current));
      }
    } catch (error) {
      console.error('Error deleting enquiry:', error);
    }
  };

  // Group enquiries by status
  const grouped = {
    new: enquiries.filter((e) => e.status === 'new'),
    contacted: enquiries.filter((e) => e.status === 'contacted'),
    quoted: enquiries.filter((e) => e.status === 'quoted'),
    won: enquiries.filter((e) => e.status === 'won'),
    lost: enquiries.filter((e) => e.status === 'lost'),
  };

  // Same fade+rise treatment as the public site's cards — docs/build/08-ADMIN-PANEL-SPEC.md §7.
  const root = useAnimationScope(
    (self) => {
      self?.add('reveal', () => {
        animate('.pipeline-column', {
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
      <h1 className="text-3xl font-black text-navy">Enquiries Pipeline</h1>

      {/* Kanban Board */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {(['new', 'contacted', 'quoted', 'won', 'lost'] as Status[]).map((status) => (
          <div key={status} className="pipeline-column flex flex-col rounded-lg bg-slate-50 p-4">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-700">
              {STATUS_LABELS[status]}
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[status]}`}>
                {grouped[status].length}
              </span>
            </h3>

            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {grouped[status].map((enquiry) => (
                  <motion.div
                    key={enquiry.id}
                    layoutId={enquiry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="rounded-lg border border-slate-200 bg-white p-3 transition-shadow focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-blue"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-navy">{enquiry.fullName}</p>
                        <p className="truncate text-xs text-slate-600" title={enquiry.email}>{enquiry.email}</p>
                      </div>
                      <button
                        onClick={() => openEnquiry(enquiry)}
                        aria-label={`View full details for ${enquiry.fullName}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-accent-blue"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                    {/* line-clamp keeps cards a uniform height on the board; the full
                        message (and everything else about this enquiry) is one click
                        away via the Eye button or clicking the message itself. */}
                    <button
                      onClick={() => openEnquiry(enquiry)}
                      className="mt-2 line-clamp-2 text-left text-xs text-slate-700 hover:text-navy"
                    >
                      {enquiry.message}
                    </button>

                    {/* Status Buttons */}
                    <div className="mt-3 flex flex-col gap-2">
                      {status !== 'won' && status !== 'lost' && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            const nextStatus: Record<Status, Status> = {
                              new: 'contacted',
                              contacted: 'quoted',
                              quoted: 'won',
                              won: 'won',
                              lost: 'lost',
                            };
                            updateStatus(enquiry.id, nextStatus[status]);
                          }}
                          className="flex min-h-[40px] items-center justify-center gap-1 rounded bg-accent-blue px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Move Forward
                          <ArrowRight className="h-3 w-3" />
                        </motion.button>
                      )}

                      {status !== 'lost' && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => updateStatus(enquiry.id, 'lost')}
                          className="flex min-h-[40px] items-center justify-center gap-1 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          Lost
                          <Trash2 className="h-3 w-3" />
                        </motion.button>
                      )}

                      {/* Reply now opens the same detail drawer the Eye button and the
                          message text open — one consistent place to read the full
                          enquiry and reply to it, rather than a second inline panel
                          competing for room on an already-narrow card. */}
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => openEnquiry(enquiry)}
                        className="flex min-h-[40px] items-center justify-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Reply
                        <Reply className="h-3 w-3" />
                      </motion.button>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <DetailDrawer
        open={selectedEnquiry !== null}
        onClose={() => { setSelectedEnquiry(null); setNotes(''); }}
        title={selectedEnquiry?.fullName ?? ''}
        subtitle={
          selectedEnquiry
            ? new Date(selectedEnquiry.createdAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : undefined
        }
        footer={
          selectedEnquiry && (
            <div className="space-y-3">
              <ReplyPanel
                endpoint={`/api/admin/enquiries/${selectedEnquiry.id}/reply`}
                recipientFirstName={selectedEnquiry.fullName.split(' ')[0]}
                recipientEmail={selectedEnquiry.email}
                defaultSubject="Re: your enquiry with Atlas South"
              />
              {/* Sits below the reply panel and styled as a quiet text button, not a
                  primary one: replying is the common action, deleting is the rare and
                  irreversible one, so the visual weight should not invite a stray click. */}
              <button
                type="button"
                onClick={() => deleteEnquiry(selectedEnquiry.id, selectedEnquiry.fullName)}
                className="text-xs font-medium text-red-700 hover:underline"
              >
                Delete this enquiry permanently
              </button>
            </div>
          )
        }
      >
        {selectedEnquiry && (
          <dl>
            <DetailField label="Status">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLORS[selectedEnquiry.status]}`}
              >
                {STATUS_LABELS[selectedEnquiry.status]}
              </span>
            </DetailField>
            <DetailField label="Email">
              <a href={`mailto:${selectedEnquiry.email}`} className="text-accent-blue hover:underline">
                {selectedEnquiry.email}
              </a>
            </DetailField>
            <DetailField label="Phone">
              <a href={`tel:${selectedEnquiry.phone}`} className="text-accent-blue hover:underline">
                {selectedEnquiry.phone}
              </a>
            </DetailField>
            <DetailField label="Service requested">
              {selectedEnquiry.serviceId || <span className="italic text-slate-400">Not specified</span>}
            </DetailField>
            <DetailField label="Submitted from">{selectedEnquiry.sourcePage}</DetailField>
            <DetailField label="Message">
              <p className="whitespace-pre-wrap leading-relaxed">{selectedEnquiry.message}</p>
            </DetailField>
            <DetailField label="Internal notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add private notes visible only to you…"
                className="w-full resize-y rounded border border-slate-200 p-2 text-sm text-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
              <button
                onClick={saveNotes}
                disabled={notesSaving || notes === (selectedEnquiry.notes ?? '')}
                className="mt-2 flex items-center gap-1 rounded bg-accent-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {notesSaving ? 'Saving…' : 'Save notes'}
              </button>
            </DetailField>
          </dl>
        )}
      </DetailDrawer>
    </div>
  );
}
