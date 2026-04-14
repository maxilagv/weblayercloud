import { useState, useEffect, Suspense, lazy } from 'react';
import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Chatbot = lazy(() => import('../components/Chatbot'));

export default function PublicLayout() {
  const [enableDeferredUi, setEnableDeferredUi] = useState(false);

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
      <Navbar />
      <main className="flex-grow z-10 relative">
        <Outlet />
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
