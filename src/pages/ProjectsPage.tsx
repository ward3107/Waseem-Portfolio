import React from 'react';
import Projects from '@/features/projects/Projects';
import TechStack from '@/features/tech-stack';
import Certifications from '@/features/certifications/Certifications';
import PageShell from '@/shared/layout/PageShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

// Static rather than lazy — see the note in HomePage.tsx. Each section
// rendered unconditionally on mount, so the chunks were fetched immediately
// regardless; the split only bought a round trip and a skeleton that resized
// the page under the reader.

const ProjectsPage: React.FC = () => {
  const { t } = useLanguage();
  useDocumentTitle(t('page_title_projects'));
  return (
    <PageShell>
      <Projects />
      <TechStack />
      <Certifications />
    </PageShell>
  );
};

export default ProjectsPage;
