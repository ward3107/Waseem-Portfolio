// UTM / attribution capture. GBP visitors arrive via /from-gbp which stamps
// utm_source=gbp on the URL. We need those params attached to the lead when
// the visitor finally submits the contact form — but by then they may have
// clicked around internally, so we snapshot on first paint and keep the
// snapshot in sessionStorage until a form submits or the tab closes.
//
// Rationale for sessionStorage (not localStorage):
//   • Attribution is per-tab / per-visit — a fresh tab is a fresh visitor.
//   • Nothing in Amendment 13 requires consent for sessionStorage of URL
//     query params the visitor themselves passed in.

import { safeGetItem, safeSetItem } from '@/lib/safeStorage';

const KEY = 'attribution_v1';

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landing_path: string | null;
}

const EMPTY: Attribution = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  referrer: null,
  landing_path: null,
};

/**
 * Call once on app load. Reads UTM params from the current URL, stores them
 * with `document.referrer` and the landing pathname, but only if this tab
 * doesn't already have a snapshot — a second in-app navigation with UTMs
 * shouldn't overwrite the true first-touch attribution.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;
  if (safeGetItem(KEY)) return; // first-touch wins

  const params = new URLSearchParams(window.location.search);
  const snap: Attribution = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    referrer: document.referrer || null,
    landing_path: window.location.pathname || null,
  };

  // Skip persisting if nothing worth persisting arrived — keeps sessionStorage
  // tidy for direct/typed visits.
  const hasSignal =
    snap.utm_source ||
    snap.utm_medium ||
    snap.utm_campaign ||
    snap.referrer;
  if (!hasSignal) return;

  try {
    safeSetItem(KEY, JSON.stringify(snap));
  } catch {
    // Storage blocked (Safari private) — attribution simply isn't recorded
    // this visit. Not fatal.
  }
}

/** Read the captured attribution. Returns nullable fields — never throws. */
export function getAttribution(): Attribution {
  const raw = safeGetItem(KEY);
  if (!raw) return { ...EMPTY };
  try {
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    return {
      utm_source: parsed.utm_source ?? null,
      utm_medium: parsed.utm_medium ?? null,
      utm_campaign: parsed.utm_campaign ?? null,
      referrer: parsed.referrer ?? null,
      landing_path: parsed.landing_path ?? null,
    };
  } catch {
    return { ...EMPTY };
  }
}
