import { useGame }     from '@/context/GameContext';
import { useFirebase } from '@/hooks/useFirebase';
import { useToast }    from '@/context/ToastContext';
import { getAuth, signOut } from 'firebase/auth';
import { saveGame, wipeSave } from '@/hooks/useSaveLoad';
import { GAME_TITLE, STUDIO_NAME } from '@/lib/constants';
import { GameIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

interface Props { open: boolean; onClose: () => void; }

export default function SettingsModal({ open, onClose }: Props) {
  const { state, dispatch } = useGame();
  const { user }            = useFirebase();
  const toast               = useToast();

  if (!open) return null;

  function toggle(key: keyof typeof state.settings) {
    dispatch({ type: 'SET_SETTING', key, value: !state.settings[key] });
  }

  async function handleSignOut() {
    saveGame(state);
    await signOut(getAuth());
    toast.info('Signed out');
  }

  function handleWipe() {
    if (!confirm('Wipe ALL save data? This cannot be undone.')) return;
    wipeSave();
    window.location.reload();
  }

  function handleSaveUsername() {
    const input = document.getElementById('settings-username') as HTMLInputElement;
    const val = input?.value?.trim();
    if (val && val.length >= 2 && val.length <= 16) {
      dispatch({ type: 'SET_USERNAME', name: val });
      toast.success('Username updated');
    } else {
      toast.warning('Invalid username', '2–16 characters required');
    }
  }

  const ToggleRow = ({ label, desc, settingKey }: { label: string; desc: string; settingKey: keyof typeof state.settings }) => (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid var(--void-border-primary)' }}>
      <div className="flex-1 pr-4">
        <p className="font-game text-sm" style={{ color: 'var(--void-text-primary)', letterSpacing: '0.04em' }}>{label}</p>
        <p className="font-game text-xs mt-0.5" style={{ color: 'var(--void-text-tertiary)' }}>{desc}</p>
      </div>
      <button onClick={() => toggle(settingKey)}
        className={cn('relative w-11 h-6 rounded-full border transition-all duration-200 shrink-0 flex-shrink-0',
          state.settings[settingKey] ? 'border-[rgba(0,243,255,0.5)]' : 'border-[var(--void-border-primary)]')}
        style={{ background: state.settings[settingKey] ? 'rgba(0,243,255,0.2)' : 'var(--void-bg-elevated)' }}>
        <div className={cn('absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200',
          state.settings[settingKey] ? 'left-5' : 'left-0.5')}
          style={{
            background: state.settings[settingKey] ? 'var(--nv-cyan)' : 'var(--void-text-muted)',
            boxShadow:  state.settings[settingKey] ? '0 0 8px rgba(0,243,255,0.6)' : 'none',
          }} />
      </button>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" onClick={onClose}
        style={{ background: 'var(--void-bg-overlay)', backdropFilter: 'blur(8px)' }} />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
        style={{
          background:     'var(--void-bg-secondary)',
          backdropFilter: 'var(--prism-blur-xl)',
          borderTop:      '1px solid var(--void-border-secondary)',
          borderLeft:     '1px solid var(--void-border-primary)',
          borderRight:    '1px solid var(--void-border-primary)',
          boxShadow:      '0 -8px 60px rgba(0,0,0,0.8)',
          maxHeight:      '88dvh',
          overflowY:      'auto',
        }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--void-border-secondary)' }} />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between py-4 mb-1"
            style={{ borderBottom: '1px solid var(--void-border-primary)' }}>
            <div>
              <h2 className="font-display text-xl font-black neon-cyan">SETTINGS</h2>
              <p className="font-game text-xs mt-0.5" style={{ color: 'var(--void-text-muted)', letterSpacing: '0.15em' }}>
                {GAME_TITLE} · {STUDIO_NAME}
              </p>
            </div>
            <button onClick={onClose} className="void-btn void-btn-xs void-btn-ghost">
              <GameIcon name="lucide:x" size={14} />
            </button>
          </div>

          {/* Account */}
          <div className="void-card-glass p-4 mb-4 mt-3">
            <p className="void-stat-label mb-3">ACCOUNT</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black"
                style={{ background: 'linear-gradient(135deg, rgba(0,243,255,0.2), rgba(157,0,255,0.15))', border: '1px solid rgba(0,243,255,0.3)', color: 'var(--nv-cyan)' }}>
                {state.username[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-display text-sm font-bold" style={{ color: 'var(--void-text-primary)' }}>{state.username}</p>
                <p className="font-game text-xs" style={{ color: 'var(--void-text-tertiary)' }}>{user?.email ?? 'No email'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input id="settings-username" type="text" defaultValue={state.username}
                maxLength={16} className="void-input flex-1" placeholder="New username" />
              <button onClick={handleSaveUsername} className="void-btn void-btn-md void-btn-glow">SAVE</button>
            </div>
            <p className="font-game text-xs mt-1.5" style={{ color: 'var(--void-text-muted)' }}>2–16 characters</p>
          </div>

          {/* Game settings */}
          <div className="void-card-glass p-4 mb-4">
            <p className="void-stat-label mb-1">GAMEPLAY</p>
            <ToggleRow label="BACKGROUND MUSIC"    desc="Toggle ambient soundtrack"          settingKey="music"           />
            <ToggleRow label="PARTICLES"           desc="Click burst visual effects"         settingKey="particles"       />
            <ToggleRow label="OFFLINE PROGRESS"    desc="Earn 50% CPS while away (8h cap)"   settingKey="offlineProgress" />
          </div>

          {/* Danger */}
          <div className="void-card p-4 mb-4" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <p className="void-stat-label mb-3" style={{ color: 'var(--void-error-400)' }}>DANGER ZONE</p>
            <button onClick={handleWipe} className="void-btn void-btn-md void-btn-danger void-btn-full">
              WIPE SAVE DATA
            </button>
          </div>

          {/* Sign out */}
          <button onClick={handleSignOut} className="void-btn void-btn-lg void-btn-ghost void-btn-full">
            SIGN OUT
          </button>

          <p className="text-center font-game text-xs mt-5" style={{ color: 'var(--void-text-muted)', letterSpacing: '0.1em' }}>
            NULL.RUN © 2026 · {GAME_TITLE} v0.1
          </p>
        </div>
      </div>
    </>
  );
}
