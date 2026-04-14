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

export interface TenantHero {
  id: string;
  titulo: string;
  subtitulo?: string;
  imageDesktop: string;
  imageMobile?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  orden: number;
  activo: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export function useTenantLandingHeroes(tenantId: string, onlyActive = false) {
  const [heroes, setHeroes] = useState<TenantHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const heroesQuery = query(
      collection(db, 'tenants', tenantId, 'landing_heroes'),
      orderBy('orden', 'asc'),
    );

    const unsubscribe = onSnapshot(
      heroesQuery,
      (snapshot) => {
        const items = snapshot.docs.map((hero) => ({ id: hero.id, ...hero.data() } as TenantHero));
        setHeroes(onlyActive ? items.filter((hero) => hero.activo !== false) : items);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [tenantId, onlyActive]);

  const addHero = (data: Omit<TenantHero, 'id'>) =>
    addDoc(collection(db, 'tenants', tenantId, 'landing_heroes'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  const updateHero = (heroId: string, data: Partial<TenantHero>) =>
    updateDoc(doc(db, 'tenants', tenantId, 'landing_heroes', heroId), {
      ...data,
      updatedAt: serverTimestamp(),
    });

  const deleteHero = (heroId: string) =>
    deleteDoc(doc(db, 'tenants', tenantId, 'landing_heroes', heroId));

  return {
    heroes,
    loading,
    error,
    addHero,
    updateHero,
    deleteHero,
  };
}
