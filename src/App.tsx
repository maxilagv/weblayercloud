/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import { useAdaptiveExperience } from './hooks/useAdaptiveExperience';
import { usePersonalization } from './hooks/usePersonalization';

const Chatbot = lazy(() => import('./components/Chatbot'));
const Home = lazy(() => import('./pages/Home'));
const Product = lazy(() => import('./pages/Product'));
const Contact = lazy(() => import('./pages/Contact'));
const Servicios = lazy(() => import('./pages/Servicios'));
const ServicioEcommerce = lazy(() => import('./pages/ServicioEcommerce'));
const ServicioERP = lazy(() => import('./pages/ServicioERP'));
const Admin = lazy(() => import('./pages/Admin'));

// ── Multi-tenant SaaS ────────────────────────────────────────────────────────
const TenantRegister   = lazy(() => import('./pages/demo/TenantRegister'));
const TenantLogin      = lazy(() => import('./pages/demo/TenantLogin'));
const TenantDashboard  = lazy(() => import('./pages/demo/TenantDashboard'));
const DemoStoreRouter  = lazy(() => import('./pages/demo/DemoStoreRouter'));
const SuperAdminShell  = lazy(() => import('./pages/superadmin/SuperAdminShell'));
import { RequireTenantAuth, RequireSuperAdmin } from './pages/demo/RequireTenantAuth';

function PageLoader() {
  return (
    <div
      style={{
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
      }}
    >
      Loading LayerCloud
    </div>
  );
}

function MaybeSmoothScroll({ children }: { children: ReactNode }) {
  const { allowSmoothScroll } = useAdaptiveExperience();

  if (!allowSmoothScroll) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.085, duration: 1.15, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  useVisitorTracking(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} {...({ key: location.pathname } as any)}>
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/solucion"
          element={
            <Suspense fallback={<PageLoader />}>
              <Product />
            </Suspense>
          }
        />
        <Route
          path="/contacto"
          element={
            <Suspense fallback={<PageLoader />}>
              <Contact />
            </Suspense>
          }
        />
        <Route
          path="/servicios"
          element={
            <Suspense fallback={<PageLoader />}>
              <Servicios />
            </Suspense>
          }
        />
        <Route
          path="/servicios/ecommerce"
          element={
            <Suspense fallback={<PageLoader />}>
              <ServicioEcommerce />
            </Suspense>
          }
        />
        <Route
          path="/servicios/erp"
          element={
            <Suspense fallback={<PageLoader />}>
              <ServicioERP />
            </Suspense>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

const BAR_H = 36; /* px — debe coincidir con .ann-bar height en CSS */

function PublicShell() {
  const [enableDeferredUi, setEnableDeferredUi] = useState(false);
  const [barVisible, setBarVisible] = useState(true);
  const { barText } = usePersonalization();

  /* Sincroniza la variable CSS --bar-h con la visibilidad del bar */
  useEffect(() => {
    document.documentElement.style.setProperty('--bar-h', barVisible ? `${BAR_H}px` : '0px');
  }, [barVisible]);

  useEffect(() => {
    let timeoutId = window.setTimeout(() => setEnableDeferredUi(true), 1200);
    const idleCallbackId =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(() => setEnableDeferredUi(true), { timeout: 1500 })
        : null;

    return () => {
      window.clearTimeout(timeoutId);
      if (idleCallbackId !== null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleCallbackId);
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col font-sans relative"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* ── Announcement bar ── */}
      {barVisible && (
        <div className="ann-bar" role="banner">
          <span className="ann-bar-dot" aria-hidden="true" />
          <span className="ann-bar-text">{barText}</span>
          <button
            className="ann-bar-close"
            onClick={() => setBarVisible(false)}
            aria-label="Cerrar aviso"
          >
            ✕
          </button>
        </div>
      )}

      <Navbar />
      <main className="flex-grow z-10 relative">
        <AnimatedRoutes />
      </main>
      <Footer />
      {enableDeferredUi ? (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <MaybeSmoothScroll>
      <Router>
        <Routes>
          {/* ── LayerCloud internal admin ── */}
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageLoader />}>
                <Admin />
              </Suspense>
            }
          />

          {/* ── Auth del cliente (sin Navbar/Footer de LayerCloud) ── */}
          <Route
            path="/registro"
            element={
              <Suspense fallback={<PageLoader />}>
                <TenantRegister />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageLoader />}>
                <TenantLogin />
              </Suspense>
            }
          />

          {/* ── Dashboard personal del cliente ── */}
          <Route
            path="/dashboard/*"
            element={
              <RequireTenantAuth>
                <Suspense fallback={<PageLoader />}>
                  <TenantDashboard />
                </Suspense>
              </RequireTenantAuth>
            }
          />

          {/* ── Demo store + admin del cliente ── */}
          <Route
            path="/demo/:tenantId/*"
            element={
              <Suspense fallback={<PageLoader />}>
                <DemoStoreRouter />
              </Suspense>
            }
          />

          {/* ── Super admin LayerCloud ── */}
          <Route
            path="/layercloud-admin/*"
            element={
              <RequireSuperAdmin>
                <Suspense fallback={<PageLoader />}>
                  <SuperAdminShell />
                </Suspense>
              </RequireSuperAdmin>
            }
          />

          {/* ── Landing pública ── */}
          <Route path="/*" element={<PublicShell />} />
        </Routes>
      </Router>
    </MaybeSmoothScroll>
  );
}
