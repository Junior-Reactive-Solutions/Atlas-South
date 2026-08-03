import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics.js';

/**
 * Hook that automatically tracks page views whenever the route changes.
 * Use this in your main layout component.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track page view when route changes
    trackPageView(location.pathname);
  }, [location.pathname]);
}
