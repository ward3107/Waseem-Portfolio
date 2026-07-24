import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const location = useLocation();

  // Use a ref to keep track of intersecting sections across callbacks
  const intersectingSections = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Reset stale ids from the previous page — its dark sections no longer
    // exist in the DOM once the route changes.
    intersectingSections.current = new Set();
    setIsDarkBackground(false);

    // 1. Scroll Visibility Logic
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);

    // 2. Background Detection Logic — target ids live on whichever page is
    // currently mounted (re-run per route change since each page only
    // renders a subset of these sections).
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

    // Lazy-loaded (Suspense) sections on the newly-mounted page may not exist
    // in the DOM yet at this exact instant — give them a moment, same pattern
    // used elsewhere in this codebase for post-navigation DOM lookups.
    const observeTimer = setTimeout(() => {
      darkSectionsIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 200);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      clearTimeout(observeTimer);
      observer.disconnect();
    };
  }, [location.pathname]);

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