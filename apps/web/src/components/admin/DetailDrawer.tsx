import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Rendered pinned to the bottom, below the scrollable body — e.g. a ReplyPanel or a
   * row of status-change buttons. Optional; most detail views are read-only. */
  footer?: React.ReactNode;
}

/**
 * Slide-over panel for viewing one list item's full detail — shared by every admin list
 * that can carry more text than its row/card has room for (Enquiries, Chat Leads, and any
 * future list with the same problem). One component, used the same way everywhere, is
 * what "consistent" means here: the same header treatment, the same field layout, the
 * same close affordance (click the backdrop, press Escape, or the X), rather than each
 * page inventing its own popup.
 *
 * A drawer rather than a centred modal because a list is still visible (dimmed) behind
 * it — useful when comparing one row's full detail against its neighbours in the list.
 */
export function DetailDrawer({ open, onClose, title, subtitle, children, footer }: DetailDrawerProps) {
  // Escape closes from anywhere, matching every other dismissible overlay on the web.
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/40"
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-navy">{title}</h2>
                {subtitle && <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {footer && <div className="border-t border-slate-200 px-6 py-4">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** One label/value row inside a DetailDrawer — the shared field layout that makes every
 * drawer read the same way regardless of which list it opened from. */
export function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 py-3 first:pt-0 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-navy">{children}</dd>
    </div>
  );
}
