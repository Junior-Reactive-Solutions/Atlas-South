/** Shared loading UI — used both for lazy-route chunk loading (App.tsx's <Suspense>)
 * and for content fetched at render time (Phase 3 pages reading from /api/content/:slug). */
export function PageLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate border-t-accent-blue" />
        <p className="mt-4 text-sm text-slate">Loading...</p>
      </div>
    </div>
  );
}
