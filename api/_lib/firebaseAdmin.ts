import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

interface ServiceAccountShape {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function sanitizeText(value: string | null | undefined) {
  return (value ?? '').trim();
}

function parseInlineCredentials() {
  const rawCredentials = sanitizeText(process.env.FIREBASE_ADMIN_CREDENTIALS);
  if (!rawCredentials) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawCredentials) as Partial<ServiceAccountShape>;
    const projectId = sanitizeText(parsed.projectId);
    const clientEmail = sanitizeText(parsed.clientEmail);
    const privateKey = sanitizeText(parsed.privateKey).replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing required admin credential keys.');
    }

    return { projectId, clientEmail, privateKey };
  } catch (error) {
    console.error('[firebaseAdmin] Invalid FIREBASE_ADMIN_CREDENTIALS payload.', error);
    throw error;
  }
}

function parseSplitCredentials() {
  const projectId = sanitizeText(process.env.FIREBASE_ADMIN_PROJECT_ID);
  const clientEmail = sanitizeText(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const privateKey = sanitizeText(process.env.FIREBASE_ADMIN_PRIVATE_KEY).replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return { projectId, clientEmail, privateKey };
}

function getCredentialOptions() {
  const serviceAccount = parseInlineCredentials() ?? parseSplitCredentials();
  if (serviceAccount) {
    return {
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    };
  }

  const projectId = sanitizeText(process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID);
  return {
    credential: applicationDefault(),
    ...(projectId ? { projectId } : {}),
  };
}

const adminApp = getApps().length > 0 ? getApps()[0] : initializeApp(getCredentialOptions());

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);

function getAdminEmails() {
  return sanitizeText(process.env.ADMIN_EMAILS)
    .split(',')
    .map((value) => sanitizeText(value).toLowerCase())
    .filter(Boolean);
}

export async function verifyAuthenticatedRequest(req: any) {
  const authorization = sanitizeText(req?.headers?.authorization || req?.headers?.Authorization);
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const token = sanitizeText(authorization.slice(7));
  if (!token) {
    return null;
  }

  return adminAuth.verifyIdToken(token);
}

export function assertAdminToken(decodedToken: DecodedIdToken | null) {
  if (!decodedToken) {
    throw new Error('Authentication required.');
  }

  if ((decodedToken as Record<string, unknown>).admin === true) {
    return decodedToken;
  }

  const adminEmails = getAdminEmails();

  // FAIL-CLOSED: si no hay emails configurados, NADIE es admin
  if (adminEmails.length === 0) {
    throw new Error('Admin access not configured. Set ADMIN_EMAILS env var.');
  }

  const email = sanitizeText(decodedToken.email).toLowerCase();
  if (email && adminEmails.includes(email)) {
    return decodedToken;
  }

  throw new Error('Admin privileges required.');
}
