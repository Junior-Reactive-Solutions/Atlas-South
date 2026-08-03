import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, MousePointerClick, Zap } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';

interface AnalyticsData {
  totalViews: number;
  totalEvents: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  topPages: Array<{ path: string; views: number; bounceRate: number }>;
  trafficOverTime: Array<{ date: string; views: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/admin/login');
          }
          return;
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, navigate]);

  // Same fade+rise treatment as the public site's cards — docs/build/08-ADMIN-PANEL-SPEC.md §7.
  const root = useAnimationScope(
    (self) => {
      self?.add('reveal', () => {
        animate('.kpi-card', {
          opacity: [0, 1],
          translateY: [24, 0],
          delay: stagger(STAGGER_GAP),
          duration: DURATION.slow,
          ease: EASE.standard,
        });
      });
    },
    [analytics],
  );

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div ref={root} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-navy">Analytics</h1>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded px-4 py-2 font-medium transition-colors ${
                timeRange === range
                  ? 'bg-accent-blue text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="kpi-card rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Page Views</p>
              <p className="mt-2 text-3xl font-black text-navy">{analytics?.totalViews || 0}</p>
            </div>
            <Eye className="h-8 w-8 text-accent-blue opacity-20" />
          </div>
        </div>

        <div className="kpi-card rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Unique Visitors</p>
              <p className="mt-2 text-3xl font-black text-navy">{analytics?.uniqueVisitors || 0}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="kpi-card rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Interactions</p>
              <p className="mt-2 text-3xl font-black text-navy">{analytics?.totalEvents || 0}</p>
            </div>
            <MousePointerClick className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="kpi-card rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Session Duration</p>
              <p className="mt-2 text-3xl font-black text-navy">
                {analytics?.avgSessionDuration ? `${analytics.avgSessionDuration}s` : '0s'}
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Top Pages */}
      {analytics?.topPages && analytics.topPages.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy">Top Pages</h2>
          <div className="space-y-3">
            {analytics.topPages.map((page, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                <div>
                  <p className="font-medium text-slate-900">{page.path}</p>
                  <p className="text-xs text-slate-600">{page.bounceRate}% bounce rate</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-navy">{page.views}</p>
                  <p className="text-xs text-slate-600">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Breakdown */}
      {analytics?.deviceBreakdown && analytics.deviceBreakdown.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy">Devices</h2>
          <div className="space-y-3">
            {analytics.deviceBreakdown.map((device, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{device.device}</p>
                    <p className="text-sm font-semibold text-navy">{device.percentage}%</p>
                  </div>
                  <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-blue transition-all"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traffic Over Time */}
      {analytics?.trafficOverTime && analytics.trafficOverTime.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy">Traffic Trend</h2>
          <div className="space-y-2 text-xs text-slate-600">
            <p>Daily page views over the selected period</p>
            <div className="mt-4 flex items-end justify-between gap-1" style={{ height: '200px' }}>
              {analytics.trafficOverTime.slice(-14).map((day, idx) => {
                const maxViews = Math.max(...analytics.trafficOverTime.map((d) => d.views));
                const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                return (
                  <div key={idx} className="flex flex-1 flex-col items-center gap-2" title={day.date}>
                    <div
                      className="w-full bg-accent-blue rounded-t transition-all hover:opacity-80"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <p className="text-xs text-slate-500">{day.date.split('-')[2]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 p-6">
        <h3 className="font-semibold text-navy">About These Metrics</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>
            <strong>Page Views:</strong> Total number of pages viewed (a single user viewing 3 pages = 3 views)
          </li>
          <li>
            <strong>Unique Visitors:</strong> Number of distinct individuals who visited (tracked by anonymous session ID)
          </li>
          <li>
            <strong>Interactions:</strong> Button clicks, form submissions, and other user actions
          </li>
          <li>
            <strong>Bounce Rate:</strong> Percentage of visitors who left the page without taking an action
          </li>
          <li className="text-xs italic text-slate-600">
            Data is retained for 14 months per GDPR requirements. Sessions are anonymised and do not contain personal information.
          </li>
        </ul>
      </div>
    </div>
  );
}
