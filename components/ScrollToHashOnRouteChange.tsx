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
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        if (id === 'contact') {
          setTimeout(() => document.getElementById('name')?.focus(), 500);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return null;
};

export default ScrollToHashOnRouteChange;
