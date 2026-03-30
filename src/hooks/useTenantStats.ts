import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TenantStats {
  productCount: number;
  orderCount: number;
  categoryCount: number;
}

export function useTenantStats(tenantId: string) {
  const [stats, setStats] = useState<TenantStats>({
    productCount: 0,
    orderCount: 0,
    categoryCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const resolvedKeys = new Set<string>();
    const totalListeners = 3;
    const markResolved = (key: string) => {
      resolvedKeys.add(key);
      if (resolvedKeys.size >= totalListeners) {
        setLoading(false);
      }
    };

    const unsubProducts = onSnapshot(
      collection(db, 'tenants', tenantId, 'products'),
      (snapshot) => {
        setStats((current) => ({ ...current, productCount: snapshot.size }));
        markResolved('products');
      },
      () => markResolved('products'),
    );

    const unsubOrders = onSnapshot(
      collection(db, 'tenants', tenantId, 'orders'),
      (snapshot) => {
        setStats((current) => ({ ...current, orderCount: snapshot.size }));
        markResolved('orders');
      },
      () => markResolved('orders'),
    );

    const unsubCategories = onSnapshot(
      collection(db, 'tenants', tenantId, 'categories'),
      (snapshot) => {
        setStats((current) => ({ ...current, categoryCount: snapshot.size }));
        markResolved('categories');
      },
      () => markResolved('categories'),
    );

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCategories();
    };
  }, [tenantId]);

  return { stats, loading };
}
