import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Share2, Facebook, Linkedin, Twitter, Link as LinkIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWidgets } from '@/contexts/WidgetContext';

const ShareWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { t } = useLanguage();
  const { widgets } = useWidgets();

  // Subscribe to the router so `url` is recomputed after client-side navigation
  // — otherwise every share targets whatever page was first loaded.
  useLocation();
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = "Check out Waseem's Portfolio!";

  if (!widgets.share) return null;

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
      href: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      color: 'bg-[#25D366] text-white'
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-[#1877F2] text-white'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={20} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'bg-[#0A66C2] text-white'
    },
    {
      name: 'Twitter',
      icon: <Twitter size={20} />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      color: 'bg-[#000000] text-white'
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Waseem Portfolio',
          text: text,
          url: url,
        });
      } catch (err) {
        // User cancelled share or share failed - silently handle
        // No action needed as this is expected behavior
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        showToast(t('share_copied'));
      } catch {
        // Clipboard write can reject (insecure context / denied permission).
        showToast(t('share_copy_failed'));
      }
    } else {
      showToast(t('share_unsupported'));
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="flex fixed bottom-24 left-6 md:bottom-6 z-50 flex-col-reverse items-start gap-4">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-brand-purple text-white rounded-full shadow-lg shadow-brand-purple/50 border border-brand-purpleLight hover:bg-brand-purpleDark transition-all opacity-50 hover:opacity-100"
        aria-label="Share"
        animate={isOpen ? {} : { scale: [1, 1.1, 1] }}
        transition={isOpen ? {} : {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }}
      >
        {isOpen ? <X size={24} /> : <Share2 size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-2"
          >
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${link.color}`}
                title={link.name}
              >
                {link.icon}
              </a>
            ))}
            <button
              onClick={handleNativeShare}
              aria-label={t('share_copied')}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700"
              title={t('share_copied')}
            >
              <LinkIcon size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role="status"
            aria-live="polite"
            className="absolute bottom-full mb-2 left-0 whitespace-nowrap bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareWidget;