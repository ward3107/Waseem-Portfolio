import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { useCertifications } from '@/features/certifications/useCertifications';
import { safeHref } from '@/lib/safe';

/** Format an ISO date. Returns '—' for null/empty/invalid input so a cert
 *  saved without an expiry (allowed by the schema) never renders as the
 *  literal string "Invalid Date". */
const formatDate = (iso: string | null | undefined, locale: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
};

const Certifications: React.FC = () => {
  const { t, language } = useLanguage();
  const locale = language === 'he' ? 'he-IL' : language === 'ar' ? 'ar' : 'en-US';
  const prefersReducedMotion = usePrefersReducedMotion();
  const { certifications } = useCertifications();

  // Parallax background blobs — drift as the section scrolls through the viewport.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const blobAY = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const blobBY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section id="certifications" ref={sectionRef} className="py-16 sm:py-20 md:py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative isolate overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={prefersReducedMotion ? undefined : { y: blobAY }}
          className="absolute -top-10 -left-10 w-72 h-72 bg-brand-purple/25 rounded-full blur-[50px]"
        ></motion.div>
        <motion.div
          style={prefersReducedMotion ? undefined : { y: blobBY }}
          className="absolute -bottom-10 -right-10 w-72 h-72 bg-brand-cyan/25 rounded-full blur-[50px]"
        ></motion.div>
      </div>
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="bg-brand-purple text-white p-1 rounded-full">
              <Award size={16} />
            </div>
            <span className="text-brand-purple font-bold tracking-widest uppercase text-sm">
              {t('certifications_badge')}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-slate-900 dark:text-white mb-4"
          >
            {t('certifications_title_1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">
              {t('certifications_title_2')}
            </span>
          </motion.h2>

          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {t('certifications_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {certifications.map((cert, index) => (
            <motion.a
              key={cert.id}
              href={safeHref(cert.credentialUrl)}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:border-brand-purple/40 transition-all duration-300"
            >
              {cert.image ? (
                <div className="relative aspect-[4/3] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
                  <img
                    src={cert.image}
                    alt={`${cert.title} certificate`}
                    className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                  />
                  <ExternalLink
                    size={16}
                    className="absolute top-3 end-3 text-white drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ) : null}

              <div className={cert.image ? 'flex flex-col flex-1 p-6' : 'flex flex-col flex-1 p-6'}>
                {!cert.image && (
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
                      <Award size={22} />
                    </div>
                    <ExternalLink size={16} className="text-slate-400 group-hover:text-brand-purple transition-colors" />
                  </div>
                )}

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                {cert.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{cert.issuer}</p>

              <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span>{t('cert_issued')}: {formatDate(cert.issueDate, locale)}</span>
                {cert.expiryDate && (
                  <span>{t('cert_expires')}: {formatDate(cert.expiryDate, locale)}</span>
                )}
              </div>

              <span className="mt-4 text-sm font-bold text-brand-purple group-hover:underline">
                {t('cert_verify')} →
              </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
