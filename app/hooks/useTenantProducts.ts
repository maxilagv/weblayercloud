import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, type DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TenantProduct {
  id:            string;
  nombre:        string;
  descripcion:   string;
  precio:        number;
  costoActual:   number;
  stockActual:   number;
  marca:         string;
  categorySlug:  string;
  imagenes:      string[];
  activo:        boolean;
  destacado:     boolean;
  priceLocked:   boolean;
}

export function useTenantProducts(tenantId: string) {
  const [products, setProducts] = useState<TenantProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);

    const q = query(
      collection(db, 'tenants', tenantId, 'products'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q,
      (snap) => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as TenantProduct)));
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );

    return unsub;
  }, [tenantId]);

  const addProduct = (data: Omit<TenantProduct, 'id'>) =>
    addDoc(collection(db, 'tenants', tenantId, 'products'), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const updateProduct = (id: string, data: Partial<TenantProduct>) =>
    updateDoc(doc(db, 'tenants', tenantId, 'products', id), {
      ...data,
      updatedAt: new Date(),
    });

  const deleteProduct = (id: string) =>
    deleteDoc(doc(db, 'tenants', tenantId, 'products', id));

  return { products, loading, error, addProduct, updateProduct, deleteProduct };
}
