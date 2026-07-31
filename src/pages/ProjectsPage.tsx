import React, { lazy, Suspense } from 'react';
import SectionSkeleton from '@/shared/ui/SectionSkeleton';

const Projects = lazy(() => import('@/features/projects/Projects'));
const TechStack = lazy(() => import('@/features/tech-stack'));
const Certifications = lazy(() => import('@/features/certifications/Certifications'));

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
