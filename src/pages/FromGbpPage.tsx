import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// /from-gbp — the URL used on the Google Business Profile "Website" button.
// Stamps consistent UTM params before handing off to the real destination, so
// GBP-sourced traffic is unambiguously attributable in Vercel Analytics / GA4.
//
// Usage on GBP: https://waseemp.vercel.app/from-gbp                 → /
//               https://waseemp.vercel.app/from-gbp?to=/services    → /services
//               https://waseemp.vercel.app/from-gbp?to=/projects    → /projects
//
// The `to` param is treated as an internal path only. Anything that isn't a
// same-origin path (starts with `/` and doesn't start with `//` or `/http`)
// falls back to `/` — closes the open-redirect vector where a crafted GBP
// link could bounce visitors to a phishing page.

const isSafeInternalPath = (raw: string | null): raw is string => {
  if (!raw) return false;
  if (!raw.startsWith('/')) return false;
  // Reject protocol-relative and embedded protocols.
  if (raw.startsWith('//')) return false;
  if (/^\/https?:/i.test(raw)) return false;
  return true;
};

const FromGbpPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const rawTo = params.get('to');
    const to = isSafeInternalPath(rawTo) ? rawTo : '/';

    // Preserve any UTM overrides the caller passed (rare — usually GBP just
    // links to /from-gbp), otherwise stamp the defaults.
    const dest = new URL(to, window.location.origin);
    if (!dest.searchParams.has('utm_source')) dest.searchParams.set('utm_source', 'gbp');
    if (!dest.searchParams.has('utm_medium')) dest.searchParams.set('utm_medium', 'profile');
    if (!dest.searchParams.has('utm_campaign')) {
      // Campaign = the destination path, sans leading slash. Empty → 'home'.
      const slug = dest.pathname.replace(/^\/+/, '').replace(/\/+$/, '') || 'home';
      dest.searchParams.set('utm_campaign', slug);
    }

    // Use replace so /from-gbp doesn't pollute the visitor's browser history.
    navigate(dest.pathname + dest.search + dest.hash, { replace: true });
  }, [navigate, params]);

  // Rendered for the ~1 frame between mount and navigate. Kept minimal so
  // there's no visible flash.
  return null;
};

export default FromGbpPage;
