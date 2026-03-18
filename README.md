# LayerCloud

Landing + intake + scoring + admin para captacion comercial en Firebase, con:

- tracking de visitas y eventos de comportamiento
- identidad persistente por visitante, persona, organizacion y lead thread
- ingestion server-side para chat y formulario
- analisis comercial con reglas + Gemini
- panel admin sobre Firestore

## Desarrollo

1. Instalar dependencias:
   `npm install`
2. Completar las variables de `.env.local` a partir de `.env.example`
3. Levantar la app:
   `npm run dev`

## Variables importantes

- `VITE_FIREBASE_*`: configuracion publica del proyecto Firebase
- `FIREBASE_ADMIN_*` o `FIREBASE_ADMIN_CREDENTIALS`: credenciales server-side para escribir con Admin SDK
- `GEMINI_API_KEY`: analista comercial IA
- `ADMIN_EMAILS`: emails autorizados para rutas admin como `/api/lead-stage`

## Pipeline actual

- `POST /api/track-visit`: page views y return visits
- `POST /api/track-event`: CTA clicks, scroll depth, time buckets, chat/form events
- `POST /api/chat/session`: session server-side + identidad + lead thread
- `POST /api/chat/message`: persistencia de mensajes + analisis por milestone
- `POST /api/intake/contact`: formulario, deduplicacion y analisis
- `POST /api/lead-stage`: cambio de etapa admin autenticado

## Validacion

- Tipado: `npm run lint`
- Build: `npm run build`
