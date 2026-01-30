import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BLOG_POSTS } from '../lib/blog-posts';

type Category = 'all' | 'portfolio' | 'ai' | 'web-dev';

const Blog: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const categories = [
    { id: 'all' as Category, label: t('blog_category_all') || 'All Posts' },
    { id: 'portfolio' as Category, label: t('blog_category_portfolio') || 'Portfolio Updates' },
    { id: 'ai' as Category, label: t('blog_category_ai') || 'AI & Automation' },
    { id: 'web-dev' as Category, label: t('blog_category_webdev') || 'Web Development' },
  ];

  const filteredPosts = selectedCategory === 'all'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(post => post.category === selectedCategory);

  return (
    <section id="blog" className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6"
          >
            <Sparkles size={14} className="text-brand-gold" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-300 tracking-wide uppercase">
              {t('services_badge') || 'Latest'}
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-6">
            {t('blog_title') || 'Latest Updates'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {t('blog_subtitle') || 'Portfolio updates, industry insights, and behind-the-scenes.'}
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30 scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-brand-purple/50 hover:scale-105'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -12 }}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-slate-100 dark:border-slate-800"
            >
              {/* Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 flex items-center justify-center overflow-hidden">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-slate-800/50 flex items-center justify-center backdrop-blur-sm"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sparkles size={32} className="text-brand-purple" />
                </motion.div>
              </div>

              <div className="p-6">
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {post.readTime}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-brand-purple transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-brand-purple uppercase">
                    {post.category.replace('-', ' ')}
                  </span>
                  <span className="text-brand-purple flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all">
                    {t('blog_read_more') || 'Read More'}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-500">No posts found in this category.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Blog;
