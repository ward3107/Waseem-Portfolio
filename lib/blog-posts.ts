export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  readTime: string;
  category: 'portfolio' | 'ai' | 'web-dev';
  image: string;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Building an AI-Powered Portfolio: Behind the Scenes",
    excerpt: "How I used React, Framer Motion, and AI tools to create an interactive portfolio that converts visitors into clients.",
    content: "Full article content here...",
    date: "Jan 2025",
    readTime: "5 min",
    category: "portfolio",
    image: "/assets/blog/portfolio-behind-scenes.jpg",
    tags: ['React', 'Portfolio', 'AI']
  },
  {
    id: 2,
    title: "5 Ways AI Automation Can Transform Your Business in 2025",
    excerpt: "From chatbots to workflow automation, discover how AI is revolutionizing small business operations.",
    content: "Full article content...",
    date: "Jan 2025",
    readTime: "7 min",
    category: "ai",
    image: "/assets/blog/ai-automation.jpg",
    tags: ['AI', 'Automation', 'Business']
  },
  {
    id: 3,
    title: "Why Your Website Needs Dark Mode (And How to Implement It)",
    excerpt: "Dark mode isn't just a trend - it's accessibility, battery saving, and user preference. Here's how to add it properly.",
    content: "Full article content...",
    date: "Dec 2024",
    readTime: "4 min",
    category: "web-dev",
    image: "/assets/blog/dark-mode.jpg",
    tags: ['CSS', 'Accessibility', 'UI/UX']
  },
  {
    id: 4,
    title: "New Project: E-Commerce Platform Launch",
    excerpt: "Just completed a full-stack e-commerce platform with Next.js, Stripe integration, and AI-powered recommendations.",
    content: "Full article content...",
    date: "Dec 2024",
    readTime: "6 min",
    category: "portfolio",
    image: "/assets/blog/ecommerce-project.jpg",
    tags: ['Next.js', 'E-Commerce', 'Stripe']
  },
  {
    id: 5,
    title: "Building Chatbots That Actually Work",
    excerpt: "Lessons learned from deploying AI chatbots for client websites. What works, what doesn't, and how to measure success.",
    content: "Full article content...",
    date: "Nov 2024",
    readTime: "8 min",
    category: "ai",
    image: "/assets/blog/chatbots.jpg",
    tags: ['Chatbots', 'AI', 'UX']
  },
  {
    id: 6,
    title: "React vs Next.js: When to Use What",
    excerpt: "A practical guide to choosing between React and Next.js for your next project. Performance, SEO, and development experience compared.",
    content: "Full article content...",
    date: "Nov 2024",
    readTime: "5 min",
    category: "web-dev",
    image: "/assets/blog/react-nextjs.jpg",
    tags: ['React', 'Next.js', 'Performance']
  }
];
