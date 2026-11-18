import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Ellipsis } from 'lucide-react';

export function CardMoreActions({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: Event) => {
      if (!(event.target instanceof Element) || root.current?.contains(event.target)) return;
      // Bit and the offer viewer return focus to their action in this disclosure.
      if (!document.querySelector('[aria-modal="true"]')) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, [open]);

  return <div className="onetap-more" ref={root} onKeyDown={event => {
    if (open && event.key === 'Escape' && !document.querySelector('[aria-modal="true"]')) {
      setOpen(false);
      trigger.current?.focus();
    }
  }}>
    <button ref={trigger} type="button" className="onetap-more-trigger" aria-expanded={open}
      aria-controls="onetap-more-panel" onClick={() => setOpen(value => !value)}>
      <Ellipsis aria-hidden="true" /> {label} <ChevronDown aria-hidden="true" size={14} />
    </button>
    <div id="onetap-more-panel" className="onetap-more-panel" hidden={!open} role="group" aria-label={label}>
      {open && children}
    </div>
  </div>;
}
