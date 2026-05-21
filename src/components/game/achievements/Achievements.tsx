import { useGame } from '@/context/GameContext';
import { ACHIEVEMENT_DEFS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { GameIcon } from '@/lib/icons';

export default function Achievements() {
  const { state } = useGame();

  const unlocked = ACHIEVEMENT_DEFS.filter(a => state.achievements[a.id]);
  const locked   = ACHIEVEMENT_DEFS.filter(a => !state.achievements[a.id]);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 text-center">
        <h2 className="font-orbitron text-2xl font-black neon-cyan tracking-widest mb-1">
          ACHIEVEMENTS
        </h2>
        <p className="font-mono text-[10px] text-white/30 tracking-wider">
          {unlocked.length} / {ACHIEVEMENT_DEFS.length} UNLOCKED
        </p>

        {/* Progress bar */}
        <div className="mt-3 mx-4">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta transition-all duration-700"
              style={{ width: `${(unlocked.length / ACHIEVEMENT_DEFS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="px-4 mb-5">
          <p className="font-mono text-[10px] tracking-widest text-neon-green mb-2">
            ✓ UNLOCKED
          </p>
          <div className="grid grid-cols-2 gap-2">
            {unlocked.map(def => (
              <div
                key={def.id}
                className="glass rounded-xl p-3 border border-neon-cyan/20 bg-neon-cyan/5"
              >
                <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center mb-1.5">
                  <GameIcon name="game-icons:achievement" size={22} className="text-neon-cyan" /></div>
                <p className="font-orbitron text-[11px] font-bold text-white/90 leading-tight mb-0.5">
                  {def.name}
                </p>
                <p className="font-mono text-[9px] text-white/35 leading-snug">
                  {def.description}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                  <span className="font-mono text-[9px] text-neon-green">UNLOCKED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="px-4">
          <p className="font-mono text-[10px] tracking-widest text-white/25 mb-2">
            🔒 LOCKED
          </p>
          <div className="grid grid-cols-2 gap-2">
            {locked.map(def => (
              <div
                key={def.id}
                className="glass rounded-xl p-3 border border-white/5 opacity-50"
              >
                <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center mb-1.5 opacity-40">
                  <GameIcon name="game-icons:padlock" size={22} className="text-white/30" /></div>
                <p className="font-orbitron text-[11px] font-bold text-white/40 leading-tight mb-0.5">
                  {def.name}
                </p>
                <p className="font-mono text-[9px] text-white/20 leading-snug">
                  {def.description}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="font-mono text-[9px] text-white/20">LOCKED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
