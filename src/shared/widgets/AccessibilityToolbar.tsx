import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Accessibility, X, RotateCcw, Type, MousePointer, Image as ImageIcon,
  Zap, Link as LinkIcon, AlignLeft, EyeOff, Heading, Focus, Palette, MoveHorizontal, Minus,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { safeSetItem } from '@/lib/safeStorage';
import {
  A11Y_CHANGE_EVENT, A11Y_DIALOG_EVENT, A11Y_OPEN_EVENT, DEFAULT_A11Y_SETTINGS,
  readA11ySettings, type A11ySettings, type A11yToggle,
} from './accessibilitySettings';
import './AccessibilityToolbar.css';

const copy = {
  he: {
    title: 'התאמות נגישות', description: 'התאימו את התצוגה לנוחותכם. אפשר לגלול בתוך החלון ולהשתמש במקלדת.',
    size: 'גודל טקסט', increase: 'הגדלת טקסט', decrease: 'הקטנת טקסט',
    contrast: 'ניגודיות', normal: 'רגילה', high: 'בהירה', inverted: 'כהה',
    highlightLinks: 'הדגשת קישורים', readableFont: 'גופן קריא', textSpacing: 'ריווח טקסט',
    largeCursor: 'סמן עכבר גדול', hideImages: 'הסתרת מדיה דקורטיבית', disableAnimations: 'הפחתת תנועה והנפשות',
    highlightHeadings: 'הדגשת כותרות', focusHighlight: 'מיקוד מקלדת מודגש', grayscale: 'מדיה בגווני אפור',
    alignText: 'יישור טקסט לתחילת השורה', readingGuide: 'קו עזר לקריאה',
    reset: 'איפוס התאמות', hide: 'הסתרה לביקור הנוכחי', close: 'סגירת נגישות',
    statement: 'הצהרת נגישות ויצירת קשר', saved: 'ההתאמות נשמרות במכשיר זה. Escape סוגר את החלון.',
    restore: 'אפשר לפתוח שוב דרך עמוד הצהרת הנגישות.',
  },
  en: {
    title: 'Accessibility settings', description: 'Adjust the display for your comfort. Scroll inside this panel or use the keyboard.',
    size: 'Text size', increase: 'Increase text size', decrease: 'Decrease text size',
    contrast: 'Contrast', normal: 'Default', high: 'Light', inverted: 'Dark',
    highlightLinks: 'Highlight links', readableFont: 'Readable font', textSpacing: 'Text spacing',
    largeCursor: 'Large cursor', hideImages: 'Hide decorative media', disableAnimations: 'Reduce motion and animations',
    highlightHeadings: 'Highlight headings', focusHighlight: 'Stronger keyboard focus', grayscale: 'Grayscale media',
    alignText: 'Align text to reading direction', readingGuide: 'Reading guide',
    reset: 'Reset settings', hide: 'Hide for this visit', close: 'Close accessibility settings',
    statement: 'Accessibility statement and contact', saved: 'Settings are saved on this device. Escape closes this panel.',
    restore: 'Reopen from the accessibility statement page.',
  },
  ar: {
    title: 'إعدادات إمكانية الوصول', description: 'اضبط العرض لراحتك. يمكنك التمرير داخل النافذة أو استخدام لوحة المفاتيح.',
    size: 'حجم النص', increase: 'تكبير النص', decrease: 'تصغير النص',
    contrast: 'التباين', normal: 'عادي', high: 'فاتح', inverted: 'داكن',
    highlightLinks: 'إبراز الروابط', readableFont: 'خط واضح', textSpacing: 'تباعد النص',
    largeCursor: 'مؤشر كبير', hideImages: 'إخفاء الوسائط الزخرفية', disableAnimations: 'تقليل الحركة والمؤثرات',
    highlightHeadings: 'إبراز العناوين', focusHighlight: 'إبراز تركيز لوحة المفاتيح', grayscale: 'وسائط بتدرج رمادي',
    alignText: 'محاذاة النص مع اتجاه القراءة', readingGuide: 'خط مساعد للقراءة',
    reset: 'إعادة ضبط الإعدادات', hide: 'إخفاء لهذه الزيارة', close: 'إغلاق إعدادات الوصول',
    statement: 'بيان الوصول والتواصل', saved: 'تُحفظ الإعدادات على هذا الجهاز. Escape يغلق النافذة.',
    restore: 'يمكن فتحها من صفحة بيان إمكانية الوصول.',
  },
} as const;

const toggles: Array<{ key: A11yToggle; icon: typeof Type }> = [
  { key: 'highlightLinks', icon: LinkIcon }, { key: 'readableFont', icon: Type },
  { key: 'textSpacing', icon: AlignLeft }, { key: 'highlightHeadings', icon: Heading },
  { key: 'focusHighlight', icon: Focus }, { key: 'disableAnimations', icon: Zap },
  { key: 'largeCursor', icon: MousePointer }, { key: 'hideImages', icon: ImageIcon },
  { key: 'grayscale', icon: Palette }, { key: 'alignText', icon: MoveHorizontal },
  { key: 'readingGuide', icon: Minus },
];

function sessionHidden() {
  try { return sessionStorage.getItem('a11y-widget-hidden') === '1'; }
  catch { return false; }
}

export default function AccessibilityToolbar() {
  const { language, dir } = useLanguage();
  const text = copy[language];
  const [state, setState] = useState(readA11ySettings);
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(() => !sessionHidden());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  // Keep Tab inside the modal even when the browser would focus its own chrome.
  useFocusTrap(dialogRef, isOpen);

  const closePanel = useCallback(() => {
    dialogRef.current?.close();
    setIsOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const open = () => {
      try { sessionStorage.removeItem('a11y-widget-hidden'); } catch { /* Optional storage. */ }
      setVisible(true);
      setIsOpen(true);
    };
    window.addEventListener(A11Y_OPEN_EVENT, open);
    return () => window.removeEventListener(A11Y_OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const attrs: Record<A11yToggle, string> = {
      highlightLinks: 'data-a11y-highlight-links', readableFont: 'data-a11y-readable-font',
      textSpacing: 'data-a11y-text-spacing', largeCursor: 'data-a11y-large-cursor',
      hideImages: 'data-a11y-hide-images', disableAnimations: 'data-a11y-reduced-motion',
      highlightHeadings: 'data-a11y-highlight-headings', focusHighlight: 'data-a11y-focus-highlight',
      grayscale: 'data-a11y-grayscale', alignText: 'data-a11y-align-text', readingGuide: 'data-a11y-reading-guide',
    };
    for (const feature of toggles) root.toggleAttribute(attrs[feature.key], state[feature.key]);
    root.dataset.a11yContrast = state.contrastMode;
    root.style.setProperty('--a11y-scale', String(state.fontSize / 100));
    // No filter/transform on html: the launcher must stay attached to the viewport.
    root.style.fontSize = state.fontSize === 100 ? '' : state.fontSize + '%';
    document.getElementById('a11y-styles')?.remove();
    safeSetItem('a11y-settings', JSON.stringify(state));
    window.dispatchEvent(new Event(A11Y_CHANGE_EVENT));
  }, [state]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    // Native modal semantics make the background inert and trap focus.
    dialog.showModal();
    document.documentElement.setAttribute('data-a11y-dialog-open', '');
    window.dispatchEvent(new CustomEvent(A11Y_DIALOG_EVENT, { detail: true }));
    return () => {
      if (dialog.open) dialog.close();
      document.documentElement.removeAttribute('data-a11y-dialog-open');
      window.dispatchEvent(new CustomEvent(A11Y_DIALOG_EVENT, { detail: false }));
    };
  }, [isOpen]);

  useEffect(() => {
    if (!state.readingGuide || isOpen) return;
    const move = (y: number) => {
      if (guideRef.current) guideRef.current.style.top = Math.max(0, Math.min(window.innerHeight - 4, y)) + 'px';
    };
    const pointer = (event: PointerEvent) => move(event.clientY + 12);
    const focus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) move(event.target.getBoundingClientRect().bottom + 4);
    };
    move(window.innerHeight / 2);
    window.addEventListener('pointermove', pointer, { passive: true });
    document.addEventListener('focusin', focus);
    return () => {
      window.removeEventListener('pointermove', pointer);
      document.removeEventListener('focusin', focus);
    };
  }, [state.readingGuide, isOpen]);

  useEffect(() => {
    if (!state.disableAnimations) return;
    // Also stop HTML media and Web Animations; CSS alone does not stop them.
    const stopMedia = (event?: Event) => {
      if (event?.target instanceof HTMLMediaElement && event.target.autoplay) event.target.pause();
      document.querySelectorAll<HTMLMediaElement>('video[autoplay],audio[autoplay]').forEach((media) => media.pause());
      document.getAnimations?.().forEach((animation) => animation.pause());
    };
    stopMedia();
    document.addEventListener('play', stopMedia, true);
    const observer = new MutationObserver(() => stopMedia());
    observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
    return () => {
      document.removeEventListener('play', stopMedia, true);
      observer.disconnect();
    };
  }, [state.disableAnimations]);

  const update = <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) =>
    setState((previous) => ({ ...previous, [key]: value }));
  const hide = () => {
    closePanel();
    try { sessionStorage.setItem('a11y-widget-hidden', '1'); } catch { /* Optional storage. */ }
    setVisible(false);
    document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
  };

  return createPortal(
    <>
      {visible && <button ref={triggerRef} type="button" className="a11y-launcher" onClick={() => setIsOpen(true)}
        aria-label={text.title} aria-haspopup="dialog" aria-controls="accessibility-dialog" aria-expanded={isOpen}>
        <Accessibility size={26} aria-hidden="true" />
      </button>}
      <dialog ref={dialogRef} id="accessibility-dialog" className="a11y-dialog" dir={dir}
        aria-labelledby="a11y-title" aria-describedby="a11y-description" data-lenis-prevent="" data-native-scroll=""
        onCancel={(event) => { event.preventDefault(); closePanel(); }}
        onClose={() => { setIsOpen(false); }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const box = event.currentTarget.getBoundingClientRect();
          if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closePanel();
        }}>
        <header className="a11y-header">
          <h2 id="a11y-title">{text.title}</h2>
          <button type="button" className="a11y-close" onClick={closePanel} aria-label={text.close} autoFocus><X size={22} aria-hidden="true" /></button>
        </header>
        <div className="a11y-scroll" data-lenis-prevent="" data-native-scroll="" tabIndex={0} aria-label={text.title}>
          <p id="a11y-description" className="a11y-description">{text.description}</p>
          <fieldset className="a11y-fieldset">
            <legend>{text.size}</legend>
            <div className="a11y-size">
              <button type="button" aria-label={text.decrease} disabled={state.fontSize === 100} onClick={() => update('fontSize', Math.max(100, state.fontSize - 25))}>A−</button>
              <output aria-live="polite">{state.fontSize}%</output>
              <button type="button" aria-label={text.increase} disabled={state.fontSize === 200} onClick={() => update('fontSize', Math.min(200, state.fontSize + 25))}>A+</button>
            </div>
          </fieldset>
          <fieldset className="a11y-fieldset">
            <legend>{text.contrast}</legend>
            <div className="a11y-contrast">{(['normal', 'high', 'inverted'] as const).map((mode) =>
              <label key={mode}><input type="radio" name="a11y-contrast" value={mode} checked={state.contrastMode === mode} onChange={() => update('contrastMode', mode)} />{text[mode]}</label>
            )}</div>
          </fieldset>
          <div>{toggles.map(({ key, icon: Icon }) =>
            <label key={key} className="a11y-toggle">
              <span><Icon size={20} aria-hidden="true" />{text[key]}</span>
              <input type="checkbox" checked={state[key]} onChange={(event) => update(key, event.target.checked)} />
            </label>
          )}</div>
          <div className="a11y-actions">
            <button type="button" className="a11y-action" onClick={() => setState({ ...DEFAULT_A11Y_SETTINGS })}><RotateCcw size={16} aria-hidden="true" style={{ display: 'inline', marginInlineEnd: 6 }} />{text.reset}</button>
            <button type="button" className="a11y-action" onClick={hide}><EyeOff size={16} aria-hidden="true" style={{ display: 'inline', marginInlineEnd: 6 }} />{text.hide}</button>
          </div>
          <a className="a11y-statement" href="/accessibility" onClick={closePanel}>{text.statement}</a>
          <p className="a11y-note">{text.saved}<br />{text.restore}</p>
        </div>
      </dialog>
      {state.readingGuide && !isOpen && <div ref={guideRef} className="a11y-guide" aria-hidden="true" />}
    </>, document.body
  );
}
