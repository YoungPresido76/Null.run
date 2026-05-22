import React from 'react';
import { GameProvider } from './context/GameContext';
import { ToastProvider } from './context/ToastContext';
import { useFirebase }  from './hooks/useFirebase';
import AuthScreen       from './components/game/modals/PhoneAuth';
import GameLayout       from './components/game/layout/GameLayout';
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

// ── Auth gate ─────────────────────────────────────────────────────
function AuthGate() {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div style={{ background: '#020614', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'monospace', color: '#00f3ff', fontSize: 14, letterSpacing: '0.1em', animation: 'pulse 1.5s infinite' }}>
          INITIALISING NULL.RUN...
        </p>
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  return <GameLayout />;
}

// ── Root ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <GameProvider>
          <AuthGate />
        </GameProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
