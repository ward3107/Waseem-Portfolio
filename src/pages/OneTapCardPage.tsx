import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight, Check, Copy, UserPlus, Facebook, Github, Globe2,
  Instagram, Linkedin, MessageCircle, PhoneCall, QrCode, Share2,
  Smartphone, X, type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { buildVCard, CARD_URL, digitsOnly, ONETAP_COPY, safeExternalUrl } from '@/features/onetap/cardData';
import { useOneTapManifest } from '@/features/onetap/useOneTapManifest';
import { buildOneTapSharePayload } from '@/features/onetap/shareDetails';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string; platform: string }>;
}

const languages = ['he', 'ar', 'en'] as const;

const OneTapCardPage: React.FC = () => {
  const { language, setLanguage, dir } = useLanguage();
  const contact = useContact();
  const c = ONETAP_COPY[language];
  const [nativePrompt, setNativePrompt] = useState<InstallPromptEvent | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'copied' | 'manual'>('none');
  const [manualText, setManualText] = useState('');
  const phone = digitsOnly(contact.whatsappNumber);
  useDocumentTitle('VASIA OneTap | Waseem Abu Akel');
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
    if (!installHelp) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setInstallHelp(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [installHelp]);

  const addHome = async () => {
    if (nativePrompt) {
      try {
        await nativePrompt.prompt();
        await nativePrompt.userChoice;
        setNativePrompt(null);
        return;
      } catch { /* Native prompts are not universal. */ }
    }
    setInstallHelp(true);
  };

  const downloadVCard = () => {
    const file = new Blob([buildVCard(contact)], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VASIA-Waseem-Abu-Akel.vcf';
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

  const social: { name: string; url: string; icon: LucideIcon; color: string }[] = [
    { name: 'Instagram', url: contact.instagram, icon: Instagram, color: 'text-pink-600' },
    { name: 'Facebook', url: contact.facebook, icon: Facebook, color: 'text-blue-600' },
    { name: 'LinkedIn', url: contact.linkedin, icon: Linkedin, color: 'text-blue-700' },
    { name: 'GitHub', url: contact.github, icon: Github, color: 'text-slate-800' },
  ];
  const ua = navigator.userAgent;
  const help = /iPhone|iPad|iPod/.test(ua) ? c.installIos : /Android/.test(ua) ? c.installAndroid : c.installDesktop;

  return (
    <main dir={dir} className="relative isolate min-h-[100dvh] overflow-hidden bg-[#F3F6FC] text-[#192640]">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 h-96 w-96 rounded-full bg-[#91EDDE]/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-28 top-40 h-96 w-96 rounded-full bg-[#B3C5FF]/50 blur-3xl" />
      <div className="relative mx-auto w-full max-w-[540px] px-4 pb-8 pt-5 sm:pt-9">
        <header className="flex items-center justify-between gap-3">
          <a href="/" aria-label="VASIA website" className="flex min-h-12 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-[#473BB3]">
            <img src="/favicon.svg" width="40" height="40" className="h-10 w-10 rounded-xl" alt="" />
            <span dir="ltr" className="font-heading text-xl font-bold tracking-[.14em] text-[#1A2448]">VASIA</span>
          </a>
          <nav aria-label={c.languageLabel} dir="ltr" className="flex gap-1 rounded-full border border-[#DCE3EF] bg-white/90 p-1 shadow-sm">
            {languages.map((code) => (
              <button type="button" key={code} aria-pressed={code === language} lang={code} onClick={() => setLanguage(code)}
                className={'min-h-10 min-w-10 rounded-full px-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-[#473BB3] ' +
                  (language === code ? 'bg-[#233A78] text-white' : 'text-[#53617B] hover:bg-[#EDF2FC]')}>
                {code.toUpperCase()}
              </button>
            ))}
          </nav>
        </header>
        <article className="mt-5 overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_26px_70px_-32px_rgba(22,42,90,0.43)]">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#121B45] via-[#293A83] to-[#166A8C] px-6 pb-8 pt-8 text-white sm:px-8">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full border-[40px] border-[#58E7E2]/15" />
            <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-[#7660E5]/35 blur-2xl" />
            <div className="relative flex items-center justify-between gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[.12em] text-[#D9F7FD]">{c.eyebrow}</span>
              <span className="rounded-full bg-white/15 px-2.5 py-1.5 text-xs font-bold tracking-wide text-[#CCFFEF]">OneTap</span>
            </div>
            <div className="relative mt-7 flex items-start gap-4">
              <img src="/brand/vasia-profile.png" width="86" height="86" className="h-[86px] w-[86px] shrink-0 rounded-[22px] border-4 border-white/20 shadow-xl" alt="VASIA" />
              <div className="min-w-0 pt-1">
                <p className="text-sm font-medium text-[#B3E4F5]">{c.headline}</p>
                <h1 dir="ltr" className="mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-[28px]">Waseem Abu Akel</h1>
                <p className="mt-1.5 text-sm font-bold tracking-[.13em] text-[#7DE2EE]">VASIA DIGITAL</p>
              </div>
            </div>
            <p className="relative mt-6 text-sm leading-6 text-[#E1EAFC] sm:text-base">{c.role}</p>
          </section>
          <div className="p-5 sm:p-7">
            <a href={'https://wa.me/' + phone} target="_blank" rel="noopener noreferrer"
              className="flex min-h-[62px] items-center justify-center gap-3 rounded-2xl bg-[#12865A] px-4 text-center text-base font-bold text-white shadow-[0_12px_26px_-10px_rgba(18,134,90,0.6)] transition-transform hover:-translate-y-0.5 hover:bg-[#0D704A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#12865A]">
              <MessageCircle size={24} aria-hidden />
              <span>{c.chat}</span>
              <ArrowUpRight size={18} aria-hidden />
            </a>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <a href="https://www.vasia.dev/" target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#D7E0F0] bg-[#F7F9FD] px-2 text-sm font-semibold text-[#1B3F85] hover:bg-[#EEF2FF] focus-visible:outline-2 focus-visible:outline-[#473BB3]">
                <Globe2 size={19} aria-hidden /> {c.website}
              </a>
              <a href={'tel:+' + phone} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#D7E0F0] bg-[#F7F9FD] px-2 text-sm font-semibold text-[#1B3F85] hover:bg-[#EEF2FF] focus-visible:outline-2 focus-visible:outline-[#473BB3]">
                <PhoneCall size={18} aria-hidden /> {c.call}
              </a>
            </div>
            <div className="mt-7">
              <h2 className="mb-3 text-xs font-extrabold tracking-[.13em] text-[#6E7C96]">{c.connect}</h2>
              <ul className="grid grid-cols-2 gap-2.5">
                {social.map(({ name, url, icon: Icon, color }) => {
                  const href = safeExternalUrl(url);
                  return href ? (
                    <li key={name}>
                      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={name}
                        className="flex min-h-14 items-center gap-2.5 rounded-2xl border border-[#E6EBF4] bg-white px-3 text-sm font-semibold text-[#273653] shadow-sm hover:border-[#BECDED] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#473BB3]">
                        <Icon size={21} className={color} aria-hidden />
                        <span>{name}</span>
                        <ArrowUpRight size={15} className="ms-auto text-[#A5B1C5]" aria-hidden />
                      </a>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
            <div className="mt-6 border-t border-[#E8EDF5] pt-5">
              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" onClick={downloadVCard} className="flex min-h-[55px] items-center justify-center gap-2 rounded-2xl bg-[#E9EDFF] px-2 text-xs font-bold text-[#3B319C] hover:bg-[#DBE1FF] focus-visible:outline-2 focus-visible:outline-[#473BB3] sm:text-sm">
                  <UserPlus size={19} aria-hidden /> {c.save}
                </button>
                <button type="button" onClick={addHome} className="flex min-h-[55px] items-center justify-center gap-2 rounded-2xl bg-[#EAF7F4] px-2 text-xs font-bold text-[#136F65] hover:bg-[#D8F0E9] focus-visible:outline-2 focus-visible:outline-[#136F65] sm:text-sm">
                  <Smartphone size={19} aria-hidden /> {c.install}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#4D6089]">
                <button type="button" onClick={copyMyInfo} className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 hover:bg-[#F1F5FC] focus-visible:outline-2 focus-visible:outline-[#473BB3]">
                  {feedback === 'copied' ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                  {feedback === 'copied' ? c.copied : ({ he: 'העתקת כל הפרטים', ar: 'نسخ جميع المعلومات', en: 'Copy My Info' })[language]}
                </button>
                <span aria-hidden className="h-4 w-px bg-[#D9E0ED]" />
                <a href="/qr" className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 hover:bg-[#F1F5FC] focus-visible:outline-2 focus-visible:outline-[#473BB3]"><QrCode size={16} aria-hidden /> {c.showQr}</a>
              </div>
              {feedback === 'manual' && <div role="status" className="mt-2 rounded-xl bg-[#EDF1F8] p-3 text-xs">
                {c.manualCopy}<textarea dir="ltr" readOnly value={manualText} onFocus={(e) => e.currentTarget.select()} rows={5} className="mt-2 w-full rounded-lg border border-[#D2DDEF] bg-white p-2" aria-label="Contact details to copy" />
              </div>}
            </div>
          </div>
        </article>
        <footer className="mt-5 flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-[#66758E]">
          <span dir="ltr">© VASIA</span>
          <a href="/privacy" className="hover:underline">{c.privacy}</a>
          <a href="/accessibility" className="hover:underline">{c.accessibility}</a>
        </footer>
      </div>
      {installHelp && (
        <div role="presentation" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111B3F]/65 p-4" onMouseDown={(e) => { if (e.currentTarget === e.target) setInstallHelp(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="onetap-install-heading" className="relative w-full max-w-sm rounded-[26px] bg-white p-6 text-[#1B2945] shadow-2xl">
            <button type="button" onClick={() => setInstallHelp(false)} autoFocus aria-label={c.close} className="absolute end-3 top-3 grid h-11 w-11 place-items-center rounded-xl text-[#65728A] hover:bg-[#EFF3FA]"><X size={20} aria-hidden /></button>
            <img src="/favicon.svg" alt="" width="56" height="56" className="h-14 w-14 rounded-xl" />
            <h2 id="onetap-install-heading" className="mt-4 text-xl font-extrabold">{c.installTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-[#596782]">{help}</p>
            <button type="button" onClick={() => setInstallHelp(false)} className="mt-5 min-h-12 w-full rounded-xl bg-[#273D86] text-sm font-bold text-white">{c.close}</button>
          </section>
        </div>
      )}
    </main>
  );
};

export default OneTapCardPage;
