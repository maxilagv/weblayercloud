import { type MetaFunction } from 'react-router';
import { AuthUI } from '../components/ui/auth-fuse';
import { buildMeta } from '../lib/seo';

export const meta: MetaFunction = () =>
  buildMeta({
    title: 'Acceso — LayerCloud',
    description: 'Ingresá a tu panel de operaciones LayerCloud.',
    path: '/acceso',
  });

export default function AccesoRoute() {
  return (
    <AuthUI
      signInContent={{
        quote: {
          text: "Tu operación te espera. Bienvenido de vuelta.",
          author: "LayerCloud",
        },
      }}
      signUpContent={{
        quote: {
          text: "El primer paso para automatizar tu empresa empieza acá.",
          author: "LayerCloud",
        },
      }}
    />
  );
}
