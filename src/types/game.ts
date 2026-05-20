// ── Producer ──────────────────────────────────────────────────────
export interface ProducerState {
  count:     number;
  unlocked:  boolean;
}

export interface ProducerDef {
  id:          string;
  name:        string;
  emoji:       string;
  baseCost:    number;  // chills
  baseCPS:     number;  // chills per second per unit
  description: string;
}

// ── NFT ───────────────────────────────────────────────────────────
export interface NFT {
  id:         string;
  name:       string;
  rarity:     'Common' | 'Rare' | 'Epic' | 'Legendary';
  emoji:      string;
  bonus:      string;   // human-readable description
  cpsBoost:   number;   // multiplier e.g. 0.05 = +5%
  mintedAt:   number;   // timestamp
}

// ── Artefact ──────────────────────────────────────────────────────
export interface ArtefactDef {
  id:          string;
  name:        string;
  emoji:       string;
  description: string;
  cpsBoost:    number;
  cost:        number;  // diamonds
}

// ── HQ Room ───────────────────────────────────────────────────────
export interface HQRoomState {
  level:        number;
  buildingUntil: number | null;  // timestamp ms, null if not building
}

export interface HQRoomDef {
  id:          string;
  name:        string;
  emoji:       string;
  maxLevel:    number;
  baseCost:    number;  // diamonds
  buildTime:   number;  // ms
  bonusPerLevel: string;
  cpsBoost:    number;  // per level
}

// ── Stake ─────────────────────────────────────────────────────────
export interface StakeEntry {
  amount:    number;
  type:      'buy' | 'sell';
  price:     number;
  timestamp: number;
}

// ── Achievement ───────────────────────────────────────────────────
export interface AchievementDef {
  id:          string;
  name:        string;
  emoji:       string;
  description: string;
  check:       (state: GameState) => boolean;
}

// ── Settings ──────────────────────────────────────────────────────
export interface GameSettings {
  music:           boolean;
  particles:       boolean;
  offlineProgress: boolean;
}

// ── Core game state ───────────────────────────────────────────────
export interface GameState {
  // Currency
  chills:       number;
  totalChills:  number;
  diamonds:     number;

  // Identity
  username:     string;
  nameChanges:  number;

  // Producers & upgrades
  producers:    Record<string, ProducerState>;
  upgrades:     Record<string, boolean>;

  // Collection
  achievements: Record<string, boolean>;
  ownedNfts:    NFT[];
  artefacts:    Record<string, boolean>;

  // Staking
  stakes:         StakeEntry[];
  diamondStakes:  StakeEntry[];

  // HQ
  hqRooms:      Record<string, HQRoomState>;

  // Social
  giftsSentToday: number;
  lastGiftDate:   string;   // ISO date string YYYY-MM-DD

  // Shield (anti-raid)
  shieldExpiry: number;     // timestamp ms, 0 = no shield

  // Settings & meta
  settings:     GameSettings;
  lastSave:     number;     // timestamp ms
  version:      number;     // save schema version
}
