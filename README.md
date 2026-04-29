# Dinero Intelligence

AI-powered financial assistant for [Dinero.dk](https://dinero.dk) — built with Next.js 14 App Router, TypeScript, and Tailwind.

---

## Architecture (Prompt 1 — API layer)

```
lib/
  api/
    client.ts          DineroAPIClient — fetch, retry, auto-refresh
    errors.ts          DineroAPIError discriminated union
    __tests__/
      client.test.ts   Vitest unit tests (no real network)
  auth/
    pkce.ts            PKCE code_verifier / code_challenge (Web Crypto API)
    oauth.ts           OAuthService — login, exchange, refresh, revoke
  storage/
    token-store.ts     In-memory access token + HttpOnly cookie strategy
types/
  dinero.ts            Organization, Contact, Invoice, Voucher, Account
i18n/
  da.json              Danish strings (primary)
  es.json              Spanish strings
  index.ts             t() + createTranslator() + detectLocale()
app/api/auth/
  login/route.ts       GET  /api/auth/login    → redirect to Dinero OAuth
  callback/route.ts    GET  /api/auth/callback → exchange code + set cookie
  refresh/route.ts     POST /api/auth/refresh  → rotate access token
  logout/route.ts      POST /api/auth/logout   → revoke + clear cookie
```

---

## Registrar la app en Dinero.dk

> TODO: URL exacta de la consola de desarrolladores de Dinero (confirmar con soporte).

1. Ve a **[dinero.dk/developers](https://dinero.dk/developers)** (TODO: confirmar URL).
2. Crea una nueva aplicación OAuth.
3. Anota el `client_id` y `client_secret`.
4. Registra el **Redirect URI** como: `https://TU_DOMINIO/api/auth/callback`.
5. Activa los scopes: `openid offline_access read write` (TODO: confirmar scopes exactos).

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto (nunca lo commits):

```env
# OAuth credentials — obtenidos del developer portal de Dinero
DINERO_CLIENT_ID=tu_client_id
DINERO_CLIENT_SECRET=tu_client_secret

# URI registrada exactamente igual en el portal de Dinero
DINERO_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Base URL de la API de Dinero
# Producción:  https://api.dinero.dk/v1   (TODO: confirmar)
# Sandbox:     https://sandbox-api.dinero.dk/v1  (TODO: confirmar)
DINERO_API_BASE_URL=https://api.dinero.dk/v1

# Auth server base URL
# TODO: confirmar endpoint exacto del servidor OAuth de Dinero
DINERO_AUTH_BASE_URL=https://authz.dinero.dk
```

En Vercel, añade estas variables en **Settings → Environment Variables**.

---

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # vitest — tests unitarios del DineroAPIClient
npm run build     # next build — validación de tipos + bundle
```

---

## TODOs bloqueantes

| # | Blocker | Acción requerida |
|---|---------|-----------------|
| 1 | `DINERO_AUTH_BASE_URL` desconocido | Consultar docs de Dinero OAuth o contactar soporte |
| 2 | Paths OAuth (`/connect/authorize`, `/connect/token`) | Confirmar en la documentación oficial |
| 3 | Scopes de la API de Dinero | Confirmar lista exacta de scopes disponibles |
| 4 | `DINERO_API_BASE_URL` — sandbox vs producción | Confirmar ambas URLs en docs de Dinero |
| 5 | Schemas de modelos (`Invoice`, `Contact`, etc.) | Verificar contra OpenAPI spec o documentación |
| 6 | Formato de dinero: øre vs DKK decimal | Confirmar si Dinero usa enteros (øre) o decimales |
| 7 | Paginación: estructura real del `PagedResult` | Confirmar campos `collection`, `pagination` |
| 8 | Token refresh: ¿Dinero rota el refresh_token? | Confirmar si el nuevo refresh token es diferente |

---

## Roadmap

### Prompt 2 — Conectar UI a servicios reales
- Reemplazar datos mock en `InvoiceDashboard` con llamadas reales a `DineroAPIClient`.
- Server Actions para `syncDinero`, `fetchOrganization`, `fetchTopExpenses`.
- Estados de carga y error (Suspense + Error Boundaries).
- Middleware de autenticación: redirigir a `/api/auth/login` si no hay sesión.

### Prompt 3 — Integración LLM (Ask AI Advisor)
- Route Handler `/api/ai/chat` con streaming.
- Sistema de contexto: inyectar datos reales de Dinero como contexto del LLM.
- Historial de conversación persistido.

### Prompt 4 — Background sync + webhooks
- Sincronización periódica con Dinero en background.
- Webhooks de Dinero (si disponibles) para actualizaciones en tiempo real.
- Notificaciones para vencimientos de Moms y discrepancias.
