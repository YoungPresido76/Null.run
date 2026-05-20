import { Timestamp } from 'firebase/firestore';

export interface PlayerDoc {
  username:    string;
  totalChills: number;
  diamonds:    number;
  hqRank:      string;
  nftCount:    number;
  achCount:    number;
  lastSeen:    Timestamp;
  shieldExpiry?: Timestamp;
}

export interface LeaderboardDoc {
  username:    string;
  totalChills: number;
  diamonds:    number;
  hqRank:      string;
  achCount:    number;
  lastUpdated: Timestamp;
}

export interface GiftDoc {
  from:      string;   // uid
  fromName:  string;
  toUid:     string;
  toName:    string;
  amount:    number;
  currency:  'chills' | 'diamonds';
  timestamp: Timestamp;
  claimed:   boolean;
}

export interface StakeEntryDoc {
  username:         string;
  weeklyStakeTotal: number;
  weekStart:        Timestamp;
  uid:              string;
}

export interface CommunityPotDoc {
  pot:          number;
  totalStaked:  number;
  weekEnd:      Timestamp;
  recentStakes: { username: string; amount: number; time: number }[];
}

export interface FriendRequestDoc {
  from:      string;
  fromName:  string;
  to:        string;
  toName:    string;
  status:    'pending' | 'accepted' | 'declined';
  timestamp: Timestamp;
}

export interface NFTListingDoc {
  sellerUid:  string;
  sellerName: string;
  nft:        import('./game').NFT;
  price:      number;
  currency:   'chills' | 'diamonds';
  localIdx:   number;
  listedAt:   Timestamp;
  sold:       boolean;
}

export interface RaidDoc {
  attacker:       string;
  defender:       string;
  won:            boolean;
  chillsGained:   number;
  diamondsGained: number;
  timestamp:      Timestamp;
}

export interface LeaderboardEntry extends LeaderboardDoc {
  uid:  string;
  rank: number;
}
