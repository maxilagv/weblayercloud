import { useEffect } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type DemoSection = 'hero' | 'products' | 'categories' | 'about';

interface SpotlightCallbacks {
  onHeroVisible?:       () => void;
  onProductsVisible?:   () => void;
  onCategoriesVisible?: () => void;
  onAboutVisible?:      () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Observa los elementos [data-demo-section] en el storefront y dispara
 * callbacks cuando entran al viewport del usuario.
 *
 * - Usa IntersectionObserver (eficiente, sin scroll listeners).
 * - Respeta `prefers-reduced-motion`: desactiva el spotlight si el usuario
 *   prefiere movimiento reducido (mejor accesibilidad).
 * - Se limpia automáticamente al desmontar.
 */
export function useDemoSpotlight(callbacks: SpotlightCallbacks): void {
  useEffect(() => {
    // Respetar la preferencia del sistema operativo
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const section = entry.target.getAttribute('data-demo-section') as DemoSection | null;
          switch (section) {
            case 'hero':       callbacks.onHeroVisible?.();       break;
            case 'products':   callbacks.onProductsVisible?.();   break;
            case 'categories': callbacks.onCategoriesVisible?.(); break;
            case 'about':      callbacks.onAboutVisible?.();      break;
          }
        }
      },
      {
        threshold:  0.3,
        rootMargin: '0px 0px -15% 0px',
      },
    );

    const elements = document.querySelectorAll('[data-demo-section]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []); // Solo corre una vez — los elementos del DOM ya están montados
}
