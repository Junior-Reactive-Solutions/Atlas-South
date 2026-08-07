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
  type LucideIcon,
} from 'lucide-react';
import { useNoIndex } from '../../hooks/useNoIndex.js';
import { useAuth } from '../../contexts/AuthContext.js';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const { isAuthenticated, isAuthLoading, logout } = useAuth();

  useNoIndex();

  useEffect(() => {
    // Wait for the silent-refresh to complete before deciding to redirect —
    // avoids a flash redirect on page reload while the httpOnly cookie is valid.
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleLogout = async () => {
    await logout(); // clears memory token + clears httpOnly cookie server-side
  };

  const isActive = (path: string) => location.pathname === path;

  // Show a minimal loading state while the silent refresh resolves.
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Authenticating…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`${isOpen ? 'w-64' : 'w-20'} flex flex-col bg-navy text-white transition-all duration-300`}
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
          <NavLink
            to="/admin/dashboard"
            icon={BarChart3}
            label="Dashboard"
            isActive={isActive('/admin/dashboard')}
            isOpen={isOpen}
          />
          <NavLink
            to="/admin/enquiries"
            icon={MessageSquare}
            label="Enquiries"
            isActive={isActive('/admin/enquiries')}
            isOpen={isOpen}
          />
          <NavLink
            to="/admin/applications"
            icon={Users}
            label="Applications"
            isActive={isActive('/admin/applications')}
            isOpen={isOpen}
          />
          <NavLink
            to="/admin/content"
            icon={FileText}
            label="Content"
            isActive={
              isActive('/admin/content') || location.pathname.startsWith('/admin/content/')
            }
            isOpen={isOpen}
          />
          <NavLink
            to="/admin/analytics"
            icon={BarChart3}
            label="Analytics"
            isActive={isActive('/admin/analytics')}
            isOpen={isOpen}
          />
          <NavLink
            to="/admin/settings"
            icon={Settings}
            label="Settings"
            isActive={isActive('/admin/settings')}
            isOpen={isOpen}
          />
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isOpen: boolean;
}

function NavLink({ to, icon: Icon, label, isActive, isOpen }: NavLinkProps) {
  return (
    // Use React Router Link (client-side navigation, no page reload, no Referer leak)
    <Link
      to={to}
      className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-accent-blue text-white' : 'text-slate-300 hover:bg-navy-700'
      } ${isOpen ? '' : 'justify-center'}`}
    >
      <Icon className="h-5 w-5" />
      {isOpen && label}
    </Link>
  );
}
