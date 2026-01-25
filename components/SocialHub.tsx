import React from 'react';
import { Facebook, Instagram, Video, Heart, UserPlus, ThumbsUp, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWidgets } from '../contexts/WidgetContext';
import { motion, AnimatePresence } from 'framer-motion';

const SocialHub: React.FC = () => {
  const { t } = useLanguage();
  const { widgets } = useWidgets();

  if (!widgets.facebook && !widgets.instagram && !widgets.tiktok) return null;

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Decorative background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-purple/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">{t('connectSocials')}</h2>
          <p className="text-slate-600">{t('latestUpdates')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          
          {/* Facebook Widget */}
          <AnimatePresence>
          {widgets.facebook && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
            >
                <div className="h-24 bg-[#1877F2] relative">
                <div className="absolute bottom-[-24px] left-6 w-16 h-16 bg-white rounded-full p-1">
                    <img src="https://picsum.photos/seed/fb/100" className="w-full h-full rounded-full object-cover" alt="Profile" />
                </div>
                </div>
                <div className="pt-8 px-6 pb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg">Waseem Dev</h3>
                            <p className="text-xs text-slate-500">Full Stack & AI</p>
                        </div>
                        <button className="flex items-center gap-2 bg-[#1877F2] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                            <ThumbsUp size={14} /> Like
                        </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
                        <span className="flex items-center gap-1"><UserPlus size={14} /> 2.5K {t('followers')}</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={14} /> 1.2K {t('likes')}</span>
                    </div>
                </div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Instagram Widget */}
          <AnimatePresence>
          {widgets.instagram && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
            >
                <div className="p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full p-0.5">
                                <img src="https://picsum.photos/seed/insta/100" className="w-full h-full rounded-full object-cover border-2 border-white" alt="Profile" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">waseem.code</p>
                                <p className="text-xs opacity-90">Developer Life</p>
                            </div>
                        </div>
                        <button className="bg-white text-slate-900 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                            {t('followMe')}
                        </button>
                    </div>
                    <div className="flex justify-between text-center text-xs font-medium">
                        <div><span className="block font-bold text-sm">124</span>{t('posts')}</div>
                        <div><span className="block font-bold text-sm">4.8k</span>{t('followers')}</div>
                        <div><span className="block font-bold text-sm">342</span>Following</div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-0.5">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="aspect-square bg-slate-100 relative group cursor-pointer">
                            <img src={`https://picsum.photos/seed/${i}/300`} className="w-full h-full object-cover" alt="Post" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
                                <Heart size={12} fill="white" />
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="bg-black text-white rounded-2xl shadow-lg overflow-hidden border border-slate-800"
            >
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full border border-slate-700 overflow-hidden">
                                <img src="https://picsum.photos/seed/tiktok/100" className="w-full h-full object-cover" alt="TikTok" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">@waseem_ai</p>
                                <p className="text-xs text-slate-400">Tech & Automation</p>
                            </div>
                        </div>
                        <button className="bg-[#FE2C55] text-white px-4 py-1.5 rounded-md text-sm font-bold hover:bg-opacity-90 transition-opacity">
                            {t('followMe')}
                        </button>
                    </div>
                </div>
                <div className="p-4 pt-0">
                    <div className="relative aspect-[9/16] bg-slate-900 rounded-xl overflow-hidden mt-4 group cursor-pointer">
                        <img src="https://picsum.photos/seed/video/400/700" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="Video Cover" />
                        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-sm font-medium mb-2">Build your own AI Agent in 30 seconds 🚀 #coding #ai</p>
                            <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1"><Video size={14} /> 15.2K</span>
                                <span className="flex items-center gap-1"><Heart size={14} /> 2.1K</span>
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[16px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
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