import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { PRODUCERS, ARTEFACTS } from '@/lib/constants';
import { producerCost } from '@/lib/gameLogic';
import { fmt, cn } from '@/lib/utils';
import { GameIcon, PRODUCER_ICONS, ARTEFACT_ICONS } from '@/lib/icons';
import { useToast } from '@/context/ToastContext';

function ProducerCard({ def }: { def: typeof PRODUCERS[0] }) {
  const { state, dispatch } = useGame();
  const toast = useToast();
  const owned     = state.producers[def.id]?.count ?? 0;
  const cost      = producerCost(def.id, owned);
  const canAfford = state.chills >= cost;

  function handleBuy() {
    if (!canAfford) { toast.warning('Not enough Chills', `Need ${fmt(cost)} ❄️`); return; }
    dispatch({ type: 'BUY_PRODUCER', id: def.id });
    toast.success(`${def.name} purchased`, `+${fmt(def.baseCPS)}/s added`);
  }

  return (
    <div className={cn(
      'void-card-glass relative prism-corner',
      canAfford ? 'prism-corner' : 'prism-corner-purple opacity-70',
    )}>
      <div className="void-card-body flex items-center gap-4">
        {/* Icon */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,243,255,0.15), rgba(157,0,255,0.1))', border: '1px solid rgba(0,243,255,0.2)' }}>
            <GameIcon name={PRODUCER_ICONS[def.id] ?? 'game-icons:cog'} size={26} style={{ color: 'var(--nv-cyan)', opacity: 0.85 }} />
          </div>
          {owned > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center font-display text-[9px] font-black"
              style={{ background: 'var(--nv-cyan)', color: 'var(--void-bg-primary)' }}>
              {owned > 99 ? '99+' : owned}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="void-card-title text-sm truncate">{def.name}</p>
          <p className="void-card-subtitle truncate mt-0.5">{def.description}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="void-badge void-badge-primary void-badge" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>
              {fmt(def.baseCPS)}/s each
            </span>
            {owned > 0 && (
              <span className="void-badge void-badge-purple" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>
                {fmt(def.baseCPS * owned)}/s total
              </span>
            )}
          </div>
        </div>

        {/* Buy */}
        <button onClick={handleBuy}
          className={cn('void-btn void-btn-sm shrink-0 flex flex-col gap-0.5 min-w-[68px]',
            canAfford ? 'void-btn-glow' : 'void-btn-ghost opacity-40 cursor-not-allowed')}>
          <span>BUY</span>
          <span style={{ fontSize: '0.6rem', opacity: 0.75 }}>{fmt(cost)}</span>
        </button>
      </div>
    </div>
  );
}

function ArtefactCard({ def }: { def: typeof ARTEFACTS[0] }) {
  const { state, dispatch } = useGame();
  const toast = useToast();
  const owned     = !!state.artefacts[def.id];
  const canAfford = !owned && state.diamonds >= def.cost;

  function handleBuy() {
    if (owned) return;
    if (!canAfford) { toast.warning('Not enough Diamonds', `Need ${def.cost} 💎`); return; }
    dispatch({ type: 'SPEND_DIAMONDS', amount: def.cost });
    dispatch({ type: 'UNLOCK_ARTEFACT', id: def.id });
    toast.success(`${def.name} acquired`, def.description);
  }

  return (
    <div className={cn('void-card-glass relative', owned && 'prism-corner-purple')}>
      <div className="void-card-body flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(157,0,255,0.2), rgba(255,0,170,0.1))', border: '1px solid rgba(157,0,255,0.25)' }}>
          <GameIcon name={ARTEFACT_ICONS[def.id] ?? 'art:singularity_gem'} size={22} style={{ color: '#c084fc', opacity: 0.85 }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="void-card-title text-sm">{def.name}</p>
          <span className="void-badge void-badge-purple" style={{ padding: '2px 6px', fontSize: '0.6rem', marginTop: 4, display: 'inline-flex' }}>{def.description}</span>
        </div>
        {owned ? (
          <span className="void-badge void-badge-success">OWNED</span>
        ) : (
          <button onClick={handleBuy}
            className={cn('void-btn void-btn-sm shrink-0 flex flex-col gap-0.5',
              canAfford ? 'void-btn-accent' : 'void-btn-ghost opacity-40')}>
            <span>BUY</span>
            <span style={{ fontSize: '0.6rem', opacity: 0.75 }}>{def.cost}💎</span>
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
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h2 className="font-display text-2xl font-black neon-cyan tracking-widest mb-3">PRODUCTION SHOP</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'CPS',     val: fmt(cps),                color: 'var(--nv-cyan)'    },
            { label: 'OWNED',   val: String(totalProducers),  color: 'var(--void-text-primary)' },
            { label: 'BALANCE', val: fmt(state.chills),       color: 'var(--nv-cyan)'    },
          ].map(s => (
            <div key={s.label} className="void-stat-card text-center">
              <p className="void-stat-label">{s.label}</p>
              <p className="void-stat-value text-base" style={{ color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Producers */}
      <div className="px-4 space-y-2 mb-4">
        {PRODUCERS.map(def => <ProducerCard key={def.id} def={def} />)}
      </div>

      {/* Artefacts accordion */}
      <div className="px-4">
        <button onClick={() => setShowArtefacts(v => !v)}
          className="void-btn void-btn-ghost void-btn-full void-btn-md mb-2 justify-between">
          <span className="flex items-center gap-2">
            <GameIcon name="art:singularity_gem" size={14} />
            ARTEFACTS
          </span>
          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{showArtefacts ? '▲ HIDE' : '▼ SHOW'}</span>
        </button>
        {showArtefacts && (
          <div className="space-y-2">
            <p className="font-game text-xs text-center mb-2" style={{ color: 'var(--void-text-muted)', letterSpacing: '0.1em' }}>
              PERMANENT CPS MULTIPLIERS · BUY WITH DIAMONDS
            </p>
            {ARTEFACTS.map(def => <ArtefactCard key={def.id} def={def} />)}
          </div>
        )}
      </div>
    </div>
  );
}
