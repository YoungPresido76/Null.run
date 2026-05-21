import { useState, useEffect } from 'react';
import { useGame }     from '@/context/GameContext';
import { useFirebase } from '@/hooks/useFirebase';
import { useToast }    from '@/context/ToastContext';
import { fmt, cn }     from '@/lib/utils';
import { GameIcon, SOCIAL_ICONS } from '@/lib/icons';
import {
  getFirestore, collection, getDocs, query, where, limit,
  doc, setDoc, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

type SocialTab = 'gifts' | 'friends' | 'raids';

const DAILY_GIFT_LIMIT = 3;
const db   = getFirestore();
const auth = getAuth();

// ── Helpers ───────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0, 10); }

// ── Gifts ─────────────────────────────────────────────────────────
function GiftsTab() {
  const { state, dispatch } = useGame();
  const { sendGift, loadIncomingGifts } = useFirebase();
  const toast = useToast();

  const [toName,   setToName]   = useState('');
  const [amount,   setAmount]   = useState('');
  const [currency, setCurrency] = useState<'chills' | 'diamonds'>('chills');
  const [loading,  setLoading]  = useState(false);
  const [inbox,    setInbox]    = useState<string[]>([]);

  const isToday = state.lastGiftDate === todayStr();
  const giftsSent = isToday ? state.giftsSentToday : 0;
  const canGift   = giftsSent < DAILY_GIFT_LIMIT;

  async function handleSend() {
    if (!toName.trim()) return toast.warning('Missing field', 'Enter a username.');
    const n = parseFloat(amount);
    if (!n || n <= 0) return toast.warning('Invalid amount', 'Enter a valid amount.');
    if (currency === 'chills'   && state.chills   < n) return toast.error('Not enough Chills');
    if (currency === 'diamonds' && state.diamonds  < n) return toast.error('Not enough Diamonds');
    if (!canGift) return toast.warning('Daily limit reached', `Max ${DAILY_GIFT_LIMIT} gifts per day.`);

    setLoading(true);
    const res = await sendGift(toName.trim(), n, currency);
    if (res?.ok) {
      if (currency === 'chills')   dispatch({ type: 'SPEND_CHILLS',   amount: n });
      if (currency === 'diamonds') dispatch({ type: 'SPEND_DIAMONDS', amount: n });
      dispatch({ type: 'UNLOCK_ACH', id: 'sent_gift' });
      toast.gift('Gift sent!', `Sent ${fmt(n)} ${currency} to ${toName}`);
      setToName(''); setAmount('');
    } else {
      toast.error('Gift failed', res?.msg ?? 'Could not send gift.');
    }
    setLoading(false);
  }

  async function handleCollect() {
    setLoading(true);
    const res = await loadIncomingGifts();
    if (res.chills > 0)   dispatch({ type: 'ADD_CHILLS',   amount: res.chills });
    if (res.diamonds > 0) dispatch({ type: 'ADD_DIAMONDS', amount: res.diamonds });
    setInbox(res.msgs ?? []);
    if (res.msgs.length === 0) {
      toast.info('No pending gifts', 'Nothing waiting for you right now.');
    } else {
      res.msgs.forEach(m => toast.gift('Gift received!', m));
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Collect incoming */}
      <div className="glass rounded-xl p-4 border border-neon-green/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-orbitron text-sm text-neon-green font-bold flex items-center gap-2">
              <GameIcon name={SOCIAL_ICONS.collect} size={16} /> COLLECT GIFTS
            </p>
            <p className="font-mono text-[10px] text-white/30">Check for incoming rewards</p>
          </div>
          <button onClick={handleCollect} disabled={loading}
            className="px-4 py-2 rounded-xl font-orbitron text-[11px] font-bold border border-neon-green/40 text-neon-green bg-neon-green/10 hover:bg-neon-green/20 transition-all active:scale-95 disabled:opacity-40">
            {loading ? '...' : 'COLLECT'}
          </button>
        </div>
        {inbox.map((msg, i) => (
          <p key={i} className="font-mono text-[10px] text-neon-green/80 border-t border-white/5 pt-2">{msg}</p>
        ))}
      </div>

      {/* Send gift */}
      <div className="glass rounded-xl p-4 border border-neon-magenta/20">
        <p className="font-orbitron text-sm neon-magenta font-bold mb-1 flex items-center gap-2">
          <GameIcon name={SOCIAL_ICONS.send} size={15} /> SEND GIFT
        </p>
        <p className="font-mono text-[10px] text-white/30 mb-3">
          {canGift ? `${DAILY_GIFT_LIMIT - giftsSent} gifts remaining today` : 'Daily limit reached'}
        </p>
        <div className="space-y-2">
          <input type="text" placeholder="Recipient username" value={toName}
            onChange={e => setToName(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-void-surface border border-white/10 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-neon-magenta/40" />
          <div className="flex gap-2">
            <input type="number" placeholder="Amount" value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl bg-void-surface border border-white/10 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-neon-magenta/40" />
            <div className="flex gap-1">
              {(['chills', 'diamonds'] as const).map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  className={cn(
                    'px-3 h-11 rounded-xl font-orbitron text-[10px] font-bold border transition-all',
                    currency === c
                      ? c === 'chills' ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-neon-magenta/50 text-neon-magenta bg-neon-magenta/10'
                      : 'border-white/10 text-white/30',
                  )}>
                  <GameIcon name={c === 'chills' ? 'game-icons:ice-cube' : 'game-icons:diamond'} size={14} />
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSend} disabled={!canGift || loading}
            className={cn(
              'w-full py-3 rounded-xl font-orbitron text-xs font-bold border tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2',
              canGift
                ? 'border-neon-magenta/50 text-neon-magenta bg-neon-magenta/10 hover:bg-neon-magenta/20'
                : 'border-white/10 text-white/20 cursor-not-allowed',
            )}>
            <GameIcon name={SOCIAL_ICONS.gift} size={14} />
            {loading ? 'SENDING...' : 'SEND GIFT'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Friends ───────────────────────────────────────────────────────
function FriendsTab() {
  const { state } = useGame();
  const toast = useToast();
  const [search,    setSearch]    = useState('');
  const [friends,   setFriends]   = useState<{ uid: string; username: string }[]>([]);
  const [requests,  setRequests]  = useState<{ fromUid: string; fromName: string }[]>([]);
  const [loading,   setLoading]   = useState(false);
  const myUid = auth.currentUser?.uid ?? '';

  useEffect(() => { loadFriends(); loadRequests(); }, []);

  async function loadFriends() {
    if (!myUid) return;
    const snap = await getDocs(collection(db, 'friends', myUid, 'list')).catch(() => null);
    if (!snap) return;
    setFriends(snap.docs.map(d => ({ uid: d.id, username: d.data().username })));
  }

  async function loadRequests() {
    if (!myUid) return;
    const q    = query(collection(db, 'friendRequests'), where('to', '==', myUid), where('status', '==', 'pending'));
    const snap = await getDocs(q).catch(() => null);
    if (!snap) return;
    setRequests(snap.docs.map(d => ({ fromUid: d.data().from, fromName: d.data().fromName })));
  }

  async function sendRequest() {
    if (!search.trim() || !myUid) return;
    setLoading(true);
    const q    = query(collection(db, 'players'), where('username', '==', search.trim()), limit(1));
    const snap = await getDocs(q).catch(() => null);
    if (!snap || snap.empty) { toast.error('Player not found'); setLoading(false); return; }
    const toUid = snap.docs[0].id;
    if (toUid === myUid) { toast.warning("Can't add yourself"); setLoading(false); return; }
    const reqId = `${myUid}_${toUid}`;
    await setDoc(doc(db, 'friendRequests', reqId), {
      from: myUid, fromName: state.username, to: toUid, toName: search.trim(),
      status: 'pending', timestamp: serverTimestamp(),
    }).catch(() => {});
    toast.success('Request sent!', `Friend request sent to ${search.trim()}`);
    setSearch('');
    setLoading(false);
  }

  async function acceptRequest(fromUid: string, fromName: string) {
    if (!myUid) return;
    const reqId = `${fromUid}_${myUid}`;
    await updateDoc(doc(db, 'friendRequests', reqId), { status: 'accepted' }).catch(() => {});
    await setDoc(doc(db, 'friends', myUid, 'list', fromUid), { username: fromName, since: serverTimestamp() });
    await setDoc(doc(db, 'friends', fromUid, 'list', myUid), { username: state.username, since: serverTimestamp() });
    toast.success('Friend added!', `${fromName} is now your friend`);
    loadFriends(); loadRequests();
  }

  async function declineRequest(fromUid: string) {
    if (!myUid) return;
    await updateDoc(doc(db, 'friendRequests', `${fromUid}_${myUid}`), { status: 'declined' }).catch(() => {});
    loadRequests();
  }

  return (
    <div className="space-y-4">
      {requests.length > 0 && (
        <div className="glass rounded-xl p-4 border border-yellow-400/20">
          <p className="font-orbitron text-[11px] text-yellow-400 font-bold mb-3 flex items-center gap-2">
            <GameIcon name="lucide:bell" size={13} /> PENDING REQUESTS ({requests.length})
          </p>
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.fromUid} className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-white/70">{r.fromName}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => acceptRequest(r.fromUid, r.fromName)}
                    className="px-3 py-1.5 rounded-lg font-orbitron text-[10px] border border-neon-green/40 text-neon-green bg-neon-green/10 hover:bg-neon-green/20 transition-all flex items-center gap-1">
                    <GameIcon name={SOCIAL_ICONS.accept} size={11} /> ACCEPT
                  </button>
                  <button onClick={() => declineRequest(r.fromUid)}
                    className="px-3 py-1.5 rounded-lg font-orbitron text-[10px] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1">
                    <GameIcon name={SOCIAL_ICONS.decline} size={11} /> DECLINE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-xl p-4 border border-neon-cyan/15">
        <p className="font-orbitron text-sm neon-cyan font-bold mb-3 flex items-center gap-2">
          <GameIcon name={SOCIAL_ICONS.add} size={15} /> ADD FRIEND
        </p>
        <div className="flex gap-2">
          <input type="text" placeholder="Search by username" value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendRequest()}
            className="flex-1 h-11 px-4 rounded-xl bg-void-surface border border-white/10 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-neon-cyan/40" />
          <button onClick={sendRequest} disabled={loading}
            className="px-4 h-11 rounded-xl font-orbitron text-xs font-bold border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 transition-all active:scale-95 disabled:opacity-40">
            ADD
          </button>
        </div>
      </div>

      <div>
        <p className="font-mono text-[9px] text-white/25 tracking-widest mb-2">FRIENDS ({friends.length})</p>
        {friends.length === 0 ? (
          <div className="glass rounded-xl p-5 border border-white/5 text-center">
            <p className="font-mono text-[10px] text-white/20">No friends yet · add someone above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map(f => (
              <div key={f.uid} className="glass rounded-xl px-4 py-3 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center font-orbitron text-xs font-bold text-neon-cyan">
                  {f.username[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="font-orbitron text-xs text-white/80 flex-1">{f.username}</span>
                <GameIcon name={SOCIAL_ICONS.friends} size={14} className="text-white/20" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Raids ─────────────────────────────────────────────────────────
function RaidsTab() {
  const { state, dispatch } = useGame();
  const { recordRaid, canRaid, setShield } = useFirebase();
  const toast = useToast();

  const [target,   setTarget]   = useState('');
  const [loading,  setLoading]  = useState(false);

  const shieldActive  = state.shieldExpiry > Date.now();
  const shieldTimeLeft= Math.max(0, state.shieldExpiry - Date.now());
  const shieldCost    = 10; // diamonds

  async function doRaid() {
    if (!target.trim()) return toast.warning('Missing target', 'Enter a target username.');
    setLoading(true);
    // Find target player
    const q    = query(collection(db, 'players'), where('username', '==', target.trim()), limit(1));
    const snap = await getDocs(q).catch(() => null);
    if (!snap || snap.empty) { toast.error('Player not found'); setLoading(false); return; }

    const defDoc = snap.docs[0];
    const defUid = defDoc.id;
    if (defUid === auth.currentUser?.uid) { toast.warning("Can't raid yourself"); setLoading(false); return; }

    // Check cooldown
    const ok = await canRaid(defUid);
    if (!ok) { toast.warning('On cooldown', `${target} was raided recently.`); setLoading(false); return; }

    // Check defender shield
    const defData = defDoc.data();
    const defShieldExpiry = defData.shieldExpiry?.toMillis?.() ?? 0;
    if (defShieldExpiry > Date.now()) { toast.warning('Target shielded', `${target} has an active shield.`); setLoading(false); return; }

    // Run raid (50% win chance)
    const won = Math.random() > 0.5;
    const chillsGained   = won ? Math.floor(state.chills * 0.05) : 0;
    const diamondsGained = won && Math.random() > 0.7 ? 1 : 0;

    if (won) {
      dispatch({ type: 'ADD_CHILLS',   amount: chillsGained });
      dispatch({ type: 'ADD_DIAMONDS', amount: diamondsGained });
      dispatch({ type: 'UNLOCK_ACH',   id: 'first_raid' });
    }

    await recordRaid(defUid, won, chillsGained, diamondsGained);

    if (won) {
      toast.raid('Raid successful!', `Stole ${fmt(chillsGained)} Chills${diamondsGained ? ` + ${diamondsGained} Diamonds` : ''}`);
    } else {
      toast.warning('Raid failed', `${target} defended successfully.`);
    }
    setTarget('');
    setLoading(false);
  }

  async function buyShield() {
    if (state.diamonds < shieldCost) return toast.error('Not enough Diamonds', 'Need 10 Diamonds for a shield.');
    dispatch({ type: 'SPEND_DIAMONDS', amount: shieldCost });
    const expiry = Date.now() + 8 * 3600000; // 8-hour shield
    dispatch({ type: 'SET_SHIELD', expiry });
    await setShield(8);
    toast.success('Shield active!', 'Protected for 8 hours');
  }

  return (
    <div className="space-y-4">
      {/* Shield status */}
      <div className={cn(
        'glass rounded-xl p-4 border',
        shieldActive ? 'border-neon-cyan/40 bg-neon-cyan/5' : 'border-white/10',
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GameIcon name={SOCIAL_ICONS.shieldOn} size={24} className="text-neon-cyan" />
            <div>
              <p className={cn('font-orbitron text-xs font-bold', shieldActive ? 'neon-cyan' : 'text-white/40')}>
                {shieldActive ? 'SHIELD ACTIVE' : 'NO SHIELD'}
              </p>
              <p className="font-mono text-[10px] text-white/30">
                {shieldActive ? `Expires in ${Math.floor(shieldTimeLeft / 3600000)}h` : 'You can be raided'}
              </p>
            </div>
          </div>
          {!shieldActive && (
            <button onClick={buyShield}
              className="px-4 py-2 rounded-xl font-orbitron text-[10px] font-bold border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 transition-all active:scale-95">
              BUY 8h · {shieldCost}💎
            </button>
          )}
        </div>
      </div>

      {/* Raid panel */}
      <div className="glass rounded-xl p-4 border border-red-500/20">
        <p className="font-orbitron text-sm text-red-400 font-bold mb-1">LAUNCH RAID</p>
        <p className="font-mono text-[10px] text-white/30 mb-3">
          50% success rate · Steal up to 5% of target's Chills
        </p>
        <div className="flex gap-2">
          <input type="text" placeholder="Target username" value={target}
            onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doRaid()}
            className="flex-1 h-11 px-4 rounded-xl bg-void-surface border border-white/10 font-mono text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/40" />
          <button onClick={doRaid} disabled={loading}
            className="px-5 h-11 rounded-xl font-orbitron text-xs font-bold border border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-40">
            RAID
          </button>
        </div>
        
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-4 border border-white/5">
        <p className="font-mono text-[9px] text-white/25 tracking-widest mb-2">RAID RULES</p>
        {[
          'Each player can only be raided once per day',
          'Shielded players cannot be raided',
          'Win: steal up to 5% of target\'s Chills',
          'Rare chance to steal 1 Diamond on win',
          '8-hour shield costs 10 Diamonds',
        ].map((line, i) => (
          <p key={i} className="font-mono text-[10px] text-white/35 py-0.5">▸ {line}</p>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function Social() {
  const [tab, setTab] = useState<SocialTab>('gifts');

  const TABS: { id: SocialTab; label: string; icon: string }[] = [
    { id: 'gifts',   label: 'GIFTS',   icon: SOCIAL_ICONS.gift    },
    { id: 'friends', label: 'FRIENDS', icon: SOCIAL_ICONS.friends },
    { id: 'raids',   label: 'RAIDS',   icon: SOCIAL_ICONS.raid    },
  ];

  return (
    <div className="pb-4">
      <div className="px-4 pt-5 pb-3 text-center">
        <h2 className="font-orbitron text-2xl font-black neon-magenta tracking-widest mb-1">SOCIAL</h2>
        <p className="font-mono text-[10px] text-white/30">Connect · Gift · Raid</p>
      </div>

      <div className="flex gap-2 px-4 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-orbitron text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5',
              tab === t.id
                ? 'border-neon-magenta/50 text-neon-magenta bg-neon-magenta/10'
                : 'border-white/10 text-white/30',
            )}>
            <GameIcon name={t.icon} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {tab === 'gifts'   && <GiftsTab />}
        {tab === 'friends' && <FriendsTab />}
        {tab === 'raids'   && <RaidsTab />}
      </div>
    </div>
  );
}
