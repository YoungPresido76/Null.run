import type { GameState } from '../types/game';
import { PRODUCERS, HQ_ROOMS, ARTEFACTS } from './constants';

// ── Number formatting ─────────────────────────────────────────────
export function fmt(n: number): string {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + 'Qa';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1)  + 'K';
  return Math.floor(n).toLocaleString();
}

export function fmtTime(ms: number): string {
  const s  = Math.floor(ms / 1000);
  const m  = Math.floor(s / 60);
  const h  = Math.floor(m / 60);
  const d  = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ── Producer cost (1.15 growth) ───────────────────────────────────
export function producerCost(id: string, owned: number): number {
  const def = PRODUCERS.find(p => p.id === id);
  if (!def) return Infinity;
  return Math.ceil(def.baseCost * Math.pow(1.15, owned));
}

// ── CPS calculation ───────────────────────────────────────────────
export function getCPS(state: GameState): number {
  let base = 0;

  // Producers
  PRODUCERS.forEach(def => {
    const s = state.producers[def.id];
    if (s) base += def.baseCPS * s.count;
  });

  // HQ room bonuses
  let hqMult = 1;
  HQ_ROOMS.forEach(def => {
    const room = state.hqRooms[def.id];
    if (room) hqMult += def.cpsBoost * room.level;
  });

  // Artefact bonuses
  let artMult = 1;
  ARTEFACTS.forEach(def => {
    if (state.artefacts[def.id]) artMult += def.cpsBoost;
  });

  // NFT bonuses
  let nftMult = 1;
  state.ownedNfts.forEach(nft => { nftMult += nft.cpsBoost; });

  return base * hqMult * artMult * nftMult;
}

// ── HQ rank ───────────────────────────────────────────────────────
import { HQ_RANKS } from './constants';
export function getHQRank(state: GameState): string {
  const totalLevels = Object.values(state.hqRooms).reduce((s, r) => s + r.level, 0);
  const idx = Math.min(Math.floor(totalLevels / 3), HQ_RANKS.length - 1);
  return HQ_RANKS[idx];
}

// ── Offline progress ──────────────────────────────────────────────
export function calcOfflineChills(state: GameState): number {
  if (!state.settings.offlineProgress) return 0;
  const now     = Date.now();
  const elapsed = Math.max(0, now - state.lastSave);
  const maxMs   = 8 * 3600 * 1000; // cap at 8 hours
  const capped  = Math.min(elapsed, maxMs);
  return getCPS(state) * (capped / 1000) * 0.5; // 50% efficiency offline
}

// ── Achievement checks ────────────────────────────────────────────
import { ACHIEVEMENT_DEFS } from './constants';

type CheckMap = Record<string, (s: GameState) => boolean>;

export const ACHIEVEMENT_CHECKS: CheckMap = {
  first_chill:      s => s.totalChills >= 1,
  chill_100:        s => s.totalChills >= 100,
  chill_1k:         s => s.totalChills >= 1_000,
  chill_10k:        s => s.totalChills >= 10_000,
  chill_100k:       s => s.totalChills >= 100_000,
  chill_1m:         s => s.totalChills >= 1_000_000,
  first_producer:   s => Object.values(s.producers).some(p => p.count > 0),
  producers_10:     s => Object.values(s.producers).reduce((a,p) => a + p.count, 0) >= 10,
  producers_50:     s => Object.values(s.producers).reduce((a,p) => a + p.count, 0) >= 50,
  first_nft:        s => s.ownedNfts.length >= 1,
  nft_5:            s => s.ownedNfts.length >= 5,
  first_diamond:    s => s.diamonds >= 1,
  diamonds_50:      s => s.diamonds >= 50,
  first_raid:       _s => false, // set externally after raid
  hq_built:         s => Object.values(s.hqRooms).some(r => r.level > 0),
  sent_gift:        _s => false, // set externally after gift sent
  leaderboard_top3: _s => false, // set externally after lb check
};

/** Returns list of newly unlocked achievement IDs */
export function checkAchievements(state: GameState): string[] {
  const newly: string[] = [];
  ACHIEVEMENT_DEFS.forEach(def => {
    if (!state.achievements[def.id]) {
      const check = ACHIEVEMENT_CHECKS[def.id];
      if (check && check(state)) newly.push(def.id);
    }
  });
  return newly;
}
