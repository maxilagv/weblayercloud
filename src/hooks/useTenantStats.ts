import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TenantStats {
  productCount: number;
  orderCount:   number;
  categoryCount: number;
}

export function useTenantStats(tenantId: string) {
  const [stats, setStats]     = useState<TenantStats>({ productCount: 0, orderCount: 0, categoryCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const fetchCounts = async () => {
      try {
        const [products, orders, categories] = await Promise.all([
          getCountFromServer(collection(db, 'tenants', tenantId, 'products')),
          getCountFromServer(collection(db, 'tenants', tenantId, 'orders')),
          getCountFromServer(collection(db, 'tenants', tenantId, 'categories')),
        ]);
        setStats({
          productCount:  products.data().count,
          orderCount:    orders.data().count,
          categoryCount: categories.data().count,
        });
      } catch (e) {
        // Silencioso — si el trial expiró las reglas bloquean las lecturas
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [tenantId]);

  return { stats, loading };
}
