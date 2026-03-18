import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TenantStaffMember {
  id: string;
  uid: string;
  nombre: string;
  email: string;
  rol: 'empleado';
  modulos: string[];
  activo: boolean;
  invitedAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export function useTenantStaff(tenantId: string) {
  const [staff, setStaff] = useState<TenantStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const staffQuery = query(
      collection(db, 'tenants', tenantId, 'staff'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      staffQuery,
      (snapshot) => {
        setStaff(snapshot.docs.map((member) => ({ id: member.id, ...member.data() } as TenantStaffMember)));
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [tenantId]);

  const saveStaffMember = (uid: string, data: Omit<TenantStaffMember, 'id' | 'uid'>) =>
    setDoc(
      doc(db, 'tenants', tenantId, 'staff', uid),
      {
        uid,
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

  const deleteStaffMember = (uid: string) =>
    deleteDoc(doc(db, 'tenants', tenantId, 'staff', uid));

  return {
    staff,
    loading,
    error,
    saveStaffMember,
    deleteStaffMember,
  };
}
