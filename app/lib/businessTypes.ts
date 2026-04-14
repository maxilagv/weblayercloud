export interface BusinessTypeOption {
  key:
    | 'muebleria'
    | 'indumentaria'
    | 'electronica'
    | 'ferreteria'
    | 'libreria'
    | 'veterinaria'
    | 'farmacia'
    | 'gastronomia'
    | 'servicios'
    | 'otro';
  label: string;
  shortLabel: string;
  icon: string;
}

export const BUSINESS_TYPES: readonly BusinessTypeOption[] = [
  { key: 'muebleria', label: 'Mueblería', shortLabel: 'Mueblería', icon: '🪑' },
  { key: 'indumentaria', label: 'Indumentaria / Ropa', shortLabel: 'Indumentaria', icon: '👕' },
  { key: 'electronica', label: 'Electrónica', shortLabel: 'Electrónica', icon: '📱' },
  { key: 'ferreteria', label: 'Ferretería', shortLabel: 'Ferretería', icon: '🔧' },
  { key: 'libreria', label: 'Librería / Papelería', shortLabel: 'Librería', icon: '📚' },
  { key: 'veterinaria', label: 'Veterinaria / Pet Shop', shortLabel: 'Veterinaria', icon: '🐾' },
  { key: 'farmacia', label: 'Farmacia / Perfumería', shortLabel: 'Farmacia', icon: '💊' },
  { key: 'gastronomia', label: 'Gastronomía / Delivery', shortLabel: 'Gastronomía', icon: '🍕' },
  { key: 'servicios', label: 'Servicios Profesionales', shortLabel: 'Servicios', icon: '💼' },
  { key: 'otro', label: 'Otro rubro', shortLabel: 'Otro', icon: '✨' },
] as const;

export function getBusinessTypeByKey(key: string | null | undefined): BusinessTypeOption | null {
  if (!key) return null;
  return BUSINESS_TYPES.find((item) => item.key === key) ?? null;
}
