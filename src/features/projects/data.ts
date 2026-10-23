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
    link: 'https://www.greeksouflaki.com/',
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
 * Curated projects stay available alongside the editable CMS portfolio.
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
  {
    id: 'nacre-ocean-atelier',
    title: 'NACRE — Ocean Atelier',
    category: 'Web',
    description: t('project_nacre_desc'),
    image: '/assets/projects/nacre/cover.webp',
    screenshots: ['/assets/projects/nacre/cover.webp', '/assets/projects/nacre/product.svg'],
    tech: ['Three.js', 'WebGL', 'JavaScript'],
    link: 'https://nacre-ocean-atelier.vasele66.chatgpt.site/',
  },
  {
    id: 'softec-vision',
    title: 'Softec Vision',
    category: 'Web',
    description: t('project_softec_desc'),
    image: '/assets/projects/softec/cover.png',
    tech: ['Next.js', 'TypeScript', 'Supabase'],
    link: 'https://www.softec.co.il/',
    github: 'https://github.com/ward3107/softec-vision',
  },
  {
    id: 'biznix',
    title: 'BizNix',
    category: 'Web',
    description: t('project_biznix_desc'),
    image: '/assets/projects/biznix/cover.svg',
    tech: ['React', 'TypeScript', 'Supabase'],
    link: 'https://biznix.app/',
  },
  {
    id: 'kiwi',
    title: 'Kiwi — Talking Robot',
    category: 'AI',
    description: t('project_kiwi_desc'),
    image: '/assets/projects/kiwi/cover.svg',
    tech: ['React', 'Three.js', 'OpenAI Realtime'],
    link: 'https://kidfin-three.vercel.app/#demo',
    github: 'https://github.com/ward3107/KIDFIN',
  },
  {
    id: 'shayish-kfar-yassif',
    title: 'Shayish Kfar Yassif',
    category: 'Web',
    description: t('project_shayish_desc'),
    image: '/assets/projects/shayish/cover.jpg',
    tech: ['React', 'TypeScript', 'Three.js'],
    link: 'https://shayish-kfar-yassif.vercel.app/',
    github: 'https://github.com/ward3107/Shayish-Kfar-Yassif',
  },
  {
    id: 'ninnyo-flowers',
    title: 'NINNYO Flowers',
    category: 'Web',
    description: t('project_ninnyo_desc'),
    image: '/assets/projects/ninnyo/cover.jpg',
    tech: ['HTML', 'CSS', 'JavaScript'],
    link: 'https://ninnyo.vercel.app/',
    github: 'https://github.com/ward3107/NINNYO-FLOWERS',
  },
  {
    id: 'vocabagrut',
    title: 'VocaBagrut',
    category: 'AI',
    description: t('project_vocabagrut_desc'),
    image: '/assets/projects/vocabagrut/cover.svg',
    tech: ['React', 'TypeScript', 'Supabase'],
    link: 'https://voca-bagrut.vercel.app/',
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

function projectIdentityKeys(project: Project): string[] {
  const keys = [`id:${project.id}`];
  for (const href of [project.link, project.github]) {
    if (!href) continue;
    try {
      const url = new URL(href);
      const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
      const pathname = url.pathname.replace(/\/$/, '').replace(/\.git$/, '');
      keys.push(`url:${hostname}${pathname}`);
    } catch { /* Missing or invalid URLs must not hide an unrelated draft. */ }
  }
  return keys;
}

export const mergeRequiredPortfolioProjects = (
  remoteProjects: Project[],
  requiredProjects: Project[]
): Project[] => {
  const seen = new Set(requiredProjects.flatMap(projectIdentityKeys));
  return [
    ...requiredProjects,
    ...remoteProjects.filter((project) => {
      const keys = projectIdentityKeys(project);
      if (isRetiredProject(project) || keys.some((key) => seen.has(key))) return false;
      keys.forEach((key) => seen.add(key));
      return true;
    }),
  ];
};
