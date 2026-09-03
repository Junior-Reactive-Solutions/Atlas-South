import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { motion } from 'motion/react';
import { CheckCircle2, Clock } from 'lucide-react';

type ContentPageType =
  | 'service'
  | 'industry'
  | 'area'
  | 'home'
  | 'company'
  | 'careers'
  | 'packages'
  | 'caseStudy'
  | 'article';

interface ContentPageSummary {
  id: string;
  slug: string;
  type: ContentPageType;
  path: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  updatedAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  home: 'Home Page',
  company: 'Company',
  careers: 'Careers',
  packages: 'Packages',
  service: 'Services',
  industry: 'Industries',
  area: 'Service Areas',
  caseStudy: 'Case Studies',
  article: 'Insights (articles)',
};

/**
 * Render order. Previously this list was only ['home','service','industry','area'], which
 * silently hid four page types that exist and are editable — Company, Careers, Packages and
 * Case Studies were all reachable by typing their URL but invisible here, so nobody knew
 * they could be edited. Careers mattered most: the open roles are managed on that page, and
 * the site spent three weeks advertising two job vacancies nobody could see how to change.
 */
const TYPE_ORDER: ContentPageType[] = [
  'home',
  'company',
  'careers',
  'packages',
  'service',
  'industry',
  'area',
  'caseStudy',
  'article',
];

export function AdminContent() {
  const [pages, setPages] = useState<ContentPageSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const { authFetch } = useAuth();

  const loadPages = useCallback(async () => {
    try {
      const response = await authFetch('/api/admin/content');
      if (!response.ok) return;

      setPages(await response.json());
    } catch (error) {
      console.error('Error fetching content pages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const createArticle = async () => {
    setCreateError(null);
    setIsCreating(true);
    try {
      const response = await authFetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), slug: newSlug.trim() }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setCreateError(body.error ?? 'Could not create the article.');
        return;
      }
      setNewTitle('');
      setNewSlug('');
      await loadPages();
    } catch {
      setCreateError('Could not reach the server.');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteArticle = async (slug: string) => {
    // A published article has a live URL and may already be indexed, so this asks first.
    // Deliberately a plain confirm rather than a custom modal: this is a rare, deliberate
    // action, and the browser's own dialog is the one users already know how to read.
    if (!window.confirm(`Delete the article "${slug}"? This cannot be undone.`)) return;
    try {
      const response = await authFetch(`/api/admin/content/${slug}`, { method: 'DELETE' });
      if (response.ok) await loadPages();
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

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

      {/* Articles are the one page type created here rather than seeded from code — the
          rest of the site's pages have fixed routes, so they exist already. */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-navy">New article</h2>
        <p className="mt-1 text-sm text-slate-600">
          Creates a draft at <code className="rounded bg-slate-100 px-1">/insights/&lt;address&gt;</code>.
          Nothing is public until you open it, write it and press Publish.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-navy">Title</span>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="How often should commercial premises be deep cleaned?"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-navy">Web address</span>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="commercial-deep-cleaning-frequency"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Lowercase letters, numbers and hyphens. This becomes the article's permanent
              URL, so it can't be changed later without breaking the link.
            </span>
          </label>
        </div>
        {createError && <p className="mt-3 text-sm text-red-700">{createError}</p>}
        <button
          type="button"
          onClick={createArticle}
          disabled={isCreating || newTitle.trim().length < 3 || newSlug.trim().length < 3}
          className="mt-4 inline-flex min-h-[40px] items-center rounded bg-accent-blue px-4 text-sm font-semibold text-white hover:bg-navy disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating ? 'Creating…' : 'Create draft article'}
        </button>
      </section>

      {TYPE_ORDER.map((type) =>
        grouped[type]?.length ? (
          <section key={type}>
            <h2 className="mb-3 text-lg font-semibold text-navy">{TYPE_LABELS[type] ?? type}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grouped[type].map((page, idx) => (
                <motion.div
                  key={page.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.25 }}
                  className="relative"
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
                  {/* Only articles can be deleted — every other type is part of the site
                      structure and has a route expecting it to exist. The API enforces
                      this too; this just doesn't offer the button. */}
                  {page.type === 'article' && (
                    <button
                      type="button"
                      onClick={() => deleteArticle(page.slug)}
                      className="mt-2 text-xs font-medium text-red-700 hover:underline"
                    >
                      Delete article
                    </button>
                  )}
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
