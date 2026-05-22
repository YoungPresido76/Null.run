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
const todayStr = () => new Date().toISOString().slice(0,10);

function GiftsTab() {
  const { state, dispatch } = useGame();
  const { sendGift, loadIncomingGifts } = useFirebase();
  const toast = useToast();
  const [toName,   setToName]   = useState('');
  const [amount,   setAmount]   = useState('');
  const [currency, setCurrency] = useState<'chills'|'diamonds'>('chills');
  const [loading,  setLoading]  = useState(false);

  const isToday   = state.lastGiftDate === todayStr();
  const giftsSent = isToday ? state.giftsSentToday : 0;
  const canGift   = giftsSent < DAILY_GIFT_LIMIT;

  async function handleSend() {
    const n = parseFloat(amount);
    if (!toName.trim()) { toast.warning('Missing target', 'Enter a username.'); return; }
    if (!n || n <= 0)   { toast.warning('Invalid amount'); return; }
    if (currency === 'chills'   && state.chills   < n) { toast.error('Not enough Chills');   return; }
    if (currency === 'diamonds' && state.diamonds  < n) { toast.error('Not enough Diamonds'); return; }
    if (!canGift) { toast.warning('Daily limit reached', `Max ${DAILY_GIFT_LIMIT} gifts per day.`); return; }
    setLoading(true);
    const res = await sendGift(toName.trim(), n, currency);
    if (res?.ok) {
      if (currency === 'chills')   dispatch({ type: 'SPEND_CHILLS',   amount: n });
      if (currency === 'diamonds') dispatch({ type: 'SPEND_DIAMONDS', amount: n });
      dispatch({ type: 'UNLOCK_ACH', id: 'sent_gift' });
      toast.gift('Gift sent!', `Sent ${fmt(n)} ${currency} to ${toName}`);
      setToName(''); setAmount('');
    } else { toast.error('Gift failed', res?.msg); }
    setLoading(false);
  }

  async function handleCollect() {
    setLoading(true);
    const res = await loadIncomingGifts();
    if (res.chills > 0)   dispatch({ type: 'ADD_CHILLS',   amount: res.chills });
    if (res.diamonds > 0) dispatch({ type: 'ADD_DIAMONDS', amount: res.diamonds });
    if (res.msgs.length === 0) toast.info('No pending gifts');
    else res.msgs.forEach(m => toast.gift('Gift received!', m));
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="void-card-glass p-4" style={{ borderColor: 'rgba(0,255,136,0.2)' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="void-card-title text-sm flex items-center gap-2" style={{ color: 'var(--nv-green)' }}>
              <GameIcon name={SOCIAL_ICONS.collect} size={15} /> COLLECT GIFTS
            </p>
            <p className="void-card-subtitle">Check for incoming rewards</p>
          </div>
          <button onClick={handleCollect} disabled={loading}
            className="void-btn void-btn-sm void-btn-success disabled:opacity-40">
            {loading ? '...' : 'COLLECT'}
          </button>
        </div>
      </div>

      <div className="void-card-glass p-4" style={{ borderColor: 'rgba(255,0,170,0.2)' }}>
        <p className="void-card-title text-sm flex items-center gap-2 mb-1" style={{ color: 'var(--nv-magenta)' }}>
          <GameIcon name={SOCIAL_ICONS.send} size={15} /> SEND GIFT
        </p>
        <p className="void-stat-label mb-3">
          {canGift ? `${DAILY_GIFT_LIMIT - giftsSent} GIFTS REMAINING TODAY` : 'DAILY LIMIT REACHED'}
        </p>
        <div className="space-y-2">
          <input type="text" placeholder="Recipient username" value={toName}
            onChange={e => setToName(e.target.value)} className="void-input" />
          <div className="flex gap-2">
            <input type="number" placeholder="Amount" value={amount}
              onChange={e => setAmount(e.target.value)} className="void-input flex-1" />
            <div className="flex gap-1">
              {(['chills','diamonds'] as const).map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  className={cn('void-btn void-btn-md', currency === c ? (c === 'chills' ? 'void-btn-glow' : 'void-btn-accent') : 'void-btn-ghost')}>
                  <GameIcon name={c === 'chills' ? 'game-icons:ice-cube' : 'game-icons:diamond'} size={14} />
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSend} disabled={!canGift || loading}
            className={cn('void-btn void-btn-md void-btn-full gap-2', canGift ? 'void-btn-accent' : 'void-btn-ghost opacity-30')}>
            <GameIcon name={SOCIAL_ICONS.gift} size={14} />
            {loading ? 'SENDING...' : 'SEND GIFT'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FriendsTab() {
  const { state } = useGame();
  const toast = useToast();
  const [search,   setSearch]   = useState('');
  const [friends,  setFriends]  = useState<{ uid: string; username: string }[]>([]);
  const [requests, setRequests] = useState<{ fromUid: string; fromName: string }[]>([]);
  const [loading,  setLoading]  = useState(false);
  const myUid = auth.currentUser?.uid ?? '';

  useEffect(() => { loadFriends(); loadRequests(); }, []);

  async function loadFriends() {
    if (!myUid) return;
    const snap = await getDocs(collection(db,'friends',myUid,'list')).catch(() => null);
    if (snap) setFriends(snap.docs.map(d => ({ uid: d.id, username: d.data().username })));
  }

  async function loadRequests() {
    if (!myUid) return;
    const snap = await getDocs(query(collection(db,'friendRequests'), where('to','==',myUid), where('status','==','pending'))).catch(() => null);
    if (snap) setRequests(snap.docs.map(d => ({ fromUid: d.data().from, fromName: d.data().fromName })));
  }

  async function sendRequest() {
    if (!search.trim() || !myUid) return;
    setLoading(true);
    const snap = await getDocs(query(collection(db,'players'), where('username','==',search.trim()), limit(1))).catch(() => null);
    if (!snap?.docs.length) { toast.error('Player not found'); setLoading(false); return; }
    const toUid = snap.docs[0].id;
    if (toUid === myUid) { toast.warning("Can't add yourself"); setLoading(false); return; }
    await setDoc(doc(db,'friendRequests',`${myUid}_${toUid}`), {
      from: myUid, fromName: state.username, to: toUid, toName: search.trim(),
      status: 'pending', timestamp: serverTimestamp(),
    }).catch(() => {});
    toast.success('Request sent!', `Friend request sent to ${search.trim()}`);
    setSearch(''); setLoading(false);
  }

  async function acceptRequest(fromUid: string, fromName: string) {
    if (!myUid) return;
    await updateDoc(doc(db,'friendRequests',`${fromUid}_${myUid}`), { status: 'accepted' }).catch(() => {});
    await setDoc(doc(db,'friends',myUid,'list',fromUid), { username: fromName, since: serverTimestamp() });
    await setDoc(doc(db,'friends',fromUid,'list',myUid), { username: state.username, since: serverTimestamp() });
    toast.success('Friend added!', `${fromName} is now your friend`);
    loadFriends(); loadRequests();
  }

  async function declineRequest(fromUid: string) {
    if (!myUid) return;
    await updateDoc(doc(db,'friendRequests',`${fromUid}_${myUid}`), { status: 'declined' }).catch(() => {});
    loadRequests();
  }

  return (
    <div className="space-y-3">
      {requests.length > 0 && (
        <div className="void-card-glass p-4" style={{ borderColor: 'rgba(251,191,36,0.25)' }}>
          <p className="void-card-title text-sm flex items-center gap-2 mb-3" style={{ color: '#fbbf24' }}>
            <GameIcon name="lucide:bell" size={14} /> PENDING ({requests.length})
          </p>
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.fromUid} className="flex items-center justify-between">
                <span className="font-game text-sm" style={{ color: 'var(--void-text-primary)' }}>{r.fromName}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => acceptRequest(r.fromUid, r.fromName)}
                    className="void-btn void-btn-xs void-btn-success gap-1">
                    <GameIcon name={SOCIAL_ICONS.accept} size={10} /> ACCEPT
                  </button>
                  <button onClick={() => declineRequest(r.fromUid)}
                    className="void-btn void-btn-xs void-btn-danger gap-1">
                    <GameIcon name={SOCIAL_ICONS.decline} size={10} /> DECLINE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="void-card-glass p-4">
        <p className="void-card-title text-sm flex items-center gap-2 mb-3">
          <GameIcon name={SOCIAL_ICONS.add} size={14} /> ADD FRIEND
        </p>
        <div className="flex gap-2">
          <input type="text" placeholder="Search by username" value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendRequest()}
            className="void-input flex-1" />
          <button onClick={sendRequest} disabled={loading}
            className="void-btn void-btn-md void-btn-glow disabled:opacity-40">ADD</button>
        </div>
      </div>

      <div>
        <p className="void-stat-label mb-2">FRIENDS ({friends.length})</p>
        {friends.length === 0 ? (
          <div className="void-card p-4 text-center">
            <p className="font-game text-xs" style={{ color: 'var(--void-text-muted)' }}>No friends yet · add someone above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map(f => (
              <div key={f.uid} className="void-card flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold"
                  style={{ background: 'rgba(0,243,255,0.15)', border: '1px solid rgba(0,243,255,0.25)', color: 'var(--nv-cyan)' }}>
                  {f.username[0]?.toUpperCase()}
                </div>
                <span className="font-game text-sm flex-1" style={{ color: 'var(--void-text-primary)' }}>{f.username}</span>
                <GameIcon name={SOCIAL_ICONS.friends} size={14} style={{ color: 'var(--void-text-muted)' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RaidsTab() {
  const { state, dispatch } = useGame();
  const { recordRaid, canRaid, setShield } = useFirebase();
  const toast = useToast();
  const [target,  setTarget]  = useState('');
  const [loading, setLoading] = useState(false);

  const shieldActive   = state.shieldExpiry > Date.now();
  const shieldTimeLeft = Math.max(0, state.shieldExpiry - Date.now());
  const shieldCost     = 10;

  async function doRaid() {
    if (!target.trim()) { toast.warning('Missing target', 'Enter a username.'); return; }
    setLoading(true);
    const snap = await getDocs(query(collection(db,'players'), where('username','==',target.trim()), limit(1))).catch(() => null);
    if (!snap?.docs.length) { toast.error('Player not found'); setLoading(false); return; }
    const defDoc = snap.docs[0];
    const defUid = defDoc.id;
    if (defUid === auth.currentUser?.uid) { toast.warning("Can't raid yourself"); setLoading(false); return; }
    const ok = await canRaid(defUid);
    if (!ok) { toast.warning('On cooldown', `${target} was raided recently.`); setLoading(false); return; }
    const defShield = defDoc.data().shieldExpiry?.toMillis?.() ?? 0;
    if (defShield > Date.now()) { toast.warning('Target shielded', `${target} has an active shield.`); setLoading(false); return; }
    const won = Math.random() > 0.5;
    const chillsGained   = won ? Math.floor(state.chills * 0.05) : 0;
    const diamondsGained = won && Math.random() > 0.7 ? 1 : 0;
    if (won) {
      dispatch({ type: 'ADD_CHILLS',   amount: chillsGained });
      dispatch({ type: 'ADD_DIAMONDS', amount: diamondsGained });
      dispatch({ type: 'UNLOCK_ACH',   id: 'first_raid' });
      toast.raid('Raid successful!', `Stole ${fmt(chillsGained)} Chills${diamondsGained ? ` + ${diamondsGained} 💎` : ''}`);
    } else {
      toast.warning('Raid failed', `${target} defended successfully.`);
    }
    await recordRaid(defUid, won, chillsGained, diamondsGained);
    setTarget(''); setLoading(false);
  }

  async function buyShield() {
    if (state.diamonds < shieldCost) { toast.error('Not enough Diamonds', `Need ${shieldCost} 💎`); return; }
    dispatch({ type: 'SPEND_DIAMONDS', amount: shieldCost });
    const expiry = Date.now() + 8 * 3600000;
    dispatch({ type: 'SET_SHIELD', expiry });
    await setShield(8);
    toast.success('Shield active!', 'Protected for 8 hours');
  }

  return (
    <div className="space-y-3">
      <div className={cn('void-card-glass p-4 flex items-center justify-between',
        shieldActive && 'prism-corner')}
        style={{ borderColor: shieldActive ? 'rgba(0,243,255,0.35)' : 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <GameIcon name={shieldActive ? SOCIAL_ICONS.shieldOn : SOCIAL_ICONS.shield} size={26}
            style={{ color: shieldActive ? 'var(--nv-cyan)' : 'var(--void-text-muted)' }} />
          <div>
            <p className="void-card-title text-sm" style={{ color: shieldActive ? 'var(--nv-cyan)' : 'var(--void-text-primary)' }}>
              {shieldActive ? 'SHIELD ACTIVE' : 'NO SHIELD'}
            </p>
            <p className="void-card-subtitle">
              {shieldActive ? `Expires in ${Math.floor(shieldTimeLeft / 3600000)}h` : 'You can be raided'}
            </p>
          </div>
        </div>
        {!shieldActive && (
          <button onClick={buyShield} className="void-btn void-btn-sm void-btn-glow">
            8h · {shieldCost}💎
          </button>
        )}
      </div>

      <div className="void-card-glass p-4" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <p className="void-card-title text-sm flex items-center gap-2 mb-1" style={{ color: 'var(--void-error-400)' }}>
          <GameIcon name={SOCIAL_ICONS.raid} size={14} /> LAUNCH RAID
        </p>
        <p className="void-stat-label mb-3">50% SUCCESS RATE · STEAL UP TO 5% CHILLS</p>
        <div className="flex gap-2">
          <input type="text" placeholder="Target username" value={target}
            onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doRaid()}
            className="void-input flex-1" />
          <button onClick={doRaid} disabled={loading}
            className="void-btn void-btn-md void-btn-danger gap-1.5 disabled:opacity-40">
            <GameIcon name={SOCIAL_ICONS.raid} size={13} />
            {loading ? '...' : 'RAID'}
          </button>
        </div>
      </div>

      <div className="void-card p-4">
        <p className="void-stat-label mb-2">RAID RULES</p>
        {['Each player can only be raided once per day','Shielded players cannot be raided','Win: steal up to 5% of target\'s Chills','8-hour shield costs 10 Diamonds'].map((line, i) => (
          <p key={i} className="font-game text-xs py-0.5" style={{ color: 'var(--void-text-secondary)' }}>▸ {line}</p>
        ))}
      </div>
    </div>
  );
}

export default function Social() {
  const [tab, setTab] = useState<SocialTab>('gifts');
  const TABS: { id: SocialTab; label: string; icon: string }[] = [
    { id: 'gifts',   label: 'GIFTS',   icon: SOCIAL_ICONS.gift    },
    { id: 'friends', label: 'FRIENDS', icon: SOCIAL_ICONS.friends },
    { id: 'raids',   label: 'RAIDS',   icon: SOCIAL_ICONS.raid    },
  ];

  return (
    <div className="pb-6">
      <div className="px-4 pt-5 pb-4">
        <h2 className="font-display text-2xl font-black neon-magenta tracking-widest mb-1">SOCIAL</h2>
        <p className="font-game text-xs" style={{ color: 'var(--void-text-muted)', letterSpacing: '0.1em' }}>CONNECT · GIFT · RAID</p>
      </div>
      <div className="flex gap-2 px-4 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('void-btn void-btn-sm flex-1 gap-1.5',
              tab === t.id ? 'void-btn-accent' : 'void-btn-ghost')}>
            <GameIcon name={t.icon} size={13} />{t.label}
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
