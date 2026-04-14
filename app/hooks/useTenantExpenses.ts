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

export interface TenantExpense {
  id: string;
  concepto: string;
  monto: number;
  categoria: 'alquiler' | 'servicios' | 'salarios' | 'mercaderia' | 'otros';
  fecha?: any;
  proveedor?: string;
  comprobante?: string;
  createdAt?: any;
  updatedAt?: any;
}

export function useTenantExpenses(tenantId: string) {
  const [expenses, setExpenses] = useState<TenantExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const expensesQuery = query(
      collection(db, 'tenants', tenantId, 'expenses'),
      orderBy('fecha', 'desc'),
    );

    const unsubscribe = onSnapshot(
      expensesQuery,
      (snapshot) => {
        setExpenses(snapshot.docs.map((expense) => ({ id: expense.id, ...expense.data() } as TenantExpense)));
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [tenantId]);

  const addExpense = (data: Omit<TenantExpense, 'id'>) =>
    addDoc(collection(db, 'tenants', tenantId, 'expenses'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  const updateExpense = (expenseId: string, data: Partial<TenantExpense>) =>
    updateDoc(doc(db, 'tenants', tenantId, 'expenses', expenseId), {
      ...data,
      updatedAt: serverTimestamp(),
    });

  const deleteExpense = (expenseId: string) =>
    deleteDoc(doc(db, 'tenants', tenantId, 'expenses', expenseId));

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
