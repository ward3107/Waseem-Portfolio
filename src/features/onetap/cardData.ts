import type { ContactInfo } from '@/features/contact/useContact';
import type { Language } from '@/types';

export const CARD_URL = 'https://www.vasia.dev/card';

export function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

export function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export function escapeVCard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\n|\r/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

export function buildVCard(info: ContactInfo): string {
  const phone = digitsOnly(info.whatsappNumber);
  const links = [CARD_URL, info.github, info.linkedin, info.instagram, info.facebook]
    .map(safeExternalUrl)
    .filter((link): link is string => Boolean(link));
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Abu Akel;Waseem;;;',
    'FN:Waseem Abu Akel',
    'ORG:VASIA',
    'TITLE:Web Development and AI Solutions',
    ...(phone ? ['TEL;TYPE=CELL:+' + phone] : []),
    ...(info.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)
      ? ['EMAIL;TYPE=INTERNET:' + escapeVCard(info.email)] : []),
    ...links.map((link) => 'URL:' + escapeVCard(link)),
    'END:VCARD',
  ];
  return lines.join('\r\n') + '\r\n';
}

export interface OneTapCopy {
  eyebrow: string;
  headline: string;
  role: string;
  chat: string;
  call: string;
  website: string;
  connect: string;
  save: string;
  install: string;
  share: string;
  showQr: string;
  privacy: string;
  accessibility: string;
  installTitle: string;
  installIos: string;
  installAndroid: string;
  installDesktop: string;
  close: string;
  copied: string;
  manualCopy: string;
  qrTitle: string;
  qrSubtitle: string;
  qrInstruction: string;
  downloadQr: string;
  copyLink: string;
  viewCard: string;
  backToCard: string;
  languageLabel: string;
}

export const ONETAP_COPY: Record<Language, OneTapCopy> = {
  he: {
    eyebrow: 'הכרטיס הדיגיטלי שלי',
    headline: 'נעים להכיר.',
    role: 'פיתוח אתרים ואפליקציות • פתרונות AI • אוטומציה',
    chat: 'בואו נדבר ב־WhatsApp',
    call: 'התקשרו אליי',
    website: 'האתר שלי',
    connect: 'נשארים בקשר',
    save: 'שמירה באנשי קשר',
    install: 'הוספה למסך הבית',
    share: 'שתפו את הכרטיס',
    showQr: 'הצגת QR',
    privacy: 'פרטיות',
    accessibility: 'נגישות',
    installTitle: 'הכרטיס תמיד במרחק לחיצה',
    installIos: 'באייפון: פתחו ב־Safari, לחצו על שיתוף (הריבוע עם החץ), ואז ״הוסף למסך הבית״.',
    installAndroid: 'באנדרואיד: פתחו ב־Chrome, לחצו על תפריט שלוש הנקודות ובחרו ״התקנת אפליקציה״ או ״הוספה למסך הבית״.',
    installDesktop: 'בדפדפן: חפשו ״התקנה״ בתפריט או בשורת הכתובת. האפשרות תלויה בדפדפן ובמכשיר.',
    close: 'סגירה',
    copied: 'הקישור הועתק',
    manualCopy: 'העתיקו את הקישור:',
    qrTitle: 'סרקו. התחברו. ממשיכים.',
    qrSubtitle: 'כל הדרכים להגיע ל־VASIA בסריקה אחת.',
    qrInstruction: 'כוונו את מצלמת הטלפון לקוד כדי לפתוח את הכרטיס שלי.',
    downloadQr: 'הורדת קוד QR',
    copyLink: 'העתקת קישור',
    viewCard: 'פתיחת הכרטיס',
    backToCard: 'חזרה לכרטיס',
    languageLabel: 'בחירת שפה',
  },
  ar: {
    eyebrow: 'بطاقتي الرقمية',
    headline: 'تشرّفنا.',
    role: 'تطوير مواقع وتطبيقات • حلول AI • أتمتة',
    chat: 'تواصل معي عبر واتساب',
    call: 'اتصل بي',
    website: 'موقعي الإلكتروني',
    connect: 'لنبقَ على تواصل',
    save: 'حفظ جهة الاتصال',
    install: 'إضافة إلى الشاشة الرئيسية',
    share: 'مشاركة البطاقة',
    showQr: 'عرض رمز QR',
    privacy: 'الخصوصية',
    accessibility: 'إمكانية الوصول',
    installTitle: 'ابقَ على بُعد نقرة واحدة',
    installIos: 'على iPhone: افتح الصفحة في Safari، اضغط مشاركة، ثم «إضافة إلى الشاشة الرئيسية».',
    installAndroid: 'على Android: افتح الصفحة في Chrome، واضغط قائمة النقاط الثلاث ثم اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».',
    installDesktop: 'من قائمة المتصفح أو شريط العنوان، اختر التثبيت إذا كان متاحًا.',
    close: 'إغلاق',
    copied: 'تم نسخ الرابط',
    manualCopy: 'انسخ الرابط:',
    qrTitle: 'امسح الرمز. تواصل. انطلق.',
    qrSubtitle: 'كل طرق التواصل مع VASIA برمز واحد.',
    qrInstruction: 'وجّه كاميرا هاتفك إلى الرمز لفتح بطاقتي.',
    downloadQr: 'تنزيل رمز QR',
    copyLink: 'نسخ الرابط',
    viewCard: 'فتح البطاقة',
    backToCard: 'العودة إلى البطاقة',
    languageLabel: 'اختيار اللغة',
  },
  en: {
    eyebrow: 'MY DIGITAL BUSINESS CARD',
    headline: 'Great to meet you.',
    role: 'Web & App Development • AI Solutions • Automation',
    chat: 'Let’s talk on WhatsApp',
    call: 'Call me',
    website: 'My website',
    connect: 'Stay connected',
    save: 'Save to contacts',
    install: 'Add to Home Screen',
    share: 'Share this card',
    showQr: 'Show QR code',
    privacy: 'Privacy',
    accessibility: 'Accessibility',
    installTitle: 'One tap away, anytime',
    installIos: 'On iPhone: open in Safari, tap Share, then “Add to Home Screen”.',
    installAndroid: 'On Android: open in Chrome, tap the three-dot menu, then select “Install app” or “Add to Home screen”.',
    installDesktop: 'Look for Install in the browser menu or address bar. Availability varies.',
    close: 'Close',
    copied: 'Link copied',
    manualCopy: 'Copy this link:',
    qrTitle: 'Scan. Connect. Create.',
    qrSubtitle: 'Every way to reach VASIA, one quick scan.',
    qrInstruction: 'Point your camera at the code to open my card.',
    downloadQr: 'Download QR',
    copyLink: 'Copy link',
    viewCard: 'Open my card',
    backToCard: 'Back to card',
    languageLabel: 'Choose language',
  },
};
