import { useState, useEffect } from 'react';
import { useGame }  from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import { fmt, fmtTime, cn } from '@/lib/utils';
import { GameIcon } from '@/lib/icons';
import type { NFT } from '@/types/game';

type MarketTab = 'mint' | 'collection' | 'marketplace';

const MINT_COST_DIAMONDS = 50;
const MINT_COST_CHILLS   = 100_000;
const MINT_DURATION      = 5.5 * 3600 * 1000;

const RARITY_WEIGHTS = { Common: 70, Rare: 20, Epic: 15, Legendary: 10 };
const NFT_POOL: Omit<NFT,'id'|'mintedAt'>[] = [
  { name:'Void Pixel #1',    rarity:'Common',    emoji:'🔷', bonus:'+2% CPS',   cpsBoost:0.02 },
  { name:'Neon Glyph #2',    rarity:'Common',    emoji:'💠', bonus:'+2% CPS',   cpsBoost:0.02 },
  { name:'Static Rune #3',   rarity:'Common',    emoji:'🔹', bonus:'+3% CPS',   cpsBoost:0.03 },
  { name:'Chill Shard #4',   rarity:'Common',    emoji:'❄️', bonus:'+3% CPS',   cpsBoost:0.03 },
  { name:'Emblem Rare',      rarity:'Rare',      emoji:'🌀', bonus:'+8% CPS',   cpsBoost:0.08 },
  { name:'Void Signal',      rarity:'Rare',      emoji:'📡', bonus:'+7% CPS',   cpsBoost:0.07 },
  { name:'Neon Crest',       rarity:'Rare',      emoji:'🏵️', bonus:'+9% CPS',   cpsBoost:0.09 },
  { name:'Epic Emblem',      rarity:'Epic',      emoji:'⚡', bonus:'+15% CPS',  cpsBoost:0.15 },
  { name:'Null Fragment',    rarity:'Epic',      emoji:'🔮', bonus:'+18% CPS',  cpsBoost:0.18 },
  { name:'Presido Legend',   rarity:'Legendary', emoji:'👑', bonus:'+35% CPS',  cpsBoost:0.35 },
  { name:'Null Genesis',     rarity:'Legendary', emoji:'🌌', bonus:'+40% CPS',  cpsBoost:0.40 },
];

const RARITY_BADGE: Record<NFT['rarity'], string> = {
  Common:    'void-badge-primary',
  Rare:      'void-badge-info',
  Epic:      'void-badge-accent',
  Legendary: 'void-badge-warning',
};
const RARITY_ICON: Record<NFT['rarity'], string> = {
  Common:    'rarity:common',
  Rare:      'rarity:rare',
  Epic:      'rarity:epic',
  Legendary: 'rarity:legendary',
};

function pickNFT(): Omit<NFT,'id'|'mintedAt'> {
  const roll = Math.random() * 100;
  let pool: typeof NFT_POOL;
  if      (roll < RARITY_WEIGHTS.Legendary) pool = NFT_POOL.filter(n => n.rarity === 'Legendary');
  else if (roll < RARITY_WEIGHTS.Legendary + RARITY_WEIGHTS.Epic) pool = NFT_POOL.filter(n => n.rarity === 'Epic');
  else if (roll < RARITY_WEIGHTS.Legendary + RARITY_WEIGHTS.Epic + RARITY_WEIGHTS.Rare) pool = NFT_POOL.filter(n => n.rarity === 'Rare');
  else pool = NFT_POOL.filter(n => n.rarity === 'Common');
  return pool[Math.floor(Math.random() * pool.length)];
}

function MintTab() {
  const { state, dispatch } = useGame();
  const toast = useToast();
  const [mintStart, setMintStart] = useState<number|null>(() => {
    const v = localStorage.getItem('nv_mint_start'); return v ? parseInt(v) : null;
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [claimed,  setClaimed]  = useState<NFT|null>(null);
  const isMinting = !!mintStart;
  const isDone    = isMinting && Date.now() - mintStart! >= MINT_DURATION;

  useEffect(() => {
    if (!isMinting) return;
    const id = setInterval(() => setTimeLeft(Math.max(0, MINT_DURATION - (Date.now() - mintStart!))), 1000);
    setTimeLeft(Math.max(0, MINT_DURATION - (Date.now() - mintStart!)));
    return () => clearInterval(id);
  }, [mintStart, isMinting]);

  function startMint() {
    if (state.diamonds < MINT_COST_DIAMONDS) { toast.error('Not enough Diamonds', `Need ${MINT_COST_DIAMONDS} 💎`); return; }
    if (state.chills < MINT_COST_CHILLS)     { toast.error('Not enough Chills',   `Need ${fmt(MINT_COST_CHILLS)} ❄️`); return; }
    dispatch({ type: 'SPEND_DIAMONDS', amount: MINT_COST_DIAMONDS });
    dispatch({ type: 'SPEND_CHILLS',   amount: MINT_COST_CHILLS });
    const now = Date.now();
    setMintStart(now);
    localStorage.setItem('nv_mint_start', String(now));
    toast.info('Minting started!', `Ready in ${fmtTime(MINT_DURATION)}`);
  }

  function claimNFT() {
    const nft = pickNFT();
    const full: NFT = { ...nft, id: `nft_${Date.now()}`, mintedAt: Date.now() };
    dispatch({ type: 'ADD_NFT', nft: full });
    dispatch({ type: 'UNLOCK_ACH', id: 'first_nft' });
    setClaimed(full);
    setMintStart(null);
    localStorage.removeItem('nv_mint_start');
    toast.achievement(`${full.rarity} NFT claimed!`, `${full.name} · ${full.bonus}`);
  }

  function cancelMint() {
    dispatch({ type: 'ADD_DIAMONDS', amount: MINT_COST_DIAMONDS });
    dispatch({ type: 'ADD_CHILLS',   amount: MINT_COST_CHILLS });
    setMintStart(null);
    localStorage.removeItem('nv_mint_start');
    toast.info('Mint cancelled', 'Costs refunded');
  }

  const canMint = !isMinting && state.diamonds >= MINT_COST_DIAMONDS && state.chills >= MINT_COST_CHILLS;

  return (
    <div className="space-y-4">
      {claimed && (
        <div className={cn('void-card-glass p-5 text-center relative prism-corner-accent')}>
          <p className={cn('void-badge mb-2 mx-auto', RARITY_BADGE[claimed.rarity])}>
            {claimed.rarity.toUpperCase()} NFT CLAIMED
          </p>
          <GameIcon name={RARITY_ICON[claimed.rarity]} size={52} className="mx-auto my-3"
            style={{ color: claimed.rarity === 'Legendary' ? '#fbbf24' : claimed.rarity === 'Epic' ? 'var(--nv-magenta)' : 'var(--nv-cyan)' }} />
          <p className="font-display font-black text-white mb-1">{claimed.name}</p>
          <p className="font-game text-xs" style={{ color: 'var(--void-text-secondary)' }}>{claimed.bonus}</p>
          <button onClick={() => setClaimed(null)} className="void-btn void-btn-ghost void-btn-sm mt-4">DISMISS</button>
        </div>
      )}

      <div className="void-card-glass p-4 relative prism-corner-accent">
        <p className="void-card-title text-center mb-4">MINT AN NFT</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'DIAMONDS', cost: MINT_COST_DIAMONDS, have: state.diamonds >= MINT_COST_DIAMONDS, val: `${MINT_COST_DIAMONDS} 💎` },
            { label: 'CHILLS',   cost: MINT_COST_CHILLS,   have: state.chills >= MINT_COST_CHILLS,   val: `${fmt(MINT_COST_CHILLS)} ❄️` },
          ].map(c => (
            <div key={c.label} className="void-stat-card text-center"
              style={{ borderColor: c.have ? 'rgba(0,243,255,0.2)' : 'rgba(239,68,68,0.2)' }}>
              <p className="void-stat-label">{c.label}</p>
              <p className="void-stat-value text-sm chill-number" style={{ color: c.have ? 'var(--nv-cyan)' : 'var(--void-error-400)' }}>{c.val}</p>
              <span className={cn('void-badge mt-1', c.have ? 'void-badge-success' : 'void-badge-error')} style={{ fontSize: '0.55rem' }}>
                {c.have ? '✓ HAVE IT' : '✗ NEED MORE'}
              </span>
            </div>
          ))}
        </div>

        {!isMinting ? (
          <button onClick={startMint} disabled={!canMint}
            className={cn('void-btn void-btn-lg void-btn-full', canMint ? 'void-btn-gradient' : 'void-btn-ghost opacity-30')}>
            <GameIcon name="game:anvil" size={16} /> MINT NOW
          </button>
        ) : isDone ? (
          <button onClick={claimNFT}
            className="void-btn void-btn-lg void-btn-full void-btn-success animate-pulse">
            CLAIM YOUR NFT ✨
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <p className="font-display text-2xl font-black" style={{ color: '#c084fc' }}>{fmtTime(timeLeft)}</p>
              <p className="font-game text-xs mt-1" style={{ color: 'var(--void-text-muted)' }}>MINTING IN PROGRESS...</p>
            </div>
            <div className="void-progress-bar" style={{ height: 6 }}>
              <div className="void-progress-fill void-progress-fill-accent"
                style={{ width: `${((MINT_DURATION - timeLeft) / MINT_DURATION) * 100}%` }} />
            </div>
            <button onClick={cancelMint} className="void-btn void-btn-sm void-btn-ghost void-btn-full">CANCEL (refunds cost)</button>
          </div>
        )}
      </div>

      <div className="void-card p-4">
        <p className="void-stat-label mb-3">MINT ODDS</p>
        {Object.entries(RARITY_WEIGHTS).map(([r, w]) => (
          <div key={r} className="flex items-center gap-3 py-1">
            <span className={cn('void-badge flex-shrink-0', RARITY_BADGE[r as NFT['rarity']])} style={{ fontSize: '0.6rem', minWidth: 64, justifyContent: 'center' }}>{r}</span>
            <div className="flex-1 void-progress-bar" style={{ height: 5 }}>
              <div style={{
                height: '100%', width: `${w}%`, borderRadius: 999, transition: 'width 0.5s',
                background: r === 'Legendary' ? '#fbbf24' : r === 'Epic' ? 'var(--nv-magenta)' : r === 'Rare' ? 'var(--nv-cyan)' : 'rgba(255,255,255,0.3)',
              }} />
            </div>
            <span className="font-game text-xs w-8 text-right" style={{ color: 'var(--void-text-muted)' }}>{w}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollectionTab() {
  const { state } = useGame();
  const nfts = state.ownedNfts;
  if (nfts.length === 0) return (
    <div className="text-center py-12">
      <GameIcon name="game:exchange" size={48} className="mx-auto mb-3" style={{ color: 'var(--void-text-muted)' }} />
      <p className="font-display text-sm" style={{ color: 'var(--void-text-tertiary)' }}>NO NFTS YET</p>
      <p className="font-game text-xs mt-1" style={{ color: 'var(--void-text-muted)' }}>Mint your first NFT to start</p>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-2">
      {nfts.map(nft => (
        <div key={nft.id} className="void-card-glass p-4 text-center relative"
          style={{ borderColor: nft.rarity === 'Legendary' ? 'rgba(251,191,36,0.3)' : nft.rarity === 'Epic' ? 'rgba(255,0,170,0.3)' : 'rgba(0,243,255,0.2)' }}>
          <GameIcon name={RARITY_ICON[nft.rarity]} size={36} className="mx-auto mb-2"
            style={{ color: nft.rarity === 'Legendary' ? '#fbbf24' : nft.rarity === 'Epic' ? 'var(--nv-magenta)' : 'var(--nv-cyan)' }} />
          <p className="font-display text-xs font-bold leading-tight mb-1">{nft.name}</p>
          <span className={cn('void-badge', RARITY_BADGE[nft.rarity])} style={{ fontSize: '0.55rem' }}>{nft.rarity}</span>
          <p className="font-game text-[9px] mt-1" style={{ color: 'var(--nv-cyan)' }}>{nft.bonus}</p>
        </div>
      ))}
    </div>
  );
}

export default function Market() {
  const [tab, setTab] = useState<MarketTab>('mint');
  const { state } = useGame();
  const TABS = [
    { id: 'mint' as MarketTab,        label: 'MINT',        icon: 'game:anvil' },
    { id: 'collection' as MarketTab,  label: `OWNED (${state.ownedNfts.length})`, icon: 'game:exchange' },
    { id: 'marketplace' as MarketTab, label: 'TRADE',       icon: 'game:shop' },
  ];

  return (
    <div className="pb-6">
      <div className="px-4 pt-5 pb-4">
        <h2 className="font-display text-2xl font-black neon-cyan tracking-widest mb-1">MARKET</h2>
        <p className="font-game text-xs" style={{ color: 'var(--void-text-muted)', letterSpacing: '0.1em' }}>NFTs · ARTEFACTS · TRADE</p>
      </div>
      <div className="flex gap-1.5 px-4 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('void-btn void-btn-xs flex-1 gap-1', tab === t.id ? 'void-btn-glow' : 'void-btn-ghost')}>
            <GameIcon name={t.icon} size={11} />{t.label}
          </button>
        ))}
      </div>
      <div className="px-4">
        {tab === 'mint'        && <MintTab />}
        {tab === 'collection'  && <CollectionTab />}
        {tab === 'marketplace' && (
          <div className="text-center py-12">
            <GameIcon name="game:shop" size={48} className="mx-auto mb-3" style={{ color: 'var(--void-text-muted)' }} />
            <p className="font-display text-sm" style={{ color: 'var(--void-text-tertiary)' }}>COMING SOON</p>
            <p className="font-game text-xs mt-1" style={{ color: 'var(--void-text-muted)' }}>P2P NFT trading · launching soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
