import React, { useState } from 'react';
import { Toaster } from 'sonner';
import AdminLayout, { type AdminTab } from '../../components/admin/AdminLayout';
import ProjectsManager from '../../components/admin/ProjectsManager';
import CertificationsManager from '../../components/admin/CertificationsManager';
import ReviewsManager from '../../components/admin/ReviewsManager';

// Toaster mounted here as a bridge — Task 2 moves it into AdminShell alongside
// the new sidebar. Kept close to the admin tree so no other route pays for it.
const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<AdminTab>('projects');
  return (
    <>
      <AdminLayout tab={tab} onTab={setTab}>
        {tab === 'projects' && <ProjectsManager />}
        {tab === 'certifications' && <CertificationsManager />}
        {tab === 'reviews' && <ReviewsManager />}
      </AdminLayout>
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
};

export default AdminDashboard;
