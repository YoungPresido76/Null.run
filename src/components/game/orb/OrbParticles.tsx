import { useEffect, useRef } from 'react';

interface Particle {
  id:    number;
  x:     number;
  y:     number;
  tx:    number;
  ty:    number;
  color: string;
}

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>;
  enabled:      boolean;
}

const COLORS = [
  'rgba(0,243,255,0.9)',
  'rgba(157,0,255,0.9)',
  'rgba(255,0,170,0.9)',
  'rgba(0,255,136,0.8)',
  'rgba(255,255,255,0.7)',
];

let _pid = 0;

export default function OrbParticles({ containerRef, enabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef    = useRef<number>(0);

  // Expose a trigger function on the container element
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    (el as HTMLDivElement & { triggerBurst?: (cx: number, cy: number) => void }).triggerBurst
      = (cx: number, cy: number) => {
        if (!enabled) return;
        const count = 12 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
          const dist  = 30 + Math.random() * 80;
          particles.current.push({
            id:    _pid++,
            x:     cx,
            y:     cy,
            tx:    Math.cos(angle) * dist,
            ty:    Math.sin(angle) * dist,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      };

    return () => {
      delete (el as HTMLDivElement & { triggerBurst?: unknown }).triggerBurst;
    };
  }, [containerRef, enabled]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas || !canvas.parentElement) return;
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let startTimes: Map<number, number> = new Map();
    let lastTs = 0;

    function draw(ts: number) {
      if (!ctx || !canvas) return;
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = ts;
      const alive: Particle[] = [];

      for (const p of particles.current) {
        if (!startTimes.has(p.id)) startTimes.set(p.id, now);
        const elapsed  = now - startTimes.get(p.id)!;
        const duration = 700;
        if (elapsed > duration) {
          startTimes.delete(p.id);
          continue;
        }
        const t       = elapsed / duration;
        const eased   = 1 - Math.pow(1 - t, 3);  // ease out cubic
        const x       = p.x + p.tx * eased;
        const y       = p.y + p.ty * eased;
        const alpha   = (1 - t) * 0.9;
        const size    = (1 - t * 0.6) * 3.5;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('rgba(','rgba(').replace(/rgba\((.+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        alive.push(p);
      }

      particles.current = alive;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50 rounded-lg"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
