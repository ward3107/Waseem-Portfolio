import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCertifications } from '@/features/certifications/useCertifications';
import { safeHref } from '@/lib/safe';
import Carousel from './Carousel';

/**
 * A compact, swipeable certifications carousel for the Trust chapter. Credentials
 * live only in the classic site's data before this; here they become social
 * proof inside the experience too. Horizontal snap-scroll keeps it to one row on
 * any width (swipe on a phone, scroll/drag on desktop) instead of a tall grid.
 *
 * Cards are real anchors to each credential, so they stay keyboard-reachable and
 * crawlable even though the surrounding canvas is aria-hidden. Data comes from
 * the shared hook (Supabase-backed + de-duped), so approving a cert in /admin
 * shows it here too.
 */
const CertCarousel: React.FC = () => {
  const { t } = useLanguage();
  const { certifications } = useCertifications();

  if (!certifications.length) return null;

  return (
    <Carousel ariaLabel={`${t('certifications_title_1')} ${t('certifications_title_2')}`}>
      {certifications.map((cert) => {
        const href = safeHref(cert.credentialUrl);
        const Card = (
          <>
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10 bg-white/5">
              {cert.image ? (
                <img
                  src={cert.image}
                  alt={cert.title}
                  loading="lazy"
                  className="h-full w-full object-cover object-top"
                />
              ) : null}
            </div>
            <p className="mt-2.5 line-clamp-2 text-xs font-bold leading-tight text-white">
              {cert.title}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">{cert.issuer}</p>
            {href && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-cyan">
                {t('cert_verify')}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </span>
            )}
          </>
        );
        return (
          <div key={cert.id} role="listitem" className="w-40 flex-none snap-start sm:w-44">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-start backdrop-blur transition-colors hover:border-brand-cyan/40 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
              >
                {Card}
              </a>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-start backdrop-blur">
                {Card}
              </div>
            )}
          </div>
        );
      })}
    </Carousel>
  );
};

export default CertCarousel;
