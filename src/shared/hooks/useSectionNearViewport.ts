import { useEffect, useState } from 'react';

/** Keep below-the-fold CMS requests off the first-render path. */
export function useSectionNearViewport(sectionId?: string): boolean {
  const [near, setNear] = useState(!sectionId);

  useEffect(() => {
    if (!sectionId || near) return;
    const section = document.getElementById(sectionId);
    if (!section || !('IntersectionObserver' in window)) {
      setNear(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin: '1200px' });
    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionId, near]);

  return near;
}
