import { useState } from 'react';
import GameHeader    from './GameHeader';
import ChillOrb      from '../orb/ChillOrb';
import Leaderboard   from '../leaderboard/Leaderboard';
import ProducerPanel from '../producers/ProducerPanel';
import Achievements  from '../achievements/Achievements';
import HQPanel       from '../hq/HQPanel';
import StakePanel    from '../staking/StakePanel';
import Market        from '../market/Market';
import Social        from '../social/Social';
import SettingsModal from '../modals/SettingsModal';
import { cn }        from '@/lib/utils';
import { useGame }   from '@/context/GameContext';

export type TabId = 'core' | 'produce' | 'rank' | 'social' | 'market' | 'stake' | 'hq' | 'achieve';

// ── Animated background ───────────────────────────────────────────
function GameBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: '#020614' }} />
      {/* Drifting orbs */}
      <div className="absolute rounded-full opacity-15" style={{
        width: 600, height: 600, left: -150, top: -200,
        background: 'radial-gradient(circle, #3366ff, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'orbDrift1 22s ease-in-out infinite alternate',
      }} />
      <div className="absolute rounded-full opacity-10" style={{
        width: 500, height: 500, right: -100, bottom: -100,
        background: 'radial-gradient(circle, #00f3ff, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'orbDrift2 18s ease-in-out infinite alternate',
      }} />
      {/* Grid */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `
          linear-gradient(rgba(0,243,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,243,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '52px 52px',
        animation: 'gridShift 20s linear infinite',
      }} />
      <style>{`
        @keyframes orbDrift1 { from{transform:translate(0,0) scale(1)} to{transform:translate(60px,40px) scale(1.08)} }
        @keyframes orbDrift2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-50px,30px) scale(1.05)} }
        @keyframes gridShift { from{transform:translateY(0)} to{transform:translateY(52px)} }
      `}</style>
    </div>
  );
}

// ── Tab content ───────────────────────────────────────────────────
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

// ── Floating side action buttons (right side) ─────────────────────
function SideActions({ onMenu, onSettings }: { onMenu: () => void; onSettings: () => void }) {
  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
      {[
        { icon: '⚙️', label: 'Settings', action: onSettings },
        { icon: '☰',  label: 'Menu',     action: onMenu },
      ].map(btn => (
        <button key={btn.label} onClick={btn.action}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg transition-all active:scale-90"
          style={{
            background: 'rgba(2,6,20,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,243,255,0.2)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 12px rgba(0,243,255,0.1)',
          }}>
          {btn.icon}
        </button>
      ))}
    </div>
  );
}

// ── Hamburger drawer ──────────────────────────────────────────────
const DRAWER_TABS: { id: TabId; label: string; emoji: string; desc: string }[] = [
  { id: 'market',  label: 'MARKET',       emoji: '🎴', desc: 'NFTs · Artefacts · Trade'      },
  { id: 'stake',   label: 'STAKE',        emoji: '📈', desc: 'Stake Chills & Diamonds'        },
  { id: 'hq',      label: 'NULL HQ',      emoji: '🏗️', desc: 'Build your headquarters'       },
  { id: 'achieve', label: 'ACHIEVEMENTS', emoji: '🏅', desc: 'Track your milestones'          },
];

function MenuDrawer({
  open, onClose, active, onChange,
}: {
  open: boolean; onClose: () => void;
  active: TabId; onChange: (t: TabId) => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50" onClick={onClose}
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
      )}
      {/* Drawer */}
      <div className={cn(
        'fixed right-0 top-0 bottom-0 z-50 w-72 transition-transform duration-300',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
        style={{
          background: 'rgba(4,13,30,0.97)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(0,243,255,0.15)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
        }}>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-5 border-b border-white/5">
          <div>
            <p className="font-orbitron text-lg font-black neon-cyan">MENU</p>
            <p className="font-mono text-[10px] text-white/30 tracking-widest">null.run</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white border border-white/10 hover:border-white/30 transition-all">
            ✕
          </button>
        </div>

        {/* Drawer items */}
        <div className="p-4 space-y-2">
          {DRAWER_TABS.map(t => (
            <button key={t.id}
              onClick={() => { onChange(t.id); onClose(); }}
              className={cn(
                'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all text-left active:scale-[0.98]',
                active === t.id
                  ? 'border-neon-cyan/40 bg-neon-cyan/10'
                  : 'border-white/5 bg-white/3 hover:border-white/15 hover:bg-white/5',
              )}>
              <span className="text-2xl">{t.emoji}</span>
              <div>
                <p className={cn('font-orbitron text-xs font-bold', active === t.id ? 'neon-cyan' : 'text-white/80')}>
                  {t.label}
                </p>
                <p className="font-mono text-[9px] text-white/30 mt-0.5">{t.desc}</p>
              </div>
              {active === t.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_rgba(0,243,255,0.8)]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Floating bottom nav ───────────────────────────────────────────
const BOTTOM_TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'core',    label: 'CORE',   emoji: '∅'  },
  { id: 'produce', label: 'SHOP',   emoji: '⚡' },
  { id: 'rank',    label: 'RANK',   emoji: '🏆' },
  { id: 'social',  label: 'SOCIAL', emoji: '👥' },
];

function FloatingNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40" style={{ width: 'calc(100% - 32px)', maxWidth: 420 }}>
      <div className="flex items-center justify-around px-2 py-2 rounded-3xl"
        style={{
          background: 'rgba(2,6,20,0.90)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,243,255,0.18)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(0,243,255,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
        {BOTTOM_TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-2xl transition-all duration-200 active:scale-90',
                isActive ? 'bg-white/8' : 'opacity-45 hover:opacity-70',
              )}>
              {/* Active pill indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-neon-cyan"
                  style={{ boxShadow: '0 0 8px rgba(0,243,255,1)' }} />
              )}
              <span className={cn('text-xl leading-none', isActive && tab.id === 'core' ? 'neon-cyan' : '')}>
                {tab.emoji}
              </span>
              <span className={cn(
                'font-orbitron text-[8px] font-bold tracking-widest leading-none',
                isActive ? 'neon-cyan' : 'text-white/40',
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main layout ───────────────────────────────────────────────────
export default function GameLayout() {
  const [activeTab,     setActiveTab]     = useState<TabId>('core');
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [settingsOpen,  setSettingsOpen]  = useState(false);

  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
  }

  return (
    <div className="relative flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      <GameBg />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <GameHeader onSettingsOpen={() => setSettingsOpen(true)} />
      </div>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ position: 'relative', zIndex: 1, paddingBottom: 100 }}>
        <div className="max-w-lg mx-auto w-full">
          <TabContent tab={activeTab} />
        </div>
      </main>

      {/* Right side floating action buttons */}
      <SideActions
        onMenu={() => setDrawerOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      />

      {/* Hamburger drawer */}
      <MenuDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        active={activeTab}
        onChange={handleTabChange}
      />

      {/* Floating bottom nav */}
      <FloatingNav active={activeTab} onChange={handleTabChange} />

      {/* Settings modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
