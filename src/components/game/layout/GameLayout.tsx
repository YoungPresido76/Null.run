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
import StyleguideBoard from '../styleguide/StyleguideBoard';
import SettingsModal from '../modals/SettingsModal';
import { cn }        from '@/lib/utils';
import { GameIcon, NAV_ICONS } from '@/lib/icons';

export type TabId = 'core' | 'produce' | 'rank' | 'social' | 'market' | 'stake' | 'hq' | 'achieve' | 'styleguide';

// ── Animated background ───────────────────────────────────────────
function GameBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: 'var(--void-bg-primary)' }} />
      <div className="absolute rounded-full" style={{
        width: 600, height: 600, left: -150, top: -200, opacity: 0.12,
        background: 'radial-gradient(circle, #3366ff, transparent 70%)',
        filter: 'blur(80px)', animation: 'orbDrift1 22s ease-in-out infinite alternate',
      }} />
      <div className="absolute rounded-full" style={{
        width: 500, height: 500, right: -100, bottom: -100, opacity: 0.08,
        background: 'radial-gradient(circle, #00f3ff, transparent 70%)',
        filter: 'blur(80px)', animation: 'orbDrift2 18s ease-in-out infinite alternate',
      }} />
      <div className="absolute inset-0" style={{
        opacity: 0.35,
        backgroundImage: `
          linear-gradient(rgba(0,243,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,243,255,0.04) 1px, transparent 1px)`,
        backgroundSize: '52px 52px',
        animation: 'gridShift 20s linear infinite',
      }} />
    </div>
  );
}

// ── Tab content router ────────────────────────────────────────────
function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'core':       return <ChillOrb />;
    case 'produce':    return <ProducerPanel />;
    case 'rank':       return <Leaderboard />;
    case 'social':     return <Social />;
    case 'market':     return <Market />;
    case 'stake':      return <StakePanel />;
    case 'hq':         return <HQPanel />;
    case 'achieve':    return <Achievements />;
    case 'styleguide': return <StyleguideBoard />;
  }
}

// ── Right side floating action buttons ───────────────────────────
function SideActions({ onMenu, onSettings }: { onMenu: () => void; onSettings: () => void }) {
  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3" style={{ zIndex: 40 }}>
      {[
        { icon: NAV_ICONS.settings, label: 'Settings', action: onSettings },
        { icon: NAV_ICONS.menu,     label: 'Menu',     action: onMenu },
      ].map(btn => (
        <button key={btn.label} onClick={btn.action}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90"
          style={{
            background:     'var(--prism-glass-bg)',
            backdropFilter: 'var(--prism-blur-lg)',
            WebkitBackdropFilter: 'var(--prism-blur-lg)',
            border:     '1px solid var(--void-border-primary)',
            boxShadow:  '0 4px 24px rgba(0,0,0,0.5), var(--void-shadow-glow)',
          }}>
          <GameIcon name={btn.icon} size={18} style={{ color: 'var(--void-primary-500)', opacity: 0.85 }} />
        </button>
      ))}
    </div>
  );
}

// ── Hamburger drawer ──────────────────────────────────────────────
const DRAWER_TABS: { id: TabId; label: string; icon: string; desc: string }[] = [
  { id: 'market',     label: 'MARKET',       icon: NAV_ICONS.market,  desc: 'NFTs · Artefacts · Trade'   },
  { id: 'stake',      label: 'STAKE',        icon: NAV_ICONS.stake,   desc: 'Stake Chills & Diamonds'    },
  { id: 'hq',         label: 'NULL HQ',      icon: NAV_ICONS.hq,      desc: 'Build your headquarters'   },
  { id: 'achieve',    label: 'ACHIEVEMENTS', icon: NAV_ICONS.achieve, desc: 'Track your milestones'      },
  { id: 'styleguide', label: 'STYLEGUIDE',   icon: NAV_ICONS.achieve, desc: 'Design system reference'    },
];

function MenuDrawer({ open, onClose, active, onChange }: {
  open: boolean; onClose: () => void; active: TabId; onChange: (t: TabId) => void;
}) {
  return (
    <>
      {open && (
        <div className="fixed inset-0" style={{ zIndex: 50, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={onClose} />
      )}
      <div className={cn('fixed right-0 top-0 bottom-0 w-72 transition-transform duration-300', open ? 'translate-x-0' : 'translate-x-full')}
        style={{
          zIndex:         51,
          background:     'var(--void-bg-secondary)',
          backdropFilter: 'var(--prism-blur-xl)',
          borderLeft:     '1px solid var(--void-border-primary)',
          boxShadow:      '-8px 0 40px rgba(0,0,0,0.7)',
        }}>
        <div className="flex items-center justify-between px-5 pt-14 pb-5"
          style={{ borderBottom: '1px solid var(--void-border-primary)' }}>
          <div>
            <p className="font-display text-lg font-black neon-cyan">MENU</p>
            <p className="font-game text-xs" style={{ color: 'var(--void-text-muted)', letterSpacing: '0.15em' }}>null.run</p>
          </div>
          <button onClick={onClose} className="void-btn void-btn-xs void-btn-ghost">
            <GameIcon name={NAV_ICONS.close} size={14} />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {DRAWER_TABS.map(t => (
            <button key={t.id} onClick={() => { onChange(t.id); onClose(); }}
              className={cn('w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all text-left active:scale-[0.98]',
                active === t.id
                  ? 'border-[rgba(0,243,255,0.35)]'
                  : 'border-[var(--void-border-primary)] hover:border-[var(--void-border-secondary)]')}
              style={{ background: active === t.id ? 'rgba(0,243,255,0.08)' : 'var(--void-bg-tertiary)' }}>
              <GameIcon name={t.icon} size={22}
                style={{ color: active === t.id ? 'var(--void-primary-500)' : 'var(--void-text-secondary)', flexShrink: 0 }} />
              <div>
                <p className="font-display text-xs font-bold"
                  style={{ color: active === t.id ? 'var(--void-primary-500)' : 'var(--void-text-primary)' }}>
                  {t.label}
                </p>
                <p className="font-game text-[9px] mt-0.5" style={{ color: 'var(--void-text-muted)' }}>{t.desc}</p>
              </div>
              {active === t.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--nv-cyan)', boxShadow: '0 0 6px var(--nv-cyan)' }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Floating bottom pill nav ──────────────────────────────────────
const BOTTOM_TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'core',    label: 'CORE',   icon: NAV_ICONS.core    },
  { id: 'produce', label: 'SHOP',   icon: NAV_ICONS.produce },
  { id: 'rank',    label: 'RANK',   icon: NAV_ICONS.rank    },
  { id: 'social',  label: 'SOCIAL', icon: NAV_ICONS.social  },
];

function FloatingNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2" style={{ zIndex: 40, width: 'calc(100% - 40px)', maxWidth: 380 }}>
      <div className="flex items-center justify-around px-2 py-2 rounded-[2rem]"
        style={{
          background:          'rgba(4, 13, 30, 0.92)',
          backdropFilter:      'blur(28px)',
          WebkitBackdropFilter:'blur(28px)',
          border:              '1px solid var(--void-border-secondary)',
          boxShadow:           '0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 0.5px rgba(0,243,255,0.08)',
        }}>
        {BOTTOM_TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)}
              className="relative flex flex-col items-center justify-center gap-1.5 px-5 py-2 rounded-2xl transition-all duration-200 active:scale-90"
              style={{ opacity: isActive ? 1 : 0.4 }}>
              {isActive && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-7 h-0.5 rounded-full"
                  style={{ background: 'var(--nv-cyan)', boxShadow: '0 0 10px var(--nv-cyan)' }} />
              )}
              <GameIcon name={tab.icon} size={22}
                style={{
                  color:  isActive ? 'var(--void-primary-500)' : 'var(--void-text-secondary)',
                  filter: isActive ? 'drop-shadow(0 0 6px var(--nv-cyan))' : 'none',
                  transition: 'all 0.2s',
                }} />
              <span className="font-display text-[8px] font-bold tracking-widest leading-none"
                style={{ color: isActive ? 'var(--void-primary-500)' : 'var(--void-text-muted)' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Root layout ───────────────────────────────────────────────────
export default function GameLayout() {
  const [activeTab,    setActiveTab]    = useState<TabId>('core');
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      <GameBg />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <GameHeader onSettingsOpen={() => setSettingsOpen(true)} />
      </div>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none"
        style={{ position: 'relative', zIndex: 1, paddingBottom: 110 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <TabContent tab={activeTab} />
        </div>
      </main>

      {/* Side floating buttons */}
      <SideActions onMenu={() => setDrawerOpen(true)} onSettings={() => setSettingsOpen(true)} />

      {/* Hamburger drawer */}
      <MenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} active={activeTab} onChange={setActiveTab} />

      {/* Floating bottom nav */}
      <FloatingNav active={activeTab} onChange={setActiveTab} />

      {/* Settings modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
