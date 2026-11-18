import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import HeadingAccent from '../components/HeadingAccent';
import { useHeadingLeading } from './ChapterOverlay';
import { GhostNavButton } from './actions';
import ProjectShowcase from './ProjectShowcase';
import WorkShelf from '@/features/work/WorkShelf';

const reveal = {
  initial: { opacity: 0.72, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
} as const;

const ProjectsOverlay: React.FC = () => {
  const { t, language } = useLanguage();
  const leading = useHeadingLeading();

  return (
    <div className="pointer-events-none mx-auto flex w-full max-w-6xl flex-col items-center gap-5 sm:gap-7">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center"
      >
        <h2
          id="projects-heading"
          className={`max-w-3xl font-heading text-4xl font-black tracking-tight sm:text-5xl md:text-6xl ${leading}`}
        >
          <span className="text-white">{t('projects_title_1')} </span>
          <HeadingAccent tone="gold" fancy>
            {t('projects_title_2')}
          </HeadingAccent>
        </h2>
        <p className="mt-2 max-w-xl text-base font-medium text-slate-300 sm:text-lg">
          {t('projects_subtitle')}
        </p>
      </motion.div>

      <ProjectShowcase />

      <motion.div
        {...reveal}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex w-full min-w-0 flex-col items-center"
      >
        <WorkShelf scope="featured" language={language} defer />
        <GhostNavButton href="/projects">{t('home_projects_cta')}</GhostNavButton>
      </motion.div>
    </div>
  );
};

export default ProjectsOverlay;
