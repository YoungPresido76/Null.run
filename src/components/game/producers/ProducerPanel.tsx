import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { PRODUCERS, ARTEFACTS } from '@/lib/constants';
import { producerCost, getCPS } from '@/lib/gameLogic';
import { fmt, cn } from '@/lib/utils';

function ProducerCard({ def }: { def: typeof PRODUCERS[0] }) {
  const { state, dispatch } = useGame();
  const owned    = state.producers[def.id]?.count ?? 0;
  const cost     = producerCost(def.id, owned);
  const canAfford = state.chills >= cost;
  const cpsEach  = def.baseCPS;

  return (
    <div className={cn(
      'glass rounded-xl px-4 py-3 border transition-all producer-card',
      canAfford ? 'border-neon-cyan/25 hover:border-neon-cyan/50' : 'border-white/5 opacity-70',
    )}>
      <div className="flex items-center gap-3">
        {/* Icon + count */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl glass border border-white/10 flex items-center justify-center text-2xl">
            {def.emoji}
          </div>
          {owned > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neon-cyan text-void-bg font-orbitron text-[9px] font-black flex items-center justify-center">
              {owned > 99 ? '99+' : owned}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-orbitron text-sm font-bold text-white/90 truncate">{def.name}</p>
          <p className="font-mono text-[10px] text-white/30 truncate">{def.description}</p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(0,243,255,0.5)' }}>
            {fmt(cpsEach)}/s each · {owned > 0 && `total ${fmt(cpsEach * owned)}/s`}
          </p>
        </div>

        {/* Buy button */}
        <button
          onClick={() => dispatch({ type: 'BUY_PRODUCER', id: def.id })}
          disabled={!canAfford}
          className={cn(
            'shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border',
            'font-orbitron text-[10px] font-bold tracking-wider',
            'transition-all duration-150 active:scale-95 min-w-[72px]',
            canAfford
              ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 shadow-[0_0_8px_rgba(0,243,255,0.2)]'
              : 'border-white/10 text-white/20 cursor-not-allowed',
          )}
        >
          <span className="text-xs">BUY</span>
          <span className="text-[9px] mt-0.5 opacity-80">{fmt(cost)} ❄️</span>
        </button>
      </div>
    </div>
  );
}

function ArtefactCard({ def }: { def: typeof ARTEFACTS[0] }) {
  const { state, dispatch } = useGame();
  const owned     = !!state.artefacts[def.id];
  const canAfford = !owned && state.diamonds >= def.cost;

  return (
    <div className={cn(
      'glass rounded-xl px-4 py-3 border transition-all',
      owned   ? 'border-neon-purple/30 bg-neon-purple/5' :
      canAfford ? 'border-white/15 hover:border-neon-purple/40' : 'border-white/5 opacity-50',
    )}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl glass border border-white/10 flex items-center justify-center text-2xl shrink-0">
          {def.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-orbitron text-sm font-bold text-white/90">{def.name}</p>
          <p className="font-mono text-[10px] text-neon-purple/70">{def.description}</p>
        </div>
        {owned ? (
          <span className="font-orbitron text-[10px] text-neon-purple tracking-widest">OWNED ✓</span>
        ) : (
          <button
            onClick={() => {
              if (!canAfford) return;
              dispatch({ type: 'SPEND_DIAMONDS', amount: def.cost });
              dispatch({ type: 'UNLOCK_ARTEFACT', id: def.id });
            }}
            disabled={!canAfford}
            className={cn(
              'shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border',
              'font-orbitron text-[10px] font-bold tracking-wider min-w-[72px]',
              'transition-all duration-150 active:scale-95',
              canAfford
                ? 'border-neon-purple/50 text-neon-purple bg-neon-purple/10 hover:bg-neon-purple/20'
                : 'border-white/10 text-white/20 cursor-not-allowed',
            )}
          >
            <span>BUY</span>
            <span className="text-[9px] mt-0.5 opacity-80">{def.cost} 💎</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProducerPanel() {
  const { state, cps } = useGame();
  const [showArtefacts, setShowArtefacts] = useState(false);

  const totalProducers = Object.values(state.producers).reduce((s, p) => s + p.count, 0);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 text-center">
        <h2 className="font-orbitron text-2xl font-black neon-cyan tracking-widest mb-1">
          PRODUCTION SHOP
        </h2>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="text-center">
            <p className="font-orbitron text-lg neon-cyan">{fmt(cps)}/s</p>
            <p className="font-mono text-[9px] text-white/30">GLOBAL CPS</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="font-orbitron text-lg text-white/70">{totalProducers}</p>
            <p className="font-mono text-[9px] text-white/30">OWNED</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="font-orbitron text-lg neon-cyan">{fmt(state.chills)}</p>
            <p className="font-mono text-[9px] text-white/30">BALANCE</p>
          </div>
        </div>
      </div>

      {/* Producers list */}
      <div className="px-4 space-y-2 mb-6">
        {PRODUCERS.map(def => <ProducerCard key={def.id} def={def} />)}
      </div>

      {/* Artefacts section */}
      <div className="px-4">
        <button
          onClick={() => setShowArtefacts(v => !v)}
          className="w-full glass rounded-xl px-4 py-3 border border-neon-purple/20 flex items-center justify-between hover:border-neon-purple/40 transition-all"
        >
          <span className="font-orbitron text-sm text-neon-purple font-bold tracking-wider">⚗️ ARTEFACTS</span>
          <span className="font-mono text-[10px] text-white/30">{showArtefacts ? '▲ HIDE' : '▼ SHOW'}</span>
        </button>

        {showArtefacts && (
          <div className="mt-2 space-y-2">
            <p className="font-mono text-[10px] text-white/25 text-center py-1">
              Permanent CPS multipliers · purchased with Diamonds
            </p>
            {ARTEFACTS.map(def => <ArtefactCard key={def.id} def={def} />)}
          </div>
        )}
      </div>
    </div>
  );
}
