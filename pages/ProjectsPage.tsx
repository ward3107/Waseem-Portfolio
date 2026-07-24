import React, { lazy, Suspense } from 'react';
import SectionSkeleton from '../components/SectionSkeleton';

const Projects = lazy(() => import('../components/Projects'));
const TechStack = lazy(() => import('../components/TechStack'));
const Certifications = lazy(() => import('../components/Certifications'));

const ProjectsPage: React.FC = () => (
  <>
    <Suspense fallback={<SectionSkeleton />}>
      <Projects />
    </Suspense>
    <Suspense fallback={<SectionSkeleton />}>
      <TechStack />
    </Suspense>
    <Suspense fallback={<SectionSkeleton />}>
      <Certifications />
    </Suspense>
  </>
);

export default ProjectsPage;
