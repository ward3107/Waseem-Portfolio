import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedProjects } from '@/features/projects/data';
import ChapterOverlay from './ChapterOverlay';
import { GhostNavButton } from './actions';

/**
 * Chapter 4 — Projects. Renders the real projects (same source as the classic
 * FeaturedProjects) as compact, clickable cards that open the live sites. The
 * cinematic camera fly-through with screenshot-textured 3D screens is the
 * Phase 3 showpiece; this ships the real, useful content in the meantime.
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
          <span className="text-brand-goldLight drop-shadow-[0_1px_12px_rgba(227,208,149,0.45)]">
            {t('projects_title_2')}
          </span>
        </>
      }
      description={t('projects_subtitle')}
      actions={<GhostNavButton href="/projects">{t('home_projects_cta')}</GhostNavButton>}
    >
      <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {projects.map((p) => (
          <li key={p.id}>
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 text-start backdrop-blur transition-all hover:-translate-y-1 hover:border-brand-cyan/40 hover:bg-white/10"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute end-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="text-sm font-bold leading-tight text-white">{p.title}</p>
                <p className="text-[11px] font-medium text-slate-400">{p.tech.slice(0, 2).join(' · ')}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </ChapterOverlay>
  );
};

export default ProjectsOverlay;
