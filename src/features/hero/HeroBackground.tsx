import React, { useRef } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { useInView } from '@/shared/hooks/useInView';

interface HeroBackgroundProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  prefersReducedMotion: boolean;
}

const HeroBackground: React.FC<HeroBackgroundProps> = ({
  mouseX,
  mouseY,
  prefersReducedMotion,
}) => {
  // Follower blob now uses transform (compositor-friendly) instead of left/top
  // (which forces a layout pass every frame). The mouse-driven MotionValues
  // are mapped to a translation offset from the section center.
  const followerX = useTransform(mouseX, [-0.5, 0.5], [-60, 60]);
  const followerY = useTransform(mouseY, [-0.5, 0.5], [-60, 60]);

  // Gate the always-on infinite animations behind an IntersectionObserver so
  // the compositor / GPU stops chewing on 700–900 px blurred surfaces the
  // moment the hero scrolls off-screen. rootMargin buys a little bleed so
  // the animation is already running when it comes back into view.
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, '100px');

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <motion.div
        style={{ x: followerX, y: followerY, willChange: 'transform' }}
        className="absolute left-1/2 top-1/2 w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
      />

      {!prefersReducedMotion && inView && (
        <div className="absolute top-0 right-0 h-full w-[60%] pointer-events-none opacity-80">
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 3, 0], x: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-[20%] -right-[20%] w-[900px] h-[1000px] bg-gradient-to-bl from-emerald-100/50 via-teal-50/30 to-transparent rounded-[40%] blur-[80px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], y: [0, -40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-[20%] -right-[30%] w-[700px] h-[700px] bg-gradient-to-bl from-brand-green/5 via-green-100/20 to-transparent rounded-full blur-[90px]"
          />
        </div>
      )}
    </div>
  );
};

export default HeroBackground;
