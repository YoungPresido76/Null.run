import { useGame }          from '@/context/GameContext';
import { fmt }               from '@/lib/utils';
import { STUDIO_NAME }       from '@/lib/constants';
import { Settings }          from 'lucide-react';

interface Props {
  onSettingsOpen: () => void;
}

export default function GameHeader({ onSettingsOpen }: Props) {
  const { state, cps } = useGame();

  return (
    <header className="glass-strong relative z-30 px-3 pt-safe pb-2">
      {/* HUD sweep line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-b-none">
        <div className="animate-hud-sweep absolute inset-0 opacity-30"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(0,243,255,0.06),transparent)' }} />
      </div>

      {/* Top meta row */}
      <div className="flex items-center justify-between mb-1.5">
        {/* Username */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest" style={{ color: 'rgba(0,243,255,0.6)' }}>
            {state.username.toUpperCase()}
          </span>
        </div>

        {/* Brand */}
        <span className="font-orbitron text-[9px] tracking-[0.3em] text-white/20">
          {STUDIO_NAME.toUpperCase()}
        </span>

        {/* Settings */}
        <button
          onClick={onSettingsOpen}
          className="p-1 rounded text-white/30 hover:text-neon-cyan transition-colors active:scale-90"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Main currency row */}
      <div className="flex items-end justify-between gap-2">

        {/* ── CHILLS ── */}
        <div className="flex-1">
          <p className="font-mono text-[9px] tracking-widest text-white/30 mb-0.5">CHILLS</p>
          <p className="font-orbitron font-black text-2xl neon-cyan chill-number leading-none">
            {fmt(state.chills)}
          </p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(0,243,255,0.45)' }}>
            {fmt(cps)}/s
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="flex flex-col items-center gap-0.5 pb-1">
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-neon-cyan/20 to-transparent" />
        </div>

        {/* ── TOTAL CHILLS ── */}
        <div className="flex-1 text-center">
          <p className="font-mono text-[9px] tracking-widest text-white/20 mb-0.5">ALL TIME</p>
          <p className="font-orbitron text-sm text-white/40 chill-number leading-none">
            {fmt(state.totalChills)}
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="flex flex-col items-center gap-0.5 pb-1">
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-neon-cyan/20 to-transparent" />
        </div>

        {/* ── DIAMONDS ── */}
        <div className="flex-1 text-right">
          <p className="font-mono text-[9px] tracking-widest text-white/30 mb-0.5">DIAMONDS</p>
          <p className="font-orbitron font-black text-2xl neon-magenta chill-number leading-none">
            {fmt(state.diamonds)}
          </p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,0,170,0.45)' }}>
            💎 {state.ownedNfts.length} NFTs
          </p>
        </div>
      </div>
    </header>
  );
}
