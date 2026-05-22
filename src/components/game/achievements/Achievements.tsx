import { useGame } from '@/context/GameContext';
import { ACHIEVEMENT_DEFS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { GameIcon } from '@/lib/icons';

export default function Achievements() {
  const { state } = useGame();
  const unlocked = ACHIEVEMENT_DEFS.filter(a => state.achievements[a.id]);
  const locked   = ACHIEVEMENT_DEFS.filter(a => !state.achievements[a.id]);
  const pct      = Math.round((unlocked.length / ACHIEVEMENT_DEFS.length) * 100);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h2 className="font-display text-2xl font-black neon-cyan tracking-widest mb-1">ACHIEVEMENTS</h2>
        <div className="void-card-glass p-4 relative prism-corner mt-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="void-stat-label">PROGRESS</p>
              <p className="void-stat-value text-xl neon-cyan">{unlocked.length} <span style={{ color: 'var(--void-text-tertiary)', fontSize: '1rem' }}>/ {ACHIEVEMENT_DEFS.length}</span></p>
            </div>
            <div className="text-right">
              <p className="void-stat-label">COMPLETION</p>
              <p className="void-stat-value text-xl" style={{ color: pct === 100 ? 'var(--nv-green)' : 'var(--void-text-primary)' }}>{pct}%</p>
            </div>
          </div>
          <div className="void-progress-bar">
            <div className="void-progress-fill void-progress-fill-multi transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="px-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="void-badge void-badge-success">✓ UNLOCKED</span>
            <span className="font-game text-xs" style={{ color: 'var(--void-text-muted)' }}>{unlocked.length} achievements</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {unlocked.map(def => (
              <div key={def.id} className="void-card-glass p-3 border relative"
                style={{ borderColor: 'rgba(0,243,255,0.2)', background: 'rgba(0,243,255,0.05)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: 'linear-gradient(135deg, rgba(0,243,255,0.2), rgba(157,0,255,0.1))', border: '1px solid rgba(0,243,255,0.25)' }}>
                  <GameIcon name="game-icons:achievement" size={20} style={{ color: 'var(--nv-cyan)' }} />
                </div>
                <p className="font-display text-xs font-bold leading-tight mb-1" style={{ color: 'var(--void-text-primary)' }}>{def.name}</p>
                <p className="font-game text-[9px] leading-snug" style={{ color: 'var(--void-text-tertiary)' }}>{def.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--nv-green)' }} />
                  <span className="font-game text-[9px]" style={{ color: 'var(--nv-green)' }}>UNLOCKED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="px-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="void-badge void-badge-error">🔒 LOCKED</span>
            <span className="font-game text-xs" style={{ color: 'var(--void-text-muted)' }}>{locked.length} remaining</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {locked.map(def => (
              <div key={def.id} className="void-card p-3 opacity-45">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <GameIcon name="game-icons:padlock" size={18} style={{ color: 'var(--void-text-muted)' }} />
                </div>
                <p className="font-display text-xs font-bold leading-tight mb-1" style={{ color: 'var(--void-text-tertiary)' }}>{def.name}</p>
                <p className="font-game text-[9px] leading-snug" style={{ color: 'var(--void-text-muted)' }}>{def.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
