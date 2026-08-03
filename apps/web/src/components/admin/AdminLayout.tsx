import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, MessageSquare, Settings, LogOut } from 'lucide-react';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className={`${isOpen ? 'w-64' : 'w-20'} flex flex-col bg-navy text-white transition-all duration-300`}>
        <div className="border-b border-navy-700 px-6 py-8">
          <h1 className={`font-black ${isOpen ? 'text-xl' : 'text-xs text-center'}`}>AS</h1>
        </div>

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
  icon: React.ComponentType<{ className: string }>;
  label: string;
  isActive: boolean;
  isOpen: boolean;
}

function NavLink({ to, icon: Icon, label, isActive, isOpen }: NavLinkProps) {
  return (
    <a
      href={to}
      className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-accent-blue text-white' : 'text-slate-300 hover:bg-navy-700'
      } ${isOpen ? '' : 'justify-center'}`}
    >
      <Icon className="h-5 w-5" />
      {isOpen && label}
    </a>
  );
}
