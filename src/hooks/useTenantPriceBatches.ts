import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TenantPriceBatch {
  id: string;
  label: string;
  mode: 'percent' | 'delta' | 'margin';
  value: number;
  roundingStep: number;
  roundingMode: 'nearest' | 'up' | 'down';
  summary?: {
    matchedCount?: number;
    changedCount?: number;
    noopCount?: number;
    lockedCount?: number;
    totalCurrent?: number;
    totalNext?: number;
    totalDelta?: number;
  };
  status?: 'applied' | 'rolled_back';
  createdAt?: any;
  updatedAt?: any;
}

export function useTenantPriceBatches(tenantId: string) {
  const [batches, setBatches] = useState<TenantPriceBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const batchesQuery = query(
      collection(db, 'tenants', tenantId, 'price_batches'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      batchesQuery,
      (snapshot) => {
        setBatches(snapshot.docs.map((batch) => ({ id: batch.id, ...batch.data() } as TenantPriceBatch)));
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [tenantId]);

  return { batches, loading, error };
}
