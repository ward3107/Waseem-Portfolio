import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import SectionSkeleton from '@/shared/ui/SectionSkeleton';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import RequireAuth from '@/features/admin/RequireAuth';
import LoginPage from './LoginPage';
import MfaPage from './MfaPage';
import AdminDashboard from './AdminDashboard';

// Admin page components live inside the shell via nested routes. Grouped in
// a single lazy import so they arrive together with the shell chunk.
const AdminPages = lazy(() =>
  import('@/features/admin/pages/_bundle').then((m) => ({ default: m.default }))
);

/**
 * The whole /admin/* tree, including its auth provider.
 *
 * This file exists to keep `@supabase/supabase-js` out of the public site's
 * entry chunk. `AdminAuthProvider` imports the Supabase client, and it used to
 * wrap the entire app in App.tsx — so every visitor to the home page
 * downloaded GoTrue (auth) + Realtime (websockets) + PostgREST just so the
 * `/admin` login route could work. Nothing on the public site consumes
 * `useAdminAuth`, so the provider belongs here, behind App.tsx's single lazy
 * import of this module.
 *
 * Mounted as a descendant route at `/admin/*`, so the paths below are relative
 * to `/admin`.
 */
const AdminRoutes: React.FC = () => (
  <AdminAuthProvider>
    <Suspense fallback={<SectionSkeleton />}>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        {/* /admin/mfa sits outside RequireAuth so it can host both the
            login-time challenge (aal1 → aal2) and the enrollment flow
            without a redirect loop. It gates itself on `user` inside. */}
        <Route path="mfa" element={<MfaPage />} />
        {/* Pathless layout route: it contributes no URL segment, so the
            children below match directly under the /admin mount point. */}
        <Route
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
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
      </Routes>
    </Suspense>
  </AdminAuthProvider>
);

export default AdminRoutes;
