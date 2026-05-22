import { useState } from 'react';
import { useLeaderboard, type LBTab } from '@/hooks/useLeaderboard';
import { fmt, cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/firebase';
import { GameIcon, CURRENCY_ICONS } from '@/lib/icons';

const MEDAL_ICONS  = ['game-icons:laurel-crown', 'game-icons:trophy', 'game-icons:medal'];
const MEDAL_COLORS = ['#fbbf24', '#d1d5db', '#b45309'];
const PODIUM_ORDER = [1, 0, 2];
const PODIUM_H     = ['h-14', 'h-20', 'h-10'];

const TABS: { id: LBTab; label: string; icon: string; color: string }[] = [
  { id: 'chills',   label: 'CHILLS',   icon: CURRENCY_ICONS.chills,   color: 'void-btn-glow'   },
  { id: 'diamonds', label: 'DIAMONDS', icon: CURRENCY_ICONS.diamonds, color: 'void-btn-accent' },
  { id: 'trophies', label: 'TROPHIES', icon: 'game-icons:trophy',     color: 'void-btn-gradient' },
];

function getValue(entry: LeaderboardEntry, tab: LBTab): string {
  if (tab === 'chills')   return fmt(entry.totalChills);
  if (tab === 'diamonds') return fmt(entry.diamonds);
  return String(entry.achCount ?? 0);
}

function getValueColor(tab: LBTab) {
  if (tab === 'chills')   return 'var(--nv-cyan)';
  if (tab === 'diamonds') return 'var(--nv-magenta)';
  return '#fbbf24';
}

function Podium({ entries, tab }: { entries: LeaderboardEntry[]; tab: LBTab }) {
  const top3 = entries.slice(0, 3);
  if (top3.length < 2) return null;

  return (
    <div className="flex items-end justify-center gap-3 px-4 pt-5 pb-3">
      {PODIUM_ORDER.map(dataIdx => {
        const entry = top3[dataIdx];
        if (!entry) return <div key={dataIdx} className="flex-1" />;
        return (
          <div key={dataIdx} className="flex-1 flex flex-col items-center gap-1.5">
            <GameIcon name={MEDAL_ICONS[dataIdx]} size={dataIdx === 0 ? 30 : dataIdx === 1 ? 24 : 20}
              style={{ color: MEDAL_COLORS[dataIdx] }} />
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-sm"
              style={{ background: 'var(--void-bg-elevated)', border: `1px solid ${MEDAL_COLORS[dataIdx]}40`, color: MEDAL_COLORS[dataIdx] }}>
              {(entry.username?.[0] ?? '?').toUpperCase()}
            </div>
            <p className="font-display text-[10px] font-bold text-center truncate w-full px-1"
              style={{ color: 'var(--void-text-primary)' }}>{entry.username || 'ANON'}</p>
            <p className="font-game text-[9px] chill-number" style={{ color: getValueColor(tab) }}>
              {getValue(entry, tab)}
            </p>
            <div className={cn('w-full rounded-t-lg', PODIUM_H[dataIdx])}
              style={{ background: `${MEDAL_COLORS[dataIdx]}15`, border: `1px solid ${MEDAL_COLORS[dataIdx]}25`, borderBottom: 'none' }}>
              <p className="font-display text-[9px] text-center mt-2" style={{ color: `${MEDAL_COLORS[dataIdx]}60` }}>#{dataIdx + 1}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RankRow({ entry, tab, isMe }: { entry: LeaderboardEntry; tab: LBTab; isMe: boolean }) {
  return (
    <div className={cn('void-card-glass flex items-center gap-3 px-4 py-3 transition-all',
      isMe && 'prism-corner')}
      style={{ borderColor: isMe ? 'rgba(0,243,255,0.35)' : 'var(--void-border-primary)', background: isMe ? 'rgba(0,243,255,0.06)' : undefined }}>
      <span className="w-6 flex items-center justify-center shrink-0">
        {entry.rank <= 3
          ? <GameIcon name={MEDAL_ICONS[entry.rank - 1]} size={18} style={{ color: MEDAL_COLORS[entry.rank - 1] }} />
          : <span className="font-display text-xs" style={{ color: 'var(--void-text-muted)' }}>#{entry.rank}</span>
        }
      </span>
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold shrink-0"
        style={{ background: 'var(--void-bg-elevated)', border: `1px solid ${isMe ? 'rgba(0,243,255,0.3)' : 'var(--void-border-primary)'}`, color: isMe ? 'var(--nv-cyan)' : 'var(--void-text-secondary)' }}>
        {(entry.username?.[0] ?? '?').toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-display text-xs font-bold truncate', isMe ? 'neon-cyan' : '')}
          style={{ color: isMe ? undefined : 'var(--void-text-primary)' }}>
          {entry.username || 'ANON'}
          {isMe && <span className="font-game text-[9px] ml-1" style={{ color: 'var(--void-text-muted)' }}>(you)</span>}
        </p>
        <p className="font-game text-[9px] truncate" style={{ color: 'var(--void-text-muted)' }}>
          {entry.hqRank || 'Empty Lot'}
        </p>
      </div>
      <span className="font-game text-xs font-bold chill-number shrink-0" style={{ color: getValueColor(tab) }}>
        {getValue(entry, tab)}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-4 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="void-card h-14 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LBTab>('chills');
  const { chills, diamonds, trophies, loading, myUid } = useLeaderboard();
  const dataMap = { chills, diamonds, trophies };
  const entries  = dataMap[activeTab];
  const myEntry  = entries.find(e => e.uid === myUid);
  const tabCfg   = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="pb-6">
      <div className="px-4 pt-5 pb-4">
        <h2 className="font-display text-2xl font-black neon-cyan tracking-widest mb-1">LEADERBOARD</h2>
        <p className="font-game text-xs" style={{ color: 'var(--void-text-muted)', letterSpacing: '0.1em' }}>LIVE GLOBAL RANKINGS</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 px-4 mb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn('void-btn void-btn-sm flex-1 gap-1.5',
              activeTab === t.id ? t.color : 'void-btn-ghost')}>
            <GameIcon name={t.icon} size={12} />{t.label}
          </button>
        ))}
      </div>

      {/* Daily reward */}
      {activeTab === 'chills' && (
        <div className="px-4 my-3">
          <div className="void-card-glass p-3 flex items-start gap-3"
            style={{ borderColor: 'rgba(251,191,36,0.2)' }}>
            <GameIcon name="game-icons:podium" size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <div>
              <p className="font-display text-xs font-bold" style={{ color: '#fbbf24' }}>DAILY REWARD ACTIVE</p>
              <p className="font-game text-[9px] mt-0.5" style={{ color: 'var(--void-text-secondary)' }}>
                Top 3 earn daily Diamonds: 🥇 3💎 · 🥈 2💎 · 🥉 1💎
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? <LoadingSkeleton /> : entries.length === 0 ? (
        <div className="text-center py-12 px-4">
          <GameIcon name="game-icons:radar-dish" size={44} className="mx-auto mb-3" style={{ color: 'var(--void-text-muted)' }} />
          <p className="font-display text-sm" style={{ color: 'var(--void-text-tertiary)' }}>NO SIGNAL YET</p>
          <p className="font-game text-xs mt-1" style={{ color: 'var(--void-text-muted)' }}>Be the first to appear here</p>
        </div>
      ) : (
        <>
          <Podium entries={entries} tab={activeTab} />

          {myEntry && myEntry.rank > 10 && (
            <div className="px-4 mb-3">
              <div className="void-card-glass flex items-center gap-3 px-4 py-2.5 prism-corner">
                <span className="font-game text-xs" style={{ color: 'var(--void-text-muted)' }}>YOUR RANK</span>
                <span className="font-display font-black text-xl neon-cyan">#{myEntry.rank}</span>
                <span className="font-game text-xs ml-auto chill-number" style={{ color: getValueColor(activeTab) }}>
                  {getValue(myEntry, activeTab)}
                </span>
              </div>
            </div>
          )}

          <div className="px-4 space-y-1.5">
            {entries.map(entry => (
              <RankRow key={entry.uid} entry={entry} tab={activeTab} isMe={entry.uid === myUid} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
