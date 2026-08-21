import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedProjects } from '@/features/projects/data';
import ChapterOverlay, { containerVariants, itemVariants, useHeadingLeading } from './ChapterOverlay';
import HeadingAccent from '../components/HeadingAccent';
import { GhostNavButton } from './actions';
import type { QualityTier } from '../useQualityTier';

/**
 * Chapter 4 — Projects DOM overlay, tier-aware:
 *
 *   - high (desktop): the 3D fly-through gallery (ProjectsScene) is the visual,
 *     so the DOM keeps the centre clear — heading pinned to the top, an
 *     accessible link index + CTA pinned to the bottom. The links keep the
 *     projects keyboard-reachable and crawlable since the canvas is aria-hidden.
 *   - low (phones): no 3D gallery, so the DOM carries the visuals with the
 *     familiar image-card grid, which fits a portrait viewport well.
 */
const ProjectsOverlay: React.FC<{ index: number; total: number; tier: QualityTier }> = ({
  index,
  total,
  tier,
}) => {
  const { t } = useLanguage();
  const projects = getLocalizedProjects(t);
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { amount: 0.3 });
  const leading = useHeadingLeading();

  const heading = (
    <>
      <span className="text-white">{t('projects_title_1')} </span>
      <HeadingAccent tone="gold" fancy>{t('projects_title_2')}</HeadingAccent>
    </>
  );

  // LOW TIER — DOM image cards carry the chapter.
  if (tier === 'low') {
    return (
      <ChapterOverlay
        index={index}
        total={total}
        title={heading}
        description={t('projects_subtitle')}
        actions={<GhostNavButton href="/projects">{t('home_projects_cta')}</GhostNavButton>}
      >
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id}>
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 text-start backdrop-blur transition-all hover:border-brand-cyan/40 hover:bg-white/10"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 p-2.5">
                  <p className="text-xs font-bold leading-tight text-white">{p.title}</p>
                  <p className="text-[10px] font-medium text-slate-400">{p.tech.slice(0, 2).join(' · ')}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </ChapterOverlay>
    );
  }

  // HIGH TIER — 3D gallery fills the centre; DOM is heading (top) + index (bottom).
  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={active ? 'show' : 'hidden'}
      className="pointer-events-none flex min-h-[82vh] w-full max-w-5xl flex-col items-center justify-between"
    >
      <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-brand-cyan">
          {String(index + 1).padStart(2, '0')} <span className="text-white/30">/</span>{' '}
          {String(total).padStart(2, '0')}
        </p>
        <h2
          className={`max-w-3xl font-heading text-4xl font-black tracking-tight sm:text-5xl md:text-6xl ${leading}`}
        >
          {heading}
        </h2>
        <p className="mt-5 max-w-xl text-base font-medium text-slate-300 sm:text-lg">
          {t('projects_subtitle')}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col items-center gap-5">
        <ul className="flex flex-wrap items-center justify-center gap-2.5">
          {projects.map((p) => (
            <li key={p.id}>
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 backdrop-blur transition-colors hover:border-brand-cyan/50 hover:bg-white/10 hover:text-white"
              >
                {p.title}
                <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <GhostNavButton href="/projects">{t('home_projects_cta')}</GhostNavButton>
      </motion.div>
    </motion.div>
  );
};

export default ProjectsOverlay;
