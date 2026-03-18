# Motor comercial con IA

## Objetivo

La pagina no solo tiene que captar leads. Tiene que:

1. Recolectar datos limpios.
2. Entender el dolor real.
3. Elegir la oferta correcta.
4. Definir el mejor angulo de venta.
5. Decidir el siguiente movimiento comercial.
6. Medir que canal y que campana terminan en ventas reales.

## Arquitectura recomendada con Vercel + Firebase

### 1. Captura estructurada

El chatbot hace preguntas cortas y el formulario de contacto deja una segunda puerta de entrada.

Por que:

- recolecta mejor
- cuesta menos
- evita respuestas largas e inconsistentes
- no depende de IA para la parte critica de intake

### 2. Enriquecimiento con IA

Cuando el lead ya tiene suficiente informacion, la web llama a `/api/lead-strategy`.

La funcion:

- corre del lado servidor en Vercel
- usa `GEMINI_API_KEY` sin exponerla al cliente
- devuelve oferta recomendada, prioridad, intencion, urgencia, fit y readiness
- redacta `que decir ahora`
- deja un follow-up listo para WhatsApp y otro para email

### 3. Persistencia

Todo queda guardado en Firestore dentro de `chatSessions` y `contactSubmissions`.

Esto te permite:

- ver el lead crudo
- ver el analisis IA
- volver a analizar mas adelante
- conectar remarketing o automatizaciones
- medir conversion por canal y campana

### 4. Panel admin

El panel `/admin` ya muestra:

- visitas
- leads unificados
- pipeline comercial
- atribucion por canal y campana
- scoring de intencion, urgencia, fit y readiness
- que oferta mostrar primero
- que decir ahora
- follow-up listo para WhatsApp y email

## Seguridad actual

Con el stack actual, la IA corre en Vercel y la escritura final del enriquecimiento vuelve a Firestore.

Por eso las reglas permiten:

- escritura publica acotada para visitas
- escritura publica acotada para intake del chatbot
- escritura publica acotada solo sobre campos `ai*` en formularios de contacto
- lectura y control total solo para admin autenticado

Siguiente endurecimiento recomendado:

- mover tambien la persistencia de IA a una funcion serverless con credenciales admin
- dejar Firestore sin updates publicos de enriquecimiento

## Por que no hace falta un backend C++ ahora

Para este objetivo, C++ seria sobreingenieria temprana.

Con Vercel + Firebase ya tenes:

- front rapido
- base de datos
- auth
- funciones serverless
- costo inicial bajo

C++ recien tendria sentido si mas adelante queres:

- scoring muy pesado en tiempo real
- modelos propios on-premise
- procesamiento masivo de eventos
- integraciones enterprise de alta concurrencia

## Idea fuerte

No le pidas a la IA que improvise toda la venta desde cero.

Hace esto:

- intake deterministico
- IA para interpretar
- reglas para ejecutar

Esa combinacion vende mejor, cuesta menos y rompe menos.

## Limite deliberado

El sistema esta pensado para persuasion fuerte y precisa, pero no para manipulacion enganosa.

La idea correcta es:

- detectar la motivacion dominante
- hablar en el lenguaje que mejor convierte
- mostrar el ROI o el alivio operativo correcto
- bajar friccion para avanzar

No:

- inventar urgencias falsas
- mentir sobre resultados
- explotar miedo o vulnerabilidad
