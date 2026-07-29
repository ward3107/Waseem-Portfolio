import { Project } from '../types';

// Each project carries an optional `github` (external repo) and `screenshots`
// (extra gallery images — first item is used as the card image when `image`
// is missing). Add per-project screenshots under public/assets/projects/<slug>/.
export const getLocalizedProjects = (
  t: (key: string) => string
): Project[] => [
  {
    id: 'souvlaki',
    title: 'Authentic Greek Restaurant',
    category: 'Web',
    description: t('project_1_desc'),
    image: '/assets/souvlaki.webp',
    tech: ['Next.js', 'Tailwind CSS', 'Vercel'],
    link: 'https://souvlaki-kfaryasif.vercel.app/',
    github: 'https://github.com/ward3107/Souvlaki',
  },
  {
    id: 'seatai',
    title: 'SeatAi',
    category: 'AI',
    description: t('project_2_desc'),
    image: '/assets/seatai.webp',
    tech: ['React', 'Three.js', 'Stripe'],
    link: 'https://seatai1-web.vercel.app/',
    github: 'https://github.com/ward3107/seatai1',
  },
  {
    id: 'law-office',
    title: 'Law Office Template',
    category: 'Web',
    description: t('project_3_desc'),
    image: '/assets/law-office.webp',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    link: 'https://lawofice.netlify.app/',
  },
  {
    id: 'shokha',
    title: 'Shokha Barbershop',
    category: 'Web',
    description: t('project_4_desc'),
    image: '/assets/barbershop.webp',
    tech: ['React', 'Node.js', 'MongoDB'],
    link: 'https://shokha1.netlify.app/',
  },
  {
    id: 'vocaband',
    title: 'Vocaband',
    category: 'Web',
    description: t('project_5_desc'),
    image: '/assets/vocaband.webp',
    tech: ['TypeScript', 'React', 'Vite'],
    link: 'https://www.vocaband.com/',
    github: 'https://github.com/ward3107/Vocaband',
  },
];
