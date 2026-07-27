import React, { useState } from 'react';
import AdminLayout, { type AdminTab } from '../../components/admin/AdminLayout';
import ProjectsManager from '../../components/admin/ProjectsManager';
import CertificationsManager from '../../components/admin/CertificationsManager';
import ReviewsManager from '../../components/admin/ReviewsManager';

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<AdminTab>('projects');
  return (
    <AdminLayout tab={tab} onTab={setTab}>
      {tab === 'projects' && <ProjectsManager />}
      {tab === 'certifications' && <CertificationsManager />}
      {tab === 'reviews' && <ReviewsManager />}
    </AdminLayout>
  );
};

export default AdminDashboard;
