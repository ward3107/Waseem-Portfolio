import React, { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import AISection from './components/AISection';
import VibeCoding from './components/VibeCoding';
import AboutTimeline from './components/AboutTimeline';
import Footer from './components/Footer';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import ShareWidget from './components/ShareWidget';
import BackToTop from './components/BackToTop';
import CookieBanner from './components/CookieBanner';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { WidgetProvider } from './contexts/WidgetContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy load below-the-fold components for code splitting
const Projects = lazy(() => import('./components/Projects'));
const Process = lazy(() => import('./components/Process'));
const TechStack = lazy(() => import('./components/TechStack'));
const SocialHub = lazy(() => import('./components/SocialHub'));
const FAQ = lazy(() => import('./components/FAQ'));
const Contact = lazy(() => import('./components/Contact'));

// Skip link component with proper accessibility
const SkipLink: React.FC = () => {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-purple focus:text-white focus:rounded-lg focus:font-bold focus:shadow-lg"
    >
      {t('skip_to_main')}
    </a>
  );
};

const AppContent: React.FC = () => {
  return (
    <div className="relative">
      <SkipLink />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Services />
        <AISection />
        <VibeCoding />
        <AboutTimeline />
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-600 dark:text-slate-400">Loading projects...</div>}>
          <Projects />
        </Suspense>
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-600 dark:text-slate-400">Loading process...</div>}>
          <Process />
        </Suspense>
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-600 dark:text-slate-400">Loading tech stack...</div>}>
          <TechStack />
        </Suspense>
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-600 dark:text-slate-400">Loading social hub...</div>}>
          <SocialHub />
        </Suspense>
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-600 dark:text-slate-400">Loading FAQ...</div>}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-600 dark:text-slate-400">Loading contact...</div>}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
      <AccessibilityToolbar />
      <ShareWidget />
      <BackToTop />
      <CookieBanner />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <WidgetProvider>
          <AppContent />
        </WidgetProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;