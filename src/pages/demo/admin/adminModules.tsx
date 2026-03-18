import type { LucideIcon } from 'lucide-react';
import {
  DollarSign,
  ExternalLink,
  Image,
  LayoutDashboard,
  LogOut,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Tag,
  TrendingUp,
  Truck,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';

export type AdminModuleId =
  | 'dashboard'
  | 'productos'
  | 'categorias'
  | 'pedidos'
  | 'clientes'
  | 'finanzas'
  | 'ofertas'
  | 'precios'
  | 'proveedores'
  | 'gastos'
  | 'empleados'
  | 'landing'
  | 'configuracion';

export interface AdminNavItem {
  id: AdminModuleId;
  label: string;
  path: string;
  icon: LucideIcon;
  showPendingBadge?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '', icon: LayoutDashboard },
  { id: 'productos', label: 'Productos', path: 'productos', icon: Package },
  { id: 'categorias', label: 'Categorias', path: 'categorias', icon: Tag },
  { id: 'pedidos', label: 'Pedidos', path: 'pedidos', icon: ShoppingBag, showPendingBadge: true },
  { id: 'clientes', label: 'Clientes', path: 'clientes', icon: Users },
  { id: 'finanzas', label: 'Finanzas', path: 'finanzas', icon: TrendingUp },
  { id: 'ofertas', label: 'Ofertas', path: 'ofertas', icon: Percent },
  { id: 'precios', label: 'Precios', path: 'precios', icon: DollarSign },
  { id: 'proveedores', label: 'Proveedores', path: 'proveedores', icon: Truck },
  { id: 'gastos', label: 'Gastos', path: 'gastos', icon: Wallet },
  { id: 'empleados', label: 'Empleados', path: 'empleados', icon: UserCog },
  { id: 'landing', label: 'Landing', path: 'landing', icon: Image },
  { id: 'configuracion', label: 'Configuracion', path: 'configuracion', icon: Settings },
];

export const ADMIN_SECONDARY_LINKS = {
  storefront: { label: 'Ver tienda', icon: ExternalLink },
  logout: { label: 'Cerrar sesion', icon: LogOut },
};

export const STAFF_MANAGEABLE_MODULES = ADMIN_NAV_ITEMS.filter(
  (item) => !['dashboard', 'configuracion', 'empleados'].includes(item.id),
).map((item) => item.id);

export const ADMIN_STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  despachado: 'Despachado',
  cancelado: 'Cancelado',
  active: 'Activo',
  inactive: 'Inactivo',
  applied: 'Aplicado',
  rolled_back: 'Revertido',
};
