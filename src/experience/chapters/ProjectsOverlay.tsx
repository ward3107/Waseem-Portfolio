import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedProjects } from '@/features/projects/data';
import { safeHref } from '@/lib/safe';
import ChapterOverlay from './ChapterOverlay';
import HeadingAccent from './../components/HeadingAccent';
import { GhostNavButton } from './actions';

/**
 * Chapter 4 — Projects. One compact image-card grid, identical on mobile and
 * desktop (no per-tier split, no desktop-only 3D fly-through), so the chapter
 * reads the same everywhere and stays condensed. Cards are real anchors to each
 * live project, so they're keyboard-reachable and crawlable over the
 * aria-hidden canvas.
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
      <ul className="mx-auto mt-8 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
        {projects.map((p) => {
          const href = safeHref(p.link);
          return (
            <li key={p.id}>
              <a
                href={href || '#'}
                target={href ? '_blank' : undefined}
                rel={href ? 'noopener noreferrer' : undefined}
                className="pointer-events-auto group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 text-start backdrop-blur transition-all hover:border-brand-cyan/40 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
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
                  <p className="text-xs font-bold leading-tight text-white sm:text-sm">{p.title}</p>
                  <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
                    {p.tech.slice(0, 2).join(' · ')}
                  </p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </ChapterOverlay>
  );
};

export default ProjectsOverlay;
