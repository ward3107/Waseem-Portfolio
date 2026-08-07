import React from 'react';
import Contact from '@/features/contact/Contact';

// Contact lives on its own route so cross-page "Start a Project" CTAs land
// directly on the form. Eager import — the section is the whole page, so
// there's nothing below the fold to defer.
const ContactPage: React.FC = () => <Contact />;

export default ContactPage;
