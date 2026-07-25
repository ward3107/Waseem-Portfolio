import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Mounted once at the app root. React Router doesn't reset scroll position
 * or honor URL hashes on navigation by default, so this restores both: jump
 * to top on a plain route change, or scroll to the matching element when the
 * URL carries a #hash (e.g. after navigating from another page's CTA).
 *
 * The short delay gives the target page's lazy-loaded (Suspense) sections
 * time to mount before we look up the element — same pattern already used
 * for the mobile nav menu's post-close scroll.
 */
const ScrollToHashOnRouteChange: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      // Retry via rAF for up to 2s — lazy-loaded pages may not have mounted
      // the target section yet on slow networks.
      const start = performance.now();
      let raf = 0;
      const tick = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          if (id === 'contact') {
            setTimeout(() => document.getElementById('name')?.focus(), 500);
          }
          return;
        }
        if (performance.now() - start < 2000) {
          raf = requestAnimationFrame(tick);
        }
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return null;
};

export default ScrollToHashOnRouteChange;
