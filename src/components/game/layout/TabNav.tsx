import { cn } from '@/lib/utils';
import { GameIcon, NAV_ICONS } from '@/lib/icons';

export type TabId =
  | 'core'
  | 'produce'
  | 'rank'
  | 'social'
  | 'market'
  | 'stake'
  | 'hq'
  | 'achieve';

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'core',    label: 'CORE',    icon: NAV_ICONS.core },
  { id: 'produce', label: 'PRODUCE', icon: NAV_ICONS.produce },
  { id: 'rank',    label: 'RANK',    icon: NAV_ICONS.rank },
  { id: 'social',  label: 'SOCIAL',  icon: NAV_ICONS.social },
  { id: 'market',  label: 'MARKET',  icon: NAV_ICONS.market },
  { id: 'stake',   label: 'STAKE',   icon: NAV_ICONS.stake },
  { id: 'hq',      label: 'HQ',      icon: NAV_ICONS.hq },
  { id: 'achieve', label: 'ACHIEVE', icon: NAV_ICONS.achieve },
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
              <GameIcon
                name={tab.icon}
                size={18}
                style={{ color: isActive ? 'var(--void-primary-300)' : 'var(--void-text-tertiary)' }}
              />
              <span className="font-display text-[8px] font-bold tracking-widest leading-none"
                style={{ color: isActive ? 'var(--void-primary-300)' : 'var(--void-text-tertiary)' }}>
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
