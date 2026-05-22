/**
 * NeonVerse Icon Registry
 * Uses lucide-react (bundled, no CDN) + inline SVG for game-specific icons
 */
import type { CSSProperties } from 'react';
import {
  Settings, Menu, X, Activity, ArrowLeft, CheckCircle2,
  AlertTriangle, Info, XCircle, Bell, UserPlus, Check,
  ShieldCheck, Shield, Sword, Gift, Users, Factory,
  Trophy, MessageCircle, ShoppingBag, TrendingUp, Castle,
  Medal, Star, Lock, Unlock, Zap, Gem, Snowflake,
  CreditCard, FlaskConical, Server, Radar, Target,
  Building2, Layers, Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Icon map: string name → Lucide component ──────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  // Nav
  'nav:core':     Target,
  'nav:produce':  Factory,
  'nav:rank':     Trophy,
  'nav:social':   Users,
  'nav:market':   ShoppingBag,
  'nav:stake':    TrendingUp,
  'nav:hq':       Building2,
  'nav:achieve':  Medal,
  'nav:settings': Settings,
  'nav:menu':     Menu,
  'nav:close':    X,
  // Currency
  'cur:chills':   Snowflake,
  'cur:diamonds': Gem,
  'cur:nft':      CreditCard,
  'cur:star':     Star,
  // Social
  'soc:gift':     Gift,
  'soc:friends':  Users,
  'soc:raid':     Sword,
  'soc:shield':   Shield,
  'soc:shieldOn': ShieldCheck,
  'soc:add':      UserPlus,
  'soc:accept':   Check,
  'soc:decline':  X,
  'soc:collect':  Package,
  'soc:send':     Gift,
  // Game
  'game:mine':      Zap,
  'game:build':     Layers,
  'game:anvil':     Layers,
  'game:upgrade':   Zap,
  'game:coins':     Gem,
  'game:cauldron':  FlaskConical,
  'game:chest':     Package,
  'game:achieve':   Medal,
  'game:padlock':   Lock,
  'game:unlock':    Unlock,
  'game:podium':    Trophy,
  'game:nft':       CreditCard,
  'game:shop':      ShoppingBag,
  'game:exchange':  TrendingUp,
  'game:radar':     Radar,
  // Feedback
  'ui:check':       CheckCircle2,
  'ui:warning':     AlertTriangle,
  'ui:info':        Info,
  'ui:error':       XCircle,
  'ui:bell':        Bell,
  'ui:activity':    Activity,
  'ui:back':        ArrowLeft,
  // Producers
  'prod:vibe_node':       Target,
  'prod:lo_fi_loop':      Activity,
  'prod:neon_shrine':     Star,
  'prod:void_reactor':    Zap,
  'prod:chill_server':    Server,
  'prod:neon_grid':       Layers,
  'prod:pulse_station':   Radar,
  'prod:void_matrix':     Layers,
  'prod:hypercore':       Zap,
  'prod:null_singularity':Target,
  // Artefacts
  'art:neon_crystal':     Gem,
  'art:void_shard':       Layers,
  'art:pulse_relic':      Star,
  'art:null_core':        Target,
  'art:singularity_gem':  Gem,
  // HQ rooms
  'hq:lounge':       Building2,
  'hq:lab':          FlaskConical,
  'hq:server_room':  Server,
  'hq:void_chamber': Target,
  'hq:nexus':        Target,
  // Rarity
  'rarity:common':    Gem,
  'rarity:rare':      Star,
  'rarity:epic':      Zap,
  'rarity:legendary': Trophy,
};

// ── Fallback: render a small text symbol ──────────────────────────
function Fallback({ size }: { size: number }) {
  return <span style={{ fontSize: size * 0.7, lineHeight: 1, display: 'inline-block', width: size, height: size, textAlign: 'center' }}>◆</span>;
}

// ── GameIcon component ─────────────────────────────────────────────
interface GameIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function GameIcon({ name, size = 20, className, style }: GameIconProps) {
  const LIcon = ICON_MAP[name];
  if (!LIcon) return <Fallback size={size} />;
  return <LIcon size={size} className={className} style={style} />;
}

// ── Named exports (same strings as before, now mapped to our keys) ─
export const NAV_ICONS = {
  core:     'nav:core',
  produce:  'nav:produce',
  rank:     'nav:rank',
  social:   'nav:social',
  market:   'nav:market',
  stake:    'nav:stake',
  hq:       'nav:hq',
  achieve:  'nav:achieve',
  settings: 'nav:settings',
  menu:     'nav:menu',
  close:    'nav:close',
} as const;

export const CURRENCY_ICONS = {
  chills:   'cur:chills',
  diamonds: 'cur:diamonds',
  nft:      'cur:nft',
  star:     'cur:star',
} as const;

export const SOCIAL_ICONS = {
  gift:       'soc:gift',
  friends:    'soc:friends',
  raid:       'soc:raid',
  shield:     'soc:shield',
  shieldOn:   'soc:shieldOn',
  add:        'soc:add',
  accept:     'soc:accept',
  decline:    'soc:decline',
  collect:    'soc:collect',
  send:       'soc:send',
} as const;

export const PRODUCER_ICONS: Record<string, string> = {
  vibe_node:        'prod:vibe_node',
  lo_fi_loop:       'prod:lo_fi_loop',
  neon_shrine:      'prod:neon_shrine',
  void_reactor:     'prod:void_reactor',
  chill_server:     'prod:chill_server',
  neon_grid:        'prod:neon_grid',
  pulse_station:    'prod:pulse_station',
  void_matrix:      'prod:void_matrix',
  hypercore:        'prod:hypercore',
  null_singularity: 'prod:null_singularity',
};

export const ARTEFACT_ICONS: Record<string, string> = {
  neon_crystal:    'art:neon_crystal',
  void_shard:      'art:void_shard',
  pulse_relic:     'art:pulse_relic',
  null_core:       'art:null_core',
  singularity_gem: 'art:singularity_gem',
};

export const HQ_ROOM_ICONS: Record<string, string> = {
  lounge:       'hq:lounge',
  lab:          'hq:lab',
  server_room:  'hq:server_room',
  void_chamber: 'hq:void_chamber',
  nexus:        'hq:nexus',
};
