import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Mounted once at the app root. Owns scroll position across client-side
 * navigation so the browser can't leave a page parked partway down.
 *
 * A URL `#hash` is honored ONLY when it arrives together with a real page
 * change (a cross-page CTA like /about#contact). On initial load / hard
 * refresh, or when the hash merely lingers on the same page (e.g. a leftover
 * `/#what-i-do` from an earlier nav click), the hash is stripped and the page
 * starts at the top. Same-page section clicks are handled directly by
 * useSectionNavigate, so this component never needs to act on them.
 *
 * Both branches re-assert their scroll target across ~0.8s. Pages here lazy-
 * load their sections (React.Suspense), so the document grows for several
 * hundred ms after a route change; a single scroll would be undone by that
 * reflow (the "starts from the bottom" / "doesn't reach the section" symptoms).
 *
 * The re-assert window is abandoned the instant the user shows scroll intent
 * (wheel / touch / arrow keys). Without that escape hatch the timers fight a
 * user who starts scrolling immediately after a route change, yanking them
 * back to the top repeatedly — which reads as the page "flashing".
 */

/** Events that mean "the user is driving the scroll now — stop correcting it". */
const INTENT_EVENTS = ['wheel', 'touchstart', 'touchmove', 'keydown'] as const;
const SCROLL_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar',
]);

/**
 * Calls `onIntent` the first time the user tries to scroll themselves, then
 * detaches. Returns a cleanup that detaches early if the caller finishes first.
 */
const onUserScrollIntent = (onIntent: () => void): (() => void) => {
  const handler = (e: Event) => {
    // Ignore typing — only keys that actually scroll count as intent.
    if (e.type === 'keydown' && !SCROLL_KEYS.has((e as KeyboardEvent).key)) return;
    onIntent();
    detach();
  };
  const detach = () =>
    INTENT_EVENTS.forEach((type) => window.removeEventListener(type, handler));

  INTENT_EVENTS.forEach((type) =>
    window.addEventListener(type, handler, { passive: true })
  );
  return detach;
};

const ScrollToHashOnRouteChange: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // null until the first effect runs, so the initial load reads as "no page
  // change" and lands at the top regardless of any hash in the URL.
  const prevPathname = useRef<string | null>(null);

  // Take scroll restoration away from the browser — otherwise it reapplies the
  // previous (scrolled-down) position on navigation.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const changedPage =
      prevPathname.current !== null && prevPathname.current !== location.pathname;
    prevPathname.current = location.pathname;

    // Re-assert offsets shortly after mount to survive lazy-section reflow.
    const REASSERT_MS = [0, 80, 180, 320, 500, 800];

    // A focus target forwarded by useSectionNavigate across a page change
    // (e.g. "Start a project" → focus the wizard). Applied after the section
    // scroll settles. Validated the same way as the hash id before any lookup.
    const rawFocusId =
      location.state && typeof (location.state as { focusId?: unknown }).focusId === 'string'
        ? (location.state as { focusId: string }).focusId
        : null;
    const focusId = rawFocusId && /^[A-Za-z][\w:-]*$/.test(rawFocusId) ? rawFocusId : null;

    // Cross-page navigation that landed on a hash → scroll to that section once
    // it exists, then re-assert as content above it finishes lazy-loading.
    if (location.hash && changedPage) {
      const id = location.hash.slice(1);
      // Whitelist plain HTML-id characters only — rejects anything a caller
      // could weaponize through the URL hash before a DOM lookup.
      if (!/^[A-Za-z][\w:-]*$/.test(id)) return;

      // The target section (e.g. Contact) is the LAST lazy-loaded block on a
      // very tall page. Wait until it exists AND its offset has stopped moving
      // (i.e. the sections above it have finished mounting) before scrolling —
      // scrolling while the page is still growing lands short or overshoots.
      let raf = 0;
      let stableFor = 0;
      let lastTop = Number.NaN;
      let aborted = false;
      const start = performance.now();
      // The user out-ranks us: if they start scrolling while we're still
      // waiting for layout to settle, stop chasing the section.
      const detachIntent = onUserScrollIntent(() => {
        aborted = true;
        cancelAnimationFrame(raf);
      });
      const tick = () => {
        if (aborted) return;
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top === lastTop) {
            stableFor += 1;
            // Offset unchanged for ~3 consecutive frames → layout settled.
            if (stableFor >= 3) {
              el.scrollIntoView({ behavior: 'auto', block: 'start' });
              // Move focus to the forwarded target (if any) without yanking the
              // viewport — preventScroll keeps the section-top alignment above.
              if (focusId) {
                document.getElementById(focusId)?.focus({ preventScroll: true });
              }
              detachIntent();
              return;
            }
          } else {
            stableFor = 0;
            lastTop = top;
          }
        }
        if (performance.now() - start < 3500) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(raf);
        detachIntent();
      };
    }

    // Initial load, same-page hash lingering, or a plain route change → start
    // at the top. Strip any leftover hash *through the router* (raw
    // history.replaceState leaves react-router's own location out of sync, so
    // it would re-assert the hash on the next render).
    if (location.hash) {
      navigate(location.pathname + location.search, { replace: true });
      // The navigate() re-triggers this effect (deps: pathname + hash) with
      // an empty hash; that second run installs the fallback timers. Bail
      // now so we don't install a duplicate set that keep running in
      // parallel with the second run's set.
      return;
    }
    const timers = REASSERT_MS.map((ms) =>
      window.setTimeout(() => window.scrollTo(0, 0), ms)
    );
    // Stop re-asserting the moment the user scrolls on their own, otherwise the
    // remaining timers drag them back to the top mid-gesture.
    const clearTimers = () => timers.forEach((t) => window.clearTimeout(t));
    const detachIntent = onUserScrollIntent(clearTimers);
    return () => {
      clearTimers();
      detachIntent();
    };
    // Intentionally keyed on pathname + hash only; `navigate` is stable and we
    // don't want query-string changes to trigger a scroll reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.hash]);

  return null;
};

export default ScrollToHashOnRouteChange;
