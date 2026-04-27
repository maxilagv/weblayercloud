import React, { useState, useId, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// ── Typewriter ─────────────────────────────────────────────────────

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({ text, speed = 100, cursor = '|', loop = false, deleteSpeed = 50, delay = 1500, className }: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || '';

  useEffect(() => {
    if (!currentText) return;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentIndex < currentText.length) {
          setDisplayText(p => p + currentText[currentIndex]);
          setCurrentIndex(p => p + 1);
        } else if (loop) {
          setTimeout(() => setIsDeleting(true), delay);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(p => p.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex(0);
          setTextArrayIndex(p => (p + 1) % textArray.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);
    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, currentText, loop, speed, deleteSpeed, delay, displayText, text]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

// ── Input ──────────────────────────────────────────────────────────

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className = '', type, ...props }, ref) => (
    <input
      type={type}
      className={`flex h-10 w-full rounded-lg border px-3 py-3 text-sm shadow-sm placeholder:text-gray-400 focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3B00] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{ borderColor: '#E5E5E5', background: '#FAFAFA', color: '#0A0A0A' }}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// ── PasswordInput ──────────────────────────────────────────────────

const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string }>(
  ({ className = '', label, ...props }, ref) => {
    const id = useId();
    const [show, setShow] = useState(false);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <label htmlFor={id} className="text-sm font-medium leading-none" style={{ color: '#0A0A0A' }}>{label}</label>}
        <div className="relative">
          <Input id={id} type={show ? 'text' : 'password'} className={`pe-10 ${className}`} ref={ref} {...props} />
          <button
            type="button"
            onClick={() => setShow(p => !p)}
            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-gray-400 hover:text-gray-700 focus-visible:outline-none"
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

// ── Button ─────────────────────────────────────────────────────────

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'link';

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  default:  { background: '#0A0A0A', color: '#FAFAFA', border: 'none' },
  outline:  { background: '#FAFAFA', color: '#0A0A0A', border: '1px solid #E5E5E5' },
  ghost:    { background: 'transparent', color: '#0A0A0A', border: 'none' },
  link:     { background: 'transparent', color: '#6B7280', border: 'none', textDecoration: 'underline', textUnderlineOffset: '4px', padding: '0 4px' },
};

function Button({ variant = 'default', onClick, children, type = 'button', className = '', style = {} }: {
  variant?: ButtonVariant;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3B00] disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full ${className}`}
      style={{ ...variantStyles[variant], ...style }}
    >
      {children}
    </button>
  );
}

// ── Forms ──────────────────────────────────────────────────────────

function SignInForm() {
  return (
    <form onSubmit={e => e.preventDefault()} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold" style={{ color: '#0A0A0A' }}>Ingresá a tu cuenta</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Ingresá tu email para acceder al panel</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="signin-email" className="text-sm font-medium" style={{ color: '#0A0A0A' }}>Email</label>
          <Input id="signin-email" name="email" type="email" placeholder="vos@empresa.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Contraseña" required autoComplete="current-password" placeholder="Contraseña" />
        <Button type="submit" variant="outline" className="mt-2">Ingresar</Button>
      </div>
    </form>
  );
}

function SignUpForm() {
  return (
    <form onSubmit={e => e.preventDefault()} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold" style={{ color: '#0A0A0A' }}>Crear cuenta</h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>Completá tus datos para empezar</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <label htmlFor="signup-name" className="text-sm font-medium" style={{ color: '#0A0A0A' }}>Nombre completo</label>
          <Input id="signup-name" name="name" type="text" placeholder="Juan Pérez" required autoComplete="name" />
        </div>
        <div className="grid gap-2">
          <label htmlFor="signup-email" className="text-sm font-medium" style={{ color: '#0A0A0A' }}>Email</label>
          <Input id="signup-email" name="email" type="email" placeholder="vos@empresa.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Contraseña" required autoComplete="new-password" placeholder="Contraseña" />
        <Button type="submit" variant="outline" className="mt-2">Crear cuenta</Button>
      </div>
    </form>
  );
}

// ── AuthUI ─────────────────────────────────────────────────────────

interface AuthContentProps {
  image?: { src: string; alt: string };
  quote?: { text: string; author: string };
}

interface AuthUIProps {
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
}

const defaultSignIn = {
  image: { src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', alt: 'LayerCloud panel' },
  quote: { text: 'Bienvenido de vuelta. Tu operación te espera.', author: 'LayerCloud' },
};
const defaultSignUp = {
  image: { src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop', alt: 'LayerCloud nuevo usuario' },
  quote: { text: 'El primer paso para automatizar tu empresa empieza acá.', author: 'LayerCloud' },
};

export function AuthUI({ signInContent = {}, signUpContent = {} }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const toggle = () => setIsSignIn(p => !p);

  const current = isSignIn
    ? { image: { ...defaultSignIn.image, ...signInContent.image }, quote: { ...defaultSignIn.quote, ...signInContent.quote } }
    : { image: { ...defaultSignUp.image, ...signUpContent.image }, quote: { ...defaultSignUp.quote, ...signUpContent.quote } };

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2" style={{ background: '#FAFAFA' }}>
      <style>{`input[type="password"]::-ms-reveal,input[type="password"]::-ms-clear{display:none}`}</style>

      {/* Form panel */}
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12">
        <div className="mx-auto grid gap-2" style={{ width: '350px' }}>
          {isSignIn ? <SignInForm /> : <SignUpForm />}

          <div className="text-center text-sm mt-2" style={{ color: '#6B7280' }}>
            {isSignIn ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
            <Button variant="link" onClick={toggle} className="w-auto h-auto p-0" style={{ color: '#0A0A0A', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
              {isSignIn ? 'Registrate' : 'Ingresá'}
            </Button>
          </div>

          <div className="relative text-center text-sm my-2">
            <div className="absolute inset-0 top-1/2 border-t" style={{ borderColor: '#E5E5E5' }} />
            <span className="relative px-2 text-sm z-10" style={{ background: '#FAFAFA', color: '#6B7280' }}>O continuá con</span>
          </div>

          <Button variant="outline">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="mr-2 h-4 w-4" />
            Continuar con Google
          </Button>
        </div>
      </div>

      {/* Image panel */}
      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${current.image.src})` }}
        key={current.image.src}
      >
        <div className="absolute inset-x-0 bottom-0 h-[120px]" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-8">
          <blockquote className="space-y-2 text-center" style={{ color: 'white' }}>
            <p className="text-lg font-medium">
              "<Typewriter key={current.quote.text} text={current.quote.text} speed={60} />"
            </p>
            <cite className="block text-sm not-italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
              — {current.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
