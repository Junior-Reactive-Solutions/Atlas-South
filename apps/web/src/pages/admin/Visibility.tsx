import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  HARD_SERVICES,
  SOFT_SERVICES,
  INDUSTRIES,
  SERVICE_AREAS,
  PACKAGES_PAGE,
  type NavItem,
} from '@atlas-south/shared';

interface VisibilityRow {
  navId: string;
  visible: boolean;
  updatedAt: string | null;
}

/**
 * Groups shown in the UI. Company, contact and legal pages are deliberately absent —
 * the API refuses to toggle them (see apps/api/src/lib/navIds.ts), and offering a switch
 * the server would reject would be misleading.
 */
const GROUPS: Array<{ label: string; items: NavItem[] }> = [
  { label: 'Hard Services', items: HARD_SERVICES },
  { label: 'Soft Services', items: SOFT_SERVICES },
  { label: 'Industries', items: INDUSTRIES },
  { label: 'Areas We Cover', items: SERVICE_AREAS },
  { label: 'Other', items: [PACKAGES_PAGE] },
];

/**
 * Page visibility — lets the client take a page off the public site without deleting its
 * content, then put it back when it's ready.
 *
 * Hiding is enforced server-side: a hidden page's content 404s from the public API, so
 * this is a real removal rather than just unlinking it from the navigation.
 */
export function AdminVisibility() {
  const [rows, setRows] = useState<VisibilityRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const response = await authFetch('/api/admin/visibility');
        if (!response.ok) {
          setError('Could not load page visibility.');
          return;
        }
        setRows(await response.json());
      } catch {
        setError('Could not load page visibility.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRows();
  }, [authFetch]);

  const visibilityById = useMemo(
    () => new Map(rows.map((row) => [row.navId, row.visible])),
    [rows],
  );

  const hiddenCount = rows.filter((row) => !row.visible).length;

  const toggle = async (navId: string, nextVisible: boolean) => {
    setSavingId(navId);
    setError(null);

    // Optimistic, with rollback on failure — toggling several pages in a row otherwise
    // feels unresponsive against a cold Render instance.
    const previous = visibilityById.get(navId) ?? true;
    setRows((current) =>
      current.map((row) => (row.navId === navId ? { ...row, visible: nextVisible } : row)),
    );

    try {
      const response = await authFetch(`/api/admin/visibility/${navId}`, {
        method: 'PATCH',
        body: JSON.stringify({ visible: nextVisible }),
      });

      if (!response.ok) throw new Error('save failed');
    } catch {
      setRows((current) =>
        current.map((row) => (row.navId === navId ? { ...row, visible: previous } : row)),
      );
      setError('Could not save that change. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-navy">Page Visibility</h1>
        <p className="mt-1 text-sm text-slate-600">
          Hide a page from the public site without deleting it. Hidden pages disappear from
          the menus and return &ldquo;page not found&rdquo; if someone has the link.
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          {hiddenCount === 0
            ? 'All pages are currently visible.'
            : `${hiddenCount} ${hiddenCount === 1 ? 'page is' : 'pages are'} currently hidden.`}
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {GROUPS.map((group) => (
        <section key={group.label}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {group.label}
          </h2>
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {group.items.map((item) => {
              const visible = visibilityById.get(item.id) ?? true;
              const isSaving = savingId === item.id;

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-navy">{item.label}</p>
                    <p className="truncate text-xs text-slate-500">{item.path}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        visible ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {visible ? 'Visible' : 'Hidden'}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggle(item.id, !visible)}
                      disabled={isSaving}
                      aria-label={`${visible ? 'Hide' : 'Show'} ${item.label}`}
                      className="inline-flex min-h-[40px] min-w-[96px] items-center justify-center gap-2 rounded border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : visible ? (
                        'Hide'
                      ) : (
                        'Show'
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
