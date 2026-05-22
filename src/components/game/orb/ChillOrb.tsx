import { useRef, useState, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { fmt }     from '@/lib/utils';
import { PRODUCERS } from '@/lib/constants';
import OrbParticles from './OrbParticles';
import { cn } from '@/lib/utils';

interface FloatLabel {
  id:    number;
  value: string;
  x:     number;
  y:     number;
}

let _fid = 0;

export default function ChillOrb() {
  const { state, dispatch, cps } = useGame();
  const wrapRef   = useRef<HTMLDivElement>(null);
  const orbRef    = useRef<HTMLButtonElement>(null);

  const [floats,  setFloats]  = useState<FloatLabel[]>([]);
  const [tapping, setTapping] = useState(false);

  const clickValue = Math.max(1, cps * 0.01);

  const handleClick = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    dispatch({ type: 'CLICK_ORB' });
    setTapping(true);
    setTimeout(() => setTapping(false), 80);

    // Float label
    const rect = orbRef.current?.getBoundingClientRect();
    const wrap  = wrapRef.current?.getBoundingClientRect();
    if (rect && wrap) {
      const x = e.clientX - wrap.left;
      const y = e.clientY - wrap.top;
      const id = _fid++;
      setFloats(prev => [...prev, { id, value: `+${fmt(clickValue)}`, x, y }]);
      setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 900);

      // Particles
      const el = wrapRef.current as HTMLDivElement & { triggerBurst?: (x: number, y: number) => void };
      el?.triggerBurst?.(x, y);
    }
  }, [dispatch, cps, clickValue]);

  return (
    <div className="flex flex-col items-center py-6 select-none">

      {/* Orb container — particles live here */}
      <div ref={wrapRef} className="relative w-72 h-72 flex items-center justify-center">
        <OrbParticles containerRef={wrapRef} enabled={state.settings.particles} />

        {/* Float labels */}
        {floats.map(f => (
          <div
            key={f.id}
            className="absolute font-display font-black text-sm pointer-events-none z-40 whitespace-nowrap neon-cyan"
            style={{ left: f.x, top: f.y, transform: 'translateX(-50%)' }}
          >
            {f.value}
          </div>
        ))}

        {/* Extended crosshair lines */}
        <div className="absolute pointer-events-none" style={{
          width: 1, height: 80,
          background: 'linear-gradient(180deg,rgba(0,243,255,0.5),transparent)',
          top: 0, left: '50%', transform: 'translateX(-50%)',
        }} />
        <div className="absolute pointer-events-none" style={{
          width: 1, height: 80,
          background: 'linear-gradient(0deg,rgba(0,243,255,0.5),transparent)',
          bottom: 0, left: '50%', transform: 'translateX(-50%)',
        }} />
        <div className="absolute pointer-events-none" style={{
          height: 1, width: 80,
          background: 'linear-gradient(270deg,transparent,rgba(0,243,255,0.5))',
          left: 0, top: '50%', transform: 'translateY(-50%)',
        }} />
        <div className="absolute pointer-events-none" style={{
          height: 1, width: 80,
          background: 'linear-gradient(90deg,transparent,rgba(0,243,255,0.5))',
          right: 0, top: '50%', transform: 'translateY(-50%)',
        }} />

        {/* Corner brackets */}
        {[
          'top-4 left-4 border-t-2 border-l-2',
          'top-4 right-4 border-t-2 border-r-2',
          'bottom-4 left-4 border-b-2 border-l-2',
          'bottom-4 right-4 border-b-2 border-r-2',
        ].map((cls, i) => (
          <div key={i} className={cn('absolute w-4 h-4 pointer-events-none border-neon-cyan/40', cls)} />
        ))}

        {/* Rotating rings */}
        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />

        {/* ── THE ORB ── */}
        <button
          ref={orbRef}
          onPointerDown={handleClick}
          className={cn(
            'w-48 h-48 rounded-full orb-glow relative overflow-hidden z-10',
            'transition-transform duration-75',
            tapping && 'scale-[0.91]',
          )}
          style={{
            background: 'radial-gradient(circle at 40% 35%, rgba(0,243,255,0.25) 0%, rgba(0,243,255,0.08) 40%, rgba(157,0,255,0.12) 70%, rgba(255,0,170,0.08) 100%)',
            border: '1px solid rgba(0,243,255,0.4)',
          }}
        >
          {/* Radar sweep */}
          <div className="orb-radar" />

          {/* Hex grid overlay */}
          <div className="absolute inset-0 rounded-full opacity-10 pointer-events-none" style={{
            backgroundImage: [
              'repeating-linear-gradient(0deg,rgba(0,243,255,0.4) 0,rgba(0,243,255,0.4) 1px,transparent 1px,transparent 20px)',
              'repeating-linear-gradient(60deg,rgba(0,243,255,0.4) 0,rgba(0,243,255,0.4) 1px,transparent 1px,transparent 20px)',
              'repeating-linear-gradient(120deg,rgba(0,243,255,0.4) 0,rgba(0,243,255,0.4) 1px,transparent 1px,transparent 20px)',
            ].join(','),
          }} />

          {/* Center label */}
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none z-10">
            <span className="font-mono text-[10px] tracking-widest" style={{ color: 'rgba(0,243,255,0.5)' }}>
              SYS::ACTIVE
            </span>
            <span className="font-display font-black text-2xl neon-cyan" style={{ letterSpacing: '0.05em' }}>
              CORE
            </span>
            <div style={{ height: 1, width: '60%', background: 'rgba(0,243,255,0.4)', margin: '3px 0' }} />
            <span className="font-mono text-xs" style={{ color: 'rgba(0,243,255,0.7)' }}>
              +{fmt(clickValue)} / TAP
            </span>
          </span>
        </button>
      </div>

      {/* Status line */}
      <div className="flex items-center gap-2 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
        <p className="font-mono text-[10px] tracking-widest" style={{ color: 'rgba(0,243,255,0.4)' }}>
          TAP CORE TO GENERATE CHILLS
        </p>
      </div>

      {/* Producer list */}
      <div className="void-card-glass mx-4 mt-4 mb-2 p-4">
        <p className="void-stat-label mb-3 flex items-center gap-2">
          <span style={{ color: 'var(--nv-purple)' }}>⬡</span> YOUR PRODUCERS
        </p>
        {(() => {
          const owned = Object.entries(state.producers).filter(([, p]) => p.count > 0);
          if (owned.length === 0) {
            return (
              <p className="font-game text-xs text-center py-2" style={{ color: 'var(--void-text-muted)' }}>
                No producers yet · visit SHOP tab
              </p>
            );
          }
          return (
            <div className="space-y-1.5">
              {owned.map(([id, p]) => {
                const def = PRODUCERS.find(d => d.id === id);
                return (
                  <div key={id} className="flex items-center justify-between">
                    <span className="font-game text-xs" style={{ color: 'var(--void-text-secondary)' }}>
                      {def?.name ?? id}
                    </span>
                    <span className="void-badge void-badge-primary" style={{ fontSize: '0.65rem' }}>×{p.count}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
