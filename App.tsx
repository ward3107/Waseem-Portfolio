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
const Reviews = lazy(() => import('./components/Reviews'));
const Process = lazy(() => import('./components/Process'));
const TechStack = lazy(() => import('./components/TechStack'));
const Certifications = lazy(() => import('./components/Certifications'));
const FAQ = lazy(() => import('./components/FAQ'));
const Contact = lazy(() => import('./components/Contact'));

const SectionSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Loading section"
    className="min-h-[50vh] flex items-center justify-center"
  >
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-16 animate-pulse">
      <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-full mb-6" />
      <div className="h-12 w-3/4 max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-lg mb-4" />
      <div className="h-4 w-1/2 max-w-lg bg-slate-200 dark:bg-slate-800 rounded mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
    <span className="sr-only">Loading…</span>
  </div>
);

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
        <Suspense fallback={<SectionSkeleton />}>
          <Projects />
        </Suspense>
        <Suspense fallback={null}>
          <Reviews />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Process />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <TechStack />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Certifications />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
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
