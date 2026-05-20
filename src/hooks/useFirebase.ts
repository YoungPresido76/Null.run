import { useEffect, useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc, setDoc, getDoc,
  collection, query, orderBy, limit, onSnapshot,
  getDocs, updateDoc, increment, serverTimestamp,
  where, addDoc, Timestamp,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import type { GameState } from '../types/game';
import type { LeaderboardEntry } from '../types/firebase';
import { getHQRank } from '../lib/gameLogic';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const fbApp = initializeApp(firebaseConfig);
const auth  = getAuth(fbApp);
const db    = getFirestore(fbApp);

export const lbData: {
  chills:   LeaderboardEntry[];
  diamonds: LeaderboardEntry[];
  ach:      LeaderboardEntry[];
} = { chills: [], diamonds: [], ach: [] };

export function useFirebase() {
  const [user,         setUser]         = useState<User | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [serverOffset, setServerOffset] = useState(0);

  const serverNow = () => Date.now() + serverOffset;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        const ref = doc(db, '_time', 'ping');
        try {
          await setDoc(ref, { t: serverTimestamp() });
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const srv = snap.data().t?.toMillis?.() ?? Date.now();
            setServerOffset(srv - Date.now());
          }
        } catch { /* offline */ }
        subscribeLeaderboard();
      }
    });
    return unsub;
  }, []);

  // ── Email auth ────────────────────────────────────────────────
  async function signUp(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  // ── Player sync ───────────────────────────────────────────────
  async function syncPlayer(state: GameState) {
    if (!user) return;
    const data = {
      username:    state.username,
      totalChills: state.totalChills,
      diamonds:    state.diamonds,
      hqRank:      getHQRank(state),
      nftCount:    state.ownedNfts.length,
      achCount:    Object.keys(state.achievements).length,
      lastSeen:    serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'players', user.uid), data, { merge: true });
      await setDoc(doc(db, 'leaderboard', user.uid), {
        username:    data.username,
        totalChills: data.totalChills,
        diamonds:    data.diamonds,
        hqRank:      data.hqRank,
        achCount:    data.achCount,
        lastUpdated: serverTimestamp(),
      }, { merge: true });
    } catch { /* ignore */ }
  }

  function subscribeLeaderboard() {
    const lb = collection(db, 'leaderboard');
    onSnapshot(query(lb, orderBy('totalChills', 'desc'), limit(50)), snap => {
      lbData.chills = snap.docs.map((d, i) => ({ rank: i + 1, uid: d.id, ...d.data() } as LeaderboardEntry));
    });
    onSnapshot(query(lb, orderBy('diamonds', 'desc'), limit(50)), snap => {
      lbData.diamonds = snap.docs.map((d, i) => ({ rank: i + 1, uid: d.id, ...d.data() } as LeaderboardEntry));
    });
    onSnapshot(query(lb, orderBy('achCount', 'desc'), limit(50)), snap => {
      lbData.ach = snap.docs.map((d, i) => ({ rank: i + 1, uid: d.id, ...d.data() } as LeaderboardEntry));
    });
  }

  async function sendGift(toUsername: string, amount: number, currency: 'chills' | 'diamonds') {
    if (!user) return { ok: false, msg: 'Not connected' };
    const q    = query(collection(db, 'players'), where('username', '==', toUsername), limit(1));
    const snap = await getDocs(q).catch(() => null);
    if (!snap || snap.empty) return { ok: false, msg: 'Player not found' };
    const toUid = snap.docs[0].id;
    if (toUid === user.uid) return { ok: false, msg: "Can't gift yourself!" };
    await setDoc(doc(db, 'gifts', user.uid + '_' + Date.now()), {
      from: user.uid, fromName: '', toUid, toName: toUsername,
      amount, currency, timestamp: serverTimestamp(), claimed: false,
    });
    return { ok: true };
  }

  async function loadIncomingGifts() {
    if (!user) return { chills: 0, diamonds: 0, msgs: [] as string[] };
    const q    = query(collection(db, 'gifts'), where('toUid', '==', user.uid), where('claimed', '==', false), limit(20));
    const snap = await getDocs(q).catch(() => null);
    if (!snap || snap.empty) return { chills: 0, diamonds: 0, msgs: [] as string[] };
    let totalChills = 0, totalDiamonds = 0;
    const msgs: string[] = [];
    for (const d of snap.docs) {
      const g = d.data();
      if (g.currency === 'chills')   totalChills   += g.amount;
      if (g.currency === 'diamonds') totalDiamonds += g.amount;
      msgs.push(`${g.fromName} sent you ${g.amount.toLocaleString()} ${g.currency === 'chills' ? 'Chills ❄️' : 'Diamonds 💎'}`);
      await updateDoc(doc(db, 'gifts', d.id), { claimed: true });
    }
    return { chills: totalChills, diamonds: totalDiamonds, msgs };
  }

  async function contributePot(stakeAmount: number, username: string) {
    if (!user) return;
    const contribution = Math.floor(stakeAmount * 0.30);
    const potRef  = doc(db, 'communityPot', 'week');
    const potSnap = await getDoc(potRef).catch(() => null);
    const now     = serverNow();
    const d       = new Date(now);
    const daysUntilSun = (7 - d.getUTCDay()) % 7 || 7;
    const weekEnd   = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + daysUntilSun));
    const weekStart = new Date(weekEnd); weekStart.setUTCDate(weekEnd.getUTCDate() - 7);
    const entryRef  = doc(db, 'stakeEntries', user.uid);
    const entrySnap = await getDoc(entryRef).catch(() => null);
    let weeklyTotal = stakeAmount;
    if (entrySnap?.exists()) {
      const e = entrySnap.data();
      if ((e.weekStart?.toMillis?.() ?? 0) >= weekStart.getTime()) weeklyTotal += (e.weeklyStakeTotal ?? 0);
    }
    await setDoc(entryRef, { username, weeklyStakeTotal: weeklyTotal, weekStart: Timestamp.fromDate(weekStart), uid: user.uid }, { merge: true });
    const recentEntry = { username, amount: stakeAmount, time: now };
    const prevRecent  = potSnap?.exists() ? (potSnap.data().recentStakes ?? []) : [];
    const newRecent   = [recentEntry, ...prevRecent].slice(0, 10);
    if (!potSnap?.exists()) {
      await setDoc(potRef, { pot: contribution, totalStaked: stakeAmount, recentStakes: newRecent, weekEnd: Timestamp.fromDate(weekEnd) });
    } else {
      await updateDoc(potRef, { pot: increment(contribution), totalStaked: increment(stakeAmount), recentStakes: newRecent });
    }
  }

  async function recordRaid(defenderUid: string, won: boolean, chillsGained: number, diamondsGained: number) {
    if (!user) return;
    await addDoc(collection(db, 'raids'), {
      attacker: user.uid, defender: defenderUid, won, chillsGained, diamondsGained, timestamp: serverTimestamp(),
    });
    const today = new Date().toISOString().slice(0, 10);
    await setDoc(doc(db, 'raidCooldowns', defenderUid), { lastRaidDate: today }, { merge: true });
  }

  async function canRaid(defenderUid: string) {
    const snap = await getDoc(doc(db, 'raidCooldowns', defenderUid)).catch(() => null);
    if (!snap?.exists()) return true;
    return snap.data().lastRaidDate !== new Date().toISOString().slice(0, 10);
  }

  async function setShield(hours: number) {
    if (!user) return;
    const expiry = new Date(serverNow() + hours * 3600000);
    await updateDoc(doc(db, 'players', user.uid), { shieldExpiry: Timestamp.fromDate(expiry) }).catch(() => {});
  }

  return {
    user, loading, serverNow,
    signUp, signIn, resetPassword,
    syncPlayer,
    sendGift, loadIncomingGifts,
    contributePot,
    recordRaid, canRaid, setShield,
    db, auth,
  };
}


// ── Leaderboard state (module-level, shared) ──────────────────────
export const lbData: {
  chills:   LeaderboardEntry[];
  diamonds: LeaderboardEntry[];
  ach:      LeaderboardEntry[];
} = { chills: [], diamonds: [], ach: [] };

// ── Hook ──────────────────────────────────────────────────────────
export function useFirebase() {
  const [user,        setUser]        = useState<User | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [serverOffset,setServerOffset]= useState(0);
  // Phone auth flow state
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const serverNow = () => Date.now() + serverOffset;

  // ── Auth state listener ───────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        // Sync server time
        const ref = doc(db, '_time', 'ping');
        try {
          await setDoc(ref, { t: serverTimestamp() });
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const srv = snap.data().t?.toMillis?.() ?? Date.now();
            setServerOffset(srv - Date.now());
          }
        } catch { /* offline */ }

        // Subscribe leaderboard
        subscribeLeaderboard();
      }
    });
    return unsub;
  }, []);

  // ── Phone auth helpers ────────────────────────────────────────
  function initRecaptcha(containerId: string) {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
    }
    return recaptchaRef.current;
  }

  async function sendOTP(phone: string, containerId: string) {
    const verifier = initRecaptcha(containerId);
    const result   = await signInWithPhoneNumber(auth, phone, verifier);
    setConfirmation(result);
    return result;
  }

  async function verifyOTP(code: string) {
    if (!confirmation) throw new Error('No OTP sent yet');
    const cred = await confirmation.confirm(code);
    return cred.user;
  }

  // ── Player sync ───────────────────────────────────────────────
  async function syncPlayer(state: GameState) {
    if (!user) return;
    const data = {
      username:    state.username,
      totalChills: state.totalChills,
      diamonds:    state.diamonds,
      hqRank:      getHQRank(state),
      nftCount:    state.ownedNfts.length,
      achCount:    Object.keys(state.achievements).length,
      lastSeen:    serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'players', user.uid), data, { merge: true });
      await setDoc(doc(db, 'leaderboard', user.uid), {
        username:    data.username,
        totalChills: data.totalChills,
        diamonds:    data.diamonds,
        hqRank:      data.hqRank,
        achCount:    data.achCount,
        lastUpdated: serverTimestamp(),
      }, { merge: true });
    } catch { /* ignore */ }
  }

  // ── Leaderboard subscription ──────────────────────────────────
  function subscribeLeaderboard() {
    const lb = collection(db, 'leaderboard');
    onSnapshot(query(lb, orderBy('totalChills','desc'), limit(50)), snap => {
      lbData.chills = snap.docs.map((d,i) => ({ rank: i+1, uid: d.id, ...d.data() } as LeaderboardEntry));
    });
    onSnapshot(query(lb, orderBy('diamonds','desc'), limit(50)), snap => {
      lbData.diamonds = snap.docs.map((d,i) => ({ rank: i+1, uid: d.id, ...d.data() } as LeaderboardEntry));
    });
    onSnapshot(query(lb, orderBy('achCount','desc'), limit(50)), snap => {
      lbData.ach = snap.docs.map((d,i) => ({ rank: i+1, uid: d.id, ...d.data() } as LeaderboardEntry));
    });
  }

  // ── Gifts ─────────────────────────────────────────────────────
  async function sendGift(toUsername: string, amount: number, currency: 'chills' | 'diamonds') {
    if (!user) return { ok: false, msg: 'Not connected' };
    const q    = query(collection(db,'players'), where('username','==',toUsername), limit(1));
    const snap = await getDocs(q).catch(() => null);
    if (!snap || snap.empty) return { ok: false, msg: 'Player not found' };
    const toUid = snap.docs[0].id;
    if (toUid === user.uid) return { ok: false, msg: "Can't gift yourself!" };
    await setDoc(doc(db,'gifts', user.uid + '_' + Date.now()), {
      from: user.uid, fromName: '', toUid, toName: toUsername,
      amount, currency, timestamp: serverTimestamp(), claimed: false,
    });
    return { ok: true };
  }

  async function loadIncomingGifts() {
    if (!user) return { chills: 0, diamonds: 0, msgs: [] as string[] };
    const q    = query(collection(db,'gifts'), where('toUid','==',user.uid), where('claimed','==',false), limit(20));
    const snap = await getDocs(q).catch(() => null);
    if (!snap || snap.empty) return { chills: 0, diamonds: 0, msgs: [] as string[] };
    let totalChills = 0, totalDiamonds = 0;
    const msgs: string[] = [];
    for (const d of snap.docs) {
      const g = d.data();
      if (g.currency === 'chills')   totalChills   += g.amount;
      if (g.currency === 'diamonds') totalDiamonds += g.amount;
      msgs.push(`${g.fromName} sent you ${g.amount.toLocaleString()} ${g.currency === 'chills' ? 'Chills ❄️' : 'Diamonds 💎'}`);
      await updateDoc(doc(db,'gifts', d.id), { claimed: true });
    }
    return { chills: totalChills, diamonds: totalDiamonds, msgs };
  }

  // ── Community pot ─────────────────────────────────────────────
  async function contributePot(stakeAmount: number, username: string) {
    if (!user) return;
    const contribution = Math.floor(stakeAmount * 0.30);
    const potRef  = doc(db,'communityPot','week');
    const potSnap = await getDoc(potRef).catch(() => null);
    const now     = serverNow();
    const d       = new Date(now);
    const daysUntilSun = (7 - d.getUTCDay()) % 7 || 7;
    const weekEnd   = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + daysUntilSun));
    const weekStart = new Date(weekEnd); weekStart.setUTCDate(weekEnd.getUTCDate() - 7);
    const entryRef  = doc(db,'stakeEntries', user.uid);
    const entrySnap = await getDoc(entryRef).catch(() => null);
    let weeklyTotal = stakeAmount;
    if (entrySnap?.exists()) {
      const e = entrySnap.data();
      if ((e.weekStart?.toMillis?.() ?? 0) >= weekStart.getTime()) weeklyTotal += (e.weeklyStakeTotal ?? 0);
    }
    await setDoc(entryRef, { username, weeklyStakeTotal: weeklyTotal, weekStart: Timestamp.fromDate(weekStart), uid: user.uid }, { merge: true });
    const recentEntry = { username, amount: stakeAmount, time: now };
    const prevRecent  = potSnap?.exists() ? (potSnap.data().recentStakes ?? []) : [];
    const newRecent   = [recentEntry, ...prevRecent].slice(0, 10);
    if (!potSnap?.exists()) {
      await setDoc(potRef, { pot: contribution, totalStaked: stakeAmount, recentStakes: newRecent, weekEnd: Timestamp.fromDate(weekEnd) });
    } else {
      await updateDoc(potRef, { pot: increment(contribution), totalStaked: increment(stakeAmount), recentStakes: newRecent });
    }
  }

  // ── Raids ─────────────────────────────────────────────────────
  async function recordRaid(defenderUid: string, won: boolean, chillsGained: number, diamondsGained: number) {
    if (!user) return;
    await addDoc(collection(db,'raids'), {
      attacker: user.uid, defender: defenderUid, won, chillsGained, diamondsGained, timestamp: serverTimestamp(),
    });
    const today = new Date().toISOString().slice(0,10);
    await setDoc(doc(db,'raidCooldowns', defenderUid), { lastRaidDate: today }, { merge: true });
  }

  async function canRaid(defenderUid: string) {
    const snap = await getDoc(doc(db,'raidCooldowns', defenderUid)).catch(() => null);
    if (!snap?.exists()) return true;
    return snap.data().lastRaidDate !== new Date().toISOString().slice(0,10);
  }

  async function setShield(hours: number) {
    if (!user) return;
    const expiry = new Date(serverNow() + hours * 3600000);
    await updateDoc(doc(db,'players', user.uid), { shieldExpiry: Timestamp.fromDate(expiry) }).catch(() => {});
  }

  return {
    user, loading, serverNow,
    sendOTP, verifyOTP,
    syncPlayer,
    sendGift, loadIncomingGifts,
    contributePot,
    recordRaid, canRaid, setShield,
    db, auth,
  };
}
