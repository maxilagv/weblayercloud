import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import { DemoCartProvider } from '../../context/DemoCartContext';
import { DemoToastProvider } from '../../context/DemoToastContext';
import { DemoJourneyProvider } from '../../context/DemoJourneyContext';
import { TenantProvider, useTenant } from '../../context/TenantContext';
import { trackTenantEvent } from '../../utils/trackTenantEvent';
import DemoLayout from './DemoLayout';

const DemoHome = lazy(() => import('./DemoHome'));
const DemoProducts = lazy(() => import('./DemoProducts'));
const DemoProductDetail = lazy(() => import('./DemoProductDetail'));
const DemoCheckout = lazy(() => import('./DemoCheckout'));
const DemoAbout = lazy(() => import('./DemoAbout'));
const DemoContact = lazy(() => import('./DemoContact'));
const DemoCustomerLogin = lazy(() => import('./DemoCustomerLogin'));
const DemoCustomerRegister = lazy(() => import('./DemoCustomerRegister'));
const DemoMyAccount = lazy(() => import('./DemoMyAccount'));
const DemoAdminShell = lazy(() => import('./DemoAdminShell'));

function DemoLoader() {
  return (
    <div
      style={{
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        fontSize: 11,
        letterSpacing: '0.1em',
        color: '#999',
        textTransform: 'uppercase',
      }}
    >
      Cargando demo...
    </div>
  );
}

function TrialGuard({ children }: { children: ReactNode }) {
  const { trialExpired, loading, tenantMeta } = useTenant();

  useEffect(() => {
    if (tenantMeta && trialExpired && !tenantMeta.isPublicDemo) {
      trackTenantEvent(tenantMeta.tenantId, 'trial_expired_shown', {});
    }
  }, [tenantMeta, trialExpired]);

  if (loading) {
    return <DemoLoader />;
  }

  if (!tenantMeta) {
    return (
      <div
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 40,
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0A0A0A' }}>Demo no encontrada</h2>
        <p style={{ color: '#666', maxWidth: 420 }}>
          El enlace puede ser incorrecto o la demo fue eliminada.
        </p>
        <a href="/" style={{ color: '#FF3B00', fontWeight: 700 }}>
          Volver a LayerCloud
        </a>
      </div>
    );
  }

  if (tenantMeta.isPublicDemo || !trialExpired) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0,0,0,0.92)',
      }}
    >
      <div
        style={{
          width: 'min(520px, 100%)',
          background: '#fff',
          borderTop: '4px solid #FF3B00',
          padding: '42px 34px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#FF3B00',
            marginBottom: 16,
          }}
        >
          Período de prueba finalizado
        </p>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#0A0A0A' }}>
          Tu demo de {tenantMeta.businessName} expiró
        </h2>
        <p style={{ marginTop: 12, color: '#666', lineHeight: 1.7 }}>
          La demo estuvo activa durante 7 días. Para activar el sistema completo y seguir
          vendiendo, contactá a LayerCloud.
        </p>
        <a
          href="/contacto"
          onClick={() => trackTenantEvent(tenantMeta.tenantId, 'trial_expired_cta_clicked', {})}
          style={{
            display: 'inline-flex',
            marginTop: 26,
            background: '#FF3B00',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            padding: '14px 28px',
          }}
        >
          Activar sistema completo
        </a>
      </div>
    </div>
  );
}

function DemoJourneyWrapper({ tenantId, children }: { tenantId: string; children: ReactNode }) {
  const { tenantMeta } = useTenant();

  return (
    <DemoJourneyProvider
      tenantId={tenantId}
      hideDemoBranding={tenantMeta?.hideDemoBranding ?? false}
    >
      {children}
    </DemoJourneyProvider>
  );
}

function RouteTracker({ tenantId }: { tenantId: string }) {
  const location = useLocation();

  useEffect(() => {
    trackTenantEvent(tenantId, 'page_view', `${location.pathname}${location.search}`);
  }, [location.pathname, location.search, tenantId]);

  return null;
}

export default function DemoStoreRouter() {
  const { tenantId } = useParams<{ tenantId: string }>();

  if (!tenantId) return null;

  return (
    <TenantProvider tenantId={tenantId}>
      <DemoJourneyWrapper tenantId={tenantId}>
        <DemoCartProvider tenantId={tenantId}>
          <DemoToastProvider>
            <RouteTracker tenantId={tenantId} />
            <TrialGuard>
              <Suspense fallback={<DemoLoader />}>
                <Routes>
                  <Route element={<DemoLayout />}>
                    <Route index element={<DemoHome />} />
                    <Route path="products" element={<DemoProducts />} />
                    <Route path="products/:productId" element={<DemoProductDetail />} />
                    <Route path="checkout" element={<DemoCheckout />} />
                    <Route path="about" element={<DemoAbout />} />
                    <Route path="contact" element={<DemoContact />} />
                    <Route path="mi-cuenta" element={<DemoMyAccount />} />
                  </Route>

                  <Route path="login" element={<DemoCustomerLogin />} />
                  <Route path="registro" element={<DemoCustomerRegister />} />
                  <Route path="admin/*" element={<DemoAdminShell />} />
                </Routes>
              </Suspense>
            </TrialGuard>
          </DemoToastProvider>
        </DemoCartProvider>
      </DemoJourneyWrapper>
    </TenantProvider>
  );
}
