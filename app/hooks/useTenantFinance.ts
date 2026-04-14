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

export interface TenantFinanceEntry {
  id: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  detalle: string;
  categoria?: string;
  createdAt?: any;
  updatedAt?: any;
}

export function useTenantFinance(tenantId: string) {
  const [entries, setEntries] = useState<TenantFinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const entriesQuery = query(
      collection(db, 'tenants', tenantId, 'finance_entries'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      entriesQuery,
      (snapshot) => {
        setEntries(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as TenantFinanceEntry)));
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [tenantId]);

  const addEntry = (data: Omit<TenantFinanceEntry, 'id'>) =>
    addDoc(collection(db, 'tenants', tenantId, 'finance_entries'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  const updateEntry = (entryId: string, data: Partial<TenantFinanceEntry>) =>
    updateDoc(doc(db, 'tenants', tenantId, 'finance_entries', entryId), {
      ...data,
      updatedAt: serverTimestamp(),
    });

  const deleteEntry = (entryId: string) =>
    deleteDoc(doc(db, 'tenants', tenantId, 'finance_entries', entryId));

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
  };
}
