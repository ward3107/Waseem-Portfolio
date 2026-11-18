import { safeGetItem, safeRemoveItem, safeSetItem } from '@/lib/safeStorage';

export const DEFAULT_CARD_COLOR = 'original';
const STORAGE_KEY = 'vasia.onetap.color';

export const CARD_PALETTE = [
  { id: DEFAULT_CARD_COLOR, hex: '#4269ce', label: { he: 'מקורי', ar: 'الأصلي', en: 'Original' } },
  { id: 'teal', hex: '#13a89d', label: { he: 'טורקיז', ar: 'فيروزي', en: 'Teal' } },
  { id: 'violet', hex: '#a274ed', label: { he: 'סגול', ar: 'بنفسجي', en: 'Violet' } },
  { id: 'rose', hex: '#df698f', label: { he: 'ורוד', ar: 'وردي', en: 'Rose' } },
  { id: 'amber', hex: '#e6a343', label: { he: 'ענבר', ar: 'كهرماني', en: 'Amber' } },
] as const;

export const COLOR_UI = {
  he: { trigger: 'צבע', title: 'צבע הכרטיס', custom: 'צבע אישי', save: 'שמירת הצבע' },
  ar: { trigger: 'اللون', title: 'لون البطاقة', custom: 'لون مخصص', save: 'حفظ اللون' },
  en: { trigger: 'Color', title: 'Card color', custom: 'Custom color', save: 'Save color' },
};

export function normalizeCardColor(value: string | null): string | null {
  if (!value) return null;
  const token = value.toLowerCase().replace(/^#/, '');
  const preset = CARD_PALETTE.find(item => item.id === token || item.hex.slice(1) === token);
  return preset?.id ?? (/^[0-9a-f]{6}$/.test(token) ? token : null);
}

export function cardAccent(color: string): string {
  return CARD_PALETTE.find(item => item.id === color)?.hex ?? '#' + color;
}

export function withCardColor(href: string, color: string): string {
  const url = new URL(href);
  const token = normalizeCardColor(color);
  if (token && token !== DEFAULT_CARD_COLOR) url.searchParams.set('color', token);
  else url.searchParams.delete('color');
  return url.href;
}

export function readCardColor(): string {
  const shared = new URLSearchParams(window.location.search).get('color');
  return normalizeCardColor(shared) ?? normalizeCardColor(safeGetItem(STORAGE_KEY)) ?? DEFAULT_CARD_COLOR;
}

export function saveCardColor(color: string): void {
  if (color === DEFAULT_CARD_COLOR) safeRemoveItem(STORAGE_KEY);
  else safeSetItem(STORAGE_KEY, color);
  const href = withCardColor(window.location.href, color);
  if (href !== window.location.href) {
    try {
      window.history.replaceState(window.history.state, '', href);
    } catch {
      // Embedded browsers may restrict history updates. Sharing uses the saved selection directly.
    }
  }
}
