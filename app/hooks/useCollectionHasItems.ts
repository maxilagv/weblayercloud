import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Detecta en tiempo real si una sub-colección del tenant tiene al menos un
 * documento activo. Usa onSnapshot con limit(1) para máxima eficiencia:
 * solo carga un documento y reacciona a cambios al instante.
 *
 * @param tenantId       ID del tenant
 * @param collectionName Nombre de la sub-colección (ej: 'products', 'orders')
 * @returns              true si la colección tiene ≥1 documento, false en caso contrario
 */
export function useCollectionHasItems(
  tenantId:       string,
  collectionName: string,
): boolean {
  const [hasItems, setHasItems] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    const q = query(
      collection(db, 'tenants', tenantId, collectionName),
      limit(1),
    );

    const unsub = onSnapshot(
      q,
      (snap) => setHasItems(!snap.empty),
      () => { /* silencioso — puede fallar si el trial expiró */ },
    );

    return unsub;
  }, [tenantId, collectionName]);

  return hasItems;
}
