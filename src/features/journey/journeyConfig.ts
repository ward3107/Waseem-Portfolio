/**
 * The single-page colour journey — one source of truth for the five acts.
 *
 * The classic homepage is a stack of sections that each painted their own flat
 * background (white / slate-50 in light, a uniform slate-950 in dark). This
 * config turns that stack into one continuous scroll journey: a fixed ground
 * layer whose colour eases from one act's hue into the next as you scroll, so
 * the whole page reads as one story instead of a list of panels.
 *
 * Each act owns:
 *  - a `ground`  — the near-black (dark) / near-white (light) tint the fixed
 *    backdrop settles on while the act is centred. The engine interpolates
 *    between neighbouring grounds, which is the visible "colour changes as you
 *    scroll" effect.
 *  - an `accent` — the vivid act hue, used by the colour rail and the aura.
 *  - a `ghost`   — the accent as a translucent radial glow behind the content.
 *
 * Every colour has a light- and dark-theme value so the theme toggle keeps
 * working and text contrast holds in both. Grounds stay very dark / very pale
 * on purpose: the section copy sits directly on the ground now, so the ground
 * must never fight the text.
 *
 * `anchor` is the DOM id of the Act wrapper (used by the rail + the scroll
 * engine). It is deliberately distinct from the inner section ids (`hero`,
 * `what-i-do`, `ai-automation`) so the existing nav deep-links keep resolving.
 */
export interface JourneyAct {
  id: string;
  anchor: string;
  /** i18n key for the rail label / aria text. */
  labelKey: string;
  accentDark: string;
  accentLight: string;
  groundDark: string;
  groundLight: string;
  ghostDark: string;
  ghostLight: string;
}

export const JOURNEY_ACTS: JourneyAct[] = [
  {
    id: 'identity',
    anchor: 'act-identity',
    labelKey: 'journey_identity',
    accentDark: '#a78bfa',
    accentLight: '#6d28d9',
    groundDark: '#0d0a1c',
    groundLight: '#f4f1fb',
    ghostDark: 'rgba(167,139,250,0.16)',
    ghostLight: 'rgba(109,40,217,0.07)',
  },
  {
    id: 'services',
    anchor: 'act-services',
    labelKey: 'journey_services',
    accentDark: '#60a5fa',
    accentLight: '#2563eb',
    groundDark: '#0a0e1f',
    groundLight: '#eef4fe',
    ghostDark: 'rgba(96,165,250,0.16)',
    ghostLight: 'rgba(37,99,235,0.07)',
  },
  {
    id: 'ai',
    anchor: 'act-ai',
    labelKey: 'journey_ai',
    accentDark: '#22d3ee',
    accentLight: '#0891b2',
    groundDark: '#04121b',
    groundLight: '#ecfbfe',
    ghostDark: 'rgba(34,211,238,0.14)',
    ghostLight: 'rgba(8,145,178,0.07)',
  },
  {
    id: 'work',
    anchor: 'act-work',
    labelKey: 'journey_work',
    accentDark: '#e9c96a',
    accentLight: '#a97e12',
    groundDark: '#151007',
    groundLight: '#fbf6e9',
    ghostDark: 'rgba(233,201,106,0.13)',
    ghostLight: 'rgba(169,126,18,0.07)',
  },
  {
    id: 'contact',
    anchor: 'act-contact',
    labelKey: 'journey_contact',
    accentDark: '#34d399',
    accentLight: '#059669',
    groundDark: '#06140e',
    groundLight: '#edfaf3',
    ghostDark: 'rgba(52,211,153,0.14)',
    ghostLight: 'rgba(5,150,105,0.07)',
  },
];

/** Parse `#rrggbb` into an [r,g,b] tuple. */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Linear-mix two rgb tuples into a `rgb()` string. `t` is clamped 0..1. */
export function mixRgb(a: [number, number, number], b: [number, number, number], t: number): string {
  const k = t < 0 ? 0 : t > 1 ? 1 : t;
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)}, ${Math.round(
    a[1] + (b[1] - a[1]) * k
  )}, ${Math.round(a[2] + (b[2] - a[2]) * k)})`;
}
