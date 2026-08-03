import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Clock } from 'lucide-react';

interface ContentPageSummary {
  id: string;
  slug: string;
  type: 'service' | 'industry' | 'area' | 'home';
  path: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  updatedAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  service: 'Services',
  industry: 'Industries',
  area: 'Service Areas',
  home: 'Home Page',
};

export function AdminContent() {
  const [pages, setPages] = useState<ContentPageSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/content', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) navigate('/admin/login');
          return;
        }

        setPages(await response.json());
      } catch (error) {
        console.error('Error fetching content pages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, [navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  const grouped = pages.reduce<Record<string, ContentPageSummary[]>>((acc, page) => {
    (acc[page.type] ??= []).push(page);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-navy">Content</h1>
        <p className="mt-1 text-sm text-slate-600">
          Edit page copy. Changes save as a draft — nothing goes live until you publish.
        </p>
      </div>

      {(['home', 'service', 'industry', 'area'] as const).map((type) =>
        grouped[type]?.length ? (
          <section key={type}>
            <h2 className="mb-3 text-lg font-semibold text-navy">{TYPE_LABELS[type]}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grouped[type].map((page, idx) => (
                <motion.div
                  key={page.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.25 }}
                >
                  <Link
                    to={`/admin/content/${page.slug}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-accent-blue"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-navy">{page.slug}</p>
                        <p className="mt-1 text-xs text-slate-500">{page.path}</p>
                      </div>
                      <StatusBadge status={page.status} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  if (status === 'published') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        <CheckCircle2 className="h-3 w-3" />
        Live
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
      <Clock className="h-3 w-3" />
      Draft
    </span>
  );
}
