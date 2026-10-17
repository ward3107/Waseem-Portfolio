import { Project } from '@/types';

// Each project carries an optional `github` (external repo) and `screenshots`
// (extra gallery images — first item is used as the card image when `image`
// is missing). Add per-project screenshots under public/assets/projects/<slug>/.
export const getLocalizedProjects = (
  t: (key: string) => string
): Project[] => [
  ...getRequiredPortfolioProjects(t),
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

/**
 * Portfolio entries that must remain visible even when Supabase is configured.
 * Keep MOVA first so its current preview and links also lead Featured Projects.
 */
export const getRequiredPortfolioProjects = (
  t: (key: string) => string
): Project[] => [
  {
    id: 'mova-motion-store',
    title: 'MOVA — Motion Store',
    category: 'WordPress',
    description: t('project_mova_desc'),
    image: '/assets/projects/mova/cover.jpg',
    tech: ['WordPress', 'WooCommerce', 'JavaScript', 'Three.js'],
    link: 'https://wordpress-woocommerce-mova.vercel.app/',
    github: 'https://github.com/ward3107/WordPress-WooCommerce-MOVA',
  },
];

// Suppress retired demos even if older CMS rows use a different slug.
const retiredProjectIds = new Set(['wordpress-studio-demo', 'wordpress-shop-demo']);
const retiredProjectHosts = new Set([
  'waseemstudiodemo.wordpress.com',
  'waseemshopdemo.wordpress.com',
]);

function isRetiredProject(project: Project): boolean {
  if (retiredProjectIds.has(project.id)) return true;
  try {
    return retiredProjectHosts.has(new URL(project.link ?? '').hostname);
  } catch {
    return false;
  }
}

export const mergeRequiredPortfolioProjects = (
  remoteProjects: Project[],
  requiredProjects: Project[]
): Project[] => {
  const requiredIds = new Set(requiredProjects.map((project) => project.id));
  return [
    ...requiredProjects,
    ...remoteProjects.filter(
      (project) => !requiredIds.has(project.id) && !isRetiredProject(project)
    ),
  ];
};
