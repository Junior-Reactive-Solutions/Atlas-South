import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { TrendingUp, Eye, MousePointerClick, Zap } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';
import { TrafficAreaChart } from '../../components/charts/TrafficAreaChart.js';
import { DeviceDonutChart } from '../../components/charts/DeviceDonutChart.js';

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
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await authFetch(`/api/admin/analytics?range=${timeRange}`);
        if (!response.ok) return;

        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, authFetch]);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-black text-navy">Analytics</h1>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`min-h-[40px] flex-1 rounded px-3 font-medium transition-colors sm:flex-none sm:px-4 sm:py-2 ${
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

      {/* Traffic Over Time */}
      {analytics?.trafficOverTime && analytics.trafficOverTime.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-1 text-lg font-semibold text-navy">Traffic Trend</h2>
          <p className="mb-2 text-xs text-slate-600">Daily page views over the selected period — hover to inspect a day</p>
          <TrafficAreaChart data={analytics.trafficOverTime.slice(-14)} />
        </div>
      )}

      {/* Device Breakdown */}
      {analytics?.deviceBreakdown && analytics.deviceBreakdown.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy">Devices</h2>
          <DeviceDonutChart data={analytics.deviceBreakdown} />
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
