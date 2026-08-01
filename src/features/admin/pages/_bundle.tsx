import React from 'react';
import Overview from './Overview';
import ProjectsList from './ProjectsList';
import ProjectEditor from './ProjectEditor';
import CertsList from './CertsList';
import CertEditor from './CertEditor';
import ReviewsList from './ReviewsList';
import ReviewEditor from './ReviewEditor';
import CollectTestimonials from './CollectTestimonials';
import Media from './Media';
import Settings from './Settings';

/**
 * One lazy chunk hosts every admin screen so the router doesn't juggle a
 * dozen separate imports. Route uses `<AdminPages page="..." />` to pick.
 */
export type AdminPageKey =
  | 'overview'
  | 'projects-list'
  | 'project-editor'
  | 'certs-list'
  | 'cert-editor'
  | 'reviews-list'
  | 'review-editor'
  | 'collect-testimonials'
  | 'media'
  | 'settings';

const PAGES: Record<AdminPageKey, React.ComponentType> = {
  overview: Overview,
  'projects-list': ProjectsList,
  'project-editor': ProjectEditor,
  'certs-list': CertsList,
  'cert-editor': CertEditor,
  'reviews-list': ReviewsList,
  'review-editor': ReviewEditor,
  'collect-testimonials': CollectTestimonials,
  media: Media,
  settings: Settings,
};

const AdminPages: React.FC<{ page: AdminPageKey }> = ({ page }) => {
  const Cmp = PAGES[page];
  return <Cmp />;
};

export default AdminPages;
