import { MessageCircle } from 'lucide-react';
import BrandPlatforms from './BrandPlatforms';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import { socialMediaCopy } from './content';

/** Shared content for the regular home page and the immersive social chapter. */
export default function SocialMediaSection({ embedded = false }: { embedded?: boolean }) {
  const { language, dir } = useLanguage();
  const contact = useContact();
  const copy = socialMediaCopy[language];
  const headingId = 'social-media-title';
  const body = (
    <div
      dir={dir}
      className={`relative overflow-hidden rounded-[2rem] border p-6 sm:p-10 ${embedded ? 'border-white/15 bg-slate-900/80 text-white' : 'border-slate-200 bg-white/80 text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white'}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-16 -top-16 h-64 w-64 rounded-full bg-brand-purple/15 blur-3xl"
      />
      <div className="relative text-start">
        <p
          className={`text-xs font-bold uppercase tracking-wider ${embedded ? 'text-cyan-300' : 'text-brand-purple dark:text-brand-cyan'}`}
        >
          {copy.eyebrow}
        </p>
        <h2
          id={headingId}
          className="mt-3 max-w-2xl font-heading text-3xl font-bold leading-snug sm:text-4xl"
        >
          {copy.title}
        </h2>
        <BrandPlatforms embedded={embedded} />
        <a
          href={`${contact.whatsappUrl}${contact.whatsappUrl.includes('?') ? '&' : '?'}text=${encodeURIComponent(copy.prefill)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-purple px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-purple/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
        >
          <MessageCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
          {copy.cta}
        </a>
      </div>
    </div>
  );
  return embedded ? (
    body
  ) : (
    <section
      id="social-media"
      aria-labelledby={headingId}
      className="mx-auto max-w-7xl px-5 py-12 sm:px-10 sm:py-16"
    >
      {body}
    </section>
  );
}
