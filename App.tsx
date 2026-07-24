import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import ShareWidget from './components/ShareWidget';
import BackToTop from './components/BackToTop';
import CookieBanner from './components/CookieBanner';
import ScrollToHashOnRouteChange from './components/ScrollToHashOnRouteChange';
import SectionSkeleton from './components/SectionSkeleton';
import HomePage from './pages/HomePage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { WidgetProvider } from './contexts/WidgetContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Route-level code splitting: Home loads eagerly (it's "/"), the other two
// pages are only fetched once the user actually navigates there.
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

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
      <ScrollToHashOnRouteChange />
      <SkipLink />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<SectionSkeleton />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </WidgetProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
