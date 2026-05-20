import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection, query, orderBy, limit, onSnapshot,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { LeaderboardEntry } from '@/types/firebase';

const db   = getFirestore();
const auth = getAuth();

export type LBTab = 'chills' | 'diamonds' | 'trophies';

interface LBState {
  chills:   LeaderboardEntry[];
  diamonds: LeaderboardEntry[];
  trophies: LeaderboardEntry[];
  loading:  boolean;
}

export function useLeaderboard() {
  const [data, setData] = useState<LBState>({
    chills: [], diamonds: [], trophies: [], loading: true,
  });

  const myUid = auth.currentUser?.uid ?? '';

  useEffect(() => {
    const lb = collection(db, 'leaderboard');

    const unsubChills = onSnapshot(
      query(lb, orderBy('totalChills', 'desc'), limit(50)),
      snap => setData(prev => ({
        ...prev,
        loading: false,
        chills: snap.docs.map((d, i) => ({
          rank: i + 1,
          uid: d.id,
          ...d.data(),
        } as LeaderboardEntry)),
      })),
      () => setData(prev => ({ ...prev, loading: false })),
    );

    const unsubDiamonds = onSnapshot(
      query(lb, orderBy('diamonds', 'desc'), limit(50)),
      snap => setData(prev => ({
        ...prev,
        diamonds: snap.docs.map((d, i) => ({
          rank: i + 1,
          uid: d.id,
          ...d.data(),
        } as LeaderboardEntry)),
      })),
    );

    const unsubTrophies = onSnapshot(
      query(lb, orderBy('achCount', 'desc'), limit(50)),
      snap => setData(prev => ({
        ...prev,
        trophies: snap.docs.map((d, i) => ({
          rank: i + 1,
          uid: d.id,
          ...d.data(),
        } as LeaderboardEntry)),
      })),
    );

    return () => {
      unsubChills();
      unsubDiamonds();
      unsubTrophies();
    };
  }, []);

  return { ...data, myUid };
}
