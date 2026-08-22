import React, { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from '@/shared/layout/Navbar';
import Footer from '@/shared/layout/Footer';
import AccessibilityToolbar from '@/shared/widgets/AccessibilityToolbar';
import BackToTop from '@/shared/widgets/BackToTop';
import CookieBanner from '@/shared/widgets/CookieBanner';
import WhatsAppFloat from '@/shared/widgets/WhatsAppFloat';
import ExitIntent from '@/shared/widgets/ExitIntent';
import ScrollToHashOnRouteChange from '@/shared/ui/ScrollToHashOnRouteChange';
import RouteTransition from '@/shared/ui/RouteTransition';
import SectionSkeleton from '@/shared/ui/SectionSkeleton';
import ErrorBoundary from '@/shared/ui/ErrorBoundary';
import HomePage from './pages/HomePage';
import FromGbpPage from './pages/FromGbpPage';
import PrivacyPage from './pages/PrivacyPage';
import AccessibilityPage from './pages/AccessibilityPage';
import NotFoundPage from './pages/NotFoundPage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { WidgetProvider } from './contexts/WidgetContext';
import { ThemeProvider } from './contexts/ThemeContext';

// The public pages are bundled eagerly. Each is small (a few kB after gzip),
// and lazy-loading them caused a visible flash of the previous page's paint
// while React Router waited for the chunk to arrive after a nav click.
//
// The entire /admin tree — including its Supabase-backed auth provider —
// stays behind this one lazy import. It is the only thing keeping
// supabase-js (GoTrue + Realtime + PostgREST) out of the chunk every public
// visitor downloads, so nothing from './pages/admin/AdminRoutes' or
// '@/contexts/AdminAuthContext' may be imported eagerly here.
const AdminRoutes = lazy(() => import('./pages/admin/AdminRoutes'));

// /share-testimonial is standalone: visitors arrive by direct link (QR code,
// WhatsApp), never by clicking through the site nav, so the flash-on-nav
// reason for keeping public pages eager doesn't apply. It is lazy because it
// posts to Supabase via '@/lib/content/reviews' — held eagerly, that single
// import put supabase-js back in the entry chunk for every visitor.
const ShareTestimonialPage = lazy(() => import('./pages/ShareTestimonialPage'));

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
  return (
    <>
      <ScrollToHashOnRouteChange />
      {/* Branded route transitions. The chrome (SiteShell vs standalone) and the
          <Routes> both read the DISPLAYED location, which lags the live one only
          while the transition curtain is covering — so the navbar never vanishes
          before the swap is hidden. */}
      <RouteTransition>
        {(display) => {
          const { pathname } = display;
          const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
          // Fully standalone routes render WITHOUT the site chrome (navbar/
          // footer/widgets). Admin, and the customer feedback page — the latter
          // has its own full-bleed cream/sage design, and the site's transparent
          // navbar (light text meant for the hero) rendered washed-out and out
          // of place on top of it. /from-gbp is a pure UTM-stamping redirect
          // (renders null) — no chrome so there's no 1-frame flash of navbar
          // before the client-side redirect fires.
          const isStandalone =
            isAdmin || pathname === '/share-testimonial' || pathname === '/from-gbp';

          const routes = (
            <Suspense fallback={<SectionSkeleton />}>
              {/* location={display} so the exchange happens under the curtain. */}
              <Routes location={display}>
                <Route path="/" element={<HomePage />} />
                {/* The site is one page now — these former routes redirect to
                    their section on the home journey. Kept so bookmarks, deep
                    links and search results still land in the right place. */}
                <Route path="/projects" element={<Navigate to="/#projects" replace />} />
                <Route path="/services" element={<Navigate to="/#what-i-do" replace />} />
                <Route path="/about" element={<Navigate to="/#about" replace />} />
                <Route path="/contact" element={<Navigate to="/#contact" replace />} />
                <Route path="/from-gbp" element={<FromGbpPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/accessibility" element={<AccessibilityPage />} />
                <Route path="/share-testimonial" element={<ShareTestimonialPage />} />
                {/* Descendant routes — the whole admin tree lives in its own chunk. */}
                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          );

          return isStandalone ? routes : <SiteShell>{routes}</SiteShell>;
        }}
      </RouteTransition>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <WidgetProvider>
            <BrowserRouter>
              {/* reducedMotion="user" makes every framer-motion animation on
                    the site honor the OS prefers-reduced-motion setting,
                    including components that don't check it manually. */}
              <MotionConfig reducedMotion="user">
                <AppContent />
              </MotionConfig>
              {/* Vercel Analytics — auto no-op outside production, and the
                    script/beacon are served same-origin via /_vercel/insights
                    on Vercel deployments. Consent-Mode wiring lives in
                    CookieBanner (analytics_storage gate). */}
              <Analytics />
            </BrowserRouter>
          </WidgetProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
