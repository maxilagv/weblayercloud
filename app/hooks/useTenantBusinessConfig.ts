import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface BusinessConfig {
  businessName:  string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  whatsappNumber: string;
  logoUrl?:       string | null;
  instagramUrl?:  string;
  facebookUrl?:   string;
}

export function useTenantBusinessConfig(tenantId: string) {
  const [config, setConfig]   = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const unsub = onSnapshot(
      doc(db, 'tenants', tenantId, 'business_config', 'main'),
      (snap) => {
        setConfig(snap.exists() ? (snap.data() as BusinessConfig) : null);
        setLoading(false);
      }
    );

    return unsub;
  }, [tenantId]);

  const saveConfig = (data: Partial<BusinessConfig>) =>
    setDoc(
      doc(db, 'tenants', tenantId, 'business_config', 'main'),
      { ...data, updatedAt: new Date() },
      { merge: true }
    );

  return { config, loading, saveConfig };
}
