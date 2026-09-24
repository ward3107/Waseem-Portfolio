import React, { useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';
import BrandLogo from '@/shared/brand/BrandLogo';
import { useLanguage } from '@/contexts/LanguageContext';

const COPY = {
  he: {
    eyebrow: 'VASIA BRAND KIT',
    title: 'הלוגו שלך, מוכן לכל מקום.',
    intro: 'כאן מורידים את הגרסה הנכונה לאינסטגרם, פייסבוק, וואטסאפ, סרטונים ומסמכים.',
    tip: 'לתמונת פרופיל השתמש בסמל המרובע. להוספה על סרטון או תמונה השתמש בלוגו השקוף.',
    download: 'הורד',
    assets: [
      ['תמונת פרופיל', 'PNG מרובע · 1080×1080', 'לאינסטגרם, פייסבוק ווואטסאפ'],
      ['לוגו שקוף כהה', 'PNG שקוף', 'לרקע לבן ובהיר'],
      ['לוגו שקוף בהיר', 'SVG וקטורי', 'לרקע כהה ולסרטונים'],
      ['תמונת שיתוף', 'PNG רחב · 1200×630', 'לתצוגה מקדימה של קישורים'],
    ],
  },
  ar: {
    eyebrow: 'VASIA BRAND KIT',
    title: 'شعارك جاهز لكل مكان.',
    intro: 'حمّل النسخة المناسبة لإنستغرام، فيسبوك، واتساب، الفيديوهات والمستندات.',
    tip: 'استخدم الرمز المربع للصورة الشخصية، والشعار الشفاف فوق الفيديو أو الصورة.',
    download: 'تحميل',
    assets: [
      ['صورة الحساب', 'PNG مربع · 1080×1080', 'لإنستغرام وفيسبوك وواتساب'],
      ['شعار داكن شفاف', 'PNG شفاف', 'للخلفيات البيضاء والفاتحة'],
      ['شعار فاتح شفاف', 'SVG متجهي', 'للخلفيات الداكنة والفيديو'],
      ['صورة مشاركة', 'PNG عريض · 1200×630', 'لمعاينة روابط الموقع'],
    ],
  },
  en: {
    eyebrow: 'VASIA BRAND KIT',
    title: 'Your logo, ready for every channel.',
    intro: 'Download the right version for Instagram, Facebook, WhatsApp, videos and documents.',
    tip: 'Use the square mark for profile photos and the transparent logo over videos or images.',
    download: 'Download',
    assets: [
      ['Profile image', 'Square PNG · 1080×1080', 'For Instagram, Facebook and WhatsApp'],
      ['Dark transparent logo', 'Transparent PNG', 'For white and light backgrounds'],
      ['Light transparent logo', 'Vector SVG', 'For dark backgrounds and video'],
      ['Link sharing image', 'Wide PNG · 1200×630', 'For website link previews'],
    ],
  },
} as const;

const ASSETS = [
  { href: '/brand/vasia-profile.png', preview: '/brand/vasia-profile.png', dark: true },
  { href: '/brand/vasia-logo-dark.png', preview: '/brand/vasia-logo-dark.png', dark: false },
  { href: '/brand/vasia-logo-light.svg', preview: '/brand/vasia-logo-light.svg', dark: true },
  { href: '/brand/vasia-share.png', preview: '/brand/vasia-share.png', dark: true },
] as const;

const BrandAssetsPage: React.FC = () => {
  const { language, dir } = useLanguage();
  const copy = COPY[language];

  useEffect(() => {
    document.title = `${copy.title} | vasia.dev`;
  }, [copy.title]);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-slate-50 px-6 pb-24 pt-28 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-10"
    >
      <section className="mx-auto max-w-6xl">
        <div className="grid items-end gap-10 border-b border-slate-200 pb-12 dark:border-slate-800 lg:grid-cols-[1.35fr_.65fr]">
          <div>
            <p className="mb-5 font-heading text-sm font-bold tracking-[0.25em] text-brand-purple dark:text-brand-cyan">
              {copy.eyebrow}
            </p>
            <h1 className="max-w-4xl font-heading text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              {copy.intro}
            </p>
          </div>
          <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl shadow-brand-purple/20">
            <BrandLogo className="h-auto w-full" />
          </div>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2">
          {ASSETS.map((asset, index) => {
            const [title, meta, description] = copy.assets[index];
            return (
              <article key={asset.href} className="group">
                <div
                  className={`grid min-h-64 place-items-center overflow-hidden rounded-[2rem] border border-slate-200 p-8 dark:border-slate-800 ${asset.dark ? 'bg-[#080b1d]' : 'bg-white'}`}
                >
                  <img
                    src={asset.preview}
                    alt=""
                    className={`max-h-56 max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.025] ${index === 0 ? 'rounded-3xl' : ''}`}
                  />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-xl font-bold">{title}</h2>
                    <p className="mt-1 text-sm font-bold text-brand-purple dark:text-brand-cyan">
                      {meta}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
                  </div>
                  <a
                    href={asset.href}
                    download
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-brand-purple px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-purpleLight focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                  >
                    <Download size={17} aria-hidden="true" />
                    {copy.download}
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="mt-16 flex gap-4 rounded-[2rem] border border-brand-gold/30 bg-brand-gold/10 p-6 text-sm leading-7 text-slate-700 dark:text-slate-200">
          <Share2 className="mt-1 shrink-0 text-brand-gold" size={22} aria-hidden="true" />
          <p>{copy.tip}</p>
        </aside>
      </section>
    </div>
  );
};

export default BrandAssetsPage;
