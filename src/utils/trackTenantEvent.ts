import { httpsCallable, getFunctions } from 'firebase/functions';
import app from '../lib/firebase';
import { getDemoJourneyABContext } from '../lib/abTest';

const functions = getFunctions(app, 'us-central1');
const trackFn = httpsCallable(functions, 'trackSession');

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
  | 'trial_expired_shown'
  | 'demo_bar_cta_clicked'
  | 'demo_panel_opened'
  | 'demo_panel_closed'
  | 'demo_panel_step_clicked'
  | 'demo_panel_step_completed'
  | 'demo_panel_admin_link_clicked'
  | 'demo_profile_modal_shown'
  | 'demo_profile_selected'
  | 'demo_profile_dismissed'
  | 'sticky_bar_shown'
  | 'sticky_bar_cta_clicked'
  | 'sticky_bar_dismissed'
  | 'trial_expired_cta_clicked'
  | 'product_added_to_cart'
  | 'checkout_started'
  | 'checkout_completed'
  | 'store_url_copied'
  | 'spotlight_badge_shown'
  | 'dashboard_conversion_cta_clicked'
  | 'dashboard_support_cta_clicked';

function getPath(pathOrPayload?: string | Record<string, unknown>): string {
  if (typeof pathOrPayload === 'string' && pathOrPayload.length > 0) {
    return pathOrPayload;
  }

  if (typeof window === 'undefined') {
    return '/';
  }

  return `${window.location.pathname}${window.location.search}`;
}

function getPayload(
  pathOrPayload?: string | Record<string, unknown>,
  extraPayload?: Record<string, unknown>,
): Record<string, unknown> {
  const basePayload =
    typeof pathOrPayload === 'object' && pathOrPayload !== null
      ? pathOrPayload
      : (extraPayload ?? {});

  return {
    ...basePayload,
    ...getDemoJourneyABContext(),
  };
}

export async function trackTenantEvent(
  tenantId: string,
  event: TenantEventType,
  pathOrPayload?: string | Record<string, unknown>,
  extraPayload?: Record<string, unknown>,
): Promise<void> {
  if (!tenantId) return;

  try {
    await trackFn({
      tenantId,
      event,
      path: getPath(pathOrPayload),
      payload: getPayload(pathOrPayload, extraPayload),
    });
  } catch {
    // El tracking nunca debe romper la UX.
  }
}
