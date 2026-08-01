import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Copy, ExternalLink, MessageCircle, Send, RefreshCw } from 'lucide-react';
import Topbar from '@/features/admin/layout/Topbar';

// Where does a client actually land? Prefer VITE_SITE_URL when set (custom
// domain in prod), otherwise fall back to the current window origin so the
// preview iframe and copy buttons always match what the admin is seeing.
const siteOrigin = (): string => {
  const configured = import.meta.env.VITE_SITE_URL;
  if (configured && configured.length > 0) return configured.replace(/\/+$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};

interface Template {
  code: 'he' | 'en' | 'ar';
  label: string;
  dir: 'rtl' | 'ltr';
  build: (name: string, url: string) => string;
}

const TEMPLATES: Template[] = [
  {
    code: 'he',
    label: 'עברית',
    dir: 'rtl',
    build: (name, url) =>
      `היי${name ? ' ' + name : ''} 🙏\n` +
      'תודה על העבודה המשותפת. אני אוסף המלצות מלקוחות כדי לעזור לעסקים אחרים להחליט.\n' +
      'אשמח אם תוכל/י למלא 30 שניות פה:\n' +
      url,
  },
  {
    code: 'en',
    label: 'English',
    dir: 'ltr',
    build: (name, url) =>
      `Hi${name ? ' ' + name : ''} 🙏\n` +
      'Thanks for the collaboration. I collect short testimonials to help other businesses decide.\n' +
      'Would you take 30 seconds to fill this out?\n' +
      url,
  },
  {
    code: 'ar',
    label: 'العربية',
    dir: 'rtl',
    build: (name, url) =>
      `مرحباً${name ? ' ' + name : ''} 🙏\n` +
      'شكراً على التعاون. أجمع توصيات قصيرة لمساعدة الأعمال الأخرى على اتخاذ قرارها.\n' +
      'هل يمكنك ملء 30 ثانية هنا؟\n' +
      url,
  },
];

// Normalize phone to E.164 digits (no +, spaces, hyphens). WhatsApp's wa.me
// URL is strict: bare digits only. We keep +, digits, and leading zero
// handling minimal — 972 stays if given, "0" → replaced with 972 if the
// user just types a local Israeli mobile like 054...
const normalizePhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  return digits;
};

const CopyButton: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed — please copy manually');
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40"
    >
      <Copy size={12} aria-hidden="true" />
      {copied ? 'Copied' : label ?? 'Copy'}
    </button>
  );
};

const CollectTestimonials: React.FC = () => {
  const shareUrl = `${siteOrigin()}/share-testimonial`;
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [previewKey, setPreviewKey] = useState(0);

  const messages = useMemo(
    () => TEMPLATES.map((tpl) => ({ ...tpl, text: tpl.build(clientName.trim(), shareUrl) })),
    [clientName, shareUrl]
  );

  const openWhatsApp = (text: string) => {
    const phone = normalizePhone(clientPhone);
    const encoded = encodeURIComponent(text);
    const url = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Topbar title="Collect Testimonials" />
      <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Send this link to a client after each project. They fill a 30-second form; the
          submission lands in <span className="font-semibold">Reviews</span> as{' '}
          <span className="rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-xs font-bold">
            pending
          </span>{' '}
          for you to approve.
        </p>

        {/* URL card */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Shareable link
            </h3>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
            >
              Open <ExternalLink size={11} aria-hidden="true" />
            </a>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="flex-1 min-w-0 truncate rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100">
              {shareUrl}
            </code>
            <CopyButton text={shareUrl} label="Copy link" />
          </div>
        </div>

        {/* Personalize inputs */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
            Personalize (optional)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Client name
              </span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. אופק"
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Client WhatsApp number
              </span>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="050-1234567 or +972501234567"
                dir="ltr"
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple"
              />
              <span className="block text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">
                Leave empty to send without a preselected contact.
              </span>
            </label>
          </div>
        </div>

        {/* WhatsApp templates */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
            WhatsApp templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {messages.map((msg) => (
              <div
                key={msg.code}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {msg.label}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                    {msg.code}
                  </span>
                </div>
                <pre
                  dir={msg.dir}
                  className="flex-1 p-4 text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed"
                >
                  {msg.text}
                </pre>
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
                  <CopyButton text={msg.text} label="Copy" />
                  <button
                    type="button"
                    onClick={() => openWhatsApp(msg.text)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#25D366] text-white hover:bg-[#20c05a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40"
                  >
                    <Send size={12} aria-hidden="true" />
                    Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Live preview
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewKey((k) => k + 1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-brand-purple"
              >
                <RefreshCw size={11} aria-hidden="true" /> Reload
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
              >
                Open in new tab <ExternalLink size={11} aria-hidden="true" />
              </a>
            </div>
          </div>
          <iframe
            key={previewKey}
            src={shareUrl}
            title="Share-testimonial page preview"
            loading="lazy"
            className="w-full h-[720px] bg-white block"
          />
        </div>

        {/* Tips */}
        <div className="rounded-xl border border-brand-purple/20 bg-brand-purple/5 dark:bg-brand-purple/10 p-4 sm:p-5 text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-brand-purple">
            <MessageCircle size={14} aria-hidden="true" />
            Tips for higher response rates
          </div>
          <ul className="list-disc ms-6 space-y-1 text-[13px] leading-relaxed">
            <li>Send the link within 24 hours of finishing a project — while the feeling is fresh.</li>
            <li>A gentle nudge 2–3 days later ("Any chance for that quick 30-second review?") doubles response rate.</li>
            <li>Personalize with the client's name — the templates auto-inject it above.</li>
            <li>For in-person meetings, generate a QR from the shareable link with any QR service and print it on a business card.</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default CollectTestimonials;
