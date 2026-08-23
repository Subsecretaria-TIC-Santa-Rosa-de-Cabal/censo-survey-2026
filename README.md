# Censo Digital

Aplicación web para la recolección de información de censo y visualización de métricas administrativas.

Construida con [Next.js 16](https://nextjs.org), [React 19](https://react.dev), [Prisma](https://prisma.io) y [Tailwind CSS v4](https://tailwindcss.com).

## Requisitos previos

- [Node.js](https://nodejs.org) >= 20
- [pnpm](https://pnpm.io) >= 9 (gestor de paquetes obligatorio; el proyecto usa `pnpm-lock.yaml`)

Instala las dependencias con:

```bash
pnpm install
```

## Estructura del proyecto

```
src/
  app/
    (public)/            # Parte pública del sitio
      page.tsx           # Formulario de censo (con reCAPTCHA)
      layout.tsx         # Provee RecaptchaProvider solo en la zona pública
    admin/               # Parte privada del sitio
      page.tsx           # Dashboard administrativo (protegido)
      layout.tsx         # Layout del panel admin
    api/auth/            # Endpoints de autenticación con AWS Cognito
      login/             # Inicia flujo OAuth y redirige a Cognito Hosted UI
      callback/          # Recibe el código y establece la sesión
      logout/            # Cierra sesión local y en Cognito
    layout.tsx           # Layout raíz (sin RecaptchaProvider)
  lib/
    auth/                # Lógica de autenticación
      cognito.ts         # Configuración y URLs de Cognito
      pkce.ts            # Helpers PKCE
      session.ts         # Gestión de cookies httpOnly
      tokens.ts          # Validación JWT con jose
      verify.ts          # DAL verifySession() para proteger rutas
  components/
    admin/               # Componentes del panel administrativo
    wizard/              # Pasos del formulario de censo
    ui/                  # Componentes de shadcn/ui
proxy.ts                 # Protección de rutas (Next.js 16 reemplaza middleware.ts)
```

## Partes pública y privada

- **Pública (`/`)**: formulario de censo digital. Utiliza Google reCAPTCHA v3 para proteger el envío.
- **Privada (`/admin`)**: panel administrativo. Solo usuarios autenticados mediante AWS Cognito pueden acceder.

## Autenticación con AWS Cognito

La aplicación utiliza el **Cognito Hosted UI** para el inicio y cierre de sesión. No existe formulario de login propio.

### Flujo

1. El usuario accede a `/admin`.
2. `src/proxy.ts` detecta que no hay sesión válida y redirige a `/api/auth/login`.
3. `/api/auth/login` genera `state` y PKCE (`code_verifier` / `code_challenge`) y redirige al Cognito Hosted UI.
4. El usuario inicia sesión en AWS Cognito.
5. Cognito redirige a `/api/auth/callback?code=...&state=...`.
6. Se intercambia el `code` por tokens, se valida el JWT y se guarda la sesión en una cookie `httpOnly`.
7. El usuario accede a `/admin`.

### Cierre de sesión

El botón de cerrar sesión redirige a `/api/auth/logout`, que borra la cookie local y redirige al logout de Cognito.

## Variables de entorno

Copia `.env` y reemplaza los valores según tu entorno:

```bash
# Base de datos PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="..."
RECAPTCHA_SECRET_KEY="..."

# AWS Cognito
COGNITO_REGION="us-east-2"
COGNITO_USER_POOL_ID="us-east-2_XXXXXXXXX"
COGNITO_CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXXXX"
COGNITO_DOMAIN="https://TU-DOMINIO.auth.us-east-2.amazoncognito.com"
COGNITO_REDIRECT_URI="http://localhost:3000/api/auth/callback"
COGNITO_LOGOUT_REDIRECT_URI="http://localhost:3000/"

# Opcional
SESSION_COOKIE_NAME="censo.session"
```

### Configuración del App Client en Cognito

- **Allowed callback URLs**:
  - Desarrollo: `http://localhost:3000/api/auth/callback`
  - Producción: `https://censo.emir.gov.co/api/auth/callback`
- **Allowed sign-out URLs**:
  - Desarrollo: `http://localhost:3000/`
  - Producción: `https://censo.emir.gov.co/`
- **OAuth 2.0 grant types**: `Authorization code grant`
- **OpenID Connect scopes**: `openid`, `email`, `profile`
- No es necesario `client secret` porque el flujo usa PKCE.

## Scripts disponibles

```bash
pnpm dev      # Inicia el servidor de desarrollo
pnpm build    # Compila para producción
pnpm start    # Inicia el servidor de producción
pnpm lint     # Ejecuta ESLint
```

## Notas para desarrollo

- El proyecto usa **Next.js 16**, cuyas convenciones difieren de versiones anteriores. Revisa `node_modules/next/dist/docs/` antes de agregar código nuevo.
- La protección de rutas se realiza mediante `src/proxy.ts` (el antiguo `middleware.ts` está deprecado).
- La validación de sesión se centraliza en `src/lib/auth/verify.ts` y se invoca en cada Server Component, Server Action o Route Handler protegido.
- `cookies()` es una función asíncrona en Next.js 16; siempre usa `await cookies()`.
