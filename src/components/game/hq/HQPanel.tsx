import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { HQ_ROOMS, HQ_RANKS } from '@/lib/constants';
import { getHQRank } from '@/lib/gameLogic';
import { fmt, fmtTime, cn } from '@/lib/utils';

// Diamond mine config
const MINE_INTERVAL = 4 * 3600 * 1000; // 4 hours
const MINE_REWARD   = 5; // diamonds

function HQRoomCard({ def }: { def: typeof HQ_ROOMS[0] }) {
  const { state, dispatch } = useGame();
  const room      = state.hqRooms[def.id] ?? { level: 0, buildingUntil: null };
  const isMax     = room.level >= def.maxLevel;
  const isBuilding= !!room.buildingUntil && room.buildingUntil > Date.now();
  const upgCost   = Math.ceil(def.baseCost * Math.pow(2, room.level));
  const canAfford = !isMax && !isBuilding && state.diamonds >= upgCost;
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isBuilding) return;
    const id = setInterval(() => {
      const left = (room.buildingUntil ?? 0) - Date.now();
      if (left <= 0) {
        clearInterval(id);
        dispatch({ type: 'UPGRADE_HQ', id: def.id });
      } else {
        setTimeLeft(left);
      }
    }, 1000);
    setTimeLeft((room.buildingUntil ?? 0) - Date.now());
    return () => clearInterval(id);
  }, [room.buildingUntil, isBuilding]);

  function handleUpgrade() {
    if (!canAfford) return;
    dispatch({ type: 'SPEND_DIAMONDS', amount: upgCost });
    // Start build timer (simplified: instant for now — real build timer needs HQ reducer extension)
    dispatch({ type: 'UPGRADE_HQ', id: def.id });
  }

  const progressPct = (room.level / def.maxLevel) * 100;

  return (
    <div className={cn(
      'glass rounded-xl p-4 border transition-all',
      isMax     ? 'border-yellow-400/30 bg-yellow-400/5' :
      isBuilding? 'border-neon-purple/30' :
      canAfford ? 'border-white/15 hover:border-neon-cyan/30' : 'border-white/5',
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-3xl shrink-0">{def.emoji}</div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-orbitron text-sm font-bold text-white/90">{def.name}</p>
            <span className={cn(
              'font-mono text-[9px] tracking-widest px-2 py-0.5 rounded-full border',
              isMax ? 'border-yellow-400/40 text-yellow-400' : 'border-white/15 text-white/30',
            )}>
              {isMax ? 'MAX' : `LV ${room.level}/${def.maxLevel}`}
            </span>
          </div>

          <p className="font-mono text-[10px] text-white/30 mb-2">{def.bonusPerLevel}</p>

          {/* Level progress bar */}
          <div className="w-full h-1 rounded-full bg-white/10 mb-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Action */}
          {isMax ? (
            <p className="font-orbitron text-[10px] text-yellow-400">⚡ FULLY UPGRADED</p>
          ) : isBuilding ? (
            <p className="font-mono text-[10px] text-neon-purple animate-pulse">
              BUILDING... {fmtTime(timeLeft)}
            </p>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={!canAfford}
              className={cn(
                'font-orbitron text-[10px] font-bold px-4 py-1.5 rounded-lg border',
                'transition-all active:scale-95',
                canAfford
                  ? 'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20'
                  : 'border-white/10 text-white/20 cursor-not-allowed',
              )}
            >
              UPGRADE · {upgCost} 💎
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HQPanel() {
  const { state, dispatch } = useGame();

  const [mineReady,    setMineReady]    = useState(false);
  const [mineTimeLeft, setMineTimeLeft] = useState(0);
  const [lastMine,     setLastMine]     = useState(() => {
    return parseInt(localStorage.getItem('nv_last_mine') ?? '0');
  });

  // Total tiers built
  const totalTiers = Object.values(state.hqRooms).reduce((s, r) => s + r.level, 0);
  const maxTiers   = HQ_ROOMS.reduce((s, r) => s + r.maxLevel, 0);
  const hqRank     = getHQRank(state);
  const hasAnyRoom = totalTiers > 0;

  // Mine timer
  useEffect(() => {
    if (!hasAnyRoom) return;
    const id = setInterval(() => {
      const elapsed = Date.now() - lastMine;
      const left    = Math.max(0, MINE_INTERVAL - elapsed);
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
  }

  // Active bonuses list
  const bonuses = HQ_ROOMS
    .filter(def => (state.hqRooms[def.id]?.level ?? 0) > 0)
    .map(def => {
      const lvl = state.hqRooms[def.id].level;
      return `${def.emoji} ${def.name} Lv${lvl} · +${(def.cpsBoost * lvl * 100).toFixed(0)}% CPS`;
    });

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 text-center">
        <p className="font-mono text-[10px] tracking-widest text-white/30 mb-1">NULL.RUN</p>
        <h2 className="font-orbitron text-3xl font-black neon-cyan tracking-widest mb-2">
          NULL HQ
        </h2>
        <div className="inline-block px-5 py-1.5 rounded-full border border-neon-purple/40 bg-neon-purple/10 mb-3">
          <span className="font-orbitron text-sm text-neon-purple">{hqRank}</span>
        </div>

        {/* Progress bar */}
        <div className="glass rounded-xl p-3 mx-2">
          <div className="flex justify-between text-[9px] text-white/30 font-mono mb-1.5">
            <span>TIERS BUILT</span>
            <span>{totalTiers} / {maxTiers}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-yellow-400 transition-all duration-500"
              style={{ width: `${(totalTiers / maxTiers) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Diamond Mine */}
      {hasAnyRoom && (
        <div className="px-4 mb-4">
          <div className={cn(
            'glass rounded-xl p-4 border flex items-center justify-between',
            mineReady ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-yellow-400/20',
          )}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⛏️</span>
              <div>
                <p className="font-orbitron text-xs text-yellow-400 font-bold">DIAMOND MINE</p>
                <p className="font-mono text-[10px] text-white/40">
                  {mineReady ? 'READY TO CLAIM!' : `Next payout in ${fmtTime(mineTimeLeft)}`}
                </p>
              </div>
            </div>
            <button
              onClick={claimMine}
              disabled={!mineReady}
              className={cn(
                'font-orbitron text-[10px] font-bold px-4 py-2 rounded-lg border',
                'transition-all active:scale-95',
                mineReady
                  ? 'border-yellow-400/50 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 animate-pulse'
                  : 'border-white/10 text-white/20 cursor-not-allowed',
              )}
            >
              CLAIM {MINE_REWARD} 💎
            </button>
          </div>
        </div>
      )}

      {/* Rooms */}
      <div className="px-4 space-y-3 mb-4">
        {HQ_ROOMS.map(def => <HQRoomCard key={def.id} def={def} />)}
      </div>

      {/* Bonus summary */}
      <div className="px-4">
        <div className="glass rounded-xl p-4 border border-white/5">
          <p className="font-mono text-[10px] tracking-widest text-white/30 mb-3">ACTIVE HQ BONUSES</p>
          {bonuses.length === 0 ? (
            <p className="font-mono text-[10px] text-white/20 text-center py-2">
              No rooms built yet · upgrade a room to gain bonuses
            </p>
          ) : (
            <div className="space-y-2">
              {bonuses.map((b, i) => (
                <p key={i} className="font-mono text-[10px] text-neon-cyan/70">{b}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
