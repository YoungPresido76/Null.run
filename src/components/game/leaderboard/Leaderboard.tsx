import { useState } from 'react';
import { useLeaderboard, type LBTab } from '@/hooks/useLeaderboard';
import { fmt } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/firebase';

// ── Sub-tab config ────────────────────────────────────────────────
const TABS: { id: LBTab; label: string; emoji: string; color: string; shadowColor: string }[] = [
  { id: 'chills',   label: 'CHILLS',   emoji: '❄️', color: 'text-neon-cyan',    shadowColor: 'rgba(0,243,255,0.4)' },
  { id: 'diamonds', label: 'DIAMONDS', emoji: '💎', color: 'text-neon-magenta', shadowColor: 'rgba(255,0,170,0.4)' },
  { id: 'trophies', label: 'TROPHIES', emoji: '🏆', color: 'text-yellow-400',   shadowColor: 'rgba(250,204,21,0.4)' },
];

// ── Value formatter per tab ───────────────────────────────────────
function getValue(entry: LeaderboardEntry, tab: LBTab): string {
  if (tab === 'chills')   return `${fmt(entry.totalChills)} ❄️`;
  if (tab === 'diamonds') return `${fmt(entry.diamonds)} 💎`;
  return `${entry.achCount ?? 0} 🏅`;
}

// ── Top 3 podium ─────────────────────────────────────────────────
const PODIUM_ORDER = [1, 0, 2]; // visual order: 2nd, 1st, 3rd
const PODIUM_H    = ['h-16', 'h-24', 'h-12'];
const PODIUM_SIZE = ['text-3xl', 'text-4xl', 'text-2xl'];
const MEDALS      = ['🥇', '🥈', '🥉'];
const PODIUM_GLOW = [
  'shadow-[0_0_20px_rgba(0,243,255,0.4)] border-neon-cyan/40',
  'shadow-[0_0_30px_rgba(255,215,0,0.5)] border-yellow-400/50',
  'shadow-[0_0_15px_rgba(157,0,255,0.3)] border-neon-purple/30',
];

function Podium({ entries, tab }: { entries: LeaderboardEntry[]; tab: LBTab }) {
  const top3 = entries.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-3 px-4 pt-6 pb-2">
      {PODIUM_ORDER.map(dataIdx => {
        const entry = top3[dataIdx];
        if (!entry) return <div key={dataIdx} className="flex-1" />;
        const pos = dataIdx; // 0 = 1st, 1 = 2nd, 2 = 3rd

        return (
          <div key={dataIdx} className="flex-1 flex flex-col items-center gap-1.5">
            {/* Medal badge */}
            <span className={cn('leading-none', PODIUM_SIZE[pos])}>
              {MEDALS[pos]}
            </span>

            {/* Avatar circle */}
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              'glass border font-orbitron font-black text-sm',
              PODIUM_GLOW[pos],
            )}>
              {(entry.username?.[0] ?? '?').toUpperCase()}
            </div>

            {/* Name */}
            <p className="font-orbitron text-[9px] font-bold text-white/80 tracking-wider text-center truncate w-full px-1">
              {entry.username || 'ANON'}
            </p>

            {/* Value */}
            <p className={cn('font-mono text-[9px] text-center', TABS[0].color)}>
              {getValue(entry, tab)}
            </p>

            {/* Podium block */}
            <div className={cn(
              'w-full rounded-t-md glass border-t border-x',
              PODIUM_H[pos],
              pos === 0 ? 'border-neon-cyan/30' : pos === 1 ? 'border-yellow-400/30' : 'border-neon-purple/20',
            )}
              style={{
                background: pos === 0
                  ? 'linear-gradient(180deg, rgba(0,243,255,0.12) 0%, rgba(0,243,255,0.03) 100%)'
                  : pos === 1
                    ? 'linear-gradient(180deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.04) 100%)'
                    : 'linear-gradient(180deg, rgba(157,0,255,0.1) 0%, rgba(157,0,255,0.02) 100%)',
              }}
            >
              <p className="font-orbitron text-[9px] text-center mt-2 text-white/30">
                #{pos + 1}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Single rank row ───────────────────────────────────────────────
function RankRow({ entry, tab, isMe }: { entry: LeaderboardEntry; tab: LBTab; isMe: boolean }) {
  const tabCfg = TABS.find(t => t.id === tab)!;

  return (
    <div className={cn(
      'glass rounded-xl px-4 py-3 flex items-center gap-3',
      'border transition-all',
      isMe
        ? 'border-neon-cyan/50 bg-neon-cyan/5 shadow-[0_0_12px_rgba(0,243,255,0.15)]'
        : 'border-white/5 hover:border-white/10',
    )}>
      {/* Rank badge */}
      <span className={cn(
        'w-6 text-center font-orbitron text-sm font-bold shrink-0',
        entry.rank <= 3 ? 'text-yellow-400' : 'text-white/20',
      )}>
        {entry.rank <= 3 ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
      </span>

      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        'glass border font-orbitron text-xs font-bold',
        isMe ? 'border-neon-cyan/40 text-neon-cyan' : 'border-white/10 text-white/50',
      )}>
        {(entry.username?.[0] ?? '?').toUpperCase()}
      </div>

      {/* Name + rank */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-orbitron text-xs font-bold truncate',
          isMe ? 'text-neon-cyan' : 'text-white/80',
        )}>
          {entry.username || 'ANON'}
          {isMe && <span className="text-white/30 font-normal"> (you)</span>}
        </p>
        <p className="font-mono text-[9px] text-white/25 truncate">
          {entry.hqRank || 'Empty Lot'}
        </p>
      </div>

      {/* Value */}
      <span className={cn('font-mono text-xs font-bold shrink-0', tabCfg.color)}>
        {getValue(entry, tab)}
      </span>
    </div>
  );
}

// ── Daily reward banner ───────────────────────────────────────────
function DailyRewardBanner() {
  return (
    <div className="glass rounded-xl px-4 py-3 border border-yellow-400/20 mb-4 flex items-start gap-3">
      <span className="text-xl shrink-0">⚡</span>
      <div>
        <p className="font-orbitron text-xs text-yellow-400 font-bold tracking-wider mb-0.5">
          DAILY REWARD ACTIVE
        </p>
        <p className="font-mono text-[10px] text-white/30 leading-relaxed">
          Every day, top 3 Chills players earn bonus diamonds:
          {' '}🥇 3💎 · 🥈 2💎 · 🥉 1💎
        </p>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-2 px-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass rounded-xl h-14 animate-pulse border border-white/5"
          style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LBTab>('chills');
  const { chills, diamonds, trophies, loading, myUid } = useLeaderboard();

  const dataMap: Record<LBTab, LeaderboardEntry[]> = {
    chills,
    diamonds,
    trophies,
  };
  const entries = dataMap[activeTab];
  const top3    = entries.slice(0, 3);
  const rest    = entries.slice(3);
  const tabCfg  = TABS.find(t => t.id === activeTab)!;

  // Find my position
  const myEntry = entries.find(e => e.uid === myUid);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 text-center">
        <h2 className="font-orbitron text-2xl font-black neon-cyan tracking-widest mb-1">
          LEADERBOARD
        </h2>
        <p className="font-mono text-[10px] tracking-widest text-white/30">
          LIVE GLOBAL RANKINGS
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 px-4 mb-4">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-orbitron text-[10px] font-bold tracking-wider',
              'border transition-all duration-150 active:scale-95',
              activeTab === t.id
                ? `border-current bg-white/5 ${t.color} shadow-[0_0_10px_var(--shadow)]`
                : 'border-white/10 bg-white/5 text-white/30 hover:text-white/50',
            )}
            style={activeTab === t.id ? { '--shadow': t.shadowColor } as React.CSSProperties : undefined}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Daily reward (only on chills tab) */}
      {activeTab === 'chills' && (
        <div className="px-4">
          <DailyRewardBanner />
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : entries.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="text-4xl mb-3">📡</div>
          <p className="font-orbitron text-sm text-white/30">NO SIGNAL YET</p>
          <p className="font-mono text-[10px] text-white/15 mt-1">Be the first to appear here</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 2 && (
            <Podium entries={entries} tab={activeTab} />
          )}

          {/* My rank callout (if outside top 10) */}
          {myEntry && myEntry.rank > 10 && (
            <div className="px-4 mb-3">
              <div className="glass rounded-xl px-4 py-2.5 border border-neon-cyan/30 flex items-center gap-3">
                <span className="font-mono text-[10px] text-white/30">YOUR RANK</span>
                <span className="font-orbitron font-black text-lg neon-cyan">#{myEntry.rank}</span>
                <span className={cn('font-mono text-xs ml-auto', tabCfg.color)}>
                  {getValue(myEntry, activeTab)}
                </span>
              </div>
            </div>
          )}

          {/* Full list (starts from rank 4, top 3 already in podium) */}
          <div className="px-4 space-y-2">
            {entries.map(entry => (
              <RankRow
                key={entry.uid}
                entry={entry}
                tab={activeTab}
                isMe={entry.uid === myUid}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
