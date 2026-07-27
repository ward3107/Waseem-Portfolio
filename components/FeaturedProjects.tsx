import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useProjects } from '../hooks/useProjects';

const FEATURED_COUNT = 3;

const FeaturedProjects: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'he' || language === 'ar';
  const prefersReducedMotion = usePrefersReducedMotion();
  const { projects: all } = useProjects();
  const projects = all.slice(0, FEATURED_COUNT);

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-brand-purple text-xs font-bold uppercase tracking-wider mb-4 shadow-sm"
          >
            {t('home_projects_badge')}
          </motion.span>

          <motion.h2
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-slate-900 dark:text-white mb-4"
          >
            {t('home_projects_title_1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">
              {t('home_projects_title_2')}
            </span>
          </motion.h2>

          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {t('home_projects_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
          {projects.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.link || project.github || '/projects'}
              target={project.link || project.github ? '_blank' : undefined}
              rel={project.link || project.github ? 'noopener noreferrer' : undefined}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1 }}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-brand-purple/30 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
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
                      img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'><rect width='600' height='400' fill='%23483AA0'/><text x='50%25' y='50%25' fill='white' font-family='sans-serif' font-size='28' text-anchor='middle' dominant-baseline='middle'>Project image coming soon</text></svg>";
                    }
                  }}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-xs font-bold text-brand-purple bg-brand-purple/5 border border-brand-purple/10 px-3 py-1 rounded-full uppercase tracking-wide w-fit mb-2">
                  {project.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {project.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">
                  {project.description}
                </p>
                <div className="mt-auto flex items-center gap-1 text-brand-blue font-bold text-sm">
                  {t('projects_details')} <ExternalLink size={14} />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-brand-purple text-white rounded-full font-bold text-sm shadow-xl hover:shadow-2xl transition-all"
          >
            {t('home_projects_cta')}
            {isRtl ? (
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            )}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
