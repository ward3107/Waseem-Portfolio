// One-time seed of current portfolio content into Supabase.
// Usage (do NOT commit the key):
//   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/seed-supabase.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.');
  process.exit(1);
}
const supabase = createClient(url, key);

const projects = [
  { slug: 'souvlaki', title: 'Authentic Greek Restaurant', category: 'Web',
    description: { en: 'A modern site for an authentic Greek restaurant.' },
    image_url: '/assets/souvlaki.webp', tech: ['Next.js', 'Tailwind CSS', 'Vercel'],
    link: 'https://souvlaki-kfaryasif.vercel.app/', github: 'https://github.com/ward3107/Souvlaki',
    screenshots: [], sort_order: 1 },
  { slug: 'seatai', title: 'SeatAi', category: 'AI',
    description: { en: 'An AI-powered seating application.' },
    image_url: '/assets/seatai.webp', tech: ['React', 'Three.js', 'Stripe'],
    link: 'https://seatai1-web.vercel.app/', github: 'https://github.com/ward3107/seatai1',
    screenshots: [], sort_order: 2 },
  { slug: 'law-office', title: 'Law Office Template', category: 'Web',
    description: { en: 'A professional template for a law office.' },
    image_url: '/assets/law-office.webp', tech: ['React', 'Vite', 'Tailwind CSS'],
    link: 'https://lawofice.netlify.app/', github: null, screenshots: [], sort_order: 3 },
  { slug: 'shokha', title: 'Shokha Barbershop', category: 'Web',
    description: { en: 'A booking-ready site for a barbershop.' },
    image_url: '/assets/barbershop.webp', tech: ['React', 'Node.js', 'MongoDB'],
    link: 'https://shokha1.netlify.app/', github: null, screenshots: [], sort_order: 4 },
  { slug: 'vocaband', title: 'Vocaband', category: 'Web',
    description: { en: 'A site for the Vocaband project.' },
    image_url: '/assets/vocaband.webp', tech: ['TypeScript', 'React', 'Vite'],
    link: 'https://www.vocaband.com/', github: 'https://github.com/ward3107/Vocaband',
    screenshots: [], sort_order: 5 },
  { slug: 'christmas-sale', title: 'Christmas Sale Landing', category: 'Web',
    description: { en: 'A festive sale landing page.' },
    image_url: '/assets/christmas-sale.webp', tech: ['TypeScript', 'React', 'Netlify'],
    link: 'https://salewebsite.netlify.app/', github: 'https://github.com/ward3107/christmas-sale-landing',
    screenshots: [], sort_order: 6 },
];

const certifications = [
  { slug: 'ai-performance-ads-1', title: { en: 'AI-Powered Performance Ads Certification' },
    issuer: 'Google Skillshop', issue_date: '2026-07-16', expiry_date: '2027-07-16',
    credential_url: 'https://www.credential.net/8fe73bad-d0b7-4a10-aef1-efca931a3386', image_url: null, sort_order: 1 },
  { slug: 'ai-performance-ads-2', title: { en: 'AI-Powered Performance Ads Certification' },
    issuer: 'Google Skillshop', issue_date: '2026-07-16', expiry_date: '2027-07-16',
    credential_url: 'https://www.credential.net/6185076b-3c05-4916-abfd-3ae205c92cdb', image_url: null, sort_order: 2 },
  { slug: 'google-ads-search', title: { en: 'Google Ads Search Professional Certification (2026)' },
    issuer: 'Google Skillshop', issue_date: '2026-07-16', expiry_date: '2027-07-16',
    credential_url: 'https://www.credential.net/327a9f94-7605-44fe-8237-f9ae705f7ec8', image_url: null, sort_order: 3 },
  { slug: 'ai-shopping-ads', title: { en: 'AI-Powered Shopping Ads Certification' },
    issuer: 'Google Skillshop', issue_date: '2026-07-17', expiry_date: '2027-07-17',
    credential_url: 'https://www.credential.net/df4ab345-1a92-4f1d-9a32-de0ba8032d5a', image_url: null, sort_order: 4 },
];

const { error: pErr } = await supabase.from('projects').upsert(projects, { onConflict: 'slug' });
if (pErr) { console.error('projects:', pErr.message); process.exit(1); }
const { error: cErr } = await supabase.from('certifications').upsert(certifications, { onConflict: 'slug' });
if (cErr) { console.error('certifications:', cErr.message); process.exit(1); }
console.log(`Seeded ${projects.length} projects and ${certifications.length} certifications.`);
