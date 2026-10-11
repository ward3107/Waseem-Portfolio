import { useEffect, useRef, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';

type OfferLanguage = 'he' | 'ar';
type Language = OfferLanguage | 'en';

const OFFERS = {
  he: {
    label: 'מבצע בעברית',
    title: 'VASIA OneTap — מבצע כרטיס ביקור דיגיטלי',
    image: '/onetap/promotions/vasia-offer-he-20261010.jpg',
    text: 'כרטיס ביקור דיגיטלי של VASIA — פרטי העסק ודרכי הקשר במקום אחד.\nClassic: 199 ₪ | Motion: 399 ₪ | עיצוב לפי בקשת הלקוח: החל מ־499 ₪.\nתשלום חד־פעמי על יצירת הכרטיס. אחסון, דומיין ותחזוקה לפי תנאי ההצעה.\nלפרטים: https://wa.me/972534260632',
  },
  ar: {
    label: 'العرض بالعربية',
    title: 'VASIA OneTap — عرض بطاقة أعمال رقمية',
    image: '/onetap/promotions/vasia-offer-ar-20261010.jpg',
    text: 'بطاقة أعمال رقمية من VASIA — تفاصيل مصلحتك وطرق التواصل في مكان واحد.\nClassic: ‏199 ₪ | Motion: ‏399 ₪ | تصميم حسب طلبك: ابتداءً من 499 ₪.\nدفعة واحدة لإنشاء البطاقة. الاستضافة والدومين والصيانة حسب شروط العرض.\nللتفاصيل: https://wa.me/972534260632',
  },
};

const COPY = {
  he: { group: 'שיתוף המבצע', close: 'סגירה', loading: 'מכין את תמונת המבצע…', share: 'שיתוף התמונה וההסבר', download: 'שמירת התמונה', copy: 'העתקת ההסבר', copied: 'ההסבר הועתק', caption: 'הסבר לצירוף לתמונה', fallback: 'אם השיתוף אינו זמין, שמרו את התמונה וצרפו אותה בוואטסאפ. ההסבר והמחירים מופיעים גם בתמונה.', loadError: 'התמונה לא נטענה. בדקו את החיבור ונסו שוב.', retry: 'טעינה מחדש', manual: 'אפשר לסמן ולהעתיק את ההסבר כאן.' },
  ar: { group: 'مشاركة العرض', close: 'إغلاق', loading: 'جارٍ تحضير صورة العرض…', share: 'مشاركة الصورة والشرح', download: 'حفظ الصورة', copy: 'نسخ الشرح', copied: 'تم نسخ الشرح', caption: 'شرح لإرفاقه بالصورة', fallback: 'إذا لم تتوفر المشاركة، احفظ الصورة وأرفقها في واتساب. الشرح والأسعار موجودة أيضًا في الصورة.', loadError: 'لم يتم تحميل الصورة. تحقق من الاتصال وحاول مجددًا.', retry: 'إعادة التحميل', manual: 'يمكنك تحديد الشرح ونسخه هنا.' },
  en: { group: 'Share the offer', close: 'Close', loading: 'Preparing the offer image…', share: 'Share image and caption', download: 'Save image', copy: 'Copy caption', copied: 'Caption copied', caption: 'Caption to send with the image', fallback: 'If sharing is unavailable, save the image and attach it in WhatsApp. The explanation and prices are also included in the image.', loadError: 'The image could not load. Check your connection and try again.', retry: 'Try again', manual: 'Select and copy the caption below.' },
};

export function PromotionShareButtons({ language }: { language: Language }) {
  const ui = COPY[language];
  const dialog = useRef<HTMLDialogElement>(null);
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
    for (const lang of ['he', 'ar'] as const) void loadFile(lang).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    setCopyStatus('idle');
    setLoadError(false);
    setReady(Boolean(files.current[selected]));
    setLoading(!files.current[selected]);
    dialog.current?.showModal();
    void loadFile(selected).then(() => {
      if (active) { setReady(true); setLoading(false); }
    }).catch(() => {
      if (active) { setLoadError(true); setLoading(false); }
    });
    return () => { active = false; dialog.current?.close(); };
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
      {(['he', 'ar'] as const).map(lang => (
        <button key={lang} type="button" className="onetap-promo-button" lang={lang} dir="rtl"
          disabled={busy} onClick={() => void shareOffer(lang)}>
          <Share2 aria-hidden="true" /> <span>{OFFERS[lang].label}</span>
        </button>
      ))}
    </div>
    {offer && <dialog ref={dialog} className="onetap-dialog onetap-promo-dialog"
      dir={language === 'en' ? 'ltr' : 'rtl'} aria-labelledby="onetap-promo-title"
      onCancel={() => setSelected(null)} onClose={() => setSelected(null)}>
      <button type="button" className="onetap-dialog-close" aria-label={ui.close} onClick={() => setSelected(null)}><X aria-hidden="true" /></button>
      <h2 id="onetap-promo-title" lang={selected!} dir="rtl">{offer.label}</h2>
      <img className="onetap-promo-image" src={offer.image} alt={offer.title} />
      <p role="status">{loading ? ui.loading : loadError ? ui.loadError : ui.fallback}</p>
      {loadError && <button type="button" className="onetap-dialog-confirm" onClick={() => void retryLoad()}>{ui.retry}</button>}
      {ready && canShare(files.current[selected!]) && <button type="button" className="onetap-dialog-confirm"
        disabled={busy} onClick={() => void shareOffer(selected!)}><Share2 aria-hidden="true" /> {ui.share}</button>}
      <a className="onetap-promo-download" href={offer.image} download={`VASIA-OneTap-${selected}.jpg`}><Download aria-hidden="true" /> {ui.download}</a>
      <textarea ref={caption} value={offer.text} readOnly lang={selected!} dir="rtl"
        aria-label={ui.caption} rows={4} onFocus={event => event.currentTarget.select()} />
      <button type="button" className="onetap-dialog-confirm" onClick={() => void copyCaption()}>
        {copyStatus === 'copied' ? ui.copied : ui.copy}
      </button>
      {copyStatus === 'manual' && <p role="status">{ui.manual}</p>}
    </dialog>}
  </>;
}
