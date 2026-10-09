import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight, Check, ChevronRight, Copy, Facebook, Github,
  Globe2, Instagram, Linkedin, MessageCircle, PhoneCall, QrCode,
  Smartphone, UserPlus, X, type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { buildVCard, ONETAP_COPY, safeExternalUrl } from '@/features/onetap/cardData';
import { buildOneTapSharePayload, getWhatsAppLink, normalizeWhatsAppNumber } from '@/features/onetap/shareDetails';
import { useOneTapManifest } from '@/features/onetap/useOneTapManifest';
import '@/features/onetap/OneTapCard.css';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string; platform: string }>;
}

const languages = ['he', 'ar', 'en'] as const;
const UI = {
  he: { copy: 'העתקת כל הפרטים', copied: 'הפרטים הועתקו', detail: 'טלפון • אתר • QR • כרטיס דיגיטלי', tagline: 'TURNING IDEAS INTO IMPACT', motto: 'CONNECT • COLLABORATE • CREATE • GROW' },
  ar: { copy: 'نسخ جميع المعلومات', copied: 'تم نسخ المعلومات', detail: 'الهاتف • الموقع • QR • البطاقة الرقمية', tagline: 'TURNING IDEAS INTO IMPACT', motto: 'CONNECT • COLLABORATE • CREATE • GROW' },
  en: { copy: 'Copy My Info', copied: 'Details copied', detail: 'Phone • Website • QR • Digital Card', tagline: 'TURNING IDEAS INTO IMPACT', motto: 'CONNECT • COLLABORATE • CREATE • GROW' },
};

const OneTapCardPage: React.FC = () => {
  const { language, setLanguage, dir } = useLanguage();
  const contact = useContact();
  const c = ONETAP_COPY[language];
  const ui = UI[language];
  const [nativePrompt, setNativePrompt] = useState<InstallPromptEvent | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'copied' | 'manual'>('none');
  const [manualText, setManualText] = useState('');
  const closeButton = useRef<HTMLButtonElement>(null);
  const copyButton = useRef<HTMLButtonElement>(null);
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
    if (!installHelp && feedback !== 'manual') return;
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInstallHelp(false);
        setFeedback('none');
        copyButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [installHelp, feedback]);

  const dismiss = () => {
    setInstallHelp(false);
    setFeedback('none');
    copyButton.current?.focus();
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
    setFeedback('none');
    const payload = buildOneTapSharePayload(contact, language);
    setManualText(payload.plainText);
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const item = new ClipboardItem({
          'text/plain': new Blob([payload.plainText], { type: 'text/plain' }),
          'text/html': new Blob([payload.html], { type: 'text/html' }),
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(payload.plainText);
      }
      setFeedback('copied');
    } catch {
      try {
        await navigator.clipboard.writeText(payload.plainText);
        setFeedback('copied');
      } catch {
        setFeedback('manual');
      }
    }
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
  const copyDialog = feedback === 'manual';
  const dialogOpen = installHelp || copyDialog;

  return (
    <main className="onetap-screen" dir={dir} aria-label="VASIA OneTap Digital Business Card">
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
            <div className="onetap-orb" aria-label="VASIA">
              <img src="/onetap/vasia-v.svg" width="93" height="93" alt="VASIA logo" />
            </div>
            <p className="onetap-service">{heroRole}</p>
            <p className="onetap-slogan" dir="ltr">{ui.tagline}</p>
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

          <button type="button" className="onetap-copy" onClick={copyMyInfo}
            ref={copyButton} aria-label={ui.copy} aria-live="polite">
            {feedback === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            <span className="onetap-copy-info">
              <span className="onetap-copy-title">{feedback === 'copied' ? ui.copied : ui.copy}</span>
              <span className="onetap-copy-detail">{ui.detail}</span>
            </span>
            <ChevronRight className="onetap-copy-arrow" aria-hidden="true" />
          </button>

          <div className="onetap-tools" role="group" aria-label={language === 'en' ? 'Card actions' : language === 'he' ? 'פעולות כרטיס' : 'إجراءات البطاقة'}>
            <button type="button" className="onetap-tool" onClick={downloadVCard}>
              <UserPlus aria-hidden="true" />
              <span>{c.save}</span>
            </button>
            <button type="button" className="onetap-tool" onClick={addHome}>
              <Smartphone aria-hidden="true" />
              <span>{c.install}</span>
            </button>
            <a className="onetap-tool" href="/qr">
              <QrCode aria-hidden="true" />
              <span>{c.showQr}</span>
            </a>
          </div>

          <footer className="onetap-footer" dir="ltr">
            CONNECT <span>•</span> COLLABORATE <span>•</span> CREATE <span>•</span> GROW
          </footer>
        </article>
      </div>
      {dialogOpen && (
        <div className="onetap-dialog-overlay" role="presentation"
          onMouseDown={e => { if (e.currentTarget === e.target) dismiss(); }}>
          <section className="onetap-dialog" role="dialog" aria-modal="true"
            aria-labelledby="onetap-dialog-title">
            <button ref={closeButton} type="button" className="onetap-dialog-close"
              onClick={dismiss} aria-label={c.close}><X size={21} aria-hidden="true" /></button>
            <img src="/onetap/vasia-v.svg" alt="" width="52" height="52" />
            <h2 id="onetap-dialog-title">{copyDialog ? ui.copy : c.installTitle}</h2>
            {copyDialog ? (
              <>
                <p>{c.manualCopy}</p>
                <textarea readOnly value={manualText} onFocus={e => e.currentTarget.select()}
                  aria-label={ui.copy} rows={5} dir="ltr" />
              </>
            ) : <p>{help}</p>}
            <button type="button" onClick={dismiss} className="onetap-dialog-confirm">
              {c.close}
            </button>
          </section>
        </div>
      )}
    </main>
  );
};

export default OneTapCardPage;
