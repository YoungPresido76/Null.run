import { useState, useRef, useEffect } from 'react';
import { useFirebase } from '@/hooks/useFirebase';
import { cn } from '@/lib/utils';

type Stage = 'phone' | 'otp' | 'loading';

// ── Animated background grid ──────────────────────────────────────
function GridBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Deep background */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,30,60,0.8) 0%, #020614 70%)',
      }} />

      {/* Perspective grid floor */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(0,243,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,243,255,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        transform: 'perspective(400px) rotateX(30deg) translateY(20%)',
        transformOrigin: '50% 100%',
      }} />

      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(0,243,255,0.3) 0%, transparent 70%)' }} />

      {/* Corner accent lines */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-neon-cyan opacity-60" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-neon-cyan opacity-60" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-neon-cyan opacity-60" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-neon-cyan opacity-60" />

      {/* Scan line sweep */}
      <div className="absolute inset-0 animate-hud-sweep opacity-40" style={{
        background: 'linear-gradient(90deg, transparent, rgba(0,243,255,0.04), transparent)',
      }} />
    </div>
  );
}

// ── Floating data particles ───────────────────────────────────────
function DataParticles() {
  const chars = ['0','1','N','V','∅','//','>>','<<','[]','{}'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute font-mono text-xs opacity-20 animate-pulse"
          style={{
            left:  `${8 + (i * 7.5) % 90}%`,
            top:   `${10 + (i * 13) % 80}%`,
            color: i % 3 === 0 ? '#00f3ff' : i % 3 === 1 ? '#9d00ff' : '#ff00aa',
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2 + (i % 3)}s`,
          }}
        >
          {chars[i % chars.length]}
        </div>
      ))}
    </div>
  );
}

// ── OTP digit input ───────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits  = value.split('').concat(Array(6).fill('')).slice(0, 6);

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[i]) {
        next[i] = '';
      } else if (i > 0) {
        next[i - 1] = '';
        inputs.current[i - 1]?.focus();
      }
      onChange(next.join(''));
    }
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next  = [...digits];
    next[i]     = char;
    onChange(next.join(''));
    if (char && i < 5) inputs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className={cn(
            'w-11 h-14 text-center text-xl font-orbitron font-bold rounded-md',
            'bg-void-surface border transition-all duration-150 outline-none',
            'caret-neon-cyan',
            d
              ? 'border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,243,255,0.4)]'
              : 'border-white/10 text-white/60',
            'focus:border-neon-cyan focus:shadow-[0_0_12px_rgba(0,243,255,0.5)]',
          )}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function PhoneAuth() {
  const { sendOTP, verifyOTP } = useFirebase();

  const [stage,   setStage]   = useState<Stage>('phone');
  const [phone,   setPhone]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [error,   setError]   = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  async function handleSendOTP() {
    if (!phone.trim()) return setError('Enter a phone number.');
    setError('');
    setStage('loading');
    try {
      await sendOTP(phone.trim(), 'recaptcha-container');
      setStage('otp');
      setCountdown(60);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send code. Check the number and try again.');
      setStage('phone');
    }
  }

  async function handleVerifyOTP() {
    if (otp.length < 6) return setError('Enter all 6 digits.');
    setError('');
    setStage('loading');
    try {
      await verifyOTP(otp);
      // Auth state change in useFirebase will re-render App → GameShell
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid code. Try again.');
      setOtp('');
      setStage('otp');
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden select-none">
      <GridBg />
      <DataParticles />

      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-container" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo block */}
        <div className="text-center mb-8">
          {/* Orb icon */}
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

          {/* Divider */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-neon-cyan/40" />
            <span className="font-mono text-[10px] text-white/30 tracking-widest">AUTH REQUIRED</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-neon-cyan/40" />
          </div>
        </div>

        {/* Panel */}
        <div className="glass-strong rounded-lg p-6">

          {/* ── PHONE STAGE ── */}
          {(stage === 'phone' || stage === 'loading') && (
            <div className="space-y-5">
              <div>
                <label className="block font-mono text-[11px] tracking-widest text-neon-cyan/70 mb-2">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                  disabled={stage === 'loading'}
                  className={cn(
                    'w-full h-12 px-4 rounded-md font-mono text-sm tracking-wider',
                    'bg-void-surface border border-white/10 text-white placeholder:text-white/20',
                    'outline-none transition-all duration-150',
                    'focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,243,255,0.25)]',
                    stage === 'loading' && 'opacity-50 cursor-not-allowed',
                  )}
                />
                <p className="mt-1.5 font-mono text-[10px] text-white/25">
                  Include country code · e.g. +234 for Nigeria
                </p>
              </div>

              {error && (
                <p className="font-mono text-xs text-red-400/90 text-center">{error}</p>
              )}

              <button
                onClick={handleSendOTP}
                disabled={stage === 'loading'}
                className={cn(
                  'w-full h-12 rounded-md font-orbitron text-sm font-bold tracking-widest',
                  'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20',
                  'border border-neon-cyan/60 text-neon-cyan',
                  'transition-all duration-150',
                  'hover:bg-neon-cyan/10 hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]',
                  'active:scale-[0.98]',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
              >
                {stage === 'loading' ? (
                  <span className="animate-pulse">SENDING CODE...</span>
                ) : (
                  'SEND CODE'
                )}
              </button>
            </div>
          )}

          {/* ── OTP STAGE ── */}
          {stage === 'otp' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="font-mono text-[11px] tracking-widest text-neon-cyan/70 mb-1">
                  VERIFICATION CODE
                </p>
                <p className="text-xs text-white/30">
                  Sent to <span className="text-white/60">{phone}</span>
                </p>
              </div>

              <OTPInput value={otp} onChange={v => { setOtp(v); setError(''); }} />

              {error && (
                <p className="font-mono text-xs text-red-400/90 text-center">{error}</p>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={otp.length < 6}
                className={cn(
                  'w-full h-12 rounded-md font-orbitron text-sm font-bold tracking-widest',
                  'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20',
                  'border border-neon-cyan/60 text-neon-cyan',
                  'transition-all duration-150',
                  'hover:bg-neon-cyan/10 hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]',
                  'active:scale-[0.98]',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                )}
              >
                VERIFY &amp; ENTER
              </button>

              {/* Resend + back */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => { setStage('phone'); setOtp(''); setError(''); }}
                  className="font-mono text-[11px] text-white/30 hover:text-white/60 transition-colors"
                >
                  ← Change number
                </button>
                <button
                  onClick={handleSendOTP}
                  disabled={countdown > 0}
                  className="font-mono text-[11px] text-neon-cyan/50 hover:text-neon-cyan disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center font-mono text-[10px] text-white/15 mt-6 tracking-wider">
          NULL.RUN © 2026 · NEON VERSE v0.1
        </p>
      </div>
    </div>
  );
}
