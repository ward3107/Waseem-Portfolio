import type { Language } from '@/types';
import logo from '../../../public/onetap/vasia-v.svg?raw';
import { cardAccent, DEFAULT_CARD_COLOR, normalizeCardColor } from './cardColors';
import { ONETAP_COPY } from './cardData';
import { displayPhone, WEBSITE_URL } from './shareDetails';

const WIDTH = 1080;
const HEIGHT = 810;
const IDENTITY = {
  he: { name: 'ואסים אבו עקל', contact: 'טלפון או וואטסאפ' },
  ar: { name: 'وسيم أبو عقل', contact: 'للاتصال أو عبر واتساب' },
  en: { name: 'Waseem Abu Akel', contact: 'Call or WhatsApp' },
};

const xmlText = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The same self-contained artwork is used in the color preview and in the PNG.
export function cardArtwork(language: Language, color: string, whatsappNumber: string) {
  const rtl = language !== 'en';
  const { name, contact } = IDENTITY[language];
  const [service, ...specialties] = ONETAP_COPY[language].role.split(' • ');
  const phone = displayPhone(whatsappNumber);
  const accent = cardAccent(normalizeCardColor(color) ?? DEFAULT_CARD_COLOR);
  const ink = rtl ? 1004 : 76;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" font-family="Arial, sans-serif">
    <defs>
      <linearGradient id="tint" x1="0" y1="1" x2="1" y2="0" gradientUnits="objectBoundingBox">
        <stop stop-color="${accent}" stop-opacity=".09"/><stop offset=".55" stop-color="${accent}" stop-opacity=".33"/><stop offset="1" stop-color="${accent}" stop-opacity=".76"/>
      </linearGradient>
      <clipPath id="header"><rect width="1080" height="205"/></clipPath>
    </defs>
    <rect width="1080" height="810" fill="#101b30"/>
    <rect width="1080" height="810" fill="url(#tint)"/>
    <g clip-path="url(#header)" fill="none" stroke="#f3f7ff" stroke-opacity=".18" transform="rotate(-17 982 40)">
      <ellipse cx="982" cy="30" rx="265" ry="87"/><ellipse cx="982" cy="30" rx="312" ry="119"/><ellipse cx="982" cy="30" rx="359" ry="151"/>
    </g>
    <rect x="76" y="58" width="88" height="88" rx="23" fill="#f4f7ff"/>
    ${logo.replace('<svg ', '<svg x="81" y="62" width="79" height="79" ')}
    <text x="187" y="120" fill="#fff" font-size="49" font-weight="700" letter-spacing="6">VASIA</text>
    <path d="M76 186H1004" stroke="#fff" stroke-opacity=".27" stroke-width="2"/>
    <g direction="${rtl ? 'rtl' : 'ltr'}" text-anchor="start" fill="#fff" xml:lang="${language}">
      <text x="${ink}" y="334" font-size="86" font-weight="700">${xmlText(name)}</text>
      <text x="${ink}" y="435" font-size="53" font-weight="600">${xmlText(service)}</text>
      <text x="${ink}" y="504" font-size="40" fill="#e0e9f5">${xmlText(specialties.join(' • '))}</text>
    </g>
    <rect x="76" y="577" width="928" height="165" rx="32" fill="#f5f8ff"/>
    <g text-anchor="middle" fill="#142239">
      <text x="540" y="633" direction="${rtl ? 'rtl' : 'ltr'}" xml:lang="${language}" font-size="33">${xmlText(phone ? contact : ONETAP_COPY[language].website)}</text>
      <text x="540" y="708" direction="ltr" font-size="72" font-weight="700">${phone || new URL(WEBSITE_URL).hostname}</text>
    </g>
  </svg>`;
  return {
    src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
    alt: [name, ONETAP_COPY[language].role, phone || WEBSITE_URL].join(' — '),
  };
}

export async function renderCardPng(src: string): Promise<Blob> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Card artwork could not load'));
    image.src = src;
  });
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  context.drawImage(image, 0, 0, WIDTH, HEIGHT);
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (blob?.size) resolve(blob);
    else reject(new Error('PNG export unavailable'));
  }, 'image/png'));
}
