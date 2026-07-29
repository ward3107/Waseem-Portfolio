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
import ProjectsPage from './pages/ProjectsPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { WidgetProvider } from './contexts/WidgetContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import RequireAuth from './components/admin/RequireAuth';

// The three public pages are bundled eagerly. Each is small (a few kB
// after gzip), and lazy-loading them caused a visible flash of the
// previous page's paint while React Router waited for the chunk to
// arrive after a nav click. Admin routes stay lazy — the admin bundle
// is unrelated to what a visitor loads.
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
// Admin page components live inside the shell via nested routes. Grouped in
// a single lazy import so they arrive together with the shell chunk.
const AdminPages = lazy(() =>
  import('./components/admin/pages/_bundle').then((m) => ({ default: m.default }))
);

// Skip link component with proper accessibility
const SkipLink: React.FC = () => {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 rtl:focus:right-4 rtl:focus:left-auto focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-purple focus:text-white focus:rounded-lg focus:font-bold focus:shadow-lg"
    >
      {t('skipToMain')}
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
        <Route
          path="/admin"
          element={<RequireAuth><AdminDashboard /></RequireAuth>}
        >
          <Route index element={<AdminPages page="overview" />} />
          <Route path="projects" element={<AdminPages page="projects-list" />} />
          <Route path="projects/new" element={<AdminPages page="project-editor" />} />
          <Route path="projects/:id" element={<AdminPages page="project-editor" />} />
          <Route path="certifications" element={<AdminPages page="certs-list" />} />
          <Route path="certifications/new" element={<AdminPages page="cert-editor" />} />
          <Route path="certifications/:id" element={<AdminPages page="cert-editor" />} />
          <Route path="reviews" element={<AdminPages page="reviews-list" />} />
          <Route path="reviews/new" element={<AdminPages page="review-editor" />} />
          <Route path="reviews/:id" element={<AdminPages page="review-editor" />} />
          <Route path="media" element={<AdminPages page="media" />} />
          <Route path="settings" element={<AdminPages page="settings" />} />
        </Route>
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
