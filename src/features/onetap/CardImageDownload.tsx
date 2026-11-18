import { useEffect, useState } from 'react';
import { ImageDown } from 'lucide-react';
import type { Language } from '@/types';
import { renderCardPng } from './cardArtwork';

const COPY = {
  he: { save: 'שמירת הכרטיס כתמונה', detail: 'תמונה לפוסט עם פרטי קשר', loading: 'מכין תמונה…', retry: 'הכנת התמונה מחדש' },
  ar: { save: 'حفظ البطاقة كصورة', detail: 'صورة للمنشور مع بيانات التواصل', loading: 'جارٍ تحضير الصورة…', retry: 'إعادة تحضير الصورة' },
  en: { save: 'Save card as image', detail: 'Post a photo with contact details', loading: 'Preparing image…', retry: 'Retry image download' },
};

export function CardImageDownload({ src, language }: { src: string; language: Language }) {
  const ui = COPY[language];
  const [result, setResult] = useState<{ src: string; href: string | null }>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let href: string | undefined;
    void renderCardPng(src).then(blob => {
      if (!active) return;
      href = URL.createObjectURL(blob);
      setResult({ src, href });
    }).catch(() => { if (active) setResult({ src, href: null }); });
    return () => {
      active = false;
      if (href) URL.revokeObjectURL(href);
    };
  }, [src, attempt]);

  const current = result?.src === src ? result : undefined;
  const title = current?.href === null ? ui.retry : ui.save;
  const content = <>
    <ImageDown aria-hidden="true" />
    <span className="onetap-copy-info">
      <span className="onetap-copy-title">{title}</span>
      <span className="onetap-copy-detail">{current ? ui.detail : ui.loading}</span>
    </span>
  </>;

  // Prepare the file before the tap so mobile browsers receive a normal download link.
  if (current?.href) return <a className="onetap-copy onetap-image-action" href={current.href}
    download={`Vasia-Waseem-Abu-Akel-${language}.png`} aria-label={ui.save}>{content}</a>;

  return <button type="button" className="onetap-copy onetap-image-action"
    aria-label={title} disabled={!current} onClick={() => { setResult(undefined); setAttempt(value => value + 1); }}>
    {content}
  </button>;
}
