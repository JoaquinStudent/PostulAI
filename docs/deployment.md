# Deployment — Calco

## 1. Entorno

Vercel, plan gratuito. La app es prácticamente estática: una sola ruta de servidor, sin base de
datos, sin trabajos en segundo plano, sin almacenamiento.

| Elemento | Valor |
|---|---|
| Framework | Next.js 15, App Router |
| Runtime de `/api/extract` | Node.js (jsdom lo requiere; no funciona en edge) |
| Región | La más cercana a Latinoamérica disponible en el plan |
| Variables de entorno secretas | **Ninguna.** La clave de IA la pone el usuario |

Que no haya secretos en el despliegue es consecuencia directa de P1 y conviene mantenerlo: si
algún día aparece una variable secreta, es señal de que algo se movió al servidor y hay que
revisarlo contra la constitución.

## 2. Variables de configuración

Solo públicas:

| Variable | Uso |
|---|---|
| URL pública de la app | Header de atribución hacia OpenRouter y redirección de OAuth |
| Nombre de la app | Header de atribución |
| Identificador de cliente OAuth de OpenRouter | Flujo PKCE; es público por diseño |

## 3. Cabeceras

Configuradas en `next.config`, verificadas en producción tras cada despliegue mayor:

- Content-Security-Policy estricta, con `connect-src` limitado a la propia app y a OpenRouter.
- Strict-Transport-Security con `preload`.
- X-Content-Type-Options en `nosniff`.
- Referrer-Policy en `no-referrer`.
- Permissions-Policy denegando cámara, micrófono y geolocalización.
- X-Frame-Options y `frame-ancestors` en `none`.

**Verificación obligatoria:** intentar un `fetch` desde la consola hacia un dominio ajeno y
confirmar que el navegador lo bloquea. Si no lo bloquea, la CSP no está haciendo su trabajo y la
defensa principal contra robo de clave no existe.

## 4. Ramas y despliegue

| Rama | Destino |
|---|---|
| `main` | Producción |
| `sprint/*` | Vista previa automática de Vercel |

Los despliegues de vista previa sirven para verificar contra los mocks antes de mergear.

## 5. Lista de verificación previa a producción

Antes de promover a `main`:

1. Verificación de tipos sin errores y pruebas automatizadas en verde.
2. Recorrido de aceptación completo en la vista previa.
3. Cabeceras verificadas, incluida la prueba de bloqueo de la CSP.
4. Ninguna petición a dominio propio contiene la clave del usuario (pestaña de red).
5. Cero peticiones a dominios de terceros: fuentes autoalojadas, sin analítica.
6. Prueba real en un teléfono, no solo en el emulador del navegador.
7. `.memory.md` actualizado con las métricas de la versión.

## 6. Límites del plan gratuito

| Límite | Efecto en Calco |
|---|---|
| Tiempo de ejecución de funciones | Solo afecta a `/api/extract`, que tiene timeout propio de 12 s. Las llamadas a la IA no pasan por el servidor, así que este límite es irrelevante para la parte pesada |
| Ancho de banda | Irrelevante: la app es liviana y el tráfico de IA va directo del navegador al proveedor |
| Cold start | jsdom puede tardar en el primer arranque de la ruta. Aceptable; si molesta, se evalúa un parser más liviano |

## 7. Rollback

Sin base de datos ni migraciones, revertir es promover el despliegue anterior desde el panel de
Vercel. No hay estado que reconciliar. Es una de las ventajas de D1 que conviene no perder.

## 8. Dominio

Opcional. Con dominio propio, actualizar la URL pública de configuración y la redirección OAuth
registrada en OpenRouter, o el flujo de conexión fallará.
