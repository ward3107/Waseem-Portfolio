import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, Download, ExternalLink, ScanLine, Smartphone, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { CARD_URL, ONETAP_COPY } from '@/features/onetap/cardData';
import { useOneTapManifest } from '@/features/onetap/useOneTapManifest';

const languages = ['he', 'ar', 'en'] as const;

const OneTapQrPage: React.FC = () => {
  const { language, setLanguage, dir } = useLanguage();
  const c = ONETAP_COPY[language];
  const [feedback, setFeedback] = useState<'idle' | 'copied' | 'manual'>('idle');
  const Back = dir === 'rtl' ? ArrowRight : ArrowLeft;
  useDocumentTitle('VASIA OneTap QR | Waseem Abu Akel');
  useOneTapManifest('/onetap-qr.webmanifest');
  const [installHelp, setInstallHelp] = useState(false);
  const [deferredInstall, setDeferredInstall] = useState<Event | null>(null);

  useEffect(() => {
    const onInstall = (event: Event) => { event.preventDefault(); setDeferredInstall(event); };
    window.addEventListener('beforeinstallprompt', onInstall);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/onetap-sw.js', { scope: '/' }).catch(() => undefined);
    }
    return () => window.removeEventListener('beforeinstallprompt', onInstall);
  }, []);

  const install = async () => {
    if (deferredInstall) {
      try {
        const prompt = deferredInstall as Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };
        await prompt.prompt();
        await prompt.userChoice;
        setDeferredInstall(null);
        return;
      } catch { /* Manual installation is always available. */ }
    }
    setInstallHelp(true);
  };
  const ua = navigator.userAgent || '';
  const help = /iPhone|iPad|iPod/.test(ua) ? c.installIos : /Android/.test(ua) ? c.installAndroid : c.installDesktop;


  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(CARD_URL);
      setFeedback('copied');
    } catch {
      setFeedback('manual');
    }
  };

  return (
    <main dir={dir} className="relative isolate grid min-h-[100dvh] place-items-center overflow-hidden bg-[#F3F6FC] px-4 py-8 text-[#1A2845]">
      <div aria-hidden className="pointer-events-none absolute -top-28 left-0 h-80 w-80 rounded-full bg-[#C4B9FF]/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-[#9AF1EB]/45 blur-3xl" />
      <div className="relative w-full max-w-[500px]">
        <header className="mb-5 flex items-center justify-between gap-3">
          <a href="/card" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-[#334779] hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-[#5543CA]">
            <Back size={18} aria-hidden /> {c.backToCard}
          </a>
          <nav aria-label={c.languageLabel} dir="ltr" className="flex gap-1 rounded-full border border-[#DCE3EF] bg-white p-1">
            {languages.map((code) => (
              <button type="button" key={code} aria-pressed={code === language} onClick={() => setLanguage(code)}
                className={'min-h-10 min-w-10 rounded-full px-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-[#5543CA] ' + (language === code ? 'bg-[#233A78] text-white' : 'text-[#53617B] hover:bg-[#EDF2FC]')}>
                {code.toUpperCase()}
              </button>
            ))}
          </nav>
        </header>
        <section className="overflow-hidden rounded-[32px] border border-white bg-white p-5 text-center shadow-[0_30px_80px_-38px_rgba(28,50,105,0.45)] sm:p-8">
          <div className="mx-auto flex items-center justify-center gap-3">
            <img src="/brand/vasia-profile.png" width="58" height="58" className="h-[58px] w-[58px] rounded-[16px]" alt="VASIA" />
            <div dir="ltr" className="text-start">
              <p className="font-heading text-xl font-extrabold tracking-[.13em] text-[#1B2E66]">VASIA</p>
              <p className="text-[10px] font-bold tracking-[.21em] text-[#7989A3]">ONE TAP. ALL CONNECTED.</p>
            </div>
          </div>
          <h1 className="mt-7 text-2xl font-extrabold leading-snug text-[#1B2B52] sm:text-3xl">{c.qrTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-[#66758F]">{c.qrSubtitle}</p>
          <div className="relative mx-auto mt-6 w-full max-w-[320px] rounded-[28px] border border-[#E6EAF3] bg-white p-4 shadow-[0_12px_35px_-15px_rgba(35,55,101,0.25)]">
            <img src="/onetap/vasia-qr.svg" width="288" height="288" alt="QR code linking to VASIA digital business card" className="mx-auto aspect-square w-full" />
          </div>
          <p className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-2 text-sm leading-6 text-[#526683]">
            <ScanLine size={20} aria-hidden className="shrink-0 text-[#326AC0]" /> {c.qrInstruction}
          </p>
          <p dir="ltr" className="mt-2 select-all break-all text-xs font-semibold text-[#6678A1]">{CARD_URL}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a download="VASIA-OneTap-QR.svg" href="/onetap/vasia-qr.svg" className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#E9EDFF] px-2 text-xs font-bold text-[#4536A5] hover:bg-[#DEE4FF] focus-visible:outline-2 focus-visible:outline-[#5543CA] sm:text-sm">
              <Download size={19} aria-hidden /> {c.downloadQr}
            </a>
            <button type="button" onClick={copyLink} className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#E9F7F3] px-2 text-xs font-bold text-[#136F65] hover:bg-[#D8F0E9] focus-visible:outline-2 focus-visible:outline-[#136F65] sm:text-sm">
              {feedback === 'copied' ? <Check size={19} aria-hidden /> : <Copy size={19} aria-hidden />}
              {feedback === 'copied' ? c.copied : c.copyLink}
            </button>
          </div>
          {feedback === 'manual' && <div role="status" className="mt-3 rounded-xl bg-[#F3F6FC] p-3 text-start text-xs">
            {c.manualCopy}
            <input readOnly value={CARD_URL} dir="ltr" onFocus={(e) => e.currentTarget.select()} aria-label="Card URL" className="mt-2 w-full rounded-lg border border-[#DCE3EF] bg-white p-2" />
          </div>}
          <button type="button" onClick={install} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1D376E] px-4 text-sm font-bold text-white hover:bg-[#294D91] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D376E]">
            <Smartphone size={19} aria-hidden /> {c.install}
          </button>
          <a href="/card" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-[#31478C] hover:bg-[#F4F6FD] focus-visible:outline-2 focus-visible:outline-[#5543CA]">
            {c.viewCard} <ExternalLink size={17} aria-hidden />
          </a>
        </section>
      </div>
      {installHelp && (
        <div role="presentation" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111B3F]/65 p-4" onMouseDown={(e) => { if (e.currentTarget === e.target) setInstallHelp(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="onetap-qr-install-heading" className="relative w-full max-w-sm rounded-[26px] bg-white p-6 text-[#1B2945] shadow-2xl">
            <button type="button" onClick={() => setInstallHelp(false)} autoFocus aria-label={c.close} className="absolute end-3 top-3 grid h-11 w-11 place-items-center rounded-xl text-[#65728A] hover:bg-[#EFF3FA]"><X size={20} aria-hidden /></button>
            <img src="/favicon.svg" alt="" width="56" height="56" className="h-14 w-14 rounded-xl" />
            <h2 id="onetap-qr-install-heading" className="mt-4 text-xl font-extrabold">{c.installTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-[#596782]">{help}</p>
            <button type="button" onClick={() => setInstallHelp(false)} className="mt-5 min-h-12 w-full rounded-xl bg-[#273D86] text-sm font-bold text-white">{c.close}</button>
          </section>
        </div>
      )}
    </main>
  );
};

export default OneTapQrPage;
