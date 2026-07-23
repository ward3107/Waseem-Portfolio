import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Hand } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getPrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import Dimensional3DWord, { fontForLanguage } from './three/Dimensional3DWord';
import { getLocalizedProjects } from '../data/projects';

type FilterCategory = 'All' | 'Web' | 'AI' | 'Mobile';

const Projects: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const [filter, setFilter] = useState<FilterCategory>('All');
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const prefersReducedMotion = getPrefersReducedMotion();

  // Reset flipped card whenever the filter changes so users don't see a flipped
  // card after switching categories.
  useEffect(() => setFlippedId(null), [filter]);

  const localizedProjects = getLocalizedProjects(t);

  const filteredProjects = filter === 'All'
    ? localizedProjects
    : localizedProjects.filter(p => p.category === filter);

  const filters: { key: FilterCategory; label: string }[] = [
    { key: 'All', label: t('projects_filter_all') },
    { key: 'Web', label: t('projects_filter_web') },
    { key: 'AI', label: t('projects_filter_ai') },
    { key: 'Mobile', label: t('projects_filter_mobile') },
  ];

  return (
    <section id="projects" dir={dir} className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-col md:flex-row justify-between items-end rtl:items-start mb-16 gap-6">

          {/* Modernized Header with Drop Animation */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-2xl text-left rtl:text-right"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-black text-slate-900 dark:text-white mb-4 md:mb-6 tracking-tight leading-[0.9]">
              {t('projects_title_1')} <br />
              <Dimensional3DWord
                word={t('projects_title_2')}
                font={fontForLanguage(language)}
                color="#7c5cff"
                depthColor="#2b2168"
                fallbackClassName="inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan"
              />
            </h2>
            <div className="h-1.5 w-20 md:w-24 bg-brand-gold rounded-full mb-4 md:mb-6 rtl:ml-auto rtl:mr-0"></div>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed">
              {t('projects_subtitle')}
            </p>
          </motion.div>

          {/* Filter */}
          <div
            role="tablist"
            aria-label={`${t('projects_title_1')} ${t('projects_title_2')} filters`}
            className="flex flex-wrap gap-2 mt-8 md:mt-0 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            {filters.map((cat) => (
              <button
                key={cat.key}
                role="tab"
                aria-selected={filter === cat.key}
                aria-controls="projects-grid"
                id={`filter-${cat.key.toLowerCase()}`}
                onClick={() => setFilter(cat.key)}
                onKeyDown={(e) => {
                  const buttons = Array.from(e.currentTarget.parentElement?.querySelectorAll('button') || []);
                  const currentIndex = buttons.indexOf(e.currentTarget);
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const nextIndex = e.key === 'ArrowRight'
                      ? Math.min(currentIndex + 1, buttons.length - 1)
                      : Math.max(currentIndex - 1, 0);
                    (buttons[nextIndex] as HTMLButtonElement).focus();
                  }
                }}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 ${filter === cat.key
                    ? 'bg-brand-purple text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-brand-purple hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div id="projects-grid" role="tabpanel" aria-live="polite" aria-label={`${t('projects_title_1')} ${t('projects_title_2')} - ${filter === 'All' ? t('projects_filter_all') : t(`projects_filter_${filter.toLowerCase()}`)}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => {
            const isFlipped = flippedId === project.id;
            const toggleFlip = () => setFlippedId(prev => prev === project.id ? null : project.id);
            return (
            <motion.div
              key={project.id}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
              role="button"
              tabIndex={0}
              aria-pressed={isFlipped}
              aria-label={`${project.title}. ${t('projects_hint')}`}
              onClick={toggleFlip}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFlip();
                }
              }}
              className="group h-96 w-full [perspective:1000px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 rounded-3xl"
            >
              <div className={`relative h-full w-full ${prefersReducedMotion ? '' : 'transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]'} ${isFlipped && !prefersReducedMotion ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 h-full w-full rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden [backface-visibility:hidden]">

                  {/* Image Container */}
                  <div className="relative h-56 w-full">
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img
                      src={project.image}
                      alt={`${project.title} — ${project.category} project screenshot`}
                      loading="lazy"
                      decoding="async"
                      width="600"
                      height="400"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src.indexOf('data:') !== 0) {
                          img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23483AA0'/><text x='50%25' y='50%25' fill='white' font-family='sans-serif' font-size='32' text-anchor='middle' dominant-baseline='middle'>Project image coming soon</text></svg>";
                        }
                      }}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Mobile Hint - Visible on Mobile & Tablet (hidden on large desktops) */}
                    <div className="lg:hidden absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20 animate-pulse shadow-lg">
                      <Hand size={12} className="text-brand-gold" />
                      <span>{t('projects_hint')}</span>
                    </div>
                  </div>

                  <div className="p-6 relative h-full flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-brand-purple bg-brand-purple/5 border border-brand-purple/10 px-3 py-1 rounded-full uppercase tracking-wide">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{project.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="mt-auto pt-4 flex items-center text-brand-blue font-bold text-sm">
                      {t('projects_details')} <ExternalLink size={14} className="ml-1" />
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 h-full w-full rounded-3xl bg-slate-900 p-8 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between shadow-2xl border border-slate-800">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-brand-gold">{project.title}</h3>
                    <div className="w-12 h-1 bg-brand-purple mb-6 rounded-full"></div>
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t) => (
                        <span key={t} className="text-xs border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 bg-slate-800/50">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-purple rounded-xl hover:bg-brand-purpleLight transition-colors font-bold text-sm shadow-lg shadow-brand-purple/20 transform hover:-translate-y-1"
                      >
                        <ExternalLink size={16} /> {t('projects_demo')}
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold text-sm transform hover:-translate-y-1"
                      >
                        <Github size={16} /> {t('projects_code')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Projects;