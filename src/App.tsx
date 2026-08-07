import React, { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '@/shared/layout/Navbar';
import Footer from '@/shared/layout/Footer';
import AccessibilityToolbar from '@/shared/widgets/AccessibilityToolbar';
import BackToTop from '@/shared/widgets/BackToTop';
import CookieBanner from '@/shared/widgets/CookieBanner';
import WhatsAppFloat from '@/shared/widgets/WhatsAppFloat';
import ExitIntent from '@/shared/widgets/ExitIntent';
import ScrollToHashOnRouteChange from '@/shared/ui/ScrollToHashOnRouteChange';
import SectionSkeleton from '@/shared/ui/SectionSkeleton';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import ShareTestimonialPage from './pages/ShareTestimonialPage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { WidgetProvider } from './contexts/WidgetContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import RequireAuth from '@/features/admin/RequireAuth';

// The three public pages are bundled eagerly. Each is small (a few kB
// after gzip), and lazy-loading them caused a visible flash of the
// previous page's paint while React Router waited for the chunk to
// arrive after a nav click. Admin routes stay lazy — the admin bundle
// is unrelated to what a visitor loads.
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const MfaPage = lazy(() => import('./pages/admin/MfaPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
// Admin page components live inside the shell via nested routes. Grouped in
// a single lazy import so they arrive together with the shell chunk.
const AdminPages = lazy(() =>
  import('@/features/admin/pages/_bundle').then((m) => ({ default: m.default }))
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
const SiteShell: React.FC<{ children: React.ReactNode; focusMode?: boolean }> = ({
  children,
  focusMode = false,
}) => (
  <div className="relative">
    <SkipLink />
    <Navbar />
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
    <Footer />
    <AccessibilityToolbar />
    <BackToTop />
    {/* Widgets that would distract a visitor performing a focused task
        (e.g. filling out /share-testimonial) are hidden in focus mode. The
        essentials — accessibility, back-to-top, cookies — stay. */}
    {/* Share moved into Navbar as NavShareButton (frees the bottom-left
        corner on mobile). WhatsApp and Exit-Intent are still floating
        widgets, hidden in focus mode so /share-testimonial stays quiet. */}
    {!focusMode && (
      <>
        <WhatsAppFloat />
        <ExitIntent />
      </>
    )}
    <CookieBanner />
  </div>
);

/** Admin routes render standalone — no site navbar, no footer, no widgets,
 *  no cookie banner. Prevents "which nav do I use?" confusion and stops the
 *  floating widgets from covering the admin UI. */
const AppContent: React.FC = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  // Fully standalone routes render WITHOUT the site chrome (navbar/footer/
  // widgets). Admin, and the customer feedback page — the latter has its own
  // full-bleed cream/sage design, and the site's transparent navbar (light
  // text meant for the hero) rendered washed-out and out of place on top of it.
  const isStandalone = isAdmin || pathname === '/share-testimonial';

  const routes = (
    <Suspense fallback={<SectionSkeleton />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/share-testimonial" element={<ShareTestimonialPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        {/* /admin/mfa sits outside RequireAuth so it can host both the
            login-time challenge (aal1 → aal2) and the enrollment flow
            without a redirect loop. It gates itself on `user` inside. */}
        <Route path="/admin/mfa" element={<MfaPage />} />
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
          <Route path="collect-testimonials" element={<AdminPages page="collect-testimonials" />} />
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
      {isStandalone ? routes : <SiteShell>{routes}</SiteShell>}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <WidgetProvider>
            <AdminAuthProvider>
              <BrowserRouter>
                {/* reducedMotion="user" makes every framer-motion animation on
                    the site honor the OS prefers-reduced-motion setting,
                    including components that don't check it manually. */}
                <MotionConfig reducedMotion="user">
                  <AppContent />
                </MotionConfig>
              </BrowserRouter>
            </AdminAuthProvider>
          </WidgetProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
