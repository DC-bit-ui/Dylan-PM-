import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordRecentView } from './useRecentAsk';

// Record the current tab into the recent-views localStorage entry
// whenever the route changes. Skips the /ask route itself (no point
// recording it when the user is already there).

export function useRouteTracker(): void {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '').split('/')[0] || 'home';
    if (path === 'ask') return;
    recordRecentView(path);
  }, [location.pathname]);
}
