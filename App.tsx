import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import RequireAuth from './components/admin/RequireAuth';

// Route-level code splitting: Home loads eagerly (it's "/"), the other two
// pages are only fetched once the user actually navigates there.
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

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

/** The public site layout — nav, footer, floating widgets, cookie banner. */
const SiteShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">
    <SkipLink />
    <Navbar />
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
    <Footer />
    <AccessibilityToolbar />
    <ShareWidget />
    <BackToTop />
    <CookieBanner />
  </div>
);

/** Admin routes render standalone — no site navbar, no footer, no widgets,
 *  no cookie banner. Prevents "which nav do I use?" confusion and stops the
 *  floating widgets from covering the admin UI. */
const AppContent: React.FC = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  const routes = (
    <Suspense fallback={<SectionSkeleton />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );

  return (
    <>
      <ScrollToHashOnRouteChange />
      {isAdmin ? routes : <SiteShell>{routes}</SiteShell>}
    </>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <WidgetProvider>
          <AdminAuthProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AdminAuthProvider>
        </WidgetProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
