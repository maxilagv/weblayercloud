import { useEffect, useState } from 'react';
import {
  browserLocalPersistence,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app, { auth, db } from '../lib/firebase';
import { normalizeEmail, normalizePhone, splitDisplayName } from '../lib/auth';
import type { TenantCustomer } from './useTenantCustomers';

const functions = getFunctions(app, 'us-central1');
const registerTenantCustomer = httpsCallable<
  {
    tenantId: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    password: string;
  },
  { uid: string }
>(functions, 'registerTenantCustomer');

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

async function ensurePersistentSession() {
  await setPersistence(auth, browserLocalPersistence);
}

async function signInWithRetry(email: string, password: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => window.setTimeout(resolve, 350 * (attempt + 1)));
    }
  }

  throw lastError;
}

function buildProfilePayload(
  firebaseUser: User,
  payload?: Partial<Omit<RegisterDemoCustomerPayload, 'password'>>,
) {
  const derivedName = splitDisplayName(firebaseUser.displayName);
  const nombre = payload?.nombre?.trim() || derivedName.nombre || 'Cliente';
  const apellido = payload?.apellido?.trim() || derivedName.apellido || '';
  const email = normalizeEmail(payload?.email ?? firebaseUser.email ?? '');
  const telefono = normalizePhone(payload?.telefono ?? '');
  const direccion = payload?.direccion?.trim() ?? '';

  return {
    uid: firebaseUser.uid,
    nombre,
    apellido,
    email,
    telefono,
    direccion,
    tipo: 'web' as const,
    updatedAt: serverTimestamp(),
  };
}

export function useDemoCustomerAuth(tenantId: string) {
  const [customerUser, setCustomerUser] = useState<DemoCustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setCustomerUser(null);
      setLoading(false);
      return;
    }

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

  const ensureCustomerProfile = async (
    payload?: Partial<Omit<RegisterDemoCustomerPayload, 'password'>>,
  ) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !tenantId) {
      return;
    }

    const tokenResult = await firebaseUser.getIdTokenResult();
    if (tokenResult.claims.role) {
      throw Object.assign(new Error('Not a store customer'), {
        code: 'auth/not-store-customer',
      });
    }

    const customerRef = doc(db, 'tenants', tenantId, 'customers', firebaseUser.uid);
    const snapshot = await getDoc(customerRef);
    const profile = buildProfilePayload(firebaseUser, payload);

    await setDoc(
      customerRef,
      {
        ...profile,
        ...(snapshot.exists() ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true },
    );
  };

  const loginCustomer = async (email: string, password: string) => {
    await ensurePersistentSession();
    const credential = await signInWithRetry(normalizeEmail(email), password);
    await ensureCustomerProfile();
    return credential.user;
  };

  const registerCustomer = async (payload: RegisterDemoCustomerPayload) => {
    await ensurePersistentSession();
    await registerTenantCustomer({
      tenantId,
      nombre: payload.nombre.trim(),
      apellido: payload.apellido.trim(),
      email: normalizeEmail(payload.email),
      telefono: normalizePhone(payload.telefono),
      direccion: payload.direccion.trim(),
      password: payload.password,
    });

    const credential = await signInWithRetry(normalizeEmail(payload.email), payload.password);

    await ensureCustomerProfile(payload);
    await sendEmailVerification(credential.user).catch(() => undefined);
    return credential.user;
  };

  const updateCustomerProfile = async (payload: Partial<RegisterDemoCustomerPayload>) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      return;
    }

    await updateDoc(doc(db, 'tenants', tenantId, 'customers', uid), {
      ...('nombre' in payload ? { nombre: payload.nombre?.trim() } : {}),
      ...('apellido' in payload ? { apellido: payload.apellido?.trim() } : {}),
      ...('direccion' in payload ? { direccion: payload.direccion?.trim() } : {}),
      ...('telefono' in payload ? { telefono: normalizePhone(payload.telefono ?? '') } : {}),
      ...('email' in payload ? { email: normalizeEmail(payload.email ?? '') } : {}),
      updatedAt: serverTimestamp(),
    });
  };

  const sendPasswordResetLink = async (email: string) => {
    await sendPasswordResetEmail(auth, normalizeEmail(email));
  };

  const logoutCustomer = () => signOut(auth);

  return {
    customerUser,
    loading,
    loginCustomer,
    registerCustomer,
    updateCustomerProfile,
    ensureCustomerProfile,
    sendPasswordResetLink,
    logoutCustomer,
  };
}
