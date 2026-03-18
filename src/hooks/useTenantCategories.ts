import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TenantCategory {
  id:          string;
  nombre:      string;
  slug:        string;
  descripcion: string;
  imagen:      string;
  orden:       number;
  activo:      boolean;
}

export function useTenantCategories(tenantId: string) {
  const [categories, setCategories] = useState<TenantCategory[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const q = query(
      collection(db, 'tenants', tenantId, 'categories'),
      orderBy('orden', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as TenantCategory)));
      setLoading(false);
    });

    return unsub;
  }, [tenantId]);

  const addCategory = (data: Omit<TenantCategory, 'id'>) =>
    addDoc(collection(db, 'tenants', tenantId, 'categories'), {
      ...data, createdAt: new Date(),
    });

  const updateCategory = (id: string, data: Partial<TenantCategory>) =>
    updateDoc(doc(db, 'tenants', tenantId, 'categories', id), data);

  const deleteCategory = (id: string) =>
    deleteDoc(doc(db, 'tenants', tenantId, 'categories', id));

  return { categories, loading, addCategory, updateCategory, deleteCategory };
}
