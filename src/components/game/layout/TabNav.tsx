import { cn } from '@/lib/utils';

export type TabId =
  | 'core'
  | 'produce'
  | 'rank'
  | 'social'
  | 'market'
  | 'stake'
  | 'hq'
  | 'achieve';

export const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'core',    label: 'CORE',    emoji: '∅'  },
  { id: 'produce', label: 'PRODUCE', emoji: '⚡' },
  { id: 'rank',    label: 'RANK',    emoji: '🏆' },
  { id: 'social',  label: 'SOCIAL',  emoji: '👥' },
  { id: 'market',  label: 'MARKET',  emoji: '🎴' },
  { id: 'stake',   label: 'STAKE',   emoji: '📈' },
  { id: 'hq',      label: 'HQ',      emoji: '🏗️' },
  { id: 'achieve', label: 'ACHIEVE', emoji: '🏅' },
];

interface Props {
  active:   TabId;
  onChange: (tab: TabId) => void;
}

export default function TabNav({ active, onChange }: Props) {
  return (
    <nav className="glass-strong relative z-30 border-t border-neon-cyan/10">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

      <div className="flex overflow-x-auto scrollbar-none px-1 py-1 gap-0.5">
        {TABS.map(tab => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center justify-center',
                'min-w-[68px] h-14 rounded-lg px-2 gap-0.5',
                'transition-all duration-150 active:scale-95',
                isActive
                  ? 'tab-active'
                  : 'opacity-40 hover:opacity-70',
              )}
            >
              <span className={cn(
                'text-lg leading-none',
                isActive && tab.id === 'core' && 'neon-cyan',
              )}>
                {tab.emoji}
              </span>
              <span className={cn(
                'font-orbitron text-[8px] font-bold tracking-widest leading-none',
                isActive ? 'neon-cyan' : 'text-white/50',
              )}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-4 h-px bg-neon-cyan rounded-full mt-0.5 shadow-[0_0_4px_rgba(0,243,255,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
