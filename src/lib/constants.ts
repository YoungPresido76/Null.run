import type { ProducerDef, ArtefactDef, HQRoomDef, AchievementDef } from '../types/game';

export const SAVE_KEY    = 'neonverse_save_v1';
export const GAME_TITLE  = 'Neon Verse';
export const STUDIO_NAME = 'null.run';

// ── Producers ─────────────────────────────────────────────────────
export const PRODUCERS: ProducerDef[] = [
  { id: 'vibe_node',      name: 'Vibe Node',      emoji: '🔮', baseCost: 15,        baseCPS: 0.1,   description: 'A tiny pulse of ambient chill.' },
  { id: 'lo_fi_loop',     name: 'Lo-Fi Loop',     emoji: '🎵', baseCost: 100,       baseCPS: 0.5,   description: 'Endless looping beats.' },
  { id: 'neon_shrine',    name: 'Neon Shrine',    emoji: '⛩️', baseCost: 500,       baseCPS: 2,     description: 'Radiates passive neon energy.' },
  { id: 'void_reactor',   name: 'Void Reactor',   emoji: '⚡', baseCost: 2000,      baseCPS: 8,     description: 'Taps into the void for raw chills.' },
  { id: 'chill_server',   name: 'Chill Server',   emoji: '🖥️', baseCost: 10000,     baseCPS: 30,    description: 'An entire data center, vibing.' },
  { id: 'neon_grid',      name: 'Neon Grid',      emoji: '🌐', baseCost: 50000,     baseCPS: 100,   description: 'City-wide chill infrastructure.' },
  { id: 'pulse_station',  name: 'Pulse Station',  emoji: '📡', baseCost: 250000,    baseCPS: 350,   description: 'Broadcasts chill frequencies globally.' },
  { id: 'void_matrix',    name: 'Void Matrix',    emoji: '🧬', baseCost: 1500000,   baseCPS: 1200,  description: 'A multidimensional chill lattice.' },
  { id: 'hypercore',      name: 'Hypercore',      emoji: '💠', baseCost: 10000000,  baseCPS: 5000,  description: 'Quantum-entangled chill engine.' },
  { id: 'null_singularity',name:'Null Singularity',emoji:'🌌', baseCost: 75000000,  baseCPS: 25000, description: 'The source of all chills in existence.' },
];

// ── Artefacts ─────────────────────────────────────────────────────
export const ARTEFACTS: ArtefactDef[] = [
  { id: 'neon_crystal',   name: 'Neon Crystal',   emoji: '💎', description: '+5% CPS',          cpsBoost: 0.05, cost: 10  },
  { id: 'void_shard',     name: 'Void Shard',     emoji: '🔷', description: '+10% CPS',         cpsBoost: 0.10, cost: 25  },
  { id: 'pulse_relic',    name: 'Pulse Relic',    emoji: '📿', description: '+20% CPS',         cpsBoost: 0.20, cost: 60  },
  { id: 'null_core',      name: 'Null Core',      emoji: '⚫', description: '+50% CPS',         cpsBoost: 0.50, cost: 150 },
  { id: 'singularity_gem',name: 'Singularity Gem',emoji: '🌟', description: '+100% CPS',        cpsBoost: 1.00, cost: 400 },
];

// ── HQ Rooms ──────────────────────────────────────────────────────
export const HQ_ROOMS: HQRoomDef[] = [
  { id: 'lounge',      name: 'Chill Lounge',     emoji: '🛋️', maxLevel: 5, baseCost: 10,  buildTime: 30000,   bonusPerLevel: '+2% CPS per level',  cpsBoost: 0.02 },
  { id: 'lab',         name: 'Neon Lab',         emoji: '🧪', maxLevel: 5, baseCost: 50,  buildTime: 120000,  bonusPerLevel: '+5% CPS per level',  cpsBoost: 0.05 },
  { id: 'server_room', name: 'Server Room',      emoji: '💾', maxLevel: 5, baseCost: 150, buildTime: 300000,  bonusPerLevel: '+10% CPS per level', cpsBoost: 0.10 },
  { id: 'void_chamber',name: 'Void Chamber',     emoji: '🌀', maxLevel: 5, baseCost: 400, buildTime: 600000,  bonusPerLevel: '+20% CPS per level', cpsBoost: 0.20 },
  { id: 'nexus',       name: 'Null Nexus',       emoji: '🌌', maxLevel: 3, baseCost: 1000,buildTime: 1800000, bonusPerLevel: '+50% CPS per level', cpsBoost: 0.50 },
];

export const HQ_RANKS = [
  'Empty Lot', 'Signal Booth', 'Neon Shack', 'Grid Node',
  'Pulse Hub', 'Void Station', 'Null HQ', 'Neon Citadel',
  'Void Nexus', 'Singularity Core',
];

// ── Achievements ──────────────────────────────────────────────────
// (check functions reference GameState — import lazily in hook to avoid circular)
export const ACHIEVEMENT_DEFS = [
  { id: 'first_chill',    name: 'First Chill',      emoji: '❄️',  description: 'Earn your first Chill.' },
  { id: 'chill_100',      name: 'Getting Chilly',   emoji: '🌊',  description: 'Earn 100 Chills.' },
  { id: 'chill_1k',       name: 'Chill Wave',       emoji: '💧',  description: 'Earn 1,000 Chills.' },
  { id: 'chill_10k',      name: 'Deep Chill',       emoji: '🧊',  description: 'Earn 10,000 Chills.' },
  { id: 'chill_100k',     name: 'Arctic Pulse',     emoji: '🏔️',  description: 'Earn 100,000 Chills.' },
  { id: 'chill_1m',       name: 'Null Frost',       emoji: '🌌',  description: 'Earn 1,000,000 Chills.' },
  { id: 'first_producer', name: 'Signal Found',     emoji: '📡',  description: 'Buy your first producer.' },
  { id: 'producers_10',   name: 'Grid Online',      emoji: '🌐',  description: 'Own 10 producers total.' },
  { id: 'producers_50',   name: 'Void Array',       emoji: '⚡',  description: 'Own 50 producers total.' },
  { id: 'first_nft',      name: 'Digital Soul',     emoji: '🎴',  description: 'Mint your first NFT.' },
  { id: 'nft_5',          name: 'Collector',        emoji: '🗂️',  description: 'Collect 5 NFTs.' },
  { id: 'first_diamond',  name: 'Crystal Born',     emoji: '💠',  description: 'Earn your first Diamond.' },
  { id: 'diamonds_50',    name: 'Gem Hoarder',      emoji: '💎',  description: 'Accumulate 50 Diamonds.' },
  { id: 'first_raid',     name: 'Signal Breach',    emoji: '⚔️',  description: 'Raid another player.' },
  { id: 'hq_built',       name: 'Null Base',        emoji: '🏗️',  description: 'Upgrade your first HQ room.' },
  { id: 'sent_gift',      name: 'Generous Signal',  emoji: '🎁',  description: 'Send a gift to another player.' },
  { id: 'leaderboard_top3', name: 'Top Signal',     emoji: '🏆',  description: 'Reach the top 3 on any leaderboard.' },
] as const;

export type AchievementId = typeof ACHIEVEMENT_DEFS[number]['id'];

// ── Default game state ────────────────────────────────────────────
import type { GameState } from '../types/game';

export function defaultGameState(): GameState {
  const producers: GameState['producers'] = {};
  PRODUCERS.forEach(p => { producers[p.id] = { count: 0, unlocked: false }; });

  const hqRooms: GameState['hqRooms'] = {};
  HQ_ROOMS.forEach(r => { hqRooms[r.id] = { level: 0, buildingUntil: null }; });

  return {
    chills:       0,
    totalChills:  0,
    diamonds:     0,
    username:     'Anon',
    nameChanges:  0,
    producers,
    upgrades:     {},
    achievements: {},
    ownedNfts:    [],
    artefacts:    {},
    stakes:       [],
    diamondStakes:[],
    hqRooms,
    giftsSentToday: 0,
    lastGiftDate:   '',
    shieldExpiry:   0,
    settings: {
      music:           true,
      particles:       true,
      offlineProgress: true,
    },
    lastSave: Date.now(),
    version:  1,
  };
}
