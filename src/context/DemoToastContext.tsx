import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';

export interface DemoToastAction {
  label: string;
  to: string;
}

export interface DemoToastInput {
  title: string;
  message?: string;
  action?: DemoToastAction;
}

interface DemoToastItem extends DemoToastInput {
  id: string;
}

interface DemoToastContextValue {
  showToast: (input: DemoToastInput) => void;
}

const DemoToastContext = createContext<DemoToastContextValue | null>(null);

function buildToastId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function DemoToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<DemoToastItem[]>([]);

  const removeToast = (toastId: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  };

  const showToast = (input: DemoToastInput) => {
    const toast = {
      id: buildToastId(),
      ...input,
    };

    setToasts((current) => [...current.slice(-2), toast]);
    window.setTimeout(() => removeToast(toast.id), 2500);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <DemoToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 72,
          right: 16,
          zIndex: 120,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 120, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              style={{
                pointerEvents: 'auto',
                width: 'min(360px, calc(100vw - 32px))',
                background: 'rgba(10,10,10,0.94)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.24)',
                padding: '14px 16px',
                backdropFilter: 'blur(16px)',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                {toast.title}
              </p>
              {toast.message ? (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)', lineHeight: 1.5 }}>
                  {toast.message}
                </p>
              ) : null}
              {toast.action ? (
                <Link
                  to={toast.action.to}
                  style={{
                    display: 'inline-flex',
                    marginTop: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--tk-primary)',
                    textDecoration: 'none',
                  }}
                >
                  {toast.action.label}
                </Link>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </DemoToastContext.Provider>
  );
}

export function useDemoToast() {
  const context = useContext(DemoToastContext);
  if (!context) {
    throw new Error('useDemoToast debe usarse dentro de <DemoToastProvider>');
  }
  return context;
}
