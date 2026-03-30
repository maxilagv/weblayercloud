export type TenantRegisterStep = 1 | 2 | 3;

export interface TenantRegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  ownerName: string;
  businessName: string;
  phone: string;
  businessType: string;
  acceptSetup: boolean;
}

export interface CustomerRegisterFormState {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  password: string;
  confirmPassword: string;
}

export type AuthFieldErrors<T extends string> = Partial<Record<T, string>>;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return value.trim().replace(/[^\d+]/g, '');
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function getPasswordPolicyState(password: string) {
  return {
    minLength: password.length >= 10,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  };
}

export function getPasswordStrength(policy: ReturnType<typeof getPasswordPolicyState>) {
  return Object.values(policy).filter(Boolean).length;
}

export function splitDisplayName(displayName?: string | null) {
  const value = (displayName ?? '').trim().replace(/\s+/g, ' ');
  if (!value) {
    return { nombre: '', apellido: '' };
  }

  const parts = value.split(' ');
  return {
    nombre: parts[0] ?? '',
    apellido: parts.slice(1).join(' '),
  };
}

export function getTenantStepErrors(
  form: TenantRegisterFormState,
  step: TenantRegisterStep,
): AuthFieldErrors<keyof TenantRegisterFormState> {
  const errors: AuthFieldErrors<keyof TenantRegisterFormState> = {};

  if (step === 1) {
    if (!isValidEmail(form.email)) {
      errors.email = 'Ingresa un email valido.';
    }

    const passwordPolicy = getPasswordPolicyState(form.password);
    if (!Object.values(passwordPolicy).every(Boolean)) {
      errors.password =
        'Usa al menos 10 caracteres, una mayuscula, una minuscula y un numero.';
    }

    if (form.confirmPassword.trim().length === 0) {
      errors.confirmPassword = 'Confirma tu contrasena.';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Las contrasenas no coinciden.';
    }
  }

  if (step === 2) {
    if (form.ownerName.trim().length < 3) {
      errors.ownerName = 'Ingresa tu nombre completo.';
    }

    if (form.businessName.trim().length < 2) {
      errors.businessName = 'Ingresa el nombre del negocio.';
    }

    if (form.phone.trim().length > 0 && normalizePhone(form.phone).length < 8) {
      errors.phone = 'Ingresa un telefono valido o dejalo vacio.';
    }
  }

  if (step === 3) {
    if (!form.businessType.trim()) {
      errors.businessType = 'Selecciona el rubro principal del negocio.';
    }

    if (!form.acceptSetup) {
      errors.acceptSetup = 'Debes confirmar para crear la demo.';
    }
  }

  return errors;
}

export function getCustomerRegistrationErrors(
  form: CustomerRegisterFormState,
): AuthFieldErrors<keyof CustomerRegisterFormState> {
  const errors: AuthFieldErrors<keyof CustomerRegisterFormState> = {};

  if (form.nombre.trim().length < 2) {
    errors.nombre = 'Ingresa tu nombre.';
  }

  if (form.apellido.trim().length < 2) {
    errors.apellido = 'Ingresa tu apellido.';
  }

  if (!isValidEmail(form.email)) {
    errors.email = 'Ingresa un email valido.';
  }

  if (normalizePhone(form.telefono).length < 8) {
    errors.telefono = 'Ingresa un telefono valido.';
  }

  if (form.direccion.trim().length < 5) {
    errors.direccion = 'Ingresa una direccion valida.';
  }

  const passwordPolicy = getPasswordPolicyState(form.password);
  if (!Object.values(passwordPolicy).every(Boolean)) {
    errors.password =
      'Usa al menos 10 caracteres, una mayuscula, una minuscula y un numero.';
  }

  if (form.confirmPassword.trim().length === 0) {
    errors.confirmPassword = 'Confirma tu contrasena.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Las contrasenas no coinciden.';
  }

  return errors;
}

export function extractAuthCode(error: unknown) {
  return (error as { code?: string } | null)?.code ?? '';
}

export function mapTenantAuthError(error: unknown) {
  const code = extractAuthCode(error);

  switch (code) {
    case 'functions/already-exists':
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese email. Inicia sesion o recupera tu contrasena.';
    case 'functions/resource-exhausted':
    case 'auth/too-many-requests':
      return 'Detectamos demasiados intentos. Espera unos minutos y vuelve a intentar.';
    case 'functions/invalid-argument':
      return 'Revisa los datos ingresados y vuelve a intentar.';
    case 'functions/failed-precondition':
      return 'La cuenta no cumple las condiciones necesarias para continuar.';
    case 'functions/not-found':
      return 'No encontramos una cuenta activa asociada a ese acceso.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email o contrasena incorrectos.';
    case 'auth/user-disabled':
      return 'Esta cuenta fue deshabilitada. Contacta a soporte.';
    case 'auth/no-tenant-access':
      return 'La cuenta existe, pero no tiene acceso valido al panel. Intentamos repararla y no fue posible.';
    case 'auth/network-request-failed':
      return 'No pudimos conectarnos. Revisa tu conexion e intenta nuevamente.';
    default:
      return 'No pudimos completar la operacion en este momento.';
  }
}

export function mapCustomerAuthError(error: unknown) {
  const code = extractAuthCode(error);

  switch (code) {
    case 'functions/already-exists':
    case 'auth/email-already-in-use':
      return 'Ese email ya tiene una cuenta. Inicia sesion para usarla en esta tienda.';
    case 'functions/resource-exhausted':
    case 'auth/too-many-requests':
      return 'Detectamos demasiados intentos. Espera unos minutos y vuelve a intentar.';
    case 'functions/invalid-argument':
      return 'Revisa los datos ingresados y vuelve a intentar.';
    case 'functions/failed-precondition':
      return 'La tienda no esta disponible para registrar o sincronizar clientes en este momento.';
    case 'functions/not-found':
      return 'No encontramos un perfil de cliente para esta tienda.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email o contrasena incorrectos.';
    case 'auth/not-store-customer':
      return 'Esta cuenta no pertenece a clientes web de esta tienda.';
    case 'auth/network-request-failed':
      return 'No pudimos conectarnos. Revisa tu conexion e intenta nuevamente.';
    default:
      return 'No pudimos completar la operacion en este momento.';
  }
}
