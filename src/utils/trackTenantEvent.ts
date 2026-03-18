import { httpsCallable, getFunctions } from 'firebase/functions';
import app from '../lib/firebase';

const functions = getFunctions(app, 'us-central1');
const trackFn   = httpsCallable(functions, 'trackSession');

export type TenantEventType =
  | 'login'
  | 'page_view'
  | 'product_view'
  | 'product_edit'
  | 'product_create'
  | 'order_view'
  | 'order_status_change'
  | 'customer_view'
  | 'stock_edit'
  | 'finance_view'
  | 'config_save'
  | 'trial_expired_shown';

/**
 * Registra un evento de uso del tenant.
 * Silencioso: nunca lanza error, nunca bloquea la UX.
 */
export async function trackTenantEvent(
  tenantId: string,
  event: TenantEventType,
  path: string = window.location.pathname,
): Promise<void> {
  if (!tenantId) return;
  try {
    await trackFn({ tenantId, event, path });
  } catch {
    // Silencioso — los analytics nunca deben romper la app
  }
}
