import { GameProvider } from './context/GameContext';
import { useFirebase }  from './hooks/useFirebase';
import PhoneAuth        from './components/game/modals/PhoneAuth';
import GameLayout       from './components/game/layout/GameLayout';
import './index.css';



// ── Auth gate wrapper ─────────────────────────────────────────────
function AuthGate() {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-void-bg">
        <div className="font-orbitron text-lg neon-cyan animate-pulse">
          INITIALISING NULL.RUN...
        </div>
      </div>
    );
  }

  if (!user) return <PhoneAuth />;
  return <GameLayout />;
}

// ── Root ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <GameProvider>
      <AuthGate />
    </GameProvider>
  );
}
