import { useState } from 'react';
import { useFirebase } from '@/hooks/useFirebase';
import { cn } from '@/lib/utils';

type Stage = 'signin' | 'signup' | 'reset' | 'loading';

function GridBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,30,60,0.8) 0%, #020614 70%)',
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(0,243,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,243,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        transform: 'perspective(400px) rotateX(30deg) translateY(20%)',
        transformOrigin: '50% 100%',
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full opacity-25"
        style={{ background: 'radial-gradient(circle, rgba(0,243,255,0.35) 0%, transparent 70%)' }} />
      <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-neon-cyan opacity-50" />
      <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-neon-cyan opacity-50" />
      <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-neon-cyan opacity-50" />
      <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-neon-cyan opacity-50" />
    </div>
  );
}

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useFirebase();

  const [stage,    setStage]    = useState<Stage>('signin');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [resetSent,setResetSent]= useState(false);

  function friendlyError(code: string) {
    if (code.includes('user-not-found'))   return 'No account found with that email.';
    if (code.includes('wrong-password'))   return 'Incorrect password.';
    if (code.includes('email-already'))    return 'An account with this email already exists.';
    if (code.includes('invalid-email'))    return 'Invalid email address.';
    if (code.includes('weak-password'))    return 'Password must be at least 6 characters.';
    if (code.includes('too-many-requests'))return 'Too many attempts. Try again later.';
    if (code.includes('network-request'))  return 'Network error. Check your connection.';
    return 'Something went wrong. Try again.';
  }

  async function handleSignIn() {
    if (!email || !password) return setError('Fill in all fields.');
    setError(''); setStage('loading');
    try {
      await signIn(email.trim(), password);
    } catch (e: unknown) {
      setError(friendlyError((e as { code?: string }).code ?? ''));
      setStage('signin');
    }
  }

  async function handleSignUp() {
    if (!email || !password || !confirm) return setError('Fill in all fields.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setError(''); setStage('loading');
    try {
      await signUp(email.trim(), password);
    } catch (e: unknown) {
      setError(friendlyError((e as { code?: string }).code ?? ''));
      setStage('signup');
    }
  }

  async function handleReset() {
    if (!email) return setError('Enter your email first.');
    setError('');
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (e: unknown) {
      setError(friendlyError((e as { code?: string }).code ?? ''));
    }
  }

  const inputCls = 'w-full h-12 px-4 rounded-md font-mono text-sm tracking-wider bg-void-surface border border-white/10 text-white placeholder:text-white/20 outline-none transition-all focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,243,255,0.2)]';

  const btnCls = 'w-full h-12 rounded-md font-orbitron text-sm font-bold tracking-widest border border-neon-cyan/60 text-neon-cyan bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 hover:bg-neon-cyan/10 hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden select-none">
      <GridBg />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="w-full h-full rounded-full orb-glow bg-gradient-to-br from-void-elevated to-void-surface flex items-center justify-center">
              <span className="text-3xl">∅</span>
            </div>
            <div className="orb-ring orb-ring-1" />
            <div className="orb-ring orb-ring-2" />
          </div>
          <h1 className="font-orbitron text-4xl font-black tracking-widest neon-cyan mb-1">
            NEON VERSE
          </h1>
          <p className="font-mono text-xs tracking-[0.3em] text-neon-purple opacity-80">
            BY NULL.RUN
          </p>
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-neon-cyan/40" />
            <span className="font-mono text-[10px] text-white/30 tracking-widest">
              {stage === 'reset' ? 'RESET PASSWORD' : stage === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-neon-cyan/40" />
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-lg p-6 space-y-4">

          {/* ── RESET SENT ── */}
          {resetSent ? (
            <div className="text-center space-y-4 py-2">
              <div className="text-4xl">📬</div>
              <p className="font-orbitron text-sm neon-cyan">CHECK YOUR EMAIL</p>
              <p className="font-mono text-xs text-white/40">
                A reset link was sent to<br />
                <span className="text-white/70">{email}</span>
              </p>
              <button onClick={() => { setResetSent(false); setStage('signin'); }}
                className="font-mono text-xs text-neon-cyan/60 hover:text-neon-cyan transition-colors">
                ← Back to sign in
              </button>
            </div>

          /* ── RESET FORM ── */
          ) : stage === 'reset' ? (
            <>
              <div>
                <label className="block font-mono text-[11px] tracking-widest text-neon-cyan/70 mb-2">EMAIL</label>
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className={inputCls} />
              </div>
              {error && <p className="font-mono text-xs text-red-400/90 text-center">{error}</p>}
              <button onClick={handleReset} className={btnCls}>SEND RESET LINK</button>
              <button onClick={() => { setStage('signin'); setError(''); }}
                className="w-full font-mono text-[11px] text-white/30 hover:text-white/60 transition-colors text-center">
                ← Back to sign in
              </button>
            </>

          /* ── SIGN IN / SIGN UP ── */
          ) : (
            <>
              <div>
                <label className="block font-mono text-[11px] tracking-widest text-neon-cyan/70 mb-2">EMAIL</label>
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && stage === 'signin' && handleSignIn()}
                  className={inputCls} />
              </div>
              <div>
                <label className="block font-mono text-[11px] tracking-widest text-neon-cyan/70 mb-2">PASSWORD</label>
                <input type="password" placeholder="••••••••" value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && stage === 'signin' && handleSignIn()}
                  className={inputCls} />
              </div>
              {stage === 'signup' && (
                <div>
                  <label className="block font-mono text-[11px] tracking-widest text-neon-cyan/70 mb-2">CONFIRM PASSWORD</label>
                  <input type="password" placeholder="••••••••" value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(''); }}
                    className={inputCls} />
                </div>
              )}

              {error && <p className="font-mono text-xs text-red-400/90 text-center">{error}</p>}

              <button
                onClick={stage === 'signin' ? handleSignIn : handleSignUp}
                disabled={stage === 'loading'}
                className={btnCls}
              >
                {stage === 'loading'
                  ? <span className="animate-pulse">CONNECTING...</span>
                  : stage === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'
                }
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => { setStage(stage === 'signin' ? 'signup' : 'signin'); setError(''); setConfirm(''); }}
                  className="font-mono text-[11px] text-neon-cyan/50 hover:text-neon-cyan transition-colors"
                >
                  {stage === 'signin' ? 'New? Create account →' : '← Back to sign in'}
                </button>
                {stage === 'signin' && (
                  <button onClick={() => { setStage('reset'); setError(''); }}
                    className="font-mono text-[11px] text-white/25 hover:text-white/50 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center font-mono text-[10px] text-white/15 mt-6 tracking-wider">
          NULL.RUN © 2026 · NEON VERSE v0.1
        </p>
      </div>
    </div>
  );
}
