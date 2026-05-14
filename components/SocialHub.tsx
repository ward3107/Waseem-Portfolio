import React from 'react';
import { Video, Heart, UserPlus, ThumbsUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWidgets } from '../contexts/WidgetContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getPrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const SocialHub: React.FC = () => {
    const { t, dir } = useLanguage();
    const { widgets } = useWidgets();

    // Check for reduced motion preference
    const prefersReducedMotion = getPrefersReducedMotion();

    if (!widgets.facebook && !widgets.instagram && !widgets.tiktok) return null;

    const isRTL = dir === 'rtl';

    return (
        <section className="py-16 sm:py-20 md:py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
            {/* Decorative background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[200px] sm:h-[300px] md:h-[400px] bg-brand-purple/5 rounded-full blur-2xl sm:blur-3xl -z-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
                <div className="text-center mb-10 sm:mb-12 md:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">{t('connectSocials')}</h2>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{t('latestUpdates')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 justify-center" dir={dir}>

                    {/* Facebook Widget */}
                    <AnimatePresence>
                        {widgets.facebook && (
                            <motion.div
                                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={prefersReducedMotion ? {} : { y: -5 }}
                                className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden"
                            >
                                <div className="h-20 sm:h-24 bg-[#1877F2] relative">
                                    <div className={`absolute bottom-[-20px] sm:bottom-[-24px] ${isRTL ? 'right-4 sm:right-6' : 'left-4 sm:left-6'} w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full p-1 flex items-center justify-center`}>
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">W</div>
                                    </div>
                                </div>
                                <div className="pt-6 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6">
                                    <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                                        <div className={isRTL ? 'text-right' : 'text-left'}>
                                            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Waseem Dev</h3>
                                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Full Stack & AI</p>
                                        </div>
                                        <button className="flex items-center gap-1.5 sm:gap-2 bg-[#1877F2] text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
                                            <ThumbsUp size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">Like</span>
                                        </button>
                                    </div>
                                    <div className={`flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 sm:pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <span className="flex items-center gap-1"><UserPlus size={12} className="sm:w-3.5 sm:h-3.5" /> 2.5K {t('followers')}</span>
                                        <span className="flex items-center gap-1"><ThumbsUp size={12} className="sm:w-3.5 sm:h-3.5" /> 1.2K {t('likes')}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Instagram Widget */}
                    <AnimatePresence>
                        {widgets.instagram && (
                            <motion.div
                                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={prefersReducedMotion ? {} : { y: -5 }}
                                className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden"
                            >
                                <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur rounded-full p-0.5 flex items-center justify-center">
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm sm:text-base">W</div>
                                            </div>
                                            <div className={isRTL ? 'text-right' : 'text-left'}>
                                                <p className="font-bold text-xs sm:text-sm">waseem.code</p>
                                                <p className="text-[11px] sm:text-xs opacity-90">Developer Life</p>
                                            </div>
                                        </div>
                                        <button className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap">
                                            {t('followMe')}
                                        </button>
                                    </div>
                                    <div className={`flex justify-between text-center text-[11px] sm:text-xs font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <div><span className="block font-bold text-xs sm:text-sm">124</span>{t('posts')}</div>
                                        <div><span className="block font-bold text-xs sm:text-sm">4.8k</span>{t('followers')}</div>
                                        <div><span className="block font-bold text-xs sm:text-sm">342</span>Following</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-0.5">
                                    {['from-purple-500 to-pink-500', 'from-pink-500 to-orange-500', 'from-orange-500 to-yellow-500', 'from-blue-500 to-purple-500', 'from-green-500 to-teal-500', 'from-teal-500 to-blue-500'].map((gradient, i) => (
                                        <div key={i} className={`aspect-square bg-gradient-to-br ${gradient} relative group cursor-pointer flex items-center justify-center`}>
                                            <span className="text-white/50 text-2xl font-bold">{i + 1}</span>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
                                                <Heart size={10} className="sm:w-3 sm:h-3" fill="white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* TikTok Widget */}
                    <AnimatePresence>
                        {widgets.tiktok && (
                            <motion.div
                                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={prefersReducedMotion ? {} : { y: -5 }}
                                className="bg-black text-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-slate-800"
                            >
                                <div className="p-4 sm:p-6 pb-1.5 sm:pb-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-700 overflow-hidden flex items-center justify-center">
                                                <div className="w-full h-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] flex items-center justify-center text-white font-bold text-sm sm:text-base">@</div>
                                            </div>
                                            <div className={isRTL ? 'text-right' : 'text-left'}>
                                                <p className="font-bold text-xs sm:text-sm">@waseem_ai</p>
                                                <p className="text-[11px] sm:text-xs text-slate-400">Tech & Automation</p>
                                            </div>
                                        </div>
                                        <button className="bg-[#FE2C55] text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-sm font-bold hover:bg-opacity-90 transition-opacity whitespace-nowrap">
                                            {t('followMe')}
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3 sm:p-4 pt-0">
                                    <div className="relative aspect-[9/16] bg-gradient-to-br from-slate-800 via-black to-slate-900 rounded-lg sm:rounded-xl overflow-hidden mt-3 sm:mt-4 group cursor-pointer">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Video size={32} className="sm:w-10 sm:h-10 text-white/20" />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-60 transition-opacity"></div>
                                        <div className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-4">
                                            <p className="text-[11px] sm:text-sm font-medium mb-1.5 sm:mb-2 line-clamp-2 sm:line-clamp-none">Build your own AI Agent in 30 seconds 🚀 #coding #ai</p>
                                            <div className={`flex items-center gap-2 sm:gap-4 text-[11px] sm:text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                <span className="flex items-center gap-1"><Video size={10} className="sm:w-3.5 sm:h-3.5" /> 15.2K</span>
                                                <span className="flex items-center gap-1"><Heart size={10} className="sm:w-3.5 sm:h-3.5" /> 2.1K</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                            <div className={`w-0 h-0 border-t-[6px] sm:border-t-[8px] border-t-transparent ${isRTL ? 'border-r-[14px] sm:border-r-[16px] border-r-white' : 'border-l-[14px] sm:border-l-[16px] border-l-white'} border-b-[6px] sm:border-b-[8px] border-b-transparent ${isRTL ? 'mr-0.5 sm:mr-1' : 'ml-0.5 sm:ml-1'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </section>
    );
};

export default SocialHub;