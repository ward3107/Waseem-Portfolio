import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Last-resort error boundary wrapping the entire app (outside the context
 * providers, so it also catches a throw inside a provider's initializer). The
 * fallback is intentionally self-contained — no context, no i18n, inline styles
 * — because the thing that failed may be exactly those systems. It turns a blank
 * white screen into a readable message with a reload affordance.
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Surface for debugging; no PII involved.
    // eslint-disable-next-line no-console
    console.error('App crashed:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          background: '#020617',
          color: '#e2e8f0',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', maxWidth: '28rem' }}>
          The page failed to load. Please refresh to try again.
          <br />
          משהו השתבש בטעינת הדף. רענן/י את העמוד כדי לנסות שוב.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            marginTop: '0.5rem',
            padding: '0.6rem 1.4rem',
            borderRadius: '0.6rem',
            border: 'none',
            background: '#7965C1',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Refresh · רענון
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
