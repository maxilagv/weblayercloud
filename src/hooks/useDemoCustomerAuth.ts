import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { TenantCustomer } from './useTenantCustomers';

export interface DemoCustomerUser extends TenantCustomer {
  uid: string;
  authEmail: string;
}

export interface RegisterDemoCustomerPayload {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  password: string;
}

export function useDemoCustomerAuth(tenantId: string) {
  const [customerUser, setCustomerUser] = useState<DemoCustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    let unsubscribeProfile = () => undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeProfile();

      if (!firebaseUser) {
        setCustomerUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubscribeProfile = onSnapshot(
        doc(db, 'tenants', tenantId, 'customers', firebaseUser.uid),
        (snapshot) => {
          if (!snapshot.exists()) {
            setCustomerUser(null);
            setLoading(false);
            return;
          }

          setCustomerUser({
            uid: firebaseUser.uid,
            authEmail: firebaseUser.email ?? '',
            id: snapshot.id,
            ...snapshot.data(),
          } as DemoCustomerUser);
          setLoading(false);
        },
        () => {
          setCustomerUser(null);
          setLoading(false);
        },
      );
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, [tenantId]);

  const loginCustomer = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  };

  const registerCustomer = async (payload: RegisterDemoCustomerPayload) => {
    const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);

    await updateProfile(credential.user, {
      displayName: `${payload.nombre} ${payload.apellido}`.trim(),
    });

    await setDoc(
      doc(db, 'tenants', tenantId, 'customers', credential.user.uid),
      {
        uid: credential.user.uid,
        nombre: payload.nombre.trim(),
        apellido: payload.apellido.trim(),
        email: payload.email.trim().toLowerCase(),
        telefono: payload.telefono.trim(),
        direccion: payload.direccion.trim(),
        tipo: 'web',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return credential.user;
  };

  const updateCustomerProfile = async (payload: Partial<RegisterDemoCustomerPayload>) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await updateDoc(doc(db, 'tenants', tenantId, 'customers', uid), {
      ...payload,
      email: payload.email?.trim().toLowerCase(),
      updatedAt: serverTimestamp(),
    });
  };

  const ensureCustomerProfile = async (payload: Omit<RegisterDemoCustomerPayload, 'password'>) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await setDoc(
      doc(db, 'tenants', tenantId, 'customers', uid),
      {
        uid,
        nombre: payload.nombre.trim(),
        apellido: payload.apellido.trim(),
        email: payload.email.trim().toLowerCase(),
        telefono: payload.telefono.trim(),
        direccion: payload.direccion.trim(),
        tipo: 'web',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  };

  const logoutCustomer = () => signOut(auth);

  return {
    customerUser,
    loading,
    loginCustomer,
    registerCustomer,
    updateCustomerProfile,
    ensureCustomerProfile,
    logoutCustomer,
  };
}
