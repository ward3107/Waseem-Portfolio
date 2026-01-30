import { Code, Globe, Cpu, Zap, Layout, Bot, Server, Shield, Box } from 'lucide-react';
import { NavLink, Service, Project, TimelineItem, FAQItem, TechItem, Language } from './types';

export const LOGO_SRC = "https://placehold.co/400x400/483AA0/FFFFFF?text=WS"; // Replace with your logo path e.g. "/logo.png"

export const NAV_LINKS: Record<Language, NavLink[]> = {
  en: [
    { name: 'Services', href: '#what-i-do' },
    { name: 'AI Solutions', href: '#ai-automation' },
    { name: 'Projects', href: '#projects' },
    { name: 'About', href: '#about' },
    { name: 'Blog', href: '#blog' },
    { name: 'Contact', href: '#contact' },
  ],
  he: [
    { name: 'שירותים', href: '#what-i-do' },
    { name: 'פתרונות AI', href: '#ai-automation' },
    { name: 'פרויקטים', href: '#projects' },
    { name: 'אודות', href: '#about' },
    { name: 'בלוג', href: '#blog' },
    { name: 'צור קשר', href: '#contact' },
  ],
  ar: [
    { name: 'خدمات', href: '#what-i-do' },
    { name: 'حلول AI', href: '#ai-automation' },
    { name: 'مشاريع', href: '#projects' },
    { name: 'من أنا', href: '#about' },
    { name: 'المدونة', href: '#blog' },
    { name: 'اتصل بي', href: '#contact' },
  ]
};

export const SERVICES: Service[] = [
  {
    title: 'Full Stack Dev',
    description: 'End-to-end web applications using Next.js, React, and Node.js. Scalable, secure, and fast.',
    icon: Code,
    color: 'text-brand-purple'
  },
  {
    title: 'Digital Products',
    description: 'Converting ideas into profitable SaaS platforms and e-commerce solutions.',
    icon: Layout,
    color: 'text-brand-blue'
  },
  {
    title: 'AI Automation',
    description: 'Custom AI chatbots, workflow automation, and intelligent data processing.',
    icon: Bot,
    color: 'text-brand-teal'
  },
  {
    title: 'Websites',
    description: 'High-performance marketing sites that convert visitors into loyal customers.',
    icon: Globe,
    color: 'text-brand-orange'
  },
  {
    title: '3D Animated Frontend',
    description: 'Immersive 3D experiences and fluid animations that bring your digital presence to life.',
    icon: Box,
    color: 'text-brand-gold'
  }
];

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Nexus AI Dashboard',
    category: 'AI',
    description: 'A comprehensive analytics dashboard for AI model performance tracking.',
    image: 'https://picsum.photos/seed/nexus/600/400',
    tech: ['Next.js', 'Python', 'TensorFlow'],
    link: '#'
  },
  {
    id: '2',
    title: 'E-Commerce Gold',
    category: 'Web',
    description: 'Luxury jewelry e-commerce platform with 3D product viewer.',
    image: 'https://picsum.photos/seed/gold/600/400',
    tech: ['React', 'Three.js', 'Stripe'],
    link: '#'
  },
  {
    id: '3',
    title: 'Vibe Chat',
    category: 'Mobile',
    description: 'Real-time messaging app with instant translation features.',
    image: 'https://picsum.photos/seed/vibe/600/400',
    tech: ['React Native', 'Firebase', 'Google Cloud'],
    link: '#'
  }
];

export const TIMELINE: TimelineItem[] = [
  {
    year: '2025',
    title: 'Vibe Coding & Design',
    description: 'Professing the art of vibe coding and design, merging aesthetics with high-performance engineering.'
  },
  {
    year: '2024',
    title: 'Senior Full Stack Dev',
    description: 'Architected scalable SaaS solutions serving 10k+ daily users.'
  },
  {
    year: '2022',
    title: 'Started Journey',
    description: 'Began freelancing and building custom web solutions for local businesses.'
  }
];

export const TECH_STACK: TechItem[] = [
  { name: 'React', icon: '⚛️', category: 'Frontend' },
  { name: 'Next.js', icon: '▲', category: 'Frontend' },
  { name: 'Tailwind', icon: '🎨', category: 'Frontend' },
  { name: 'Node.js', icon: '🟩', category: 'Backend' },
  { name: 'Python', icon: '🐍', category: 'Backend' },
  { name: 'Docker', icon: '🐳', category: 'DevOps' },
  { name: 'OpenAI', icon: '🧠', category: 'AI' },
  { name: 'PostgreSQL', icon: '🐘', category: 'Backend' },
];

export const FAQS: FAQItem[] = [
  {
    question: 'How long does a typical project take?',
    answer: 'Timeline varies by complexity. A standard brochure site takes 1-2 weeks, while complex SaaS platforms can take 1-3 months.'
  },
  {
    question: 'Do you offer ongoing support?',
    answer: 'Yes, I offer maintenance packages to ensure your software remains secure, updated, and performant.'
  },
  {
    question: 'What is "Vibe Coding"?',
    answer: 'It is my philosophy of blending technical precision with intuitive, user-centric design flow to create software that feels "alive".'
  },
  {
    question: 'Can you work with existing teams?',
    answer: 'Absolutely. I have extensive experience integrating into existing workflows, using Jira, GitHub, and Agile methodologies.'
  },
  {
    question: 'What is your pricing model?',
    answer: 'I typically work on a project-based pricing model, but I am open to hourly billing for consultation or maintenance tasks.'
  },
  {
    question: 'Do you handle hosting and domain setup?',
    answer: 'Yes, I can handle the entire deployment process, including server setup, domain configuration, and SSL certificates.'
  },
  {
    question: 'Are your websites SEO friendly?',
    answer: 'Yes, all websites are built with SEO best practices in mind, including semantic HTML, fast loading times, and mobile optimization.'
  }
];