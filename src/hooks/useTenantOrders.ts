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

export type OrderStatus = 'pendiente' | 'confirmado' | 'despachado' | 'cancelado';

export interface OrderItem {
  productId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  precio?: number;
}

export interface CustomerSnapshot {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  dni?: string;
}

export interface TenantOrder {
  id: string;
  customerId?: string;
  customerSnapshot: CustomerSnapshot;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  descuentoMonto?: number;
  notes?: string;
  source?: 'web' | 'web_guest' | 'manual';
  stockApplied?: boolean;
  costoTotal?: number;
  remitoId?: string;
  remitoNumero?: number;
  createdAt?: any;
  updatedAt?: any;
}

export function useTenantOrders(tenantId: string) {
  const [orders, setOrders] = useState<TenantOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const q = query(
      collection(db, 'tenants', tenantId, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as TenantOrder)));
      setLoading(false);
    });

    return unsub;
  }, [tenantId]);

  const createOrder = (data: Omit<TenantOrder, 'id'>) =>
    addDoc(collection(db, 'tenants', tenantId, 'orders'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  const updateOrderStatus = (id: string, status: OrderStatus) =>
    updateDoc(doc(db, 'tenants', tenantId, 'orders', id), {
      status,
      updatedAt: serverTimestamp(),
    });

  const updateOrder = (id: string, data: Partial<TenantOrder>) =>
    updateDoc(doc(db, 'tenants', tenantId, 'orders', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });

  const deleteOrder = (id: string) =>
    deleteDoc(doc(db, 'tenants', tenantId, 'orders', id));

  return { orders, loading, createOrder, updateOrderStatus, updateOrder, deleteOrder };
}
