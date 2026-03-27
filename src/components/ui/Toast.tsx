'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, X, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; title: string; description?: string; variant: ToastVariant; }
interface ToastContextType { toast: (opts: Omit<Toast, 'id'>) => void; }

const ToastContext = createContext<ToastContextType>({ toast: () => {} });
export function useToastContext() { return useContext(ToastContext); }

const icons: Record<ToastVariant, React.ElementType> = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
const colors: Record<ToastVariant, string> = {
  success: 'border-emerald-500/30 bg-emerald-950/50',
  error: 'border-red-500/30 bg-red-950/50',
  warning: 'border-amber-500/30 bg-amber-950/50',
  info: 'border-blue-500/30 bg-blue-950/50',
};
const iconColors: Record<ToastVariant, string> = { success: 'text-emerald-400', error: 'text-red-400', warning: 'text-amber-400', info: 'text-blue-400' };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => setToasts((prev) => prev.filter(( t: any ) => t.id !== id)), 5000);
  }, []);
  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter(( t: any ) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map(( t: any ) => {
            const Icon = icons[t.variant];
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`flex items-start gap-3 border rounded-xl p-4 shadow-xl backdrop-blur-xl ${colors[t.variant]}`}>
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors[t.variant]}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{t.title}</p>
                  {t.description && <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>}
                </div>
                <button onClick={() => removeToast(t.id)} className="text-slate-500 hover:text-white transition-colors shrink-0"><X className="w-4 h-4" /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
