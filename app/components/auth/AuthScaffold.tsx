import { useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPasswordPolicyState } from '../../lib/auth';

interface AuthFeature {
  title: string;
  description: string;
}

interface AuthScaffoldProps {
  accentColor?: string;
  brandEyebrow: string;
  brandTitle: string;
  brandDescription: string;
  features: AuthFeature[];
  children: ReactNode;
  headerEyebrow: string;
  headerTitle: ReactNode;
  headerDescription: string;
  footer?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const accentStyle = (accentColor?: string): CSSProperties =>
  ({ '--lc-auth-accent': accentColor ?? '#FF3B00' } as CSSProperties);

export function AuthScaffold({
  accentColor,
  brandEyebrow,
  brandTitle,
  brandDescription,
  features,
  children,
  headerEyebrow,
  headerTitle,
  headerDescription,
  footer,
  backTo = '/',
  backLabel = 'Volver',
}: AuthScaffoldProps) {
  return (
    <div className="lc-auth-shell" style={accentStyle(accentColor)}>
      <aside className="lc-auth-brand-panel">
        <div className="lc-auth-brand-orb lc-auth-brand-orb-top" />
        <div className="lc-auth-brand-orb lc-auth-brand-orb-bottom" />
        <div className="lc-auth-brand-content">
          <p className="lc-auth-brand-eyebrow">{brandEyebrow}</p>
          <h2 className="lc-auth-brand-title">{brandTitle}</h2>
          <p className="lc-auth-brand-description">{brandDescription}</p>

          <div className="lc-auth-feature-list">
            {features.map((feature, index) => (
              <div key={`${feature.title}-${index}`} className="lc-auth-feature-item">
                <span className="lc-auth-feature-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className="lc-auth-feature-title">{feature.title}</p>
                  <p className="lc-auth-feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="lc-auth-panel">
        <div className="lc-auth-panel-inner">
          <Link to={backTo} className="lc-auth-back-link">
            <ArrowLeft size={14} />
            {backLabel}
          </Link>

          <div className="lc-auth-card">
            <div className="lc-auth-card-header">
              <p className="lc-auth-header-eyebrow">{headerEyebrow}</p>
              <h1 className="lc-auth-header-title">{headerTitle}</h1>
              <p className="lc-auth-header-description">{headerDescription}</p>
            </div>

            {children}

            {footer ? <div className="lc-auth-footer">{footer}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}

export function AuthTextField({ label, error, hint, ...inputProps }: AuthFieldProps) {
  return (
    <label className="lc-auth-field">
      <span className="lc-auth-field-label">{label}</span>
      <input
        {...inputProps}
        className={`lc-auth-input ${error ? 'is-error' : ''} ${inputProps.className ?? ''}`.trim()}
      />
      {error ? <span className="lc-auth-field-error">{error}</span> : null}
      {!error && hint ? <span className="lc-auth-field-hint">{hint}</span> : null}
    </label>
  );
}

export function AuthPasswordField({ label, error, hint, ...inputProps }: AuthFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="lc-auth-field">
      <span className="lc-auth-field-label">{label}</span>
      <div className="lc-auth-password-wrap">
        <input
          {...inputProps}
          type={visible ? 'text' : 'password'}
          className={`lc-auth-input ${error ? 'is-error' : ''} ${inputProps.className ?? ''}`.trim()}
        />
        <button
          type="button"
          className="lc-auth-password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          disabled={Boolean(inputProps.disabled)}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? <span className="lc-auth-field-error">{error}</span> : null}
      {!error && hint ? <span className="lc-auth-field-hint">{hint}</span> : null}
    </label>
  );
}

export function AuthNotice({
  tone,
  children,
}: {
  tone: 'error' | 'success' | 'info';
  children: ReactNode;
}) {
  return <div className={`lc-auth-notice ${tone}`}>{children}</div>;
}

export function PasswordChecklist({ password }: { password: string }) {
  const policy = getPasswordPolicyState(password);
  const items = [
    { key: 'minLength', label: '10+ caracteres', valid: policy.minLength },
    { key: 'hasUppercase', label: 'Una mayuscula', valid: policy.hasUppercase },
    { key: 'hasLowercase', label: 'Una minuscula', valid: policy.hasLowercase },
    { key: 'hasNumber', label: 'Un numero', valid: policy.hasNumber },
  ];

  return (
    <div className="lc-auth-checklist">
      {items.map((item) => (
        <div key={item.key} className={`lc-auth-checklist-item ${item.valid ? 'is-valid' : ''}`}>
          <span className="lc-auth-checklist-dot" />
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function AuthStepBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="lc-auth-stepbar">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`lc-auth-stepbar-segment ${index + 1 <= currentStep ? 'is-active' : ''}`}
        />
      ))}
    </div>
  );
}
