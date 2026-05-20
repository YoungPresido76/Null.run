interface Props {
  emoji: string;
  title: string;
  subtitle?: string;
}

export default function PlaceholderPanel({ emoji, title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
      <div className="text-5xl mb-4">{emoji}</div>
      <h2 className="font-orbitron text-xl neon-cyan mb-2 tracking-widest">{title}</h2>
      {subtitle && (
        <p className="font-mono text-xs text-white/30 tracking-wider">{subtitle}</p>
      )}
      <div className="mt-6 glass rounded-lg px-6 py-3">
        <p className="font-mono text-[10px] text-white/20 tracking-widest">COMING SOON // NULL.RUN</p>
      </div>
    </div>
  );
}
