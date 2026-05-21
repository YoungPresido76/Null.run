import { useGame }    from '@/context/GameContext';
import { fmt }        from '@/lib/utils';
import { STUDIO_NAME }from '@/lib/constants';
import { GameIcon, NAV_ICONS, CURRENCY_ICONS } from '@/lib/icons';

interface Props { onSettingsOpen: () => void; }

export default function GameHeader({ onSettingsOpen }: Props) {
  const { state, cps } = useGame();

  return (
    <header className="relative z-30 px-3 pt-safe pb-2"
      style={{
        background: 'rgba(2,6,20,0.80)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,243,255,0.10)',
      }}>
      {/* HUD sweep */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-hud-sweep absolute inset-0 opacity-30"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(0,243,255,0.06),transparent)' }} />
      </div>

      {/* Top row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest" style={{ color: 'rgba(0,243,255,0.6)' }}>
            {state.username.toUpperCase()}
          </span>
        </div>
        <span className="font-orbitron text-[9px] tracking-[0.3em] text-white/20">{STUDIO_NAME.toUpperCase()}</span>
        <button onClick={onSettingsOpen}
          className="p-1.5 rounded-lg text-white/30 hover:text-neon-cyan transition-colors active:scale-90">
          <GameIcon name={NAV_ICONS.settings} size={15} />
        </button>
      </div>

      {/* Currency row */}
      <div className="flex items-end justify-between gap-2">
        {/* Chills */}
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <GameIcon name={CURRENCY_ICONS.chills} size={11} className="text-neon-cyan opacity-60" />
            <p className="font-mono text-[9px] tracking-widest text-white/30">CHILLS</p>
          </div>
          <p className="font-orbitron font-black text-2xl neon-cyan chill-number leading-none">
            {fmt(state.chills)}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <GameIcon name="lucide:activity" size={9} className="text-neon-cyan opacity-40" />
            <p className="font-mono text-[10px]" style={{ color: 'rgba(0,243,255,0.45)' }}>
              {fmt(cps)}/s
            </p>
          </div>
        </div>

        <div className="w-px h-8 bg-gradient-to-b from-transparent via-neon-cyan/20 to-transparent" />

        {/* All time */}
        <div className="flex-1 text-center">
          <p className="font-mono text-[9px] tracking-widest text-white/20 mb-0.5">ALL TIME</p>
          <p className="font-orbitron text-sm text-white/40 chill-number leading-none">
            {fmt(state.totalChills)}
          </p>
        </div>

        <div className="w-px h-8 bg-gradient-to-b from-transparent via-neon-cyan/20 to-transparent" />

        {/* Diamonds */}
        <div className="flex-1 text-right">
          <div className="flex items-center gap-1 justify-end mb-0.5">
            <GameIcon name={CURRENCY_ICONS.diamonds} size={11} className="text-neon-magenta opacity-60" />
            <p className="font-mono text-[9px] tracking-widest text-white/30">DIAMONDS</p>
          </div>
          <p className="font-orbitron font-black text-2xl neon-magenta chill-number leading-none">
            {fmt(state.diamonds)}
          </p>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <GameIcon name={CURRENCY_ICONS.nft} size={9} className="text-neon-magenta opacity-40" />
            <p className="font-mono text-[10px]" style={{ color: 'rgba(255,0,170,0.45)' }}>
              {state.ownedNfts.length} NFTs
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
