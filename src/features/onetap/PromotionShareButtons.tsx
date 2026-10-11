import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share2, X } from 'lucide-react';

type OfferLanguage = 'he' | 'ar' | 'en';
type Language = OfferLanguage;
const OFFER_LANGUAGES = ['he', 'ar', 'en'] as const;

const OFFERS = {
  he: {
    label: 'מבצע בעברית',
    shortLabel: 'עברית',
    title: 'VASIA OneTap — מבצע כרטיס ביקור דיגיטלי',
    image: '/onetap/promotions/vasia-offer-he-20261011.jpg',
    text: 'כרטיס ביקור דיגיטלי של VASIA — פרטי העסק ודרכי הקשר במקום אחד.\nClassic: 199 ₪ | Motion: 399 ₪ | עיצוב לפי בקשת הלקוח: החל מ־499 ₪.\nתשלום חד־פעמי על יצירת הכרטיס. האחסון כלול במחיר. דומיין ותחזוקה בתשלום נוסף.\nלפרטים: https://wa.me/972534260632',
  },
  ar: {
    label: 'العرض بالعربية',
    shortLabel: 'العربية',
    title: 'VASIA OneTap — عرض بطاقة أعمال رقمية',
    image: '/onetap/promotions/vasia-offer-ar-20261011.jpg',
    text: 'بطاقة أعمال رقمية من VASIA — تفاصيل مصلحتك وطرق التواصل في مكان واحد.\nClassic: ‏199 ₪ | Motion: ‏399 ₪ | تصميم حسب طلبك: ابتداءً من 499 ₪.\nدفعة واحدة لإنشاء البطاقة. الاستضافة مشمولة بالسعر. الدومين والصيانة بتكلفة إضافية.\nللتفاصيل: https://wa.me/972534260632',
  },
  en: {
    label: 'Offer in English',
    shortLabel: 'English',
    title: 'VASIA OneTap — Digital Business Card Offer',
    image: '/onetap/promotions/vasia-offer-en-20261011.jpg',
    text: 'A VASIA digital business card — your business details and contact options in one place.\nClassic: ₪199 | Motion: ₪399 | Custom design: from ₪499.\nOne-time payment for card creation. Hosting included. Domain and maintenance cost extra.\nGet in touch: https://wa.me/972534260632',
  },
};

const COPY = {
  he: { group: 'שיתוף המבצע', close: 'סגירה', loading: 'מכין את תמונת המבצע…', share: 'שיתוף התמונה וההסבר', download: 'שמירת התמונה', copy: 'העתקת ההסבר', copied: 'ההסבר הועתק', caption: 'הסבר לצירוף לתמונה', fallback: 'אם השיתוף אינו זמין, שמרו את התמונה וצרפו אותה בוואטסאפ. ההסבר והמחירים מופיעים גם בתמונה.', loadError: 'התמונה לא נטענה. בדקו את החיבור ונסו שוב.', retry: 'טעינה מחדש', manual: 'אפשר לסמן ולהעתיק את ההסבר כאן.' },
  ar: { group: 'مشاركة العرض', close: 'إغلاق', loading: 'جارٍ تحضير صورة العرض…', share: 'مشاركة الصورة والشرح', download: 'حفظ الصورة', copy: 'نسخ الشرح', copied: 'تم نسخ الشرح', caption: 'شرح لإرفاقه بالصورة', fallback: 'إذا لم تتوفر المشاركة، احفظ الصورة وأرفقها في واتساب. الشرح والأسعار موجودة أيضًا في الصورة.', loadError: 'لم يتم تحميل الصورة. تحقق من الاتصال وحاول مجددًا.', retry: 'إعادة التحميل', manual: 'يمكنك تحديد الشرح ونسخه هنا.' },
  en: { group: 'Share the offer', close: 'Close', loading: 'Preparing the offer image…', share: 'Share image and caption', download: 'Save image', copy: 'Copy caption', copied: 'Caption copied', caption: 'Caption to send with the image', fallback: 'If sharing is unavailable, save the image and attach it in WhatsApp. The explanation and prices are also included in the image.', loadError: 'The image could not load. Check your connection and try again.', retry: 'Try again', manual: 'Select and copy the caption below.' },
};

export function PromotionShareButtons({ language }: { language: Language }) {
  const ui = COPY[language];
  const dialog = useRef<HTMLElement>(null);
  const files = useRef<Partial<Record<OfferLanguage, File>>>({});
  const requests = useRef<Partial<Record<OfferLanguage, Promise<File>>>>({});
  const sharing = useRef(false);
  const caption = useRef<HTMLTextAreaElement>(null);
  const [selected, setSelected] = useState<OfferLanguage | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle');

  function loadFile(lang: OfferLanguage): Promise<File> {
    if (files.current[lang]) return Promise.resolve(files.current[lang]!);
    if (!requests.current[lang]) {
      requests.current[lang] = fetch(OFFERS[lang].image)
        .then(async response => {
          if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
            throw new Error('Offer image unavailable');
          }
          const blob = await response.blob();
          if (!blob.size) throw new Error('Empty offer image');
          const file = new File([blob], `VASIA-OneTap-${lang}.jpg`, { type: 'image/jpeg' });
          files.current[lang] = file;
          return file;
        }).finally(() => { delete requests.current[lang]; });
    }
    return requests.current[lang]!;
  }

  useEffect(() => {
    // Prepare the files ahead of the tap so native sharing retains user activation.
    for (const lang of OFFER_LANGUAGES) void loadFile(lang).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    setCopyStatus('idle');
    setLoadError(false);
    setReady(Boolean(files.current[selected]));
    setLoading(!files.current[selected]);
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const background = document.querySelector<HTMLElement>('.onetap-screen');
    const previousHidden = background?.getAttribute('aria-hidden');
    const previousInert = background?.hasAttribute('inert');
    background?.setAttribute('aria-hidden', 'true');
    background?.setAttribute('inert', '');
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setSelected(null); }
      if (event.key !== 'Tab') return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea');
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    void loadFile(selected).then(() => {
      if (active) { setReady(true); setLoading(false); }
    }).catch(() => {
      if (active) { setLoadError(true); setLoading(false); }
    });
    return () => {
      active = false;
      document.removeEventListener('keydown', onKey);
      if (previousHidden == null) background?.removeAttribute('aria-hidden');
      else background?.setAttribute('aria-hidden', previousHidden);
      if (!previousInert) background?.removeAttribute('inert');
      returnFocus?.focus();
    };
  }, [selected]);

  function canShare(file: File | undefined) {
    try { return Boolean(file && typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })); }
    catch { return false; }
  }

  async function shareOffer(lang: OfferLanguage) {
    if (sharing.current) return;
    const file = files.current[lang];
    if (!file || !canShare(file)) { setSelected(lang); return; }
    sharing.current = true;
    setBusy(true);
    try {
      // No awaited fetch before share: browsers require the current button gesture.
      await navigator.share({ files: [file], title: OFFERS[lang].title, text: OFFERS[lang].text });
      setSelected(null);
    } catch (error) {
      // Canceling never triggers a download, another share, or a clipboard write.
      const canceled = typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
      if (!canceled) setSelected(lang);
    } finally {
      sharing.current = false;
      setBusy(false);
    }
  }

  async function retryLoad() {
    if (!selected) return;
    setLoading(true); setLoadError(false);
    try { await loadFile(selected); setReady(true); }
    catch { setLoadError(true); }
    finally { setLoading(false); }
  }

  async function copyCaption() {
    if (!selected) return;
    try { await navigator.clipboard.writeText(OFFERS[selected].text); setCopyStatus('copied'); }
    catch { setCopyStatus('manual'); caption.current?.focus(); caption.current?.select(); }
  }

  const offer = selected ? OFFERS[selected] : null;
  return <>
    <div className="onetap-promotions" role="group" aria-label={ui.group}>
      {OFFER_LANGUAGES.map(lang => (
        <button key={lang} type="button" className="onetap-promo-button" lang={lang} dir={lang === 'en' ? 'ltr' : 'rtl'}
          aria-label={OFFERS[lang].label} title={OFFERS[lang].label}
          disabled={busy} onClick={() => void shareOffer(lang)}>
          <Share2 aria-hidden="true" /> <span>{OFFERS[lang].shortLabel}</span>
        </button>
      ))}
    </div>
    {offer && createPortal(<div className="onetap-dialog-overlay" role="presentation"
      onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}>
      <section ref={dialog} className="onetap-dialog onetap-promo-dialog" role="dialog" aria-modal="true"
      dir={language === 'en' ? 'ltr' : 'rtl'} aria-labelledby="onetap-promo-title">
      <button type="button" className="onetap-dialog-close" aria-label={ui.close} onClick={() => setSelected(null)}><X aria-hidden="true" /></button>
      <h2 id="onetap-promo-title" lang={selected!} dir={selected === 'en' ? 'ltr' : 'rtl'}>{offer.label}</h2>
      <img className="onetap-promo-image" src={offer.image} alt={offer.title} />
      <p role="status">{loading ? ui.loading : loadError ? ui.loadError : ui.fallback}</p>
      {loadError && <button type="button" className="onetap-dialog-confirm" onClick={() => void retryLoad()}>{ui.retry}</button>}
      {ready && canShare(files.current[selected!]) && <button type="button" className="onetap-dialog-confirm"
        disabled={busy} onClick={() => void shareOffer(selected!)}><Share2 aria-hidden="true" /> {ui.share}</button>}
      <a className="onetap-promo-download" href={offer.image} download={`VASIA-OneTap-${selected}.jpg`}><Download aria-hidden="true" /> {ui.download}</a>
      <textarea ref={caption} value={offer.text} readOnly lang={selected!} dir={selected === 'en' ? 'ltr' : 'rtl'}
        aria-label={ui.caption} rows={4} onFocus={event => event.currentTarget.select()} />
      <button type="button" className="onetap-dialog-confirm" onClick={() => void copyCaption()}>
        {copyStatus === 'copied' ? ui.copied : ui.copy}
      </button>
      {copyStatus === 'manual' && <p role="status">{ui.manual}</p>}
    </section></div>, document.body)}
  </>;
}
