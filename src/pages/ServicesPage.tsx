import React from 'react';
import Services from '@/features/services';
import PageShell from '@/shared/layout/PageShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

// Standalone /services route so Google (and GBP) have a canonical URL for the
// services offering, not just a #what-i-do anchor on the home page. Eager —
// the Services section IS the page, nothing below the fold to defer.
const ServicesPage: React.FC = () => {
  const { t } = useLanguage();
  useDocumentTitle(t('page_title_services'));
  return (
    <PageShell>
      <Services />
    </PageShell>
  );
};

export default ServicesPage;
