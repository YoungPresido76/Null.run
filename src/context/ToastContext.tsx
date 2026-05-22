import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'raid' | 'gift' | 'achievement';

export interface Toast {
  id:      string;
  type:    ToastType;
  title:   string;
  message?: string;
  duration?: number;
  removing?: boolean;
}

interface ToastCtx {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success:     (title: string, message?: string) => void;
  error:       (title: string, message?: string) => void;
  warning:     (title: string, message?: string) => void;
  info:        (title: string, message?: string) => void;
  achievement: (title: string, message?: string) => void;
  raid:        (title: string, message?: string) => void;
  gift:        (title: string, message?: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

// ── Config per type ───────────────────────────────────────────────
const TYPE_CONFIG: Record<ToastType, { icon: string; border: string; iconClass: string }> = {
  success:     { icon: 'ui:check',          border: 'border-l-[3px] border-l-green-500',    iconClass: 'text-green-400'    },
  error:       { icon: 'ui:error',                border: 'border-l-[3px] border-l-red-500',      iconClass: 'text-red-400'      },
  warning:     { icon: 'ui:warning',          border: 'border-l-[3px] border-l-yellow-500',   iconClass: 'text-yellow-400'   },
  info:        { icon: 'ui:info',                    border: 'border-l-[3px] border-l-blue-500',     iconClass: 'text-blue-400'     },
  achievement: { icon: 'game:achieve',         border: 'border-l-[3px] border-l-yellow-400',   iconClass: 'text-yellow-300'   },
  raid:        { icon: 'soc:raid',      border: 'border-l-[3px] border-l-red-400',      iconClass: 'text-red-300'      },
  gift:        { icon: 'soc:gift',                border: 'border-l-[3px] border-l-neon-magenta', iconClass: 'text-pink-300'     },
};

// ── Single toast item ─────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const cfg = TYPE_CONFIG[toast.type];
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 rounded-2xl',
        'border border-white/10 pointer-events-auto',
        cfg.border,
        toast.removing
          ? 'animate-[toastOut_0.3s_ease_forwards]'
          : 'animate-[toastIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]',
      )}
      style={{
        background:     'rgba(22,22,30,0.96)',
        backdropFilter: 'blur(20px)',
        boxShadow:      '0 8px 32px rgba(0,0,0,0.6)',
        maxWidth:       340,
      }}
    >
      <Icon icon={cfg.icon} width={18} height={18} className={cn('shrink-0 mt-0.5', cfg.iconClass)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-white/50 mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-white/25 hover:text-white/70 transition-colors"
      >
        <Icon icon="nav:close" width={14} />
      </button>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 320);
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `toast_${Date.now()}_${counterRef.current++}`;
    const duration = opts.duration ?? 4000;
    setToasts(prev => [...prev.slice(-4), { ...opts, id }]); // max 5 stacked
    setTimeout(() => remove(id), duration);
  }, [remove]);

  const success     = useCallback((title: string, message?: string) => toast({ type: 'success',     title, message }), [toast]);
  const error       = useCallback((title: string, message?: string) => toast({ type: 'error',       title, message }), [toast]);
  const warning     = useCallback((title: string, message?: string) => toast({ type: 'warning',     title, message }), [toast]);
  const info        = useCallback((title: string, message?: string) => toast({ type: 'info',        title, message }), [toast]);
  const achievement = useCallback((title: string, message?: string) => toast({ type: 'achievement', title, message, duration: 5500 }), [toast]);
  const raid        = useCallback((title: string, message?: string) => toast({ type: 'raid',        title, message, duration: 5000 }), [toast]);
  const gift        = useCallback((title: string, message?: string) => toast({ type: 'gift',        title, message, duration: 5000 }), [toast]);

  return (
    <Ctx.Provider value={{ toast, success, error, warning, info, achievement, raid, gift }}>
      {children}

      {/* Toast container — bottom-left on mobile, bottom-right on desktop */}
      <div
        className="fixed bottom-24 left-3 right-3 flex flex-col gap-2 pointer-events-none z-[9999]"
        style={{ maxWidth: 340 }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>

      <style>{`
        @keyframes toastIn  { from { opacity:0; transform:translateY(12px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes toastOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateX(30px) scale(0.95); } }
      `}</style>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
