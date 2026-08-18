# Security Spec — Calco

## 1. Qué protegemos

| Activo | Sensibilidad | Dónde vive |
|---|---|---|
| Clave de API de OpenRouter | Alta: permite gastar dinero del usuario | Memoria; opcionalmente sessionStorage o IndexedDB cifrada |
| Contexto profesional del usuario | Media-alta: trayectoria, proyectos, datos personales | Memoria; opcionalmente IndexedDB en claro si el usuario lo activa |
| Respuestas generadas | Media | Memoria únicamente |
| Fuentes analizadas | Baja: son públicas | Memoria únicamente |

## 2. Modelo de amenazas

| # | Amenaza | Vector | Mitigación |
|---|---|---|---|
| T1 | Robo de la clave por XSS | Inyección de script, dependencia comprometida | CSP con `connect-src` restringido a OpenRouter y a la propia app; cero scripts de terceros; dependencias mínimas con lockfile fijo |
| T2 | Robo de la clave desde el almacenamiento local | Acceso físico al equipo, malware | Modo memoria por defecto; bóveda cifrada con passphrase para persistencia; nunca en localStorage sin cifrar |
| T3 | Lectura por extensiones del navegador | Extensión con permisos sobre la página | No mitigable técnicamente. Se mitiga por consecuencia: clave dedicada con límite de crédito bajo |
| T4 | Exfiltración del contexto personal | Igual que T1 y T2 | Mismo control; además el contexto no se persiste por defecto |
| T5 | Filtración a través del servidor de Calco | Logs, telemetría | El servidor nunca recibe clave ni contexto. `/api/extract` no registra URL ni contenido |
| T6 | SSRF vía `/api/extract` | URL apuntando a red interna | Lista de bloqueo de rangos privados, loopback y metadatos de nube; solo http y https |
| T7 | Inyección de instrucciones desde una convocatoria | Texto malicioso en las bases que manipula al modelo | El texto extraído se marca como datos no confiables en el prompt; el modelo tiene instrucción explícita de no obedecer instrucciones halladas en las fuentes |
| T8 | Pérdida de dinero por clave sin límite | Error del usuario, o T1/T2/T3 | Advertencia insistente en el ingreso; validación que muestra el límite configurado; OAuth PKCE como camino preferente |

## 3. Manejo de la clave

### Camino preferente: OAuth PKCE
El usuario conecta su cuenta de OpenRouter y la aplicación recibe una clave emitida para Calco.
Elimina toda la clase de errores de "pegué mi clave maestra" y permite revocación desde el panel
del usuario sin tocar sus otras integraciones.

### Camino alternativo: pegado manual
Permitido, con validación inmediata contra el endpoint de clave para confirmar validez y mostrar
crédito y límite. Si la clave **no tiene límite configurado**, se muestra un aviso destacado
recomendando crear una acotada.

### Tres modos de almacenamiento

| Modo | Dónde | Sobrevive a | Recomendado para |
|---|---|---|---|
| Memoria (defecto) | Estado de React | Nada; se pierde al recargar | Uso normal |
| Sesión | `sessionStorage` | Recarga de página; muere al cerrar la pestaña | Sesiones largas |
| Bóveda cifrada | IndexedDB | Cierre del navegador | Equipo personal de uso frecuente |

### Especificación de la bóveda

Derivación de clave con PBKDF2 sobre la passphrase del usuario: SHA-256, mínimo 600.000
iteraciones, sal aleatoria de 16 bytes generada por operación. Cifrado con AES-GCM de 256 bits,
IV aleatorio de 12 bytes por cifrado. Se persiste únicamente: sal, IV y ciphertext.

La passphrase **no se guarda en ningún lado**. Sin ella el blob es irrecuperable, y así debe
comunicarse en la interfaz.

> **Regla explícita:** está prohibido cifrar la clave con un secreto que la propia aplicación
> conozca. Eso no es cifrado, es ofuscación, y da una falsa sensación de seguridad. Si el usuario
> no aporta la passphrase, la clave va en memoria o en sesión, sin excepción.

### Mejora opcional (Sprint 3, condicionada)
WebAuthn con extensión PRF para derivar la clave de cifrado de biometría en lugar de passphrase.
Misma garantía criptográfica, mejor experiencia. Se implementa solo si el sprint tiene holgura, y
siempre con la passphrase como alternativa.

## 4. Content Security Policy

Política estricta definida en la configuración de Next.js. Directivas clave:

- `default-src` restringido a la propia app.
- `connect-src` limitado a la propia app y al dominio de la API de OpenRouter. **Esta es la
  defensa principal contra T1**: aunque se ejecute código inyectado, el navegador impide enviar
  la clave a cualquier otro destino.
- `script-src` sin `unsafe-eval`; los nonces los gestiona Next.
- `img-src` permitiendo `data:` para favicons embebidos.
- `frame-ancestors` en `none`.
- `object-src` en `none`.

Complementos: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: no-referrer`, y `Permissions-Policy` denegando cámara, micrófono y geolocalización.

## 5. Higiene de datos

- Botón "Borrar todos mis datos" visible en ajustes: limpia memoria, sessionStorage, localStorage
  e IndexedDB en una sola acción, y devuelve al usuario a la pantalla de ingreso.
- La clave se muestra siempre enmascarada, con revelado momentáneo bajo acción explícita.
- Prohibido incluir la clave o el contexto en mensajes de error, trazas o cualquier salida.
- Ningún script de terceros. Fuentes tipográficas autoalojadas.

## 6. Comunicación honesta al usuario

La interfaz debe decir la verdad sobre lo que protege y lo que no:

- "Se guarda solo en este navegador" es correcto.
- "Cifrada con tu contraseña" es correcto **solo** en el modo bóveda.
- Prohibido escribir "seguro", "encriptado" o "protegido" sin decir contra qué.
- La recomendación de usar una clave con límite de crédito acotado aparece en el ingreso y en
  ajustes, porque es la mitigación más efectiva de todas las de este documento.

## 7. Verificación

| Control | Cómo se verifica |
|---|---|
| La clave nunca llega al servidor | Inspección de red: ninguna petición a dominio propio contiene la clave |
| CSP activa y correcta | Revisión de cabeceras en producción; prueba de bloqueo con un `fetch` a dominio ajeno |
| Bóveda irrecuperable sin passphrase | Prueba: cifrar, recargar, introducir passphrase incorrecta y confirmar fallo limpio |
| Borrado total efectivo | Prueba: llenar los tres almacenamientos, borrar, inspeccionar que quedan vacíos |
| Protección contra SSRF | Prueba de `/api/extract` con direcciones de loopback y de red privada |
| Sin scripts de terceros | Auditoría de la pestaña de red en producción |
