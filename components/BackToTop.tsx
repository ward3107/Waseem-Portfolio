import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  
  // Use a ref to keep track of intersecting sections across callbacks
  const intersectingSections = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1. Scroll Visibility Logic
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);

    // 2. Background Detection Logic
    const darkSectionsIds = ['ai-automation', 'process', 'footer'];
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          intersectingSections.current.add(entry.target.id);
        } else {
          intersectingSections.current.delete(entry.target.id);
        }
      });
      
      setIsDarkBackground(intersectingSections.current.size > 0);
    };

    const observerOptions = {
      root: null,
      // Adjust rootMargin to create a detection zone around the button's position (bottom-24 left-6)
      // The button is roughly at 85-90% down the viewport.
      // -85% top means we ignore the top part.
      rootMargin: '-85% 0px 0px 0px', 
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    darkSectionsIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Dynamic Styles
  const buttonStyle = isDarkBackground 
    ? "bg-white text-slate-900 border-white hover:bg-slate-200" // Light button on Dark bg
    : "bg-slate-900 text-white border-slate-900 hover:bg-brand-purple hover:border-brand-purple"; // Dark button on Light bg

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 0.5, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ opacity: 1, scale: 1.1 }}
          onClick={scrollToTop}
          className={`fixed bottom-24 left-6 z-40 p-3 rounded-full shadow-xl border-2 transition-colors duration-300 group ${buttonStyle}`}
          aria-label="Back to Top"
        >
          <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;