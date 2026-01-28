import React, { useState } from 'react';
import { ExternalLink, Github, Hand } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Project } from '../types';

const Projects: React.FC = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'All' | 'Web' | 'AI' | 'Mobile'>('All');

  const localizedProjects: Project[] = [
    {
      id: '1',
      title: 'Authentic Greek Resturant',
      category: 'Web',
      description: t('project_1_desc'),
      image: 'https://picsum.photos/seed/nexus/600/400',
      tech: ['Next.js', 'Python', 'TensorFlow'],
      link: '#'
    },
    {
      id: '2',
      title: 'SeatAi',
      category: 'AI',
      description: t('project_2_desc'),
      image: 'https://picsum.photos/seed/gold/600/400',
      tech: ['React', 'Three.js', 'Stripe'],
      link: '#'
    },
    {
      id: '3',
      title: 'Vibe Chat',
      category: 'Mobile',
      description: t('project_3_desc'),
      image: 'https://picsum.photos/seed/vibe/600/400',
      tech: ['React Native', 'Firebase', 'Google Cloud'],
      link: '#'
    }
  ];

  const filteredProjects = filter === 'All'
    ? localizedProjects
    : localizedProjects.filter(p => p.category === filter);

  const filters = [
    { key: 'All', label: t('projects_filter_all') },
    { key: 'Web', label: t('projects_filter_web') },
    { key: 'AI', label: t('projects_filter_ai') },
    { key: 'Mobile', label: t('projects_filter_mobile') },
  ];

  return (
    <section id="projects" className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">

          {/* Modernized Header with Drop Animation */}
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h2 className="text-5xl md:text-7xl font-heading font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[0.9]">
              {t('projects_title_1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan">
                {t('projects_title_2')}
              </span>
            </h2>
            <div className="h-1.5 w-24 bg-brand-gold rounded-full mb-6"></div>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              {t('projects_subtitle')}
            </p>
          </motion.div>

          {/* Filter */}
          <div className="flex gap-2 mt-8 md:mt-0 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {filters.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key as any)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === cat.key
                    ? 'bg-brand-purple text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-brand-purple hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group h-96 w-full [perspective:1000px] cursor-pointer"
            >
              <div className="relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front */}
                <div className="absolute inset-0 h-full w-full rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden [backface-visibility:hidden]">

                  {/* Image Container */}
                  <div className="relative h-56 w-full">
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Mobile Hint - Visible on Mobile & Tablet (hidden on large desktops) */}
                    <div className="lg:hidden absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/20 animate-pulse shadow-lg">
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
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm line-clamp-2 leading-relaxed">
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
                    <a href="#" className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-purple rounded-xl hover:bg-brand-purpleLight transition-colors font-bold text-sm shadow-lg shadow-brand-purple/20 transform hover:-translate-y-1">
                      <ExternalLink size={16} /> {t('projects_demo')}
                    </a>
                    <a href="#" className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold text-sm transform hover:-translate-y-1">
                      <Github size={16} /> {t('projects_code')}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;