import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useNoIndex } from '../../hooks/useNoIndex.js';
import { useAuth } from '../../contexts/AuthContext.js';

const NAV_ITEMS: Array<{ to: string; icon: LucideIcon; label: string }> = [
  { to: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries' },
  { to: '/admin/applications', icon: Users, label: 'Applications' },
  { to: '/admin/content', icon: FileText, label: 'Content' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  // Desktop sidebar collapse (lg+) — independent from the mobile drawer below.
  const [isOpen, setIsOpen] = useState(true);
  // Mobile drawer open/closed — the sidebar is entirely off-canvas below lg.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isAuthenticated, isAuthLoading, logout } = useAuth();

  useNoIndex();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Close the mobile drawer automatically on route change so navigating never
  // leaves it stuck open over the new page.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/admin/content' && location.pathname.startsWith('/admin/content/'));

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Authenticating…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const currentPageLabel = NAV_ITEMS.find((item) => isActive(item.to))?.label ?? 'Admin';

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Desktop sidebar — persistent from lg up, collapsible via chevron. Hidden entirely
          below lg in favour of the mobile top bar + drawer. */}
      <aside
        className={`${isOpen ? 'w-64' : 'w-20'} hidden flex-col bg-navy text-white transition-all duration-300 lg:flex`}
      >
        <div className="flex items-center justify-between border-b border-navy-700 px-6 py-8">
          <h1 className={`font-black ${isOpen ? 'text-xl' : 'text-xs text-center'}`}>AS</h1>
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Collapse sidebar"
              className="rounded p-1 text-slate-300 hover:bg-navy-700 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Expand sidebar"
            className="mx-auto mb-2 rounded p-1 text-slate-300 hover:bg-navy-700 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <nav className="flex-1 space-y-2 px-4 py-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={isActive(item.to)}
              isOpen={isOpen}
            />
          ))}
        </nav>

        <div className="border-t border-navy-700 px-4 py-6">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 text-sm font-medium text-white hover:bg-navy-700 ${
              isOpen ? '' : 'justify-center'
            }`}
          >
            <LogOut className="h-5 w-5" />
            {isOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Mobile drawer — off-canvas below lg, toggled by the top bar's hamburger. */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy/60"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[80vw] max-w-xs flex-col bg-navy text-white">
            <div className="flex items-center justify-between border-b border-navy-700 px-6 py-6">
              <h1 className="text-xl font-black">Atlas South</h1>
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded text-slate-300 hover:bg-navy-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-6">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive(item.to)}
                  isOpen
                  minHeight
                />
              ))}
            </nav>
            <div className="border-t border-navy-700 px-4 py-6">
              <button
                onClick={handleLogout}
                className="flex min-h-[48px] w-full items-center gap-3 rounded px-3 py-2 text-sm font-medium text-white hover:bg-navy-700"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar — hamburger + current section label. Hidden from lg up, where
            the persistent sidebar already shows the same nav. */}
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded text-navy hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-navy">{currentPageLabel}</span>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isOpen: boolean;
  /** Mobile drawer items get a 44px+ tap target regardless of the desktop collapse state. */
  minHeight?: boolean;
}

function NavLink({ to, icon: Icon, label, isActive, isOpen, minHeight }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-accent-blue text-white' : 'text-slate-300 hover:bg-navy-700'
      } ${isOpen ? '' : 'justify-center'} ${minHeight ? 'min-h-[44px]' : ''}`}
    >
      <Icon className="h-5 w-5" />
      {isOpen && label}
    </Link>
  );
}
