import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    // Sync immediately in case the page loads already scrolled.
    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Contrast the button against the page background. In dark theme every
  // section is dark, so use the light button; in light theme use the dark
  // button. (The previous IntersectionObserver assumed a fixed list of
  // "dark sections", but those sections are light in light theme — producing
  // a white button on a white background, i.e. an invisible control.)
  const buttonStyle =
    theme === 'dark'
      ? 'bg-white text-slate-900 border-white hover:bg-slate-200'
      : 'bg-slate-900 text-white border-slate-900 hover:bg-brand-purple hover:border-brand-purple';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 0.5, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ opacity: 1, scale: 1.1 }}
          onClick={scrollToTop}
          className={`fixed bottom-6 left-6 md:bottom-24 z-40 p-2.5 md:p-3 rounded-full shadow-xl border-2 transition-colors duration-300 group ${buttonStyle}`}
          aria-label="Back to Top"
        >
          <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
