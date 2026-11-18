import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';

export type PhysicalStep = -1 | 1;

export function useProjectGestures(step: (direction: PhysicalStep) => void, enabled: boolean) {
  const region = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const node = region.current;
    if (!node || !enabled) return;
    let last = -Infinity;
    let distance = 0;
    let advanced = false;

    function wheel(event: WheelEvent) {
      if (event.ctrlKey) return; // Trackpad pinch zoom.
      const x = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
      if (!x || (!event.shiftKey && Math.abs(x) <= Math.abs(event.deltaY))) return;
      event.preventDefault();
      event.stopPropagation();
      const now = performance.now();
      if (now - last > 220) {
        distance = 0;
        advanced = false;
      }
      last = now;
      if (advanced) return; // The momentum tail belongs to the same gesture.
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerWidth : 1;
      distance += x * unit;
      if (Math.abs(distance) >= 36) {
        advanced = true;
        step(distance < 0 ? -1 : 1);
      }
    }

    node.addEventListener('wheel', wheel, { passive: false });
    return () => node.removeEventListener('wheel', wheel);
  }, [enabled, step]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    if (!enabled) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    // Capture on the original target so an ordinary tap still follows the link.
    if (event.target instanceof Element) event.target.setPointerCapture?.(event.pointerId);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    drag.current = null;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    suppressClick.current = Math.max(Math.abs(x), Math.abs(y)) > 8;
    if (Math.abs(x) >= 36 && Math.abs(x) > Math.abs(y) * 1.2) step(x > 0 ? -1 : 1);
  }

  function onPointerCancel() {
    drag.current = null;
    suppressClick.current = true;
  }

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (suppressClick.current && event.detail > 0) {
      event.preventDefault();
      event.stopPropagation();
    }
    suppressClick.current = false;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!enabled || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (!event.repeat) step(event.key === 'ArrowLeft' ? -1 : 1);
  }

  return { region, onKeyDown, previewEvents: { onPointerDown, onPointerUp, onPointerCancel, onClickCapture } };
}
