import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Cpu, Zap, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TimelineItem } from '../types';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import Dimensional3DWord, { fontForLanguage } from './three/Dimensional3DWord';

// Sub-component for spinning year effect
const SpinningYear = ({ year }: { year: string }) => {
    const numericYear = parseInt(year);
    const ref = useRef<HTMLSpanElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();
    const [hasAnimated, setHasAnimated] = useState(false);
    // Start at the low end of the count-up range so the first paint shows the
    // animation's starting value — initialising to the FINAL year made the
    // number flash (e.g. 2021 → 1971 → … → 2021) the moment it scrolled in.
    const [displayYear, setDisplayYear] = useState(isNaN(numericYear) ? 0 : numericYear - 50);

    const isInView = useInView(ref, {
        amount: "some", // trigger when any pixel is visible
        margin: "0px"
    });

    useEffect(() => {
        if (isInView && !hasAnimated && !isNaN(numericYear) && prefersReducedMotion) {
            // Reduced motion: jump straight to the real year, no count-up.
            setDisplayYear(numericYear);
            setHasAnimated(true);
            return;
        }
        if (isInView && !hasAnimated && !isNaN(numericYear)) {
            const startYear = numericYear - 50;
            let current = startYear;
            const duration = 800; // 0.8 seconds - much faster
            const steps = 60; // 60 frames
            const increment = (numericYear - startYear) / steps;
            const interval = duration / steps;

            const timer = setInterval(() => {
                current += increment;
                if (current >= numericYear) {
                    setDisplayYear(numericYear);
                    clearInterval(timer);
                    setHasAnimated(true);
                } else {
                    setDisplayYear(Math.round(current));
                }
            }, interval);

            return () => clearInterval(timer);
        }
    }, [isInView, hasAnimated, numericYear, prefersReducedMotion]);

    if (isNaN(numericYear)) return <span>{year}</span>;

    return (
        <span ref={ref} className="tabular-nums relative inline-block" dir="ltr">
            {displayYear}
        </span>
    );
};

const AboutTimeline: React.FC = () => {
    const { t, language } = useLanguage();

    // Check for reduced motion preference
    const prefersReducedMotion = usePrefersReducedMotion();

    // Lazy-mount the hero video only when the card scrolls into view, so the
    // ~1.5 MB MP4 isn't downloaded on initial page load. With reduced-motion
    // we skip the video entirely and stay on the static poster.
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const isVideoInView = useInView(videoContainerRef, { once: true, margin: '200px' });
    const showVideo = !prefersReducedMotion && isVideoInView;

    const localizedTimeline: TimelineItem[] = [
        {
            year: '2021',
            title: t('timeline_3_title'),
            description: t('timeline_3_desc')
        },
        {
            year: '2024',
            title: t('timeline_2_title'),
            description: t('timeline_2_desc')
        },
        {
            year: '2025',
            title: t('timeline_1_title'),
            description: t('timeline_1_desc')
        },
        {
            year: '2026',
            title: t('timeline_0_title'),
            description: t('timeline_0_desc')
        }
    ];

    return (
        <section id="about" className="py-24 bg-slate-50 dark:bg-slate-950 relative isolate transition-colors duration-300">
            {/* Abstract Background Blobs — clipped to this wrapper (not the section)
                so position:sticky on the profile card below still tracks page scroll;
                overflow-hidden on the section itself would make it the sticky
                containing block and the card would never appear to move. */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className={`absolute top-20 left-0 w-96 h-96 bg-brand-purple/5 rounded-full blur-3xl ${!prefersReducedMotion && 'animate-float'}`}></div>
                <div className={`absolute bottom-20 right-0 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl ${!prefersReducedMotion && 'animate-float'}`} style={prefersReducedMotion ? {} : { animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">

                {/* Section Header - The "Fact" Presentation */}
                <div className="mb-20 perspective-1000">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="bg-brand-purple text-white p-1 rounded-full">
                            <BadgeCheck size={16} />
                        </div>
                        <span className="text-brand-purple font-bold tracking-widest uppercase text-sm">{t('about_badge')}</span>
                        <span className="h-px w-20 bg-brand-purple/20"></span>
                    </motion.div>

                    {/* Fade from Back to Front Effect */}
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-4xl md:text-6xl font-heading font-black text-slate-900 dark:text-white leading-tight mb-6"
                    >
                        {t('about_title_1')} <br />
                        <Dimensional3DWord
                            word={t('about_title_2')}
                            font={fontForLanguage(language)}
                            color="#9683d6"
                            depthColor="#2b2168"
                            fallbackClassName="inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan"
                        />
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-6 md:items-center p-6 bg-white dark:bg-slate-900 border-l-4 border-brand-green rounded-r-xl shadow-sm max-w-3xl"
                    >
                        <div className="flex-shrink-0">
                            <ShieldCheck size={32} className="text-brand-green" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('about_trusted_title')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                {t('about_trusted_desc')}
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-12 lg:items-start">

                    {/* Left Column: Gamified Character Card — pinned on desktop while the
                        timeline scrolls past, so the narrative reads as a guided story. */}
                    <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-28">
                        <motion.div
                            initial={{ opacity: 0, rotateY: 15 }}
                            whileInView={{ opacity: 1, rotateY: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            style={{ perspective: '1000px' }}
                            className="relative group"
                        >
                            {/* The Card Container */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden transform transition-transform duration-500 group-hover:scale-[1.02]">

                                {/* Header Image Area */}
                                <div ref={videoContainerRef} className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden bg-slate-900">
                                    {showVideo ? (
                                        <video
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="metadata"
                                            poster="/assets/waseem-profile.webp"
                                            aria-label={t('hero_profile_alt')}
                                            className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                                        >
                                            <source src="/assets/waseem-profile-video.mp4" type="video/mp4" />
                                        </video>
                                    ) : (
                                        <img
                                            src="/assets/waseem-profile.webp"
                                            alt={t('hero_profile_alt')}
                                            loading="lazy"
                                            decoding="async"
                                            width={800}
                                            height={600}
                                            className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-purpleDark via-brand-purple/50 to-transparent"></div>

                                    <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 text-white">
                                        <h3 className="text-2xl md:text-3xl font-heading font-bold">Waseem</h3>
                                        <p className="text-brand-cyan font-mono text-xs md:text-sm tracking-widest">{t('about_card_lvl')}</p>
                                    </div>
                                </div>

                                {/* Stats Section (RPG Style) */}
                                <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                                    <div className="flex items-center justify-between text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 md:mb-2">
                                        <span>{t('about_attr')}</span>
                                        <span className="text-brand-purple">{t('about_class')}</span>
                                    </div>

                                    {/* Stat 1: Logic */}
                                    <div>
                                        <div className="flex justify-between text-[11px] md:text-xs font-bold mb-1">
                                            <span className="flex items-center gap-1"><Brain className="w-2.5 h-2.5 md:w-3 md:h-3" /> {t('about_stat_1')}</span>
                                            <span className="text-slate-600 dark:text-slate-400">100%</span>
                                        </div>
                                        <div className="h-1.5 md:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                whileInView={{ width: '100%' }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className="h-full bg-brand-purple rounded-full"
                                            ></motion.div>
                                        </div>
                                    </div>

                                    {/* Stat 2: Creativity */}
                                    <div>
                                        <div className="flex justify-between text-[11px] md:text-xs font-bold mb-1">
                                            <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5 md:w-3 md:h-3" /> {t('about_stat_2')}</span>
                                            <span className="text-slate-600 dark:text-slate-400">95%</span>
                                        </div>
                                        <div className="h-1.5 md:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                whileInView={{ width: '95%' }}
                                                transition={{ duration: 1, delay: 0.4 }}
                                                className="h-full bg-brand-cyan rounded-full"
                                            ></motion.div>
                                        </div>
                                    </div>

                                    {/* Stat 3: AI Integration */}
                                    <div>
                                        <div className="flex justify-between text-[11px] md:text-xs font-bold mb-1">
                                            <span className="flex items-center gap-1"><Cpu className="w-2.5 h-2.5 md:w-3 md:h-3" /> {t('about_stat_3')}</span>
                                            <span className="text-slate-600 dark:text-slate-400">100%</span>
                                        </div>
                                        <div className="h-1.5 md:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '100%' }}
                                                transition={{ duration: 1, delay: 0.6 }}
                                                className="h-full bg-brand-gold rounded-full"
                                            ></motion.div>
                                        </div>
                                    </div>

                                    <div className="pt-3 md:pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 md:gap-3">

                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl md:text-2xl" title="Coffee Level: High">
                                            ☕
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements behind */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-purple/20 rounded-full blur-xl -z-10 animate-pulse"></div>
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-brand-cyan/20 rounded-full blur-xl -z-10"></div>
                        </motion.div>
                    </div>

                    {/* Right Column: Narrative Timeline */}
                    <div className="lg:col-span-7 pl-0 lg:pl-10 flex flex-col justify-center">
                        <div className="prose prose-base md:prose-lg text-slate-600 dark:text-slate-400 mb-8 md:mb-12">
                            <p>
                                {t('about_narrative_1')}
                            </p>
                            <p>
                                {t('about_narrative_2')}
                                <span className="text-slate-900 dark:text-white font-bold block mt-2 p-3 md:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm text-sm md:text-base">
                                    {t('about_mission')}
                                </span>
                            </p>
                        </div>

                        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-8 md:space-y-12">
                            {/* Glowing Line Overlay */}
                            <div className="absolute left-[-2px] top-0 w-[2px] h-full bg-gradient-to-b from-brand-purple via-brand-cyan to-transparent"></div>

                            {localizedTimeline.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="relative pl-10"
                                >
                                    {/* Timeline Dot */}
                                    <div className="absolute left-[-9px] top-0 w-[14px] md:w-[18px] h-[14px] md:h-[18px] rounded-full border-4 border-white bg-brand-purple shadow-[0_0_0_4px_rgba(72,58,160,0.2)]"></div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                                        {/* Spinning Year Effect - Updated Color */}
                                        <span className="text-3xl md:text-4xl font-heading font-bold text-brand-purple overflow-hidden h-[32px] md:h-[40px] flex items-center">
                                            <SpinningYear year={item.year} />
                                        </span>
                                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
                                    </div>
                                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                                        {item.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AboutTimeline;