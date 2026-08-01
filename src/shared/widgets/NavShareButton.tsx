import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Facebook, Linkedin, Twitter, Link as LinkIcon, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Header-hosted share button. Replaces the floating ShareWidget so the
// mobile viewport isn't cluttered with corner widgets.
//
// Flow:
// - Tap → try `navigator.share()` (native share sheet on mobile; Chrome/Edge
//   on desktop). That's the fastest one-tap flow for everyone.
// - Where it isn't supported (Safari desktop) or the user cancels, we open
//   a small popover with the same links the old ShareWidget had.
//
// Route-aware: subscribes to useLocation() so the shared URL always
// reflects the page the visitor is looking at now, not the first paint.

interface NavShareButtonProps {
  className?: string;
}

const NavShareButton: React.FC<NavShareButtonProps> = ({ className = '' }) => {
  const { t, dir } = useLanguage();
  useLocation(); // recompute URL on client-side nav
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = t('share_page_intent') || "Check out Waseem's Portfolio";

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click and Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleClick = async () => {
    const supported = typeof navigator !== 'undefined' && 'share' in navigator;
    if (supported) {
      try {
        await navigator.share({ url, text, title: text });
        return;
      } catch {
        // User cancelled or share threw — fall through to the popover so
        // they can still copy the link or pick a specific network.
      }
    }
    setOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — noop, the popover still shows social links */
    }
  };

  const links: Array<{
    key: string;
    name: string;
    icon: React.ReactNode;
    href: string;
    color: string;
  }> = [
    {
      key: 'wa',
      name: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      color: 'bg-[#25D366]',
    },
    {
      key: 'fb',
      name: 'Facebook',
      icon: <Facebook size={16} aria-hidden="true" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-[#1877F2]',
    },
    {
      key: 'li',
      name: 'LinkedIn',
      icon: <Linkedin size={16} aria-hidden="true" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'bg-[#0A66C2]',
    },
    {
      key: 'tw',
      name: 'X · Twitter',
      icon: <Twitter size={16} aria-hidden="true" />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      color: 'bg-[#000]',
    },
  ];

  const alignEndClass = dir === 'rtl' ? 'left-0' : 'right-0';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={t('share_button_aria') || 'Share this page'}
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-purple dark:hover:text-brand-purpleLight hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
      >
        <Share2 size={20} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-2 ${alignEndClass} w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50`}
          >
            <ul className="py-2">
              {links.map((l) => (
                <li key={l.key}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => setOpen(false)}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white ${l.color}`}
                    >
                      {l.icon}
                    </span>
                    {l.name}
                  </a>
                </li>
              ))}
              <li className="mt-1 border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  type="button"
                  onClick={copyLink}
                  className="w-full text-start flex items-center gap-3 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    {copied ? <Check size={16} aria-hidden="true" /> : <LinkIcon size={16} aria-hidden="true" />}
                  </span>
                  {copied ? t('share_copied') || 'Copied' : t('share_copy_link') || 'Copy link'}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavShareButton;
