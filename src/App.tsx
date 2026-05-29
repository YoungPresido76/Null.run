import React from 'react';
import StyleguideBoard from './components/game/styleguide/StyleguideBoard';
import './index.css';

// ── Error Boundary ────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#020614', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 24, maxWidth: 380 }}>
            <p style={{ fontFamily: 'monospace', color: '#f87171', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>RUNTIME ERROR</p>
            <p style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
              {this.state.error.message}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Root ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <div style={{ background: 'var(--void-bg-primary)', minHeight: '100dvh' }}>
        <StyleguideBoard />
      </div>
    </ErrorBoundary>
  );
}
