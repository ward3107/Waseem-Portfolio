import { NavLink, TechItem, Language } from './types';

// ==========================================================================
// Contact — single source of truth. Override via .env.local when needed.
// ==========================================================================
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '972534260632';

export const CONTACT = {
  email: import.meta.env.VITE_CONTACT_EMAIL ?? 'wasya92@gmail.com',
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}`,
  whatsappDisplay: `+${WHATSAPP_NUMBER.slice(0, 3)} ${WHATSAPP_NUMBER.slice(3, 5)} ${WHATSAPP_NUMBER.slice(5, 8)} ${WHATSAPP_NUMBER.slice(8)}`,
  github: 'https://github.com/ward3107',
  linkedin: 'https://www.linkedin.com/in/waseem-abu-akel-334486374/',
  twitter: 'https://twitter.com/ward3107',
} as const;

// Local SEO landing pages (static HTML in /public). Linked from the footer
// so search engines discover them via internal links. See
// .dev-scripts/generate-landing-pages.mjs
export const SERVICE_AREAS: { he: string; ar: string; en: string; slug: string }[] = [
  { he: 'כפר יאסיף', ar: 'كفر ياسيف', en: 'Kfar Yasif', slug: 'web-design-kfar-yasif' },
  { he: 'עכו', ar: 'عكا', en: 'Acre', slug: 'web-design-akko' },
  { he: 'כרמיאל', ar: 'كرمئيل', en: 'Karmiel', slug: 'web-design-karmiel' },
  { he: 'נהריה', ar: 'نهاريا', en: 'Nahariya', slug: 'web-design-nahariya' },
  { he: 'חיפה', ar: 'حيفا', en: 'Haifa', slug: 'web-design-haifa' },
  { he: "ג'דיידה-מכר", ar: 'جديدة المكر', en: 'Judeide-Maker', slug: 'web-design-judeide-maker' },
  { he: 'אבו סנאן', ar: 'أبو سنان', en: 'Abu Snan', slug: 'web-design-abu-snan' },
  { he: "ינוח-ג'ת", ar: 'يانوح - جث', en: 'Yanuh', slug: 'web-design-yanuh' },
];

export const NAV_LINKS: Record<Language, NavLink[]> = {
  // The whole site is one page now, so every nav link scrolls to a section
  // rather than routing away. The old /about, /projects, /services and
  // /contact routes still exist as redirects to these anchors (see App.tsx)
  // for bookmarks, deep links and search results.
  en: [
    { name: 'Services', href: '/#what-i-do' },
    { name: 'AI Solutions', href: '/#ai-automation' },
    { name: 'About', href: '/#about' },
    { name: 'Projects', href: '/#projects' },
    { name: 'Contact', href: '/#contact' },
  ],
  he: [
    { name: 'שירותים', href: '/#what-i-do' },
    { name: 'פתרונות AI', href: '/#ai-automation' },
    { name: 'אודות', href: '/#about' },
    { name: 'פרויקטים', href: '/#projects' },
    { name: 'צור קשר', href: '/#contact' },
  ],
  ar: [
    { name: 'خدمات', href: '/#what-i-do' },
    { name: 'حلول AI', href: '/#ai-automation' },
    { name: 'من أنا', href: '/#about' },
    { name: 'مشاريع', href: '/#projects' },
    { name: 'اتصل بي', href: '/#contact' },
  ],
};

export const TECH_STACK: TechItem[] = [
  { name: 'React', icon: '⚛️', category: 'Frontend' },
  { name: 'Next.js', icon: '▲', category: 'Frontend' },
  { name: 'Tailwind', icon: '🎨', category: 'Frontend' },
  { name: 'Node.js', icon: '🟩', category: 'Backend' },
  { name: 'Python', icon: '🐍', category: 'Backend' },
  { name: 'Docker', icon: '🐳', category: 'DevOps' },
  { name: 'OpenAI', icon: '🧠', category: 'AI' },
  { name: 'PostgreSQL', icon: '🐘', category: 'Backend' },
];
