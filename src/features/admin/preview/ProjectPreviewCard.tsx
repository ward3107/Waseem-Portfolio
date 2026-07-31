import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { LocalizedText } from '@/types';
import { localized } from '@/lib/localized';

/**
 * Compact render of a project card that mimics the public FeaturedProjects
 * card. Used inside the editor's live-preview pane so the owner sees exactly
 * what a change looks like on the public site (English by default; the
 * public site swaps to he/ar per visitor language).
 */
const ProjectPreviewCard: React.FC<{
  title: string;
  category: string;
  description: LocalizedText;
  image_url: string | null;
  tech: string[];
}> = ({ title, category, description, image_url, tech }) => (
  <article className="w-full max-w-xs mx-auto flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
      {image_url ? (
        <img src={image_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
          No cover image
        </div>
      )}
    </div>
    <div className="p-5">
      <span className="text-[10px] font-bold text-brand-purple bg-brand-purple/5 border border-brand-purple/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
        {category || 'Category'}
      </span>
      <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
        {title || 'Project title'}
      </h3>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
        {localized(description, 'en') || 'Short description of the project…'}
      </p>
      {tech.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {tech.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center gap-1 text-brand-blue font-bold text-xs">
        Details <ExternalLink size={12} aria-hidden="true" />
      </div>
    </div>
  </article>
);

export default ProjectPreviewCard;
