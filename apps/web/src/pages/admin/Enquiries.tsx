import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trash2 } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { motion, AnimatePresence } from 'motion/react';
import { useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';

interface Enquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  serviceId: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/enquiries', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/admin/login');
          }
          return;
        }

        const data = await response.json();
        setEnquiries(data);
      } catch (error) {
        console.error('Error fetching enquiries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnquiries();
  }, [navigate]);

  const updateStatus = async (id: string, newStatus: Status) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
      }
    } catch (error) {
      console.error('Error updating enquiry:', error);
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
                    <p className="font-medium text-navy">{enquiry.fullName}</p>
                    <p className="text-xs text-slate-600">{enquiry.email}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-700">{enquiry.message}</p>

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
                          className="flex items-center justify-center gap-1 rounded bg-accent-blue px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Move Forward
                          <ArrowRight className="h-3 w-3" />
                        </motion.button>
                      )}

                      {status !== 'lost' && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => updateStatus(enquiry.id, 'lost')}
                          className="flex items-center justify-center gap-1 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          Lost
                          <Trash2 className="h-3 w-3" />
                        </motion.button>
                      )}
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
    </div>
  );
}
