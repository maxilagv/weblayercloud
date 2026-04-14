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
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TenantCustomer {
  id: string;
  uid?: string;
  nombre: string;
  apellido: string;
  dni?: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo?: 'web' | 'manual';
  createdAt?: any;
  updatedAt?: any;
}

export function useTenantCustomers(tenantId: string) {
  const [customers, setCustomers] = useState<TenantCustomer[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const q = query(
      collection(db, 'tenants', tenantId, 'customers'),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(q, snap => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as TenantCustomer)));
      setLoading(false);
    });

    return unsub;
  }, [tenantId]);

  const addCustomer = (data: Omit<TenantCustomer, 'id'>) =>
    addDoc(collection(db, 'tenants', tenantId, 'customers'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  const updateCustomer = (id: string, data: Partial<TenantCustomer>) =>
    updateDoc(doc(db, 'tenants', tenantId, 'customers', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });

  const upsertCustomer = (id: string, data: Partial<TenantCustomer>) =>
    setDoc(
      doc(db, 'tenants', tenantId, 'customers', id),
      {
        ...data,
        uid: data.uid ?? id,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

  const deleteCustomer = (id: string) =>
    deleteDoc(doc(db, 'tenants', tenantId, 'customers', id));

  return { customers, loading, addCustomer, updateCustomer, upsertCustomer, deleteCustomer };
}
