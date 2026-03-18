import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { ADMIN_STATUS_LABELS } from './adminModules';
import './admin.css';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="demo-admin-page-header">
      <div>
        <p className="demo-admin-page-eyebrow">{eyebrow}</p>
        <h1 className="demo-admin-page-title">{title}</h1>
        {description ? <p className="demo-admin-page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="demo-admin-actions">{actions}</div> : null}
    </div>
  );
}

export function AdminSurface({
  children,
  className = '',
  padding = 'pad-md',
}: {
  children: ReactNode;
  className?: string;
  padding?: 'pad-sm' | 'pad-md';
}) {
  return <section className={`demo-admin-surface ${padding} ${className}`.trim()}>{children}</section>;
}

export function AdminButton({
  children,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  const className =
    variant === 'ghost'
      ? 'demo-admin-button-ghost'
      : variant === 'danger'
        ? 'demo-admin-button-danger'
        : 'demo-admin-button';

  return (
    <button type={type} className={className} {...props}>
      {children}
    </button>
  );
}

export function AdminIconButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="demo-admin-icon-button" {...props}>
      {children}
    </button>
  );
}

export function AdminField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="demo-admin-field">
      <span className="demo-admin-label">{label}</span>
      {children}
    </label>
  );
}

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="demo-admin-input" {...props} />;
}

export function AdminSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="demo-admin-select" {...props} />;
}

export function AdminTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="demo-admin-textarea" {...props} />;
}

export function AdminStatusBadge({ status }: { status: string }) {
  const className =
    status === 'pendiente'
      ? 'pending'
      : status === 'confirmado'
        ? 'confirmed'
        : status === 'despachado'
          ? 'shipped'
          : status === 'cancelado'
            ? 'cancelled'
            : status === 'activo' || status === 'applied'
              ? 'active'
              : 'inactive';

  return (
    <span className={`demo-admin-status-badge ${className}`}>
      {ADMIN_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function AdminMessage({
  kind,
  children,
}: {
  kind: 'error' | 'success';
  children: ReactNode;
}) {
  return <div className={`demo-admin-message ${kind}`}>{children}</div>;
}

export function AdminEmptyState({ children }: { children: ReactNode }) {
  return <div className="demo-admin-empty">{children}</div>;
}

export function AdminLoadingState({ children }: { children: ReactNode }) {
  return <div className="demo-admin-loading">{children}</div>;
}

export function AdminSkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="demo-admin-list">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="demo-admin-list-item demo-admin-skeleton" style={{ minHeight: 66 }} />
      ))}
    </div>
  );
}

export function AdminModal({
  open,
  title,
  eyebrow,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="demo-admin-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="demo-admin-modal"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="demo-admin-modal-header">
              <div>
                {eyebrow ? <p className="demo-admin-page-eyebrow">{eyebrow}</p> : null}
                <h2 className="demo-admin-page-title" style={{ fontSize: 24 }}>
                  {title}
                </h2>
              </div>
              <AdminIconButton onClick={onClose} aria-label="Cerrar modal">
                <X size={16} />
              </AdminIconButton>
            </div>
            <div className="demo-admin-modal-body">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
