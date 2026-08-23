import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedProjects } from '@/features/projects/data';
import { safeHref } from '@/lib/safe';
import ChapterOverlay from './ChapterOverlay';
import HeadingAccent from './../components/HeadingAccent';
import Carousel from '../components/Carousel';
import { GhostNavButton } from './actions';

/**
 * Chapter 4 — Projects. A swipeable carousel of project cards, the same on
 * mobile and desktop (swipe on a phone, scroll/drag on desktop). Cards are real
 * anchors to each live project, so they're keyboard-reachable and crawlable over
 * the aria-hidden canvas.
 */
const ProjectsOverlay: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const { t } = useLanguage();
  const projects = getLocalizedProjects(t);

  return (
    <ChapterOverlay
      index={index}
      total={total}
      title={
        <>
          <span className="text-white">{t('projects_title_1')} </span>
          <HeadingAccent tone="gold" fancy>
            {t('projects_title_2')}
          </HeadingAccent>
        </>
      }
      description={t('projects_subtitle')}
      actions={<GhostNavButton href="/projects">{t('home_projects_cta')}</GhostNavButton>}
    >
      <Carousel ariaLabel={`${t('projects_title_1')} ${t('projects_title_2')}`}>
        {projects.map((p) => {
          const href = safeHref(p.link);
          return (
            <div key={p.id} role="listitem" className="w-56 flex-none snap-start sm:w-64">
              <a
                href={href || '#'}
                target={href ? '_blank' : undefined}
                rel={href ? 'noopener noreferrer' : undefined}
                className="group block h-full overflow-hidden rounded-xl border border-white/10 bg-white/5 text-start backdrop-blur transition-all hover:border-brand-cyan/40 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col gap-0.5 p-3">
                  <p className="text-sm font-bold leading-tight text-white">{p.title}</p>
                  <p className="text-[11px] font-medium text-slate-400">
                    {p.tech.slice(0, 2).join(' · ')}
                  </p>
                </div>
              </a>
            </div>
          );
        })}
      </Carousel>
    </ChapterOverlay>
  );
};

export default ProjectsOverlay;
