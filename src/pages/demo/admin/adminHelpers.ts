import type { TenantCategory } from '../../../hooks/useTenantCategories';
import type { TenantOrder } from '../../../hooks/useTenantOrders';
import { toDate } from '../../../utils/firestoreDate';

export function formatCurrency(value: number) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatDate(value: unknown) {
  const date = toDate(value as any);
  return date ? date.toLocaleDateString('es-AR') : '—';
}

export function formatDateTime(value: unknown) {
  const date = toDate(value as any);
  return date ? date.toLocaleString('es-AR') : '—';
}

export function buildCategorySlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getPendingOrdersCount(orders: TenantOrder[]) {
  return orders.filter((order) => order.status === 'pendiente').length;
}

export function sortCategoriesByOrder(categories: TenantCategory[]) {
  return [...categories].sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0));
}
