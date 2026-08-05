import React, { useState, Suspense, lazy } from 'react';

/**
 * Brand 3D logo — a beveled "W" monogram in Waseem's brand colors.
 *
 * Everything three.js is code-split into a separate chunk (`Logo3DScene`
 * below is a dynamic import), so the ~180 KB three + fiber cost never lands
 * in the main bundle and doesn't hurt LCP. Visitors see the CSS fallback
 * (a flat gradient "W") immediately; the 3D scene fades in when its chunk
 * loads. If WebGL is missing/blocked or the chunk fails, the fallback stays.
 *
 * Motion policy: static. Per prior UX feedback ("nothing that feels like a
 * bug"), the logo does NOT auto-rotate. It sways gently on desktop hover
 * only — no perpetual rAF loop.
 */

const Logo3DScene = lazy(() => import('./Logo3DScene'));

interface Props {
  className?: string;
  /** Set `false` to skip WebGL entirely (renders only the CSS fallback). */
  enable3D?: boolean;
}

/**
 * A cheap CSS "W" that stands in for the 3D letter while the WebGL chunk
 * loads, or permanently when 3D is disabled / unsupported. Same size + font
 * family as the real thing so there's no layout shift.
 */
const FallbackW: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`flex items-center justify-center select-none ${className ?? ''}`}
    aria-hidden="true"
  >
    <span className="font-heading font-black text-[8rem] leading-none text-transparent bg-clip-text bg-gradient-to-br from-brand-purpleLight via-brand-purple to-brand-purpleDark drop-shadow-[0_4px_20px_rgba(121,101,193,0.4)]">
      W
    </span>
  </div>
);

const Logo3D: React.FC<Props> = ({ className, enable3D = true }) => {
  const [failed, setFailed] = useState(false);

  if (!enable3D || failed) {
    return <FallbackW className={className} />;
  }

  return (
    <div className={className} aria-label="Waseem logo">
      <ErrorBoundary onError={() => setFailed(true)} fallback={<FallbackW />}>
        <Suspense fallback={<FallbackW />}>
          <Logo3DScene />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

/**
 * Local error boundary — catches WebGL init failures, font-load rejections,
 * or a chunk-load error and swaps to the CSS fallback so the hero never
 * shows a blank rectangle.
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export default Logo3D;
