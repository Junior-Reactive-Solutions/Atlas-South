import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, MessageSquare, Eye, TrendingUp, Users } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';

interface DashboardStats {
  enquiriesThisWeek: number;
  enquiriesThisMonth: number;
  conversionRate: number;
  topPages: Array<{ path: string; views: number }>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/admin/login');
          }
          return;
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  // Data widgets fade+rise on load using the same tokens as public-site cards —
  // docs/build/08-ADMIN-PANEL-SPEC.md §7 ("admin UI is not a separate animation system").
  const root = useAnimationScope(
    (self) => {
      self?.add('reveal', () => {
        animate('.stat-card', {
          opacity: [0, 1],
          translateY: [24, 0],
          delay: stagger(STAGGER_GAP),
          duration: DURATION.slow,
          ease: EASE.standard,
        });
      });
    },
    [stats],
  );

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div ref={root} className="space-y-6">
      <h1 className="text-3xl font-black text-navy">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Enquiries (Week)</p>
              <p className="mt-2 text-3xl font-black text-navy">
                {stats?.enquiriesThisWeek || 0}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-accent-blue opacity-20" />
          </div>
        </div>

        <div className="stat-card rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Enquiries (Month)</p>
              <p className="mt-2 text-3xl font-black text-navy">
                {stats?.enquiriesThisMonth || 0}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-accent-blue opacity-20" />
          </div>
        </div>

        <div className="stat-card rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
              <p className="mt-2 text-3xl font-black text-navy">
                {stats?.conversionRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="stat-card rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Top Pages</p>
              <p className="mt-2 text-3xl font-black text-navy">
                {stats?.topPages.length || 0}
              </p>
            </div>
            <Eye className="h-8 w-8 text-accent-blue opacity-20" />
          </div>
        </div>
      </div>

      {/* Top Pages */}
      {stats?.topPages && stats.topPages.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy">Top Pages</h2>
          <div className="space-y-3">
            {stats.topPages.map((page, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{page.path}</span>
                <span className="font-semibold text-navy">{page.views} views</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/enquiries"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-6 hover:bg-slate-50"
        >
          <div>
            <p className="font-semibold text-navy">Manage Enquiries</p>
            <p className="text-sm text-slate-600">View sales pipeline</p>
          </div>
          <MessageSquare className="h-6 w-6 text-accent-blue" />
        </a>

        <a
          href="/admin/applications"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-6 hover:bg-slate-50"
        >
          <div>
            <p className="font-semibold text-navy">Job Applications</p>
            <p className="text-sm text-slate-600">Review applicants</p>
          </div>
          <Users className="h-6 w-6 text-accent-blue" />
        </a>

        <a
          href="/admin/analytics"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-6 hover:bg-slate-50"
        >
          <div>
            <p className="font-semibold text-navy">Analytics</p>
            <p className="text-sm text-slate-600">Traffic insights</p>
          </div>
          <BarChart3 className="h-6 w-6 text-accent-blue" />
        </a>

        <a
          href="/admin/settings"
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-6 hover:bg-slate-50"
        >
          <div>
            <p className="font-semibold text-navy">Settings</p>
            <p className="text-sm text-slate-600">Account & security</p>
          </div>
          <MessageSquare className="h-6 w-6 text-accent-blue" />
        </a>
      </div>
    </div>
  );
}
