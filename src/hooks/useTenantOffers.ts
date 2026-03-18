import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TenantOffer {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: 'fecha' | 'volumen';
  activa: boolean;
  prioridad: number;
  productIds: string[];
  bannerImageUrl?: string;
  descuentoPct?: number;
  precioOferta?: number;
  minUnidades?: number;
  startsAt?: any;
  endsAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export function useTenantOffers(tenantId: string) {
  const [offers, setOffers] = useState<TenantOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const offersQuery = query(
      collection(db, 'tenants', tenantId, 'offers'),
      orderBy('prioridad', 'desc'),
    );

    const unsubscribe = onSnapshot(
      offersQuery,
      (snapshot) => {
        const items = snapshot.docs.map((offer) => ({ id: offer.id, ...offer.data() } as TenantOffer));
        items.sort((a, b) => Number(b.prioridad || 0) - Number(a.prioridad || 0));
        setOffers(items);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [tenantId]);

  const addOffer = (data: Omit<TenantOffer, 'id'>) =>
    addDoc(collection(db, 'tenants', tenantId, 'offers'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  const updateOffer = (offerId: string, data: Partial<TenantOffer>) =>
    updateDoc(doc(db, 'tenants', tenantId, 'offers', offerId), {
      ...data,
      updatedAt: serverTimestamp(),
    });

  const deleteOffer = (offerId: string) =>
    deleteDoc(doc(db, 'tenants', tenantId, 'offers', offerId));

  return {
    offers,
    loading,
    error,
    addOffer,
    updateOffer,
    deleteOffer,
  };
}
