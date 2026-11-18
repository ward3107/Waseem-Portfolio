import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight, Check, ChevronRight, Copy, Facebook, Github,
  Globe2, Instagram, Linkedin, MessageCircle, PhoneCall, QrCode,
  Smartphone, Share2, UserPlus, X, type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { buildVCard, CARD_URL, ONETAP_COPY, safeExternalUrl } from '@/features/onetap/cardData';
import { buildFacebookMessage, buildOneTapSharePayload, getWhatsAppLink, normalizeWhatsAppNumber } from '@/features/onetap/shareDetails';
import { useOneTapManifest } from '@/features/onetap/useOneTapManifest';
import { resolveOneTapVariant } from '@/features/onetap/variants';
import { PromotionShareButtons } from '@/features/onetap/PromotionShareButtons';
import '@/features/onetap/OneTapCard.css';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string; platform: string }>;
}

// Destination decoded from the owner's supplied Bit QR; never inferred from a phone number.
const BIT_PAYMENT_URL = 'https://www.bitpay.co.il/app/me/4BA960EA-B2B9-7D9A-76D3-F97DBE45FD731EFE';
const PAYMENT_COPY = {
  he: { title: 'תשלום ב־Bit', open: 'פתיחת Bit לתשלום', scan: 'סרקו או פתחו את הקישור לתשלום ב־Bit.', number: 'מספר הטלפון' },
  ar: { title: 'الدفع عبر Bit', open: 'فتح Bit للدفع', scan: 'امسح الرمز أو افتح الرابط للدفع عبر Bit.', number: 'رقم الهاتف' },
  en: { title: 'Pay with Bit', open: 'Open Bit to pay', scan: 'Scan or open the link to pay with Bit.', number: 'Phone number' },
};

const languages = ['he', 'ar', 'en'] as const;
type CopyKind = 'facebook' | 'info' | 'card';
type CopyFeedback =
  | { status: 'copied'; kind: CopyKind }
  | { status: 'manual'; kind: CopyKind; text: string };

const UI = {
  he: {
    copy: 'העתקת כל הפרטים', copied: 'הפרטים הועתקו', detail: 'טלפון • אתר • QR • כרטיס דיגיטלי',
    facebook: 'העתק הודעה לפייסבוק', facebookCopied: 'ההודעה הועתקה', facebookDetail: 'היכרות קצרה וקישור אחד לכרטיס',
    manualText: 'סמנו את הטקסט והעתיקו אותו.',
  },
  ar: {
    copy: 'نسخ جميع المعلومات', copied: 'تم نسخ المعلومات', detail: 'الهاتف • الموقع • QR • البطاقة الرقمية',
    facebook: 'نسخ رسالة لفيسبوك', facebookCopied: 'تم نسخ الرسالة', facebookDetail: 'تعريف قصير ورابط واحد للبطاقة',
    manualText: 'حدّدوا النص وانسخوه.',
  },
  en: {
    copy: 'Copy My Info', copied: 'Details copied', detail: 'Phone • Website • QR • Digital Card',
    facebook: 'Copy message for Facebook', facebookCopied: 'Message copied', facebookDetail: 'A short introduction and one card link',
    manualText: 'Select and copy the text.',
  },
};

const OneTapCardPage: React.FC = () => {
  const { language, setLanguage, dir } = useLanguage();
  const variant = resolveOneTapVariant(window.location.search);
  const contact = useContact();
  const c = ONETAP_COPY[language];
  const ui = UI[language];
  const [nativePrompt, setNativePrompt] = useState<InstallPromptEvent | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [bitHelp, setBitHelp] = useState(false);
  const [feedback, setFeedback] = useState<CopyFeedback | null>(null);
  const copied = feedback?.status === 'copied' ? feedback.kind : null;
  const manual = feedback?.status === 'manual' ? feedback : null;
  const dialogOpen = installHelp || bitHelp || manual !== null;
  const copyLabels = { facebook: ui.facebook, info: ui.copy, card: c.share };
  const payment = PAYMENT_COPY[language];
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const textArea = useRef<HTMLTextAreaElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useDocumentTitle('VASIA OneTap | Digital Business Card');
  useOneTapManifest('/onetap.webmanifest');

  useEffect(() => {
    const listen = (e: Event) => { e.preventDefault(); setNativePrompt(e as InstallPromptEvent); };
    window.addEventListener('beforeinstallprompt', listen);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/onetap-sw.js', { scope: '/' }).catch(() => undefined);
    }
    return () => window.removeEventListener('beforeinstallprompt', listen);
  }, []);

  useEffect(() => {
    if (feedback?.status !== 'copied') return;
    const timer = window.setTimeout(() => setFeedback(null), 2500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!dialogOpen) return;
    const focusTarget = textArea.current ?? closeButton.current;
    focusTarget?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInstallHelp(false);
        setBitHelp(false);
        setFeedback(null);
      }
      if (e.key === 'Tab') {
        const elements = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button, textarea');
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      returnFocus.current?.focus();
    };
  }, [dialogOpen]);

  const dismiss = () => {
    setInstallHelp(false);
    setBitHelp(false);
    setFeedback(null);
  };

  const copyPlainText = async (kind: CopyKind, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback({ status: 'copied', kind });
    } catch {
      setFeedback({ status: 'manual', kind, text });
    }
  };

  const shareCard = async () => {
    setFeedback(null);
    const url = new URL(CARD_URL);
    url.searchParams.set('lang', language);
    if (variant === 'classic') url.searchParams.set('variant', variant);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'VASIA OneTap', text: c.eyebrow, url: url.href });
        return;
      } catch (error) {
        // Closing the share sheet is intentional; do not overwrite the clipboard.
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    await copyPlainText('card', url.href);
  };

  const addHome = async () => {
    if (nativePrompt) {
      try {
        await nativePrompt.prompt();
        await nativePrompt.userChoice;
        setNativePrompt(null);
        return;
      } catch {
        // iOS and some browsers offer only manual Add to Home Screen.
      }
    }
    setInstallHelp(true);
  };

  const downloadVCard = () => {
    const file = new Blob([buildVCard(contact)], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VASIA-Contact.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const copyMyInfo = async () => {
    const payload = buildOneTapSharePayload(contact, language);
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      try {
        const item = new ClipboardItem({
          'text/plain': new Blob([payload.plainText], { type: 'text/plain' }),
          'text/html': new Blob([payload.html], { type: 'text/html' }),
        });
        await navigator.clipboard.write([item]);
        setFeedback({ status: 'copied', kind: 'info' });
        return;
      } catch {
        // Browsers can support plain text even when rich clipboard writes fail.
      }
    }
    await copyPlainText('info', payload.plainText);
  };

  const social: { name: string; url: string; icon: LucideIcon; slug: string }[] = [
    { name: 'LinkedIn', url: contact.linkedin, icon: Linkedin, slug: 'linkedin' },
    { name: 'GitHub', url: contact.github, icon: Github, slug: 'github' },
    { name: 'Instagram', url: contact.instagram, icon: Instagram, slug: 'instagram' },
    { name: 'Facebook', url: contact.facebook, icon: Facebook, slug: 'facebook' },
  ];
  const ua = navigator.userAgent || '';
  const help = /iPhone|iPad|iPod/.test(ua) ? c.installIos : /Android/.test(ua) ? c.installAndroid : c.installDesktop;
  const waLink = getWhatsAppLink(contact.whatsappNumber);
  const number = normalizeWhatsAppNumber(contact.whatsappNumber);
  const heroRole = language === 'he'
    ? 'פיתוח אתרים ואפליקציות • AI • אוטומציה'
    : language === 'ar'
      ? 'تطوير مواقع وتطبيقات • AI • أتمتة'
      : 'Web & App Development • AI Solutions • Automation';

  return (
    <>
    <main className={"onetap-screen onetap--" + variant} dir={dir} aria-label="VASIA OneTap Digital Business Card" inert={dialogOpen}
      onClickCapture={event => {
        if (event.target instanceof Element) returnFocus.current = event.target.closest<HTMLElement>('button, a');
      }}>
      <div className="onetap-shell">
        <article className="onetap-glass">
          <div aria-hidden="true" className="onetap-horizon" />
          <div aria-hidden="true" className="onetap-glow" />

          <header className="onetap-header">
            <a className="onetap-wordmark" href="https://vasia.dev/" aria-label="VASIA website">
              <img src="/onetap/vasia-v.svg" alt="" width="44" height="44" />
              <span className="onetap-wordmark-text" dir="ltr">
                <strong>VASIA</strong>
                <span>One<em>Tap</em></span>
              </span>
            </a>
            <nav className="onetap-lang" aria-label={c.languageLabel} dir="ltr">
              {languages.map(code => (
                <button type="button" key={code} lang={code}
                  onClick={() => setLanguage(code)} aria-pressed={code === language}
                  aria-label={code === 'he' ? 'עברית' : code === 'ar' ? 'العربية' : 'English'}>
                  {code.toUpperCase()}
                </button>
              ))}
            </nav>
          </header>

          <section className="onetap-hero" aria-label="VASIA digital services">
            <p className="onetap-kicker" aria-hidden="true">PEOPLE<br />IDEAS<br />TECHNOLOGY<br />FOR A BETTER<br />TOMORROW</p>
            <p className="onetap-hero-label" aria-hidden="true">IDEAS<br />AUTOMATED<br />FOR A BRIGHTER<br />TOMORROW</p>
            <div className="onetap-orbit-system">
              {variant === 'motion' && (
                <div className="onetap-orbit-effects" aria-hidden="true">
                  <span className="onetap-orbit-ring onetap-orbit-ring--one" />
                  <span className="onetap-orbit-ring onetap-orbit-ring--two" />
                  <span className="onetap-orbit-ring onetap-orbit-ring--three" />
                  {Array.from({ length: 9 }, (_, i) => (
                    <i key={i} className={"onetap-spark onetap-spark--" + i} />
                  ))}
                </div>
              )}
              <div className="onetap-orb" aria-label="VASIA">
              <img src="/onetap/vasia-v.svg" width="93" height="93" alt="VASIA logo" />
            </div>
            </div>
            <p className="onetap-microline" dir="ltr">WEB <span>•</span> APPS <span>•</span> AI</p>
            <p className="onetap-service">{heroRole}</p>
            <p className="onetap-slogan" dir="ltr">TURNING IDEAS INTO IMPACT</p>
          </section>

          <a className="onetap-action onetap-whatsapp" href={waLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="onetap-whatsapp-icon" aria-hidden="true" strokeWidth={2.3} />
            <span>WhatsApp</span>
            <ChevronRight className="onetap-action-end" aria-hidden="true" />
          </a>

          <div className="onetap-quick-links">
            <a className="onetap-action onetap-quick" href="https://vasia.dev/" target="_blank" rel="noopener noreferrer">
              <Globe2 aria-hidden="true" />
              <span>{c.website}</span>
              <ArrowUpRight className="onetap-action-end" aria-hidden="true" />
            </a>
            <a className="onetap-action onetap-quick" href={'tel:+' + number}>
              <PhoneCall aria-hidden="true" />
              <span>{c.call}</span>
              <ArrowUpRight className="onetap-action-end" aria-hidden="true" />
            </a>
          </div>

          <nav className="onetap-socials" aria-label={c.connect} dir="ltr">
            {social.map(({ name, url, icon: Icon, slug }) => {
              const href = safeExternalUrl(url);
              return href ? (
                <a key={name} className={'onetap-social onetap-social--' + slug}
                  href={href} target="_blank" rel="noopener noreferrer" aria-label={name}>
                  <span className="onetap-social-glyph"><Icon aria-hidden="true" /></span>
                  <span className="onetap-social-label">{name}</span>
                </a>
              ) : null;
            })}
          </nav>

          <div className="onetap-secondary-actions">
          <button type="button" className="onetap-copy"
            onClick={() => copyPlainText('facebook', buildFacebookMessage(language))}
            aria-labelledby="onetap-facebook-title" aria-describedby="onetap-facebook-detail">
            {copied === 'facebook' ? <Check aria-hidden="true" /> : <Facebook aria-hidden="true" />}
            <span className="onetap-copy-info">
              <span id="onetap-facebook-title" className="onetap-copy-title" aria-live="polite">
                {copied === 'facebook' ? ui.facebookCopied : ui.facebook}
              </span>
              <span id="onetap-facebook-detail" className="onetap-copy-detail">{ui.facebookDetail}</span>
            </span>
            <ChevronRight className="onetap-copy-arrow" aria-hidden="true" />
          </button>

          <button type="button" className="onetap-bit" onClick={() => setBitHelp(true)} aria-label={payment.title}>
            <span className="onetap-bit-logo" aria-hidden="true" />
            <span>Bit</span>
          </button>
          </div>

          <div className="onetap-tools" role="group" aria-label={language === 'en' ? 'Card actions' : language === 'he' ? 'פעולות כרטיס' : 'إجراءات البطاقة'}>
            <button type="button" className="onetap-tool" onClick={copyMyInfo} title={ui.detail} aria-live="polite">
              {copied === 'info' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              <span>{copied === 'info' ? ui.copied : ui.copy}</span>
            </button>
            <button type="button" className="onetap-tool" onClick={downloadVCard}>
              <UserPlus aria-hidden="true" />
              <span>{c.save}</span>
            </button>
            <button type="button" className="onetap-tool" onClick={addHome}>
              <Smartphone aria-hidden="true" />
              <span>{c.install}</span>
            </button>
            <button type="button" className="onetap-tool" onClick={shareCard} aria-live="polite">
              {copied === 'card' ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
              <span>{copied === 'card' ? c.copied : c.share}</span>
            </button>
            <a className="onetap-tool" href="/qr">
              <QrCode aria-hidden="true" />
              <span>{c.showQr}</span>
            </a>
          </div>

          <PromotionShareButtons language={language} />

          <footer className="onetap-footer" dir="ltr">
            CONNECT <span>•</span> COLLABORATE <span>•</span> CREATE <span>•</span> GROW
          </footer>
        </article>
      </div>
    </main>
      {dialogOpen && (
        <div className="onetap-dialog-overlay" role="presentation"
          onMouseDown={e => { if (e.currentTarget === e.target) dismiss(); }}>
          <section ref={dialogRef} dir={dir} className="onetap-dialog" role="dialog" aria-modal="true"
            aria-labelledby="onetap-dialog-title">
            <button ref={closeButton} type="button" className="onetap-dialog-close"
              onClick={dismiss} aria-label={c.close}><X size={21} aria-hidden="true" /></button>
            <img src="/onetap/vasia-v.svg" alt="" width="52" height="52" />
            <h2 id="onetap-dialog-title">{bitHelp ? payment.title : manual ? copyLabels[manual.kind] : c.installTitle}</h2>
            {bitHelp ? (
              <>
                <p>{payment.scan}</p>
                <img className="onetap-bit-qr" src="/onetap/bit-qr.svg" alt={payment.title + ' QR'} width="280" height="280" />
                <a className="onetap-bit-open" href={BIT_PAYMENT_URL} target="_blank" rel="noopener noreferrer">{payment.open}</a>
              </>
            ) : manual ? (
              <>
                <p>{manual.kind === 'card' ? c.manualCopy : ui.manualText}</p>
                <textarea ref={textArea} readOnly value={manual.text} onFocus={e => e.currentTarget.select()}
                  aria-label={copyLabels[manual.kind]} rows={5} dir={manual.kind === 'card' ? 'ltr' : dir} />
              </>
            ) : <p>{help}</p>}
            <button type="button" onClick={dismiss} className="onetap-dialog-confirm">
              {c.close}
            </button>
          </section>
        </div>
      )}
    </>
  );
};

export default OneTapCardPage;
