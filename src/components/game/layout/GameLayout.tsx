import { useState } from 'react';
import GameHeader    from './GameHeader';
import TabNav, { type TabId } from './TabNav';
import ChillOrb      from '../orb/ChillOrb';
import Leaderboard   from '../leaderboard/Leaderboard';
import ProducerPanel from '../producers/ProducerPanel';
import Achievements  from '../achievements/Achievements';
import HQPanel       from '../hq/HQPanel';
import StakePanel    from '../staking/StakePanel';
import Market        from '../market/Market';
import Social        from '../social/Social';

// ── Background effects ────────────────────────────────────────────
function GameBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Base */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(0,20,40,0.9) 0%, #020614 60%)',
      }} />
      {/* Grid */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
          linear-gradient(rgba(0,243,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,243,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }} />
      {/* Top glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(0,243,255,0.4) 0%, transparent 70%)' }} />
      {/* Bottom glow */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-60 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(157,0,255,0.4) 0%, transparent 70%)' }} />
      {/* HUD sweep */}
      <div className="absolute inset-0 animate-hud-sweep opacity-20"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(0,243,255,0.04),transparent)' }} />
    </div>
  );
}

function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'core':    return <ChillOrb />;
    case 'produce': return <ProducerPanel />;
    case 'rank':    return <Leaderboard />;
    case 'social':  return <Social />;
    case 'market':  return <Market />;
    case 'stake':   return <StakePanel />;
    case 'hq':      return <HQPanel />;
    case 'achieve': return <Achievements />;
  }
}

// ── Main layout ───────────────────────────────────────────────────
export default function GameLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('core');

  return (
    <div className="relative flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      <GameBg />

      {/* Header */}
      <GameHeader onSettingsOpen={() => console.log('TODO: settings modal')} />

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-lg mx-auto w-full pb-2">
          <TabContent tab={activeTab} />
        </div>
      </main>

      {/* Bottom tab nav */}
      <TabNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
