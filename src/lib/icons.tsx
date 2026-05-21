/**
 * NeonVerse Icon Registry
 * Uses @iconify/react with game-icons + lucide sets
 * Full icon browser: https://icon-sets.iconify.design
 */
import { Icon } from '@iconify/react';
import type { CSSProperties } from 'react';

interface GameIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function GameIcon({ name, size = 20, className, style }: GameIconProps) {
  return <Icon icon={name} width={size} height={size} className={className} style={style} />;
}

// ── Navigation icons ──────────────────────────────────────────────
export const NAV_ICONS = {
  core:     'game-icons:orb',
  produce:  'game-icons:factory',
  rank:     'game-icons:podium',
  social:   'game-icons:conversation',
  market:   'game-icons:shop',
  stake:    'game-icons:gold-bar',
  hq:       'game-icons:castle',
  achieve:  'game-icons:achievement',
  settings: 'lucide:settings',
  menu:     'lucide:menu',
  close:    'lucide:x',
} as const;

// ── Currency icons ────────────────────────────────────────────────
export const CURRENCY_ICONS = {
  chills:   'game-icons:ice-cube',
  diamonds: 'game-icons:diamond',
  nft:      'game-icons:card-exchange',
  star:     'game-icons:star-medal',
} as const;

// ── Social icons ──────────────────────────────────────────────────
export const SOCIAL_ICONS = {
  gift:       'game-icons:gift',
  friends:    'game-icons:two-shadows',
  raid:       'game-icons:crossed-swords',
  shield:     'game-icons:shield-reflect',
  shieldOn:   'game-icons:shield',
  add:        'lucide:user-plus',
  accept:     'lucide:check',
  decline:    'lucide:x',
  collect:    'game-icons:open-chest',
  send:       'game-icons:paper-arrow',
} as const;

// ── Game icons ────────────────────────────────────────────────────
export const GAME_ICONS = {
  // Leaderboard
  gold:         'game-icons:laurel-crown',
  silver:       'game-icons:trophy',
  bronze:       'game-icons:medal',
  // HQ
  mine:         'game-icons:mine-explosion',
  build:        'game-icons:stone-crafting',
  // Market
  mint:         'game-icons:anvil',
  rareCommon:   'game-icons:gem-necklace',
  rareRare:     'game-icons:crystal-wand',
  rareEpic:     'game-icons:lightning-trio',
  rareLegend:   'game-icons:holy-grail',
  // Stake
  stake:        'game-icons:coins',
  pot:          'game-icons:cauldron',
  // Achievements
  locked:       'game-icons:padlock',
  unlocked:     'game-icons:unlocked',
  // UI
  online:       'lucide:radio',
  cps:          'lucide:activity',
  upgrade:      'game-icons:upgrade',
  info:         'lucide:info',
  warning:      'lucide:alert-triangle',
  check:        'lucide:check-circle-2',
  back:         'lucide:arrow-left',
} as const;

// ── Producer icons ────────────────────────────────────────────────
export const PRODUCER_ICONS: Record<string, string> = {
  vibe_node:       'game-icons:crystal-ball',
  lo_fi_loop:      'game-icons:music-spell',
  neon_shrine:     'game-icons:torii-gate',
  void_reactor:    'game-icons:nuclear-plant',
  chill_server:    'game-icons:server-rack',
  neon_grid:       'game-icons:power-lightning',
  pulse_station:   'game-icons:radar-dish',
  void_matrix:     'game-icons:matrix',
  hypercore:       'game-icons:reactor',
  null_singularity:'game-icons:vortex',
};

// ── HQ room icons ─────────────────────────────────────────────────
export const HQ_ROOM_ICONS: Record<string, string> = {
  lounge:       'game-icons:sofa',
  lab:          'game-icons:microscope',
  server_room:  'game-icons:server-rack',
  void_chamber: 'game-icons:vortex',
  nexus:        'game-icons:targeting',
};

// ── Artefact icons ────────────────────────────────────────────────
export const ARTEFACT_ICONS: Record<string, string> = {
  neon_crystal:    'game-icons:crystal-shine',
  void_shard:      'game-icons:shatter',
  pulse_relic:     'game-icons:necklace-display',
  null_core:       'game-icons:cube',
  singularity_gem: 'game-icons:gem-pendant',
};
