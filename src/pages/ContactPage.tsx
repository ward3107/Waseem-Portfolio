import React from 'react';
import Contact from '@/features/contact/Contact';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

// Contact lives on its own route so cross-page "Start a Project" CTAs land
// directly on the form. Eager import — the section is the whole page, so
// there's nothing below the fold to defer.
const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  useDocumentTitle(t('page_title_contact'));
  return <Contact />;
};

export default ContactPage;
