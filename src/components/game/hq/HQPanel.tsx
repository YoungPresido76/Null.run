import { useState, useEffect } from 'react';
import { useGame }      from '@/context/GameContext';
import { useToast }     from '@/context/ToastContext';
import { HQ_ROOMS, HQ_RANKS } from '@/lib/constants';
import { getHQRank }    from '@/lib/gameLogic';
import { fmt, fmtTime, cn } from '@/lib/utils';
import { GameIcon, HQ_ROOM_ICONS } from '@/lib/icons';

const MINE_INTERVAL = 4 * 3600 * 1000;
const MINE_REWARD   = 5;

function HQRoomCard({ def }: { def: typeof HQ_ROOMS[0] }) {
  const { state, dispatch } = useGame();
  const toast = useToast();
  const room      = state.hqRooms[def.id] ?? { level: 0, buildingUntil: null };
  const isMax     = room.level >= def.maxLevel;
  const upgCost   = Math.ceil(def.baseCost * Math.pow(2, room.level));
  const canAfford = !isMax && state.diamonds >= upgCost;
  const pct       = (room.level / def.maxLevel) * 100;

  function handleUpgrade() {
    if (!canAfford) { toast.warning('Not enough Diamonds', `Need ${upgCost} 💎`); return; }
    dispatch({ type: 'SPEND_DIAMONDS', amount: upgCost });
    dispatch({ type: 'UPGRADE_HQ',     id: def.id });
    toast.success(`${def.name} upgraded!`, `Level ${room.level + 1} · ${def.bonusPerLevel}`);
  }

  return (
    <div className={cn('void-card-glass relative', isMax && 'prism-corner-purple')}>
      <div className="void-card-body">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(157,0,255,0.2), rgba(0,243,255,0.1))', border: '1px solid rgba(157,0,255,0.25)' }}>
            <GameIcon name={HQ_ROOM_ICONS[def.id] ?? 'nav:hq'} size={22} style={{ color: '#c084fc' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="void-card-title text-sm">{def.name}</p>
              <span className={cn('void-badge', isMax ? 'void-badge-warning' : 'void-badge-primary')}
                style={{ fontSize: '0.6rem' }}>
                {isMax ? 'MAX' : `LV ${room.level}/${def.maxLevel}`}
              </span>
            </div>
            <p className="void-card-subtitle mt-0.5">{def.bonusPerLevel}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="void-progress-bar mb-3">
          <div className={cn('void-progress-fill', isMax ? 'void-progress-fill-accent' : '')}
            style={{ width: `${pct}%` }} />
        </div>

        {/* Action */}
        {isMax ? (
          <div className="flex items-center gap-2">
            <GameIcon name="game:upgrade" size={13} style={{ color: '#fbbf24' }} />
            <span className="font-display text-xs" style={{ color: '#fbbf24', letterSpacing: '0.06em' }}>FULLY UPGRADED</span>
          </div>
        ) : (
          <button onClick={handleUpgrade}
            className={cn('void-btn void-btn-sm', canAfford ? 'void-btn-glow' : 'void-btn-ghost opacity-40')}>
            <GameIcon name="game:upgrade" size={12} />
            UPGRADE · {upgCost} 💎
          </button>
        )}
      </div>
    </div>
  );
}

export default function HQPanel() {
  const { state, dispatch } = useGame();
  const toast = useToast();

  const [mineReady,     setMineReady]     = useState(false);
  const [mineTimeLeft,  setMineTimeLeft]  = useState(0);
  const [lastMine,      setLastMine]      = useState(() => parseInt(localStorage.getItem('nv_last_mine') ?? '0'));

  const totalTiers = Object.values(state.hqRooms).reduce((s, r) => s + r.level, 0);
  const maxTiers   = HQ_ROOMS.reduce((s, r) => s + r.maxLevel, 0);
  const hqRank     = getHQRank(state);
  const hasAnyRoom = totalTiers > 0;

  useEffect(() => {
    if (!hasAnyRoom) return;
    const id = setInterval(() => {
      const left = Math.max(0, MINE_INTERVAL - (Date.now() - lastMine));
      setMineTimeLeft(left);
      setMineReady(left === 0);
    }, 1000);
    return () => clearInterval(id);
  }, [lastMine, hasAnyRoom]);

  function claimMine() {
    if (!mineReady) return;
    dispatch({ type: 'ADD_DIAMONDS', amount: MINE_REWARD });
    const now = Date.now();
    setLastMine(now);
    localStorage.setItem('nv_last_mine', String(now));
    setMineReady(false);
    toast.success(`+${MINE_REWARD} Diamonds`, 'Diamond Mine collected!');
  }

  const bonuses = HQ_ROOMS
    .filter(def => (state.hqRooms[def.id]?.level ?? 0) > 0)
    .map(def => ({ name: def.name, level: state.hqRooms[def.id].level, boost: (def.cpsBoost * state.hqRooms[def.id].level * 100).toFixed(0) }));

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <p className="font-game text-xs mb-1" style={{ color: 'var(--void-text-muted)', letterSpacing: '0.2em' }}>NULL.RUN</p>
        <h2 className="font-display text-2xl font-black neon-cyan tracking-widest mb-3">NULL HQ</h2>

        <div className="void-card-glow p-4 relative prism-corner text-center">
          <div className="void-badge void-badge-purple text-sm px-4 py-1.5 mb-3" style={{ fontSize: '0.75rem' }}>
            {hqRank}
          </div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="font-game text-xs" style={{ color: 'var(--void-text-secondary)' }}>TIERS BUILT</span>
            <span className="font-display text-sm neon-cyan">{totalTiers}/{maxTiers}</span>
          </div>
          <div className="void-progress-bar" style={{ height: 8 }}>
            <div className="void-progress-fill void-progress-fill-multi" style={{ width: `${(totalTiers / maxTiers) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Diamond Mine */}
      {hasAnyRoom && (
        <div className="px-4 mb-4">
          <div className={cn('void-card-glass relative p-4 flex items-center justify-between',
            mineReady && 'prism-corner-accent')}
            style={{ borderColor: mineReady ? 'rgba(255,204,0,0.4)' : 'rgba(255,204,0,0.15)' }}>
            <div className="flex items-center gap-3">
              <GameIcon name="game:mine" size={26} style={{ color: mineReady ? '#fbbf24' : 'var(--void-text-secondary)' }} />
              <div>
                <p className="void-card-title text-sm" style={{ color: mineReady ? '#fbbf24' : 'var(--void-text-primary)' }}>DIAMOND MINE</p>
                <p className="void-card-subtitle">
                  {mineReady ? 'READY TO CLAIM!' : `Next in ${fmtTime(mineTimeLeft)}`}
                </p>
              </div>
            </div>
            <button onClick={claimMine} disabled={!mineReady}
              className={cn('void-btn void-btn-sm', mineReady ? 'void-btn-gradient animate-pulse' : 'void-btn-ghost opacity-30')}>
              +{MINE_REWARD} 💎
            </button>
          </div>
        </div>
      )}

      {/* Rooms */}
      <div className="px-4 space-y-2 mb-4">
        {HQ_ROOMS.map(def => <HQRoomCard key={def.id} def={def} />)}
      </div>

      {/* Bonus summary */}
      <div className="px-4">
        <div className="void-card p-4">
          <p className="void-stat-label mb-3">ACTIVE HQ BONUSES</p>
          {bonuses.length === 0 ? (
            <p className="font-game text-xs text-center py-2" style={{ color: 'var(--void-text-muted)' }}>
              No rooms upgraded yet
            </p>
          ) : (
            <div className="space-y-2">
              {bonuses.map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-game text-xs" style={{ color: 'var(--void-text-secondary)' }}>{b.name} Lv{b.level}</span>
                  <span className="void-badge void-badge-primary" style={{ fontSize: '0.6rem' }}>+{b.boost}% CPS</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
