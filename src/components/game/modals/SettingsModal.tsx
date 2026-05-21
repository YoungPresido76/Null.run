import { useGame }     from '@/context/GameContext';
import { useFirebase } from '@/hooks/useFirebase';
import { getAuth, signOut } from 'firebase/auth';
import { cn }          from '@/lib/utils';
import { saveGame, wipeSave } from '@/hooks/useSaveLoad';
import { GAME_TITLE, STUDIO_NAME } from '@/lib/constants';

interface Props { open: boolean; onClose: () => void; }

export default function SettingsModal({ open, onClose }: Props) {
  const { state, dispatch } = useGame();
  const { user }            = useFirebase();

  if (!open) return null;

  function toggle(key: keyof typeof state.settings) {
    dispatch({ type: 'SET_SETTING', key, value: !state.settings[key] });
  }

  async function handleSignOut() {
    saveGame(state);
    await signOut(getAuth());
  }

  function handleWipe() {
    if (!confirm('Wipe ALL save data? This cannot be undone.')) return;
    wipeSave();
    window.location.reload();
  }

  const Row = ({
    label, desc, settingKey,
  }: {
    label: string; desc: string; settingKey: keyof typeof state.settings;
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex-1 pr-4">
        <p className="font-orbitron text-xs font-bold text-white/90">{label}</p>
        <p className="font-mono text-[10px] text-white/30 mt-0.5">{desc}</p>
      </div>
      <button onClick={() => toggle(settingKey)}
        className={cn(
          'relative w-12 h-6 rounded-full border transition-all duration-200 shrink-0',
          state.settings[settingKey]
            ? 'bg-neon-cyan/30 border-neon-cyan/60'
            : 'bg-white/5 border-white/15',
        )}>
        <div className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 shadow-md',
          state.settings[settingKey]
            ? 'left-6 bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.6)]'
            : 'left-0.5 bg-white/30',
        )} />
      </button>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{
          background: 'rgba(4,13,30,0.98)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(0,243,255,0.15)',
          borderBottom: 'none',
          boxShadow: '0 -8px 60px rgba(0,0,0,0.8)',
          maxHeight: '88dvh',
          overflowY: 'auto',
        }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between py-4 border-b border-white/5 mb-2">
            <div>
              <h2 className="font-orbitron text-xl font-black neon-cyan">SETTINGS</h2>
              <p className="font-mono text-[10px] text-white/25 tracking-widest mt-0.5">
                {GAME_TITLE} · {STUDIO_NAME}
              </p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all font-mono">
              ✕
            </button>
          </div>

          {/* Account */}
          <div className="glass rounded-2xl p-4 border border-white/5 mb-4">
            <p className="font-mono text-[9px] text-white/25 tracking-widest mb-3">ACCOUNT</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full glass border border-neon-cyan/30 flex items-center justify-center font-orbitron font-black text-neon-cyan">
                {state.username[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-orbitron text-sm text-white/90 font-bold">{state.username}</p>
                <p className="font-mono text-[10px] text-white/30">{user?.email ?? 'No email'}</p>
              </div>
            </div>

            {/* Username change */}
            <div className="flex gap-2 mb-1">
              <input
                type="text"
                defaultValue={state.username}
                maxLength={16}
                id="settings-username"
                className="flex-1 h-10 px-3 rounded-xl bg-void-surface border border-white/10 font-mono text-sm text-white outline-none focus:border-neon-cyan/50"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('settings-username') as HTMLInputElement;
                  const val = input?.value?.trim();
                  if (val && val.length >= 2) {
                    dispatch({ type: 'SET_USERNAME', name: val });
                  }
                }}
                className="px-4 h-10 rounded-xl font-orbitron text-[11px] font-bold border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/20 transition-all active:scale-95">
                SAVE
              </button>
            </div>
            <p className="font-mono text-[9px] text-white/20">2–16 characters</p>
          </div>

          {/* Game settings */}
          <div className="glass rounded-2xl p-4 border border-white/5 mb-4">
            <p className="font-mono text-[9px] text-white/25 tracking-widest mb-1">GAMEPLAY</p>
            <Row label="BACKGROUND MUSIC"    desc="Toggle ambient soundtrack"       settingKey="music"           />
            <Row label="PARTICLES"           desc="Click burst visual effects"      settingKey="particles"       />
            <Row label="OFFLINE PROGRESS"    desc="Earn 50% CPS while away (8h max)" settingKey="offlineProgress" />
          </div>

          {/* Danger zone */}
          <div className="glass rounded-2xl p-4 border border-red-500/15 mb-4">
            <p className="font-mono text-[9px] text-white/25 tracking-widest mb-3">DANGER ZONE</p>
            <button onClick={handleWipe}
              className="w-full py-3 rounded-xl font-orbitron text-xs font-bold border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/15 transition-all active:scale-98">
              WIPE SAVE DATA
            </button>
          </div>

          {/* Sign out */}
          <button onClick={handleSignOut}
            className="w-full py-4 rounded-2xl font-orbitron text-sm font-bold border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-all active:scale-98">
            SIGN OUT
          </button>

          <p className="text-center font-mono text-[9px] text-white/15 mt-5 tracking-wider">
            NULL.RUN © 2026 · {GAME_TITLE} v0.1
          </p>
        </div>
      </div>
    </>
  );
}
