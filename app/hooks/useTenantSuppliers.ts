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

export interface TenantSupplier {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  cuit?: string;
  notas?: string;
  createdAt?: any;
  updatedAt?: any;
}

export function useTenantSuppliers(tenantId: string) {
  const [suppliers, setSuppliers] = useState<TenantSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const suppliersQuery = query(
      collection(db, 'tenants', tenantId, 'suppliers'),
      orderBy('nombre', 'asc'),
    );

    const unsubscribe = onSnapshot(
      suppliersQuery,
      (snapshot) => {
        setSuppliers(snapshot.docs.map((supplier) => ({ id: supplier.id, ...supplier.data() } as TenantSupplier)));
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [tenantId]);

  const addSupplier = (data: Omit<TenantSupplier, 'id'>) =>
    addDoc(collection(db, 'tenants', tenantId, 'suppliers'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  const updateSupplier = (supplierId: string, data: Partial<TenantSupplier>) =>
    updateDoc(doc(db, 'tenants', tenantId, 'suppliers', supplierId), {
      ...data,
      updatedAt: serverTimestamp(),
    });

  const deleteSupplier = (supplierId: string) =>
    deleteDoc(doc(db, 'tenants', tenantId, 'suppliers', supplierId));

  return {
    suppliers,
    loading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
}
