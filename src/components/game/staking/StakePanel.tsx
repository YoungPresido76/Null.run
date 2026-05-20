import { useState, useEffect, useRef } from 'react';
import { useGame }      from '@/context/GameContext';
import { useFirebase }  from '@/hooks/useFirebase';
import { fmt, fmtTime, cn } from '@/lib/utils';
import {
  getFirestore, doc, onSnapshot,
} from 'firebase/firestore';

// ── Types ─────────────────────────────────────────────────────────
type StakeTab = 'chills' | 'diamonds' | 'pot';

// Simple stake price simulation (starts at 1, grows with volume)
function calcStakePrice(history: { type: string }[]): number {
  const buys  = history.filter(h => h.type === 'buy').length;
  const sells = history.filter(h => h.type === 'sell').length;
  return Math.max(0.5, 1 + (buys - sells) * 0.05);
}

// ── Pot data ──────────────────────────────────────────────────────
interface PotData {
  pot:         number;
  totalStaked: number;
  weekEnd:     number;
  recent:      { username: string; amount: number; time: number }[];
}

function usePotData() {
  const [pot, setPot] = useState<PotData | null>(null);
  useEffect(() => {
    const db = getFirestore();
    const unsub = onSnapshot(doc(db, 'communityPot', 'week'), snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setPot({
        pot:         d.pot ?? 0,
        totalStaked: d.totalStaked ?? 0,
        weekEnd:     d.weekEnd?.toMillis?.() ?? Date.now() + 7 * 86400000,
        recent:      d.recentStakes ?? [],
      });
    }, () => {});
    return unsub;
  }, []);
  return pot;
}

// ── Chills Stake ──────────────────────────────────────────────────
function ChillsStake() {
  const { state, dispatch } = useGame();
  const [amount,    setAmount]    = useState('');
  const [mode,      setMode]      = useState<'buy' | 'sell'>('buy');
  const [feedback,  setFeedback]  = useState('');
  const history = state.stakes ?? [];
  const price   = calcStakePrice(history);
  const staked  = history.filter(h => h.type === 'buy').reduce((s,h) => s + h.amount, 0)
                - history.filter(h => h.type === 'sell').reduce((s,h) => s + h.amount, 0);

  function execute() {
    const n = parseFloat(amount);
    if (!n || n <= 0) return setFeedback('Enter a valid amount.');
    if (mode === 'buy') {
      if (state.chills < n) return setFeedback('Not enough Chills.');
      dispatch({ type: 'SPEND_CHILLS', amount: n });
      setFeedback(`Staked ${fmt(n)} Chills ✓`);
    } else {
      if (staked < n) return setFeedback('Not enough staked Chills.');
      dispatch({ type: 'ADD_CHILLS', amount: n });
      setFeedback(`Unstaked ${fmt(n)} Chills ✓`);
    }
    setAmount('');
    setTimeout(() => setFeedback(''), 3000);
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'BALANCE',   val: fmt(state.chills),  color: 'neon-cyan'    },
          { label: 'STAKED',    val: fmt(staked),         color: 'text-white/60' },
          { label: 'PRICE IDX', val: price.toFixed(2)+'x',color: 'text-neon-green' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-3 border border-white/5 text-center">
            <p className={cn('font-orbitron text-sm font-bold', s.color)}>{s.val}</p>
            <p className="font-mono text-[9px] text-white/25 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {(['buy','sell'] as const).map(m => (
          <button key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-orbitron text-[11px] font-bold border transition-all',
              mode === m
                ? m === 'buy'
                  ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10'
                  : 'border-neon-magenta/50 text-neon-magenta bg-neon-magenta/10'
                : 'border-white/10 text-white/30',
            )}
          >
            {m === 'buy' ? '▲ STAKE' : '▼ UNSTAKE'}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Amount of Chills"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="flex-1 h-11 px-4 rounded-xl bg-void-surface border border-white/10 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-neon-cyan/50"
        />
        <button
          onClick={execute}
          className={cn(
            'px-5 h-11 rounded-xl font-orbitron text-xs font-bold border transition-all active:scale-95',
            mode === 'buy'
              ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20'
              : 'border-neon-magenta/50 text-neon-magenta bg-neon-magenta/10 hover:bg-neon-magenta/20',
          )}
        >
          GO
        </button>
      </div>

      {feedback && <p className="font-mono text-[11px] text-neon-green text-center">{feedback}</p>}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="font-mono text-[9px] text-white/25 tracking-widest mb-2">STAKE HISTORY</p>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {[...history].reverse().slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center justify-between glass rounded-lg px-3 py-2 border border-white/5">
                <span className={cn('font-mono text-[10px]', h.type === 'buy' ? 'text-neon-green' : 'text-neon-magenta')}>
                  {h.type === 'buy' ? '▲' : '▼'} {fmt(h.amount)} ❄️
                </span>
                <span className="font-mono text-[9px] text-white/25">
                  @{h.price?.toFixed(2) ?? '1.00'}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Diamond Stake ─────────────────────────────────────────────────
function DiamondStake() {
  const { state, dispatch } = useGame();
  const [amount,   setAmount]   = useState('');
  const [mode,     setMode]     = useState<'buy' | 'sell'>('buy');
  const [feedback, setFeedback] = useState('');
  const history = state.diamondStakes ?? [];
  const staked  = history.filter(h => h.type === 'buy').reduce((s,h) => s + h.amount, 0)
                - history.filter(h => h.type === 'sell').reduce((s,h) => s + h.amount, 0);

  function execute() {
    const n = parseFloat(amount);
    if (!n || n <= 0) return setFeedback('Enter a valid amount.');
    if (mode === 'buy') {
      if (state.diamonds < n) return setFeedback('Not enough Diamonds.');
      dispatch({ type: 'SPEND_DIAMONDS', amount: n });
      setFeedback(`Staked ${n} 💎 ✓`);
    } else {
      if (staked < n) return setFeedback('Not enough staked Diamonds.');
      dispatch({ type: 'ADD_DIAMONDS', amount: n });
      setFeedback(`Unstaked ${n} 💎 ✓`);
    }
    setAmount('');
    setTimeout(() => setFeedback(''), 3000);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'BALANCE', val: `${state.diamonds} 💎`, color: 'neon-magenta' },
          { label: 'STAKED',  val: `${staked} 💎`,         color: 'text-white/60' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-3 border border-white/5 text-center">
            <p className={cn('font-orbitron text-sm font-bold', s.color)}>{s.val}</p>
            <p className="font-mono text-[9px] text-white/25 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(['buy','sell'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-orbitron text-[11px] font-bold border transition-all',
              mode === m
                ? 'border-neon-magenta/50 text-neon-magenta bg-neon-magenta/10'
                : 'border-white/10 text-white/30',
            )}
          >
            {m === 'buy' ? '▲ STAKE 💎' : '▼ UNSTAKE 💎'}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Amount of Diamonds"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="flex-1 h-11 px-4 rounded-xl bg-void-surface border border-white/10 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-neon-magenta/50"
        />
        <button onClick={execute}
          className="px-5 h-11 rounded-xl font-orbitron text-xs font-bold border border-neon-magenta/50 text-neon-magenta bg-neon-magenta/10 hover:bg-neon-magenta/20 transition-all active:scale-95">
          GO
        </button>
      </div>

      {feedback && <p className="font-mono text-[11px] text-neon-green text-center">{feedback}</p>}
    </div>
  );
}

// ── Community Pot ─────────────────────────────────────────────────
function CommunityPotPanel() {
  const { state } = useGame();
  const pot = usePotData();
  const timeLeft = pot ? Math.max(0, pot.weekEnd - Date.now()) : 0;

  return (
    <div className="space-y-4">
      {/* Pot display */}
      <div className="glass rounded-xl p-5 border border-yellow-400/20 text-center">
        <p className="font-mono text-[10px] text-yellow-400/60 tracking-widest mb-1">WEEKLY POT</p>
        <p className="font-orbitron text-4xl font-black text-yellow-400">
          {pot ? fmt(pot.pot) : '---'}
        </p>
        <p className="font-mono text-[10px] text-white/30 mt-1">❄️ Chills in pool</p>

        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          <p className="font-mono text-[10px] text-white/40">
            Resets in {fmtTime(timeLeft)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass rounded-xl p-3 border border-white/5 text-center">
          <p className="font-orbitron text-sm text-neon-cyan">{pot ? fmt(pot.totalStaked) : '0'}</p>
          <p className="font-mono text-[9px] text-white/25 mt-0.5">TOTAL STAKED</p>
        </div>
        <div className="glass rounded-xl p-3 border border-white/5 text-center">
          <p className="font-orbitron text-sm text-neon-purple">Top 3 Win</p>
          <p className="font-mono text-[9px] text-white/25 mt-0.5">WEEKLY REWARD</p>
        </div>
      </div>

      {/* How it works */}
      <div className="glass rounded-xl p-4 border border-white/5">
        <p className="font-mono text-[9px] text-white/25 tracking-widest mb-2">HOW IT WORKS</p>
        <div className="space-y-1.5">
          {[
            '30% of every stake goes to the community pot',
            'Top 3 weekly stakers split the pot each Sunday',
            '🥇 50% · 🥈 30% · 🥉 20% of the prize pool',
          ].map((line, i) => (
            <p key={i} className="font-mono text-[10px] text-white/40 leading-relaxed">
              {i === 0 ? '▸' : i === 1 ? '▸' : '▸'} {line}
            </p>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {pot && pot.recent.length > 0 && (
        <div>
          <p className="font-mono text-[9px] text-white/25 tracking-widest mb-2">RECENT STAKES</p>
          <div className="space-y-1.5">
            {pot.recent.slice(0, 5).map((r, i) => (
              <div key={i} className="flex justify-between glass rounded-lg px-3 py-2 border border-white/5">
                <span className="font-mono text-[10px] text-white/50">{r.username}</span>
                <span className="font-mono text-[10px] text-neon-cyan">{fmt(r.amount)} ❄️</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Stake panel ──────────────────────────────────────────────
export default function StakePanel() {
  const [tab, setTab] = useState<StakeTab>('chills');

  const TABS: { id: StakeTab; label: string; emoji: string; color: string }[] = [
    { id: 'chills',   label: 'CHILLS',   emoji: '❄️', color: 'neon-cyan'    },
    { id: 'diamonds', label: 'DIAMONDS', emoji: '💎', color: 'neon-magenta' },
    { id: 'pot',      label: 'POT',      emoji: '🏆', color: 'text-yellow-400' },
  ];

  return (
    <div className="pb-4">
      <div className="px-4 pt-5 pb-3 text-center">
        <h2 className="font-orbitron text-2xl font-black neon-cyan tracking-widest mb-1">STAKE</h2>
        <p className="font-mono text-[10px] text-white/30">Stake your wealth · earn returns</p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 px-4 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-orbitron text-[10px] font-bold border transition-all',
              tab === t.id
                ? `border-current bg-white/5 ${t.color}`
                : 'border-white/10 text-white/30',
            )}
          >
            {t.emoji} {t.label}
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
