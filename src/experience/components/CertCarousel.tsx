import React from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCertifications } from '@/features/certifications/useCertifications';
import { safeHref } from '@/lib/safe';
import Carousel from './Carousel';

/** Format an ISO date to "Month YYYY"; '—' for null/empty/invalid input so a
 *  cert saved without a date never renders the literal string "Invalid Date". */
const formatDate = (iso: string | null | undefined, locale: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(locale, { year: 'numeric', month: 'short' });
};

/**
 * The certifications carousel for the Trust chapter — a swipeable one-row proof
 * strip that carries the same weight as the classic site's grid: a full
 * certificate image, the title, issuer, issue date, and a Verify link. Cards
 * lift and glow on hover/focus so they feel as premium as the projects gallery
 * beside them, but stay a single horizontal snap-scroll row (swipe on a phone,
 * scroll/drag on desktop) instead of a tall grid.
 *
 * Cards are real anchors to each credential, so they stay keyboard-reachable and
 * crawlable even though the surrounding canvas is aria-hidden. Data comes from
 * the shared hook (Supabase-backed + de-duped), so approving a cert in /admin
 * shows it here too.
 */
const CertCarousel: React.FC = () => {
  const { t, language } = useLanguage();
  const locale = language === 'he' ? 'he-IL' : language === 'ar' ? 'ar' : 'en-US';
  const { certifications } = useCertifications();

  if (!certifications.length) return null;

  return (
    <Carousel ariaLabel={`${t('certifications_title_1')} ${t('certifications_title_2')}`}>
      {certifications.map((cert) => {
        const href = safeHref(cert.credentialUrl);
        const card = (
          <>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
              {cert.image ? (
                <img
                  src={cert.image}
                  alt={`${cert.title} certificate`}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-brand-gold/70">
                  <Award className="h-9 w-9" aria-hidden="true" />
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-1 flex-col">
              <p className="line-clamp-2 text-sm font-bold leading-tight text-white">{cert.title}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-400">{cert.issuer}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                <span className="text-[11px] font-medium text-slate-500">
                  {formatDate(cert.issueDate, locale)}
                </span>
                {href && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-cyan">
                    {t('cert_verify')}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </span>
                )}
              </div>
            </div>
          </>
        );
        return (
          <div key={cert.id} role="listitem" className="w-52 flex-none snap-start sm:w-56">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-start backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan/40 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-brand-cyan/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
              >
                {card}
              </a>
            ) : (
              <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-start backdrop-blur">
                {card}
              </div>
            )}
          </div>
        );
      })}
    </Carousel>
  );
};

export default CertCarousel;
