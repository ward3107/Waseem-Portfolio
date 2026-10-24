export type ContrastMode = 'normal' | 'high' | 'inverted';

export const DEFAULT_A11Y_SETTINGS = {
  fontSize: 100,
  contrastMode: 'normal' as ContrastMode,
  highlightLinks: false,
  readableFont: false,
  textSpacing: false,
  largeCursor: false,
  hideImages: false,
  disableAnimations: false,
  highlightHeadings: false,
  focusHighlight: false,
  grayscale: false,
  alignText: false,
  readingGuide: false,
};
export type A11ySettings = typeof DEFAULT_A11Y_SETTINGS;
export type A11yToggle = Exclude<keyof A11ySettings, 'fontSize' | 'contrastMode'>;
export const A11Y_CHANGE_EVENT = 'vasia:a11y-change';
export const A11Y_OPEN_EVENT = 'vasia:open-accessibility';
export const A11Y_DIALOG_EVENT = 'vasia:accessibility-dialog-change';

/** Accept older settings, but never inject untrusted storage values into CSS. */
export function normalizeA11ySettings(value: unknown): A11ySettings {
  const settings = { ...DEFAULT_A11Y_SETTINGS };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return settings;
  const input = value as Record<string, unknown>;
  if (typeof input.fontSize === 'number' && Number.isFinite(input.fontSize)) {
    settings.fontSize = Math.min(200, Math.max(100, Math.round(input.fontSize / 25) * 25));
  }
  if (input.contrastMode === 'normal' || input.contrastMode === 'high' || input.contrastMode === 'inverted') {
    settings.contrastMode = input.contrastMode;
  }
  for (const key of Object.keys(settings) as Array<keyof A11ySettings>) {
    if (key !== 'fontSize' && key !== 'contrastMode' && typeof input[key] === 'boolean') {
      settings[key] = input[key];
    }
  }
  return settings;
}

export function readA11ySettings(): A11ySettings {
  try { return normalizeA11ySettings(JSON.parse(localStorage.getItem('a11y-settings') || 'null')); }
  catch { return { ...DEFAULT_A11Y_SETTINGS }; }
}
