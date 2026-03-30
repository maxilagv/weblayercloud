import { useEffect, useState } from 'react';
import {
  browserLocalPersistence,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type IdTokenResult,
  type User,
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app, { auth } from '../lib/firebase';
import { normalizeEmail, normalizePhone } from '../lib/auth';

const functions = getFunctions(app, 'us-central1');
const registerTenantAccount = httpsCallable<
  {
    email: string;
    password: string;
    ownerName: string;
    businessName: string;
    businessType: string;
    phone?: string;
  },
  { tenantId: string }
>(functions, 'registerTenantAccount');
const repairTenantAccess = httpsCallable<undefined, { tenantId: string }>(
  functions,
  'repairTenantAccess',
);

export type TenantAuthUser = User & {
  tenantId: string | null;
  role?: string;
  trialActive?: boolean;
  modules?: string[];
  active?: boolean;
  plan?: string;
};

export interface RegisterTenantPayload {
  ownerName: string;
  businessName: string;
  businessType: string;
  phone?: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
      await sleep(350 * (attempt + 1));
    }
  }

  throw lastError;
}

function enrichUser(firebaseUser: User, tokenResult: IdTokenResult): TenantAuthUser {
  return Object.assign(firebaseUser, {
    tenantId:
      (tokenResult.claims.tenantId as string | undefined) ?? firebaseUser.tenantId ?? null,
    role: tokenResult.claims.role as string | undefined,
    trialActive: tokenResult.claims.trialActive as boolean | undefined,
    modules: Array.isArray(tokenResult.claims.modules)
      ? tokenResult.claims.modules.map((module) => String(module))
      : [],
    active: tokenResult.claims.active as boolean | undefined,
    plan: tokenResult.claims.plan as string | undefined,
  });
}

async function waitForAccessClaims(firebaseUser: User) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const tokenResult = await firebaseUser.getIdTokenResult(true);
    const role = tokenResult.claims.role as string | undefined;
    const tenantId = (tokenResult.claims.tenantId as string | undefined) ?? null;

    if (role === 'layercloud_superadmin') {
      return tokenResult;
    }

    if (role === 'tenant_admin' && tenantId) {
      return tokenResult;
    }

    await sleep(450 * (attempt + 1));
  }

  throw Object.assign(new Error('No tenant access'), {
    code: 'auth/no-tenant-access',
  });
}

export function useTenantAuth() {
  const [user, setUser] = useState<TenantAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        setUser(enrichUser(firebaseUser, tokenResult));
      } catch (error) {
        console.error('[useTenantAuth] No pudimos leer claims:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const registerTenant = async (
    email: string,
    password: string,
    payload: RegisterTenantPayload,
  ) => {
    const normalizedEmail = normalizeEmail(email);

    await ensurePersistentSession();
    await registerTenantAccount({
      email: normalizedEmail,
      password,
      ownerName: payload.ownerName.trim(),
      businessName: payload.businessName.trim(),
      businessType: payload.businessType.trim(),
      phone: normalizePhone(payload.phone ?? ''),
    });

    const credential = await signInWithRetry(normalizedEmail, password);
    await waitForAccessClaims(credential.user);
    await sendEmailVerification(credential.user).catch(() => undefined);

    return { user: credential.user };
  };

  const login = async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);

    await ensurePersistentSession();
    const credential = await signInWithRetry(normalizedEmail, password);
    const tokenResult = await credential.user.getIdTokenResult(true);

    if (tokenResult.claims.role === 'layercloud_superadmin') {
      return { user: credential.user };
    }

    try {
      await waitForAccessClaims(credential.user);
      return { user: credential.user };
    } catch (error) {
      await repairTenantAccess();
      await waitForAccessClaims(credential.user);
      return { user: credential.user };
    }
  };

  const sendPasswordResetLink = async (email: string) => {
    await sendPasswordResetEmail(auth, normalizeEmail(email));
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      return;
    }

    await sendEmailVerification(auth.currentUser);
  };

  const logout = () => signOut(auth);

  const isTenantAdmin = () => user?.role === 'tenant_admin';
  const isSuperAdmin = () => user?.role === 'layercloud_superadmin';
  const tenantId = user?.tenantId ?? null;

  return {
    user,
    loading,
    registerTenant,
    login,
    logout,
    sendPasswordResetLink,
    resendVerificationEmail,
    isTenantAdmin,
    isSuperAdmin,
    tenantId,
  };
}
