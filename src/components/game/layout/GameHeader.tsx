import { useGame }   from '@/context/GameContext';
import { fmt }        from '@/lib/utils';
import { STUDIO_NAME }from '@/lib/constants';
import { GameIcon, NAV_ICONS, CURRENCY_ICONS } from '@/lib/icons';

interface Props { onSettingsOpen: () => void; }

export default function GameHeader({ onSettingsOpen }: Props) {
  const { state, cps } = useGame();

  return (
    <header className="relative z-30 px-3 pb-2 pt-2"
      style={{
        background:    'var(--prism-glass-bg)',
        backdropFilter:'var(--prism-blur-lg)',
        WebkitBackdropFilter: 'var(--prism-blur-lg)',
        borderBottom:  '1px solid var(--void-border-primary)',
      }}>

      {/* HUD sweep */}
      <div className="hud-sweep-line rounded-none" style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(0,243,255,0.04),transparent)', animation:'sweep 8s linear infinite' }} />
      </div>

      {/* Top row: username + brand + settings */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--nv-green)' }} />
          <span className="font-game text-xs" style={{ color: 'var(--void-primary-400)', letterSpacing: '0.12em' }}>
            {state.username.toUpperCase()}
          </span>
        </div>
        <span className="font-display text-xs tracking-widest" style={{ color: 'var(--void-text-muted)', letterSpacing: '0.25em' }}>
          {STUDIO_NAME.toUpperCase()}
        </span>
        <button onClick={onSettingsOpen}
          className="void-btn void-btn-xs void-btn-ghost" style={{ padding: '4px 6px' }}>
          <GameIcon name={NAV_ICONS.settings} size={14} />
        </button>
      </div>

      {/* Currency row */}
      <div className="flex items-end justify-between gap-3">
        {/* Chills */}
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <GameIcon name={CURRENCY_ICONS.chills} size={10} style={{ color: 'var(--void-primary-500)', opacity: 0.7 }} />
            <span className="void-stat-label" style={{ marginBottom: 0 }}>CHILLS</span>
          </div>
          <p className="font-display font-black text-2xl chill-number leading-none neon-cyan">{fmt(state.chills)}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <GameIcon name="lucide:activity" size={8} style={{ color: 'var(--void-primary-500)', opacity: 0.5 }} />
            <span className="font-game text-xs" style={{ color: 'rgba(0,243,255,0.5)' }}>{fmt(cps)}/s</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, transparent, var(--void-border-primary), transparent)' }} />

        {/* All time */}
        <div className="flex-1 text-center">
          <p className="void-stat-label">ALL TIME</p>
          <p className="font-display text-sm chill-number leading-none" style={{ color: 'var(--void-text-secondary)' }}>
            {fmt(state.totalChills)}
          </p>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, transparent, var(--void-border-primary), transparent)' }} />

        {/* Diamonds */}
        <div className="flex-1 text-right">
          <div className="flex items-center gap-1 justify-end mb-0.5">
            <GameIcon name={CURRENCY_ICONS.diamonds} size={10} style={{ color: 'var(--void-accent-400)', opacity: 0.7 }} />
            <span className="void-stat-label" style={{ marginBottom: 0 }}>DIAMONDS</span>
          </div>
          <p className="font-display font-black text-2xl chill-number leading-none neon-magenta">{fmt(state.diamonds)}</p>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <GameIcon name={CURRENCY_ICONS.nft} size={8} style={{ color: 'var(--void-accent-400)', opacity: 0.5 }} />
            <span className="font-game text-xs" style={{ color: 'rgba(255,0,170,0.5)' }}>{state.ownedNfts.length} NFTs</span>
          </div>
        </div>
      </div>
    </header>
  );
}
