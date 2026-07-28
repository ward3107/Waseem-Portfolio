import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Navigates to a `path#hash`-style href (e.g. "/about#contact", "/projects",
 * "/#what-i-do"). If the target page is already the current page, scrolls
 * smoothly to the hash (or to the top when there's no hash) instead of
 * triggering a route change. Otherwise navigates via React Router, and
 * ScrollToHashOnRouteChange finishes the job once the new page mounts.
 */
export const useSectionNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (href: string, options?: { focusId?: string }) => {
      const [path, hash] = href.split('#');
      const targetPath = path || '/';

      if (location.pathname === targetPath) {
        if (hash) {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
          if (options?.focusId) {
            setTimeout(() => document.getElementById(options.focusId!)?.focus(), 500);
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        // Cross-page: forward the focus intent through the router so the
        // destination can focus the target once it has mounted (the element
        // doesn't exist yet on this page). Handled by ScrollToHashOnRouteChange.
        navigate(hash ? `${targetPath}#${hash}` : targetPath, {
          state: options?.focusId ? { focusId: options.focusId } : undefined,
        });
      }
    },
    [navigate, location.pathname]
  );
};
