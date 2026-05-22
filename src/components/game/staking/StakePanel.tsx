import { useState, useEffect } from 'react';
import { useGame }     from '@/context/GameContext';
import { useToast }    from '@/context/ToastContext';
import { fmt, fmtTime, cn } from '@/lib/utils';
import { GameIcon }    from '@/lib/icons';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

type StakeTab = 'chills' | 'diamonds' | 'pot';

function calcPrice(history: { type: string }[]) {
  const buys  = history.filter(h => h.type === 'buy').length;
  const sells = history.filter(h => h.type === 'sell').length;
  return Math.max(0.5, 1 + (buys - sells) * 0.05);
}

interface PotData { pot: number; totalStaked: number; weekEnd: number; recent: { username: string; amount: number }[]; }

function usePotData() {
  const [pot, setPot] = useState<PotData | null>(null);
  useEffect(() => {
    const db = getFirestore();
    const unsub = onSnapshot(doc(db, 'communityPot', 'week'), snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setPot({ pot: d.pot ?? 0, totalStaked: d.totalStaked ?? 0, weekEnd: d.weekEnd?.toMillis?.() ?? Date.now() + 604800000, recent: d.recentStakes ?? [] });
    }, () => {});
    return unsub;
  }, []);
  return pot;
}

function ChillsStake() {
  const { state, dispatch } = useGame();
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [mode,   setMode]   = useState<'buy'|'sell'>('buy');
  const history = state.stakes ?? [];
  const price   = calcPrice(history);
  const staked  = history.filter(h => h.type === 'buy').reduce((s,h) => s+h.amount,0)
                - history.filter(h => h.type === 'sell').reduce((s,h) => s+h.amount,0);

  function execute() {
    const n = parseFloat(amount);
    if (!n || n <= 0) { toast.warning('Invalid amount'); return; }
    if (mode === 'buy') {
      if (state.chills < n) { toast.error('Not enough Chills'); return; }
      dispatch({ type: 'SPEND_CHILLS', amount: n });
      toast.success(`Staked ${fmt(n)} Chills`);
    } else {
      if (staked < n) { toast.error('Not enough staked'); return; }
      dispatch({ type: 'ADD_CHILLS', amount: n });
      toast.success(`Unstaked ${fmt(n)} Chills`);
    }
    setAmount('');
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'BALANCE', val: fmt(state.chills), color: 'var(--nv-cyan)' },
          { label: 'STAKED',  val: fmt(staked),        color: 'var(--void-text-primary)' },
          { label: 'INDEX',   val: price.toFixed(2)+'x', color: 'var(--nv-green)' },
        ].map(s => (
          <div key={s.label} className="void-stat-card text-center">
            <p className="void-stat-label">{s.label}</p>
            <p className="void-stat-value text-sm chill-number" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {(['buy','sell'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={cn('void-btn void-btn-sm flex-1',
              mode === m ? (m === 'buy' ? 'void-btn-glow' : 'void-btn-accent') : 'void-btn-ghost')}>
            {m === 'buy' ? '▲ STAKE' : '▼ UNSTAKE'}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="number" placeholder="Amount of Chills" value={amount}
          onChange={e => setAmount(e.target.value)}
          className="void-input flex-1" />
        <button onClick={execute}
          className={cn('void-btn void-btn-md', mode === 'buy' ? 'void-btn-glow' : 'void-btn-accent')}>
          GO
        </button>
      </div>
      {history.length > 0 && (
        <div>
          <p className="void-stat-label mb-2">HISTORY</p>
          <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-none">
            {[...history].reverse().slice(0,8).map((h, i) => (
              <div key={i} className="void-card flex items-center justify-between px-3 py-2">
                <span className={cn('font-game text-xs', h.type === 'buy' ? 'text-green-400' : 'text-pink-400')}>
                  {h.type === 'buy' ? '▲' : '▼'} {fmt(h.amount)} ❄️
                </span>
                <span className="font-game text-xs" style={{ color: 'var(--void-text-muted)' }}>
                  @{(h.price ?? 1).toFixed(2)}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DiamondStake() {
  const { state, dispatch } = useGame();
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [mode,   setMode]   = useState<'buy'|'sell'>('buy');
  const history = state.diamondStakes ?? [];
  const staked  = history.filter(h => h.type === 'buy').reduce((s,h) => s+h.amount,0)
                - history.filter(h => h.type === 'sell').reduce((s,h) => s+h.amount,0);

  function execute() {
    const n = parseFloat(amount);
    if (!n || n <= 0) { toast.warning('Invalid amount'); return; }
    if (mode === 'buy') {
      if (state.diamonds < n) { toast.error('Not enough Diamonds'); return; }
      dispatch({ type: 'SPEND_DIAMONDS', amount: n });
      toast.success(`Staked ${n} 💎`);
    } else {
      if (staked < n) { toast.error('Not enough staked'); return; }
      dispatch({ type: 'ADD_DIAMONDS', amount: n });
      toast.success(`Unstaked ${n} 💎`);
    }
    setAmount('');
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'BALANCE', val: `${state.diamonds} 💎`, color: 'var(--nv-magenta)' },
          { label: 'STAKED',  val: `${staked} 💎`,         color: 'var(--void-text-primary)' },
        ].map(s => (
          <div key={s.label} className="void-stat-card text-center">
            <p className="void-stat-label">{s.label}</p>
            <p className="void-stat-value text-sm" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {(['buy','sell'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={cn('void-btn void-btn-sm flex-1',
              mode === m ? 'void-btn-accent' : 'void-btn-ghost')}>
            {m === 'buy' ? '▲ STAKE 💎' : '▼ UNSTAKE 💎'}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="number" placeholder="Amount of Diamonds" value={amount}
          onChange={e => setAmount(e.target.value)} className="void-input flex-1" />
        <button onClick={execute} className="void-btn void-btn-md void-btn-accent">GO</button>
      </div>
    </div>
  );
}

function CommunityPotPanel() {
  const pot      = usePotData();
  const timeLeft = pot ? Math.max(0, pot.weekEnd - Date.now()) : 0;

  return (
    <div className="space-y-3">
      <div className="void-card-glow p-5 text-center relative prism-corner-accent">
        <p className="void-stat-label">WEEKLY POT</p>
        <p className="void-stat-value text-4xl chill-number" style={{ color: '#fbbf24' }}>
          {pot ? fmt(pot.pot) : '—'}
        </p>
        <p className="font-game text-xs mt-1" style={{ color: 'var(--void-text-secondary)' }}>❄️ Chills in pool</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#fbbf24' }} />
          <p className="font-game text-xs" style={{ color: 'var(--void-text-secondary)' }}>
            Resets in {fmtTime(timeLeft)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="void-stat-card text-center">
          <p className="void-stat-label">TOTAL STAKED</p>
          <p className="void-stat-value text-base neon-cyan">{pot ? fmt(pot.totalStaked) : '0'}</p>
        </div>
        <div className="void-stat-card text-center">
          <p className="void-stat-label">REWARD</p>
          <p className="void-stat-value text-base" style={{ color: '#c084fc' }}>Top 3</p>
        </div>
      </div>
      <div className="void-card p-4">
        <p className="void-stat-label mb-3">HOW IT WORKS</p>
        {['30% of every stake goes to the pot', 'Top 3 weekly stakers split the prize', '🥇 50% · 🥈 30% · 🥉 20%'].map((line, i) => (
          <p key={i} className="font-game text-xs py-1" style={{ color: 'var(--void-text-secondary)' }}>▸ {line}</p>
        ))}
      </div>
      {pot && pot.recent.length > 0 && (
        <div>
          <p className="void-stat-label mb-2">RECENT STAKES</p>
          <div className="space-y-1">
            {pot.recent.slice(0,5).map((r, i) => (
              <div key={i} className="void-card flex justify-between px-3 py-2">
                <span className="font-game text-xs" style={{ color: 'var(--void-text-secondary)' }}>{r.username}</span>
                <span className="font-game text-xs neon-cyan">{fmt(r.amount)} ❄️</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StakePanel() {
  const [tab, setTab] = useState<StakeTab>('chills');
  const TABS: { id: StakeTab; label: string; icon: string }[] = [
    { id: 'chills',   label: 'CHILLS',   icon: 'cur:chills' },
    { id: 'diamonds', label: 'DIAMONDS', icon: 'cur:diamonds'  },
    { id: 'pot',      label: 'POT',      icon: 'game:cauldron' },
  ];

  return (
    <div className="pb-6">
      <div className="px-4 pt-5 pb-4">
        <h2 className="font-display text-2xl font-black neon-cyan tracking-widest mb-1">STAKE</h2>
        <p className="font-game text-xs" style={{ color: 'var(--void-text-muted)', letterSpacing: '0.1em' }}>STAKE YOUR WEALTH · EARN RETURNS</p>
      </div>
      <div className="flex gap-2 px-4 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('void-btn void-btn-sm flex-1 gap-1.5',
              tab === t.id ? 'void-btn-glow' : 'void-btn-ghost')}>
            <GameIcon name={t.icon} size={12} />
            {t.label}
          </button>
        ))}
      </div>
      <div className="px-4">
        {tab === 'chills'   && <ChillsStake />}
        {tab === 'diamonds' && <DiamondStake />}
        {tab === 'pot'      && <CommunityPotPanel />}
      </div>
    </div>
  );
}
