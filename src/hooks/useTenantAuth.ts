import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { auth } from '../lib/firebase';
import app from '../lib/firebase';

const functions = getFunctions(app, 'us-central1');

export type TenantAuthUser = User & {
  tenantId:     string | null;
  role?:        string;
  trialActive?: boolean;
  modules?:     string[];
  active?:      boolean;
};

export interface RegisterTenantPayload {
  ownerName:    string;
  businessName: string;
  businessType: string;
  phone?:       string;
}

export function useTenantAuth() {
  const [user, setUser]       = useState<TenantAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Forzar refresh del token para obtener custom claims actualizados
        const tokenResult = await firebaseUser.getIdTokenResult(true); // forceRefresh
        const enriched = Object.assign(firebaseUser, {
          tenantId:    (tokenResult.claims.tenantId as string | undefined) ?? firebaseUser.tenantId ?? null,
          role:        tokenResult.claims.role     as string | undefined,
          trialActive: tokenResult.claims.trialActive as boolean | undefined,
          modules: Array.isArray(tokenResult.claims.modules)
            ? tokenResult.claims.modules.map((module) => String(module))
            : [],
          active: tokenResult.claims.active as boolean | undefined,
        });
        setUser(enriched);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Registro: crea usuario en Auth → llama CF → espera claims → refresca token
  const registerTenant = async (email: string, password: string, payload: RegisterTenantPayload) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

    const registerFn = httpsCallable(functions, 'onTenantRegistration');
    const result     = await registerFn(payload);
    const { tenantId } = (result.data as { tenantId: string });

    // Refrescar el token para que los custom claims estén disponibles
    await newUser.getIdToken(true);

    return { user: newUser, tenantId };
  };

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)
      .then(cred => ({ user: cred.user }));

  const logout = () => signOut(auth);

  const isTenantAdmin = () => user?.role === 'tenant_admin';
  const isSuperAdmin  = () => user?.role === 'layercloud_superadmin';
  const tenantId      = user?.tenantId ?? null;

  return {
    user,
    loading,
    registerTenant,
    login,
    logout,
    isTenantAdmin,
    isSuperAdmin,
    tenantId,
  };
}
