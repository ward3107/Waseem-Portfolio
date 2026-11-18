import { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProjects } from '@/features/projects/useProjects';
import { safeHref } from '@/lib/safe';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { useProjectGestures, type PhysicalStep } from './useProjectGestures';

const arrowClass = 'grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/5 text-white transition-colors hover:border-brand-cyan hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan';

export default function ProjectShowcase() {
  const { t, dir } = useLanguage();
  const { projects } = useProjects('projects');
  const reducedMotion = usePrefersReducedMotion();
  const [selection, setSelection] = useState<{ id?: string; direction: number }>({ direction: 0 });
  const [failedImage, setFailedImage] = useState<string>();
  const rtl = dir === 'rtl';
  const index = Math.max(0, projects.findIndex(project => project.id === selection.id));
  const active = projects[index];

  const step = useCallback((physical: PhysicalStep) => {
    if (projects.length < 2) return;
    setSelection(current => {
      const start = Math.max(0, projects.findIndex(project => project.id === current.id));
      const next = (start + (rtl ? -physical : physical) + projects.length) % projects.length;
      return { id: projects[next].id, direction: physical };
    });
  }, [projects, rtl]);
  const { region, onKeyDown, previewEvents } = useProjectGestures(step, projects.length > 1);

  if (!active) return null;
  const url = safeHref(active.link);
  const siteLabel = t('projects_demo');
  const image = active.image && active.image !== failedImage ? (
    <motion.img
      key={active.id}
      src={active.image}
      alt=""
      width={1200}
      height={750}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailedImage(active.image)}
      initial={reducedMotion || !selection.direction ? false : { x: selection.direction * 28, opacity: 0.86 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="pointer-events-none block h-full w-full object-contain"
    />
  ) : <span dir="auto" className="px-6 text-center font-heading text-2xl font-bold text-white">{active.title}</span>;
  const previewClass = 'flex h-full w-full items-center justify-center';

  return (
    <div
      ref={region}
      role="region"
      aria-labelledby="projects-heading"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="pointer-events-auto grid w-full min-w-0 overflow-hidden rounded-3xl border border-white/20 bg-[#10182a] text-start shadow-2xl shadow-black/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-cyan lg:grid-cols-[minmax(0,1.9fr)_minmax(16rem,0.84fr)]"
    >
      <div
        {...previewEvents}
        onDragStart={event => event.preventDefault()}
        className="relative aspect-[16/10] min-w-0 cursor-grab select-none overflow-hidden bg-[#101523] [touch-action:pan-y_pinch-zoom] active:cursor-grabbing lg:aspect-auto lg:h-[clamp(17rem,46svh,29rem)]"
      >
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" draggable={false}
            aria-label={siteLabel + ' · ' + active.title}
            className={previewClass + ' cursor-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-cyan'}>
            {image}
          </a>
        ) : <div className={previewClass}>{image}</div>}
      </div>

      <div className="flex min-w-0 flex-col gap-4 border-t border-white/15 p-5 sm:p-7 lg:gap-5 lg:border-s lg:border-t-0 lg:p-8">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-cyan" dir="auto">{active.category}</p>
          <h3 dir="auto" className="break-words font-heading text-2xl font-bold leading-tight text-white sm:text-3xl">{active.title}</h3>
          {active.description && <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">{active.description}</p>}
        </div>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan">
            {siteLabel} <ExternalLink size={16} aria-hidden="true" />
          </a>
        )}
        {projects.length > 1 && (
          <div dir="ltr" className="mt-auto flex items-center justify-between gap-3 border-t border-white/15 pt-4">
            <button type="button" aria-label={t(rtl ? 'aria_carousel_next' : 'aria_carousel_prev')} onClick={() => step(-1)} className={arrowClass}>
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <span className="font-mono text-sm tabular-nums tracking-wider text-slate-300" aria-hidden="true">
              <strong className="text-white">{index + 1}</strong> / {projects.length}
            </span>
            <button type="button" aria-label={t(rtl ? 'aria_carousel_prev' : 'aria_carousel_next')} onClick={() => step(1)} className={arrowClass}>
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        )}
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          <bdi>{active.title}</bdi> <bdi>{index + 1} / {projects.length}</bdi>
        </span>
      </div>
    </div>
  );
}
