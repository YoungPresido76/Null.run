import { useState, useEffect } from 'react';
import { useGame }     from '@/context/GameContext';
import { fmt, fmtTime, cn } from '@/lib/utils';
import type { NFT }    from '@/types/game';

type MarketTab = 'mint' | 'collection' | 'marketplace';

const MINT_COST_DIAMONDS = 50;
const MINT_COST_CHILLS   = 100_000;
const MINT_DURATION      = 5.5 * 3600 * 1000; // 5.5 hours

const RARITY_WEIGHTS = { Common: 70, Rare: 20, Epic: 15, Legendary: 10 } as const;

const NFT_POOL: Omit<NFT, 'id' | 'mintedAt'>[] = [
  // Common
  { name: 'Void Pixel #1',    rarity: 'Common',    emoji: '🔷', bonus: '+2% CPS',    cpsBoost: 0.02 },
  { name: 'Neon Glyph #2',    rarity: 'Common',    emoji: '💠', bonus: '+2% CPS',    cpsBoost: 0.02 },
  { name: 'Static Rune #3',   rarity: 'Common',    emoji: '🔹', bonus: '+2% CPS',    cpsBoost: 0.02 },
  { name: 'Chill Shard #4',   rarity: 'Common',    emoji: '❄️', bonus: '+3% CPS',    cpsBoost: 0.03 },
  { name: 'Pulse Echo #5',    rarity: 'Common',    emoji: '〰️', bonus: '+3% CPS',    cpsBoost: 0.03 },
  // Rare
  { name: 'Emblem Rare',      rarity: 'Rare',      emoji: '🌀', bonus: '+8% CPS',    cpsBoost: 0.08 },
  { name: 'Void Signal',      rarity: 'Rare',      emoji: '📡', bonus: '+7% CPS',    cpsBoost: 0.07 },
  { name: 'Neon Crest',       rarity: 'Rare',      emoji: '🏵️', bonus: '+9% CPS',    cpsBoost: 0.09 },
  // Epic
  { name: 'Epic Emblem',      rarity: 'Epic',      emoji: '⚡', bonus: '+15% CPS',   cpsBoost: 0.15 },
  { name: 'Null Fragment',    rarity: 'Epic',      emoji: '🔮', bonus: '+18% CPS',   cpsBoost: 0.18 },
  // Legendary
  { name: 'Presido Legend',   rarity: 'Legendary', emoji: '👑', bonus: '+35% CPS',   cpsBoost: 0.35 },
  { name: 'Null Genesis',     rarity: 'Legendary', emoji: '🌌', bonus: '+40% CPS',   cpsBoost: 0.40 },
];

const RARITY_COLOR: Record<NFT['rarity'], string> = {
  Common:    'text-white/60',
  Rare:      'text-neon-cyan',
  Epic:      'text-neon-magenta',
  Legendary: 'text-yellow-400',
};
const RARITY_BORDER: Record<NFT['rarity'], string> = {
  Common:    'border-white/10',
  Rare:      'border-neon-cyan/30',
  Epic:      'border-neon-magenta/30',
  Legendary: 'border-yellow-400/40',
};

function pickNFT(): Omit<NFT, 'id' | 'mintedAt'> {
  const roll = Math.random() * 100;
  let pool: typeof NFT_POOL;
  if      (roll < RARITY_WEIGHTS.Legendary) pool = NFT_POOL.filter(n => n.rarity === 'Legendary');
  else if (roll < RARITY_WEIGHTS.Legendary + RARITY_WEIGHTS.Epic) pool = NFT_POOL.filter(n => n.rarity === 'Epic');
  else if (roll < RARITY_WEIGHTS.Legendary + RARITY_WEIGHTS.Epic + RARITY_WEIGHTS.Rare) pool = NFT_POOL.filter(n => n.rarity === 'Rare');
  else     pool = NFT_POOL.filter(n => n.rarity === 'Common');
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Mint tab ──────────────────────────────────────────────────────
function MintTab() {
  const { state, dispatch } = useGame();

  const [mintStart, setMintStart] = useState<number | null>(() => {
    const v = localStorage.getItem('nv_mint_start');
    return v ? parseInt(v) : null;
  });
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [claimed,   setClaimed]   = useState<NFT | null>(null);

  const isMinting = !!mintStart;
  const isDone    = isMinting && Date.now() - mintStart >= MINT_DURATION;

  useEffect(() => {
    if (!isMinting) return;
    const id = setInterval(() => {
      const elapsed = Date.now() - mintStart!;
      setTimeLeft(Math.max(0, MINT_DURATION - elapsed));
    }, 1000);
    setTimeLeft(Math.max(0, MINT_DURATION - (Date.now() - mintStart!)));
    return () => clearInterval(id);
  }, [mintStart, isMinting]);

  function startMint() {
    if (state.diamonds < MINT_COST_DIAMONDS) return;
    if (state.chills < MINT_COST_CHILLS) return;
    dispatch({ type: 'SPEND_DIAMONDS', amount: MINT_COST_DIAMONDS });
    dispatch({ type: 'SPEND_CHILLS',   amount: MINT_COST_CHILLS });
    const now = Date.now();
    setMintStart(now);
    localStorage.setItem('nv_mint_start', String(now));
  }

  function cancelMint() {
    dispatch({ type: 'ADD_DIAMONDS', amount: MINT_COST_DIAMONDS });
    dispatch({ type: 'ADD_CHILLS',   amount: MINT_COST_CHILLS });
    setMintStart(null);
    localStorage.removeItem('nv_mint_start');
  }

  function claimNFT() {
    const nft = pickNFT();
    const full: NFT = { ...nft, id: `nft_${Date.now()}`, mintedAt: Date.now() };
    dispatch({ type: 'ADD_NFT', nft: full });
    dispatch({ type: 'UNLOCK_ACH', id: 'first_nft' });
    setClaimed(full);
    setMintStart(null);
    localStorage.removeItem('nv_mint_start');
  }

  const canMint = !isMinting
    && state.diamonds >= MINT_COST_DIAMONDS
    && state.chills   >= MINT_COST_CHILLS;

  return (
    <div className="space-y-4">
      {/* Claimed reveal */}
      {claimed && (
        <div className={cn(
          'glass rounded-xl p-5 border text-center',
          RARITY_BORDER[claimed.rarity],
        )}>
          <p className={cn('font-mono text-[10px] tracking-widest mb-1', RARITY_COLOR[claimed.rarity])}>
            NFT CLAIMED · {claimed.rarity.toUpperCase()}
          </p>
          <div className="text-5xl my-3">{claimed.emoji}</div>
          <p className="font-orbitron font-black text-white mb-1">{claimed.name}</p>
          <p className={cn('font-mono text-xs', RARITY_COLOR[claimed.rarity])}>{claimed.bonus}</p>
          <button onClick={() => setClaimed(null)}
            className="mt-4 font-mono text-[10px] text-white/30 hover:text-white/60 transition-colors">
            DISMISS
          </button>
        </div>
      )}

      {/* Cost panel */}
      <div className="glass rounded-xl p-5 border border-neon-magenta/25">
        <h3 className="font-orbitron text-lg neon-magenta text-center mb-4 font-bold tracking-wider">
          MINT AN NFT
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={cn('glass rounded-xl p-3 border text-center',
            state.diamonds >= MINT_COST_DIAMONDS ? 'border-neon-magenta/25' : 'border-red-500/25')}>
            <p className="font-orbitron text-lg neon-magenta font-black">{MINT_COST_DIAMONDS} 💎</p>
            <p className="font-mono text-[9px] text-white/30">DIAMONDS</p>
            <p className="font-mono text-[9px] mt-0.5" style={{ color: state.diamonds >= MINT_COST_DIAMONDS ? 'rgba(0,255,136,0.7)' : 'rgba(255,80,80,0.7)' }}>
              {state.diamonds >= MINT_COST_DIAMONDS ? '✓ HAVE IT' : '✗ NEED MORE'}
            </p>
          </div>
          <div className={cn('glass rounded-xl p-3 border text-center',
            state.chills >= MINT_COST_CHILLS ? 'border-neon-cyan/25' : 'border-red-500/25')}>
            <p className="font-orbitron text-lg neon-cyan font-black">{fmt(MINT_COST_CHILLS)} ❄️</p>
            <p className="font-mono text-[9px] text-white/30">CHILLS</p>
            <p className="font-mono text-[9px] mt-0.5" style={{ color: state.chills >= MINT_COST_CHILLS ? 'rgba(0,255,136,0.7)' : 'rgba(255,80,80,0.7)' }}>
              {state.chills >= MINT_COST_CHILLS ? '✓ HAVE IT' : '✗ NEED MORE'}
            </p>
          </div>
        </div>

        {!isMinting ? (
          <button onClick={startMint} disabled={!canMint}
            className={cn(
              'w-full py-4 rounded-xl font-orbitron font-bold tracking-widest border transition-all active:scale-95',
              canMint
                ? 'border-neon-magenta/50 text-neon-magenta bg-neon-magenta/15 hover:bg-neon-magenta/25 shadow-[0_0_20px_rgba(255,0,170,0.2)]'
                : 'border-white/10 text-white/20 cursor-not-allowed',
            )}
          >
            MINT NOW
          </button>
        ) : isDone ? (
          <button onClick={claimNFT}
            className="w-full py-4 rounded-xl font-orbitron font-bold tracking-widest border border-yellow-400/50 text-yellow-400 bg-yellow-400/15 animate-pulse hover:bg-yellow-400/25 transition-all active:scale-95">
            CLAIM YOUR NFT ✨
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <p className="font-orbitron text-2xl neon-purple animate-pulse">{fmtTime(timeLeft)}</p>
              <p className="font-mono text-[10px] text-white/30 mt-1">MINTING IN PROGRESS...</p>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-neon-magenta to-neon-purple transition-all"
                style={{ width: `${((MINT_DURATION - timeLeft) / MINT_DURATION) * 100}%` }} />
            </div>
            <button onClick={cancelMint}
              className="w-full py-2 rounded-xl font-orbitron text-xs text-red-400/60 border border-red-500/20 hover:border-red-500/40 transition-all">
              CANCEL (refunds cost)
            </button>
          </div>
        )}
      </div>

      {/* Rarity odds */}
      <div className="glass rounded-xl p-4 border border-white/5">
        <p className="font-mono text-[9px] text-white/25 tracking-widest mb-3">MINT ODDS</p>
        {Object.entries(RARITY_WEIGHTS).map(([r, w]) => (
          <div key={r} className="flex items-center justify-between py-1">
            <span className={cn('font-orbitron text-[11px]', RARITY_COLOR[r as NFT['rarity']])}>{r}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${w}%`,
                  background: r === 'Legendary' ? '#ffcc00' : r === 'Epic' ? '#ff00aa' : r === 'Rare' ? '#00f3ff' : 'rgba(255,255,255,0.4)',
                }} />
              </div>
              <span className="font-mono text-[10px] text-white/30 w-10 text-right">{w}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Collection tab ─────────────────────────────────────────────────
function CollectionTab() {
  const { state } = useGame();
  const nfts = state.ownedNfts;

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🎴</div>
        <p className="font-orbitron text-sm text-white/30">NO NFTS YET</p>
        <p className="font-mono text-[10px] text-white/15 mt-1">Mint your first NFT to start your collection</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {nfts.map(nft => (
        <div key={nft.id} className={cn('glass rounded-xl p-4 border text-center', RARITY_BORDER[nft.rarity])}>
          <div className="text-3xl mb-2">{nft.emoji}</div>
          <p className="font-orbitron text-[11px] font-bold text-white/90 leading-tight mb-1">{nft.name}</p>
          <p className={cn('font-mono text-[9px] mb-1', RARITY_COLOR[nft.rarity])}>{nft.rarity}</p>
          <p className="font-mono text-[9px] text-neon-cyan/60">{nft.bonus}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function Market() {
  const [tab, setTab] = useState<MarketTab>('mint');
  const { state } = useGame();

  const TABS: { id: MarketTab; label: string; emoji: string }[] = [
    { id: 'mint',        label: 'MINT',       emoji: '⚗️' },
    { id: 'collection',  label: `COLLECTION (${state.ownedNfts.length})`, emoji: '🗂️' },
    { id: 'marketplace', label: 'MARKETPLACE', emoji: '🏪' },
  ];

  return (
    <div className="pb-4">
      <div className="px-4 pt-5 pb-3 text-center">
        <h2 className="font-orbitron text-2xl font-black neon-cyan tracking-widest mb-1">MARKET</h2>
        <p className="font-mono text-[10px] text-white/30">NFTs · Artefacts · Trade</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 py-2 rounded-xl font-orbitron text-[9px] font-bold border transition-all tracking-wider',
              tab === t.id
                ? 'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10'
                : 'border-white/10 text-white/25',
            )}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {tab === 'mint'        && <MintTab />}
        {tab === 'collection'  && <CollectionTab />}
        {tab === 'marketplace' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏪</div>
            <p className="font-orbitron text-sm text-white/30">COMING SOON</p>
            <p className="font-mono text-[10px] text-white/15 mt-1">P2P NFT trading · launching soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
