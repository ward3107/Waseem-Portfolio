import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProjects } from '@/features/projects/useProjects';
import { safeHref } from '@/lib/safe';
import HeadingAccent from '../components/HeadingAccent';
import { useHeadingLeading } from './ChapterOverlay';
import { GhostNavButton } from './actions';

/**
 * Chapter 4 — Projects. The visual is the 3D turntable (ProjectsScene, in the
 * canvas): every project's screenshot rides a slowly rotating ring and the one
 * at the front enlarges and opens on click. This DOM layer keeps the centre clear
 * clear for that gallery — the heading is pinned to the top and an accessible
 * link index + CTA to the bottom. Those links keep every project
 * keyboard-reachable and crawlable even though the canvas is aria-hidden, and
 * they double as a tap target on touch. Same on every device.
 */
const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
} as const;

const ProjectsOverlay: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const { t } = useLanguage();
  const { projects } = useProjects();
  const leading = useHeadingLeading();

  return (
    <div className="pointer-events-none flex min-h-[82vh] w-full max-w-5xl flex-col items-center justify-between">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center"
      >
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-brand-cyan">
          {String(index + 1).padStart(2, '0')} <span className="text-white/30">/</span>{' '}
          {String(total).padStart(2, '0')}
        </p>
        <h2
          className={`max-w-3xl font-heading text-4xl font-black tracking-tight sm:text-5xl md:text-6xl ${leading}`}
        >
          <span className="text-white">{t('projects_title_1')} </span>
          <HeadingAccent tone="gold" fancy>
            {t('projects_title_2')}
          </HeadingAccent>
        </h2>
        <p className="mt-5 max-w-xl text-base font-medium text-slate-300 sm:text-lg">
          {t('projects_subtitle')}
        </p>
      </motion.div>

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col items-center gap-5"
      >
        <ul className="flex flex-wrap items-center justify-center gap-2.5">
          {projects.map((p) => {
            const href = safeHref(p.link);
            return (
              <li key={p.id}>
                <a
                  href={href || '#'}
                  target={href ? '_blank' : undefined}
                  rel={href ? 'noopener noreferrer' : undefined}
                  className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 backdrop-blur transition-colors hover:border-brand-cyan/50 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
                >
                  {p.title}
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
        <GhostNavButton href="/projects">{t('home_projects_cta')}</GhostNavButton>
      </motion.div>
    </div>
  );
};

export default ProjectsOverlay;
