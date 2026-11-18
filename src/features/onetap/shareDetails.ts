import type { ContactInfo } from '@/features/contact/useContact';
import type { Language } from '@/types';
import { CARD_URL, digitsOnly } from './cardData';
import { DEFAULT_CARD_COLOR, withCardColor } from './cardColors';

export const WEBSITE_URL = 'https://vasia.dev';
export const QR_PAGE_URL = 'https://www.vasia.dev/qr';

const FACEBOOK_INTRO: Record<Language, string> = {
  he: 'היי, אני ואסים מ־Vasia 👋 אני בונה אתרים לעסקים. אשמח לשמוע על הפרויקט שלכם כאן בפרטי.\nזה כרטיס הביקור שלי עם פרטי הקשר 👇',
  ar: 'مرحبًا، أنا وسيم من Vasia 👋 أصمّم مواقع إلكترونية للأعمال. يسعدني أن أسمع عن مشروعكم برسالة خاصة هنا.\nهذه بطاقتي وفيها تفاصيل التواصل معي 👇',
  en: 'Hi, I’m Waseem from Vasia 👋 I build websites for businesses. Feel free to message me here about your project.\nHere’s my business card with my contact details 👇',
};

export function buildFacebookMessage(language: Language, color: string = DEFAULT_CARD_COLOR): string {
  return FACEBOOK_INTRO[language] + '\n' + withCardColor(CARD_URL, color);
}

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
export function buildOneTapSharePayload(info: ContactInfo, language: Language, color: string = DEFAULT_CARD_COLOR): OneTapSharePayload {
  const label = LABELS[language];
  const cardUrl = withCardColor(CARD_URL, color);
  const whatsappLink = getWhatsAppLink(info.whatsappNumber);
  const phone = displayPhone(info.whatsappNumber);
  const whatsappPlain = whatsappLink ? phone + ' — ' + whatsappLink : phone;

  const plainText = [
    'VASIA OneTap',
    label.whatsapp + ': ' + whatsappPlain,
    label.site + ': ' + WEBSITE_URL,
    label.card + ': ' + cardUrl,
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
    '<p>' + label.card + ': <a href="' + cardUrl + '">' + cardUrl + '</a></p>',
    '<p>' + label.qr + ': <a href="' + QR_PAGE_URL + '">' + QR_PAGE_URL + '</a></p>',
    '</div>',
  ].join('');

  return { plainText, html, whatsappLink };
}
