# Módulo 1 — Autenticación y Perfiles

Login, registro, sesión y gestión de los datos del perfil. Todo con Server
Actions y Server Components; no hay `route.ts` ni llamadas a API.

---

## Contrato para los demás módulos

No consulten la tabla `users` por su cuenta. Todo pasa por los barriles:

```typescript
// Un solo punto de entrada
import { getUserProfile, getCurrentUser } from '@/mod1'

// O por funcionalidad
import { getCurrentUser } from '@module_1/auth/exports'
import { getUserProfile } from '@module_1/profiles/exports'
```

### Desde un componente cliente

`exports.ts` arrastra los servicios de Supabase, que dependen de `next/headers`
y solo existen en el servidor. Un archivo con `'use client'` **no puede**
importar de ahí: usen el barril cliente.

```typescript
'use client'
import { UserAvatar, ReputationBadge } from '@module_1/profiles/exports.client'
import { LogoutButton } from '@module_1/auth/exports.client'
```

### Lo que exponemos

| Función | Devuelve |
|---|---|
| `getCurrentUser()` | Usuario autenticado con su perfil, o `null` |
| `getCurrentUserId()` | Solo el id, o `null` |
| `isAuthenticated()` | `boolean` |
| `getUserProfile(userId)` | Perfil completo, o `null` |
| `getUserProfileByUsername(username)` | Perfil completo, o `null` |
| `getPublicProfile(userId)` | Perfil sin correo si es privado |
| `getUserRole(userId)` | `'regular' \| 'moderator' \| 'admin'` |
| `getUserReputation(userId)` | Puntaje, insignia y progreso |
| `canModerate(role)` / `isAdmin(role)` | `boolean` |

Componentes: `UserAvatar`, `ProfileCard`, `ReputationBadge`, `LogoutButton`,
`ProfileView`, `ProfileEditView`, `LoginView`, `RegisterView`.

El perfil es el tipo `User` de `@/lib/types`. No definimos alias propios: si
necesitan tiparlo, importen `User` de ahí o del barril, que lo reexporta.

---

## Cambios en el contrato

### `getUserReputation` devuelve un número

Antes devolvía un objeto con la insignia y el progreso. Ahora devuelve el
puntaje tal como está en la tabla, porque un service solo debe hacer la
consulta.

```typescript
// Antes
const rep = await getUserReputation(userId)  // { score, badge, nextBadge, progress }
if (rep.score < 100) { ... }

// Ahora
const reputation = await getUserReputation(userId)  // number | null
if (reputation === null || reputation < 100) { ... }
```

`null` significa que el perfil no existe. Trátenlo como caso de error, no como
un cero: no es lo mismo un usuario sin reputación que un usuario inexistente.

Si necesitan la insignia y el progreso, sigue disponible en el barril, pero
ahora es una función pura que reciben ya calculada:

```typescript
import { getUserReputation, buildUserReputation } from '@module_1/profiles/exports'

const reputation = await getUserReputation(userId)
if (reputation !== null) {
  const { badge, nextBadge, progress } = buildUserReputation(userId, reputation)
}
```

**Nota para el Módulo 2:** si solo necesitan comprobar el mínimo de reputación
para crear una subcomunidad, les sale más barato `getCurrentUser()`: devuelve el
`User` completo, con `reputation` incluido, y de paso reemplaza el `MOCK_USER`
con una sola llamada.

```typescript
import { getCurrentUser } from '@module_1/auth/exports'

const user = await getCurrentUser()
if (!user) return { error: 'Debes iniciar sesión para crear una subcomunidad.' }
if (user.reputation < MIN_REPUTATION) {
  return { error: `Necesitas al menos ${MIN_REPUTATION} de reputación.` }
}
```

### `isUsernameTaken` puede devolver `null`

`null` significa que la consulta falló, no que el nombre esté libre. Comprueben
contra `false` antes de darlo por disponible.

---

## Requisitos fuera de este módulo

Este módulo **no funciona solo**. Hacen falta estos archivos, que están fuera de
`src/modules/module_1/` y por tanto no puede tocarlos nuestro equipo. Los
entregamos aparte para que un integrador los aplique.

### 1. Alias en `tsconfig.json`

```json
"paths": {
  "@/mod1": ["./src/modules/module_1/index.ts"]
}
```

### 2. Rutas en `src/app/`

```
(auth)/login/page.tsx              → <LoginView redirectTo={...} />
(auth)/login/loading.tsx           → <AuthSkeleton />
(auth)/register/page.tsx           → <RegisterView />
(auth)/register/loading.tsx        → <AuthSkeleton />
(auth)/forgot-password/page.tsx    → <ForgotPasswordView />
(auth)/forgot-password/loading.tsx → <AuthSkeleton />
(auth)/update-password/page.tsx    → <UpdatePasswordView />
(auth)/update-password/loading.tsx → <AuthSkeleton />
auth/confirm/route.ts              → verifyRecoveryToken(tokenHash)
(dashboard)/profile/page.tsx            → <ProfileView />
(dashboard)/profile/loading.tsx         → <ProfileSkeleton />
(dashboard)/profile/error.tsx           → <ProfileErrorState reset={reset} />
(dashboard)/profile/edit/page.tsx       → <ProfileEditView />
(dashboard)/profile/[username]/page.tsx → <ProfileView username={...} />
```

`auth/confirm/route.ts` es el único Route Handler del módulo. Hace falta porque
el usuario llega desde un enlace del correo (petición GET) y canjear el token
exige escribir la cookie de sesión, cosa que un Server Component no puede hacer.

`error.tsx` debe importar de `@module_1/profiles/exports.client`, no del barril
normal, o el build falla con `You're importing a component that needs
"next/headers"`.

### 3. `src/middleware.ts`

**Obligatorio.** El proyecto tiene `src/proxy.ts`, pero ese nombre solo lo
reconoce Next.js 16 y aquí corre la 15.5: hoy no se ejecuta ningún middleware.
Sin él, el token de acceso de Supabase caduca y el usuario pierde la sesión,
porque un Server Component no puede escribir cookies.

### 4. Imágenes en `public/`

`logo-udonet.png` y `udo-arch.jpg`, usadas por la pantalla de autenticación.

### 5. Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

---

## Requisitos en Supabase

- **Auth**: proveedor de correo y contraseña habilitado.
- **URL Configuration**: añadir `{SITE_URL}/auth/confirm` a las *Redirect URLs*,
  o el enlace del correo de recuperación no funcionará.
- **Email Templates → Reset Password**: el enlace debe apuntar a
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/update-password`.
- **Storage**: bucket público llamado `images` (lo comparten los módulos 2 y 3).
  Los avatares se guardan en `users/{userId}/avatar.webp`.
- **Tabla `users`**: si tiene RLS activado, necesita políticas de `INSERT` para
  el propio usuario (el registro crea la fila) y de `SELECT` para leer perfiles.
  Sin ellas el registro falla aunque la cuenta sí se cree en Auth.

---

## Limitación conocida

El prototipo de frontend pide carrera, semestre, núcleo, teléfono, ubicación y
fecha de nacimiento. La tabla `users` del esquema solo tiene `email`,
`username`, `avatar_url`, `bio`, `is_public`, `role`, `reputation` y
`created_at`. Como los desarrolladores no pueden modificar el esquema, esos
campos no se guardan todavía: hace falta una migración aprobada por los
integradores.
