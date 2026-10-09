import type { ContactInfo } from '@/features/contact/useContact';
import type { Language } from '@/types';
import { CARD_URL, digitsOnly } from './cardData';

export const WEBSITE_URL = 'https://vasia.dev';
export const QR_PAGE_URL = 'https://www.vasia.dev/qr';

/**
 * wa.me only accepts an international-format phone number without +, 00,
 * whitespace or punctuation. Site settings may use the local Israeli format.
 */
export function normalizeWhatsAppNumber(value: string): string {
  const digits = digitsOnly(value);
  if (/^05\d{8}$/.test(digits)) return '972' + digits.slice(1);
  if (/^00972\d{9}$/.test(digits)) return digits.slice(2);
  return digits;
}

export function getWhatsAppLink(value: string): string {
  const number = normalizeWhatsAppNumber(value);
  return number ? 'https://wa.me/' + number : '';
}

export function displayPhone(value: string): string {
  const number = normalizeWhatsAppNumber(value);
  if (/^9725\d{8}$/.test(number)) {
    const local = '0' + number.slice(3);
    return local.slice(0, 3) + '-' + local.slice(3);
  }
  return number ? '+' + number : '';
}

const LABELS: Record<Language, {
  whatsapp: string; site: string; card: string; qr: string; open: string;
}> = {
  he: {
    whatsapp: 'WhatsApp', site: 'אתר', card: 'כרטיס דיגיטלי',
    qr: 'קוד QR', open: 'פתיחת WhatsApp',
  },
  ar: {
    whatsapp: 'واتساب', site: 'الموقع', card: 'البطاقة الرقمية',
    qr: 'رمز QR', open: 'فتح واتساب',
  },
  en: {
    whatsapp: 'WhatsApp', site: 'Website', card: 'Digital Card',
    qr: 'QR Page', open: 'Open WhatsApp',
  },
};

export interface OneTapSharePayload {
  plainText: string;
  html: string;
  whatsappLink: string;
}

/**
 * Rich-text editors receive a real hyperlink on the visible phone number.
 * Plain-text-only apps receive the explicit wa.me URL, because they cannot
 * retain hyperlinks. The receiving platform decides whether URLs are clickable.
 */
export function buildOneTapSharePayload(info: ContactInfo, language: Language): OneTapSharePayload {
  const label = LABELS[language];
  const whatsappLink = getWhatsAppLink(info.whatsappNumber);
  const phone = displayPhone(info.whatsappNumber);
  const whatsappPlain = whatsappLink ? phone + ' — ' + whatsappLink : phone;

  const plainText = [
    'VASIA OneTap',
    label.whatsapp + ': ' + whatsappPlain,
    label.site + ': ' + WEBSITE_URL,
    label.card + ': ' + CARD_URL,
    label.qr + ': ' + QR_PAGE_URL,
  ].join('\n');

  // All interpolated destinations are trusted constants or numeric-only wa.me
  // URLs. Localized labels are static source-controlled translations.
  const phoneHtml = whatsappLink
    ? '<a href="' + whatsappLink + '">' + phone + '</a> (<a href="' + whatsappLink + '">' + label.open + '</a>)'
    : phone;
  const dir = language === 'en' ? 'ltr' : 'rtl';
  const html = [
    '<div dir="' + dir + '">',
    '<p><strong>VASIA OneTap</strong></p>',
    '<p>' + label.whatsapp + ': ' + phoneHtml + '</p>',
    '<p>' + label.site + ': <a href="' + WEBSITE_URL + '">' + WEBSITE_URL + '</a></p>',
    '<p>' + label.card + ': <a href="' + CARD_URL + '">' + CARD_URL + '</a></p>',
    '<p>' + label.qr + ': <a href="' + QR_PAGE_URL + '">' + QR_PAGE_URL + '</a></p>',
    '</div>',
  ].join('');

  return { plainText, html, whatsappLink };
}
