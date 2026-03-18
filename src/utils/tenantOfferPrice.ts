import type { TenantOffer } from '../hooks/useTenantOffers';
import type { TenantProduct } from '../hooks/useTenantProducts';
import { toDate } from './firestoreDate';

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProductIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? '').trim()).filter(Boolean);
}

function computeCandidatePrice(basePrice: number, offer: TenantOffer): number {
  const fixedPrice = Number.isFinite(Number(offer.precioOferta))
    ? Math.max(0, Number(offer.precioOferta))
    : null;
  const discountPct = Number.isFinite(Number(offer.descuentoPct))
    ? Number(offer.descuentoPct)
    : null;

  const candidates = [basePrice];
  if (fixedPrice !== null) candidates.push(fixedPrice);
  if (discountPct !== null && discountPct > 0) {
    candidates.push(basePrice * (1 - discountPct / 100));
  }

  return Math.max(0, Number(Math.min(...candidates).toFixed(2)));
}

function computeDiscountPct(basePrice: number, finalPrice: number): number {
  if (basePrice <= 0 || finalPrice >= basePrice) return 0;
  return Number((((basePrice - finalPrice) / basePrice) * 100).toFixed(2));
}

export function isOfferEnabled(offer: TenantOffer, now = new Date()): boolean {
  if (!offer || offer.activa === false) return false;
  if (!offer.productIds?.length) return false;

  const hasDiscountPct =
    Number.isFinite(Number(offer.descuentoPct)) && Number(offer.descuentoPct) > 0;
  const hasFixedPrice =
    Number.isFinite(Number(offer.precioOferta)) && Number(offer.precioOferta) >= 0;

  if (!hasDiscountPct && !hasFixedPrice) return false;

  if (offer.tipo === 'fecha') {
    const startsAt = toDate(offer.startsAt);
    const endsAt = toDate(offer.endsAt);
    if (!startsAt || !endsAt) return false;
    return now >= startsAt && now <= endsAt;
  }

  return true;
}

export function getActiveOffersForTenant(offers: TenantOffer[], now = new Date()): TenantOffer[] {
  return [...offers]
    .filter((offer) => isOfferEnabled(offer, now))
    .sort((a, b) => Number(b.prioridad || 0) - Number(a.prioridad || 0));
}

export function getProductOfferPrice(
  product: Pick<TenantProduct, 'id' | 'precio'>,
  offers: TenantOffer[],
  quantity = 1,
  now = new Date(),
): {
  hasOffer: boolean;
  originalPrice: number;
  finalPrice: number;
  discountPct: number;
  appliedOffer: TenantOffer | null;
  volumeHintMinUnits: number | null;
} {
  const productId = String(product.id ?? '').trim();
  const originalPrice = Math.max(0, toNumber(product.precio, 0));
  const safeQuantity = Math.max(1, Math.floor(quantity || 1));

  const candidates: Array<{
    offer: TenantOffer;
    finalPrice: number;
    discountPct: number;
  }> = [];

  const volumeHints: Array<{ priority: number; minUnits: number }> = [];

  for (const offer of offers) {
    if (!normalizeProductIds(offer.productIds).includes(productId)) continue;
    if (!isOfferEnabled(offer, now)) continue;

    if (offer.tipo === 'volumen') {
      const minUnits = Math.max(1, Math.floor(toNumber(offer.minUnidades, 1)));
      if (safeQuantity < minUnits) {
        volumeHints.push({ priority: Number(offer.prioridad || 0), minUnits });
        continue;
      }
    }

    const finalPrice = computeCandidatePrice(originalPrice, offer);
    if (finalPrice >= originalPrice) continue;

    candidates.push({
      offer,
      finalPrice,
      discountPct: computeDiscountPct(originalPrice, finalPrice),
    });
  }

  candidates.sort((a, b) => {
    if (a.finalPrice !== b.finalPrice) return a.finalPrice - b.finalPrice;
    return Number(b.offer.prioridad || 0) - Number(a.offer.prioridad || 0);
  });

  volumeHints.sort((a, b) => b.priority - a.priority || a.minUnits - b.minUnits);

  const best = candidates[0] ?? null;

  return {
    hasOffer: Boolean(best),
    originalPrice,
    finalPrice: best?.finalPrice ?? originalPrice,
    discountPct: best?.discountPct ?? 0,
    appliedOffer: best?.offer ?? null,
    volumeHintMinUnits: volumeHints[0]?.minUnits ?? null,
  };
}
