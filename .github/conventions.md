# Convenciones para el Desarrollo de UdoNET

> Se usará el framework Next.js para el desarrollo de este proyecto, con TypeScript para un tipado más estricto.

---

## Índice

1. [Arquitectura y Solución de Rutas con Alias (Path Aliases)](#1-arquitectura-y-solución-de-rutas-con-alias-path-aliases)
2. [Contratos y Comunicación entre Módulos](#2-contratos-y-comunicación-entre-módulos)
3. [Flujo de Trabajo con GitHub Flow](#3-flujo-de-trabajo-con-github-flow)
4. [Convenciones de Código y Documentación](#4-convenciones-de-código-y-documentación)
5. [Convenciones de Commits](#5-convenciones-de-commits)
6. [Manejo de Base de Datos y Relaciones (Supabase/PostgreSQL)](#6-manejo-de-base-de-datos-y-relaciones-supabasepostgresql)

---

## 1. Arquitectura y Solución de Rutas con Alias (Path Aliases)

**Regla:** Quedan prohibidas las importaciones relativas largas que salgan del módulo. Todo lo que cruce fronteras de módulos debe usar los alias.

En lugar de:
```typescript
import { getUserProfile } from '../../module_1/profiles/exports'
```

Se usará:
```typescript
import { getUserProfile } from '@module_1/profiles/exports'
```

Los alias disponibles están definidos en `tsconfig.json`:

| Alias | Apunta a |
|-------|----------|
| `@/*` | `./src/*` |
| `@module_1/*` | `./src/modules/module_1/*` |
| `@module_2/*` | `./src/modules/module_2/*` |
| `@module_3/*` | `./src/modules/module_3/*` |
| `@module_4/*` | `./src/modules/module_4/*` |
| `@module_5/*` | `./src/modules/module_5/*` |

---

## 2. Contratos y Comunicación entre Módulos

Para que no hayan problemas en la exposición de los datos de cada módulo, implementaremos el **Patrón Barrel (Barril)**.

**Regla:** Un módulo NUNCA debe consultar directamente la base de datos de otro módulo.

Si el Módulo 3 (Posts) necesita el nombre del autor, debe llamar a `getUserProfile(userId)` del Módulo 1.

De esta forma, cada módulo debe tener un archivo `exports.ts` en la raíz de cada funcionalidad que exporte únicamente las funciones e interfaces públicas.

```typescript
// Correcto — importar desde exports.ts
import { getUserProfile } from '@module_1/profiles/exports'

// Prohibido — importar desde carpetas internas de otro módulo
import { getUserProfile } from '@module_1/profiles/services/profile.service'
```

Está prohibido que un desarrollador del Módulo 2 importe funciones internas de carpetas profundas del Módulo 4. Solo pueden importar lo que el archivo barril del Módulo 4 exponga.

---

## 3. Flujo de Trabajo con GitHub Flow

Cada equipo (módulo) trabaja desde su rama asignada en el repositorio principal. Lo estrictamente regulado es cómo ese código llega a las ramas principales `develop` y `main`.

### Ciclo de Vida de los PRs

1. El equipo trabaja en su rama `module_X/name` dentro de su carpeta asignada.
2. Al terminar, abren un Pull Request dirigido hacia la rama `develop`.
3. Un integrador revisará el PR. Si hay fallos, dejará comentarios para que el equipo los corrija. Si todo está correcto (cumple convenciones, no hay conflictos), el integrador aprueba y fusiona el PR en `develop`.

### Estructura de las Ramas

**main:** Es la rama de producción. Estrictamente bloqueada. Solo los integradores pueden subir código aquí, y únicamente mediante fusiones desde la rama `develop`.

**develop:** Es la rama de integración donde se unen todos los módulos. Bloqueada para push directo. Solo recibe código a través de Pull Requests (PRs) evaluados y aprobados por los integradores.

**Ramas de módulo:** Ramas de trabajo asignadas a cada equipo:
- `module_1/auth_&_profile`
- `module_2/communities_&_feed`
- `module_3/posts_&_threads`
- `module_4/votes_&_notifications`
- `module_5/moderation_&_reports`

### Reglas para Pull Requests (PRs)

- Todos los PR deben ser aprobados por uno de los integradores.
- Mantengan el código documentado para poder entender su funcionamiento.
- Verificar que el código funciona sin errores antes de hacer la PR.
- Verificar que solo se modificaron archivos dentro de tu módulo.
- Hacer pull de develop para tener la versión más reciente: `git pull origin develop`.
- Un PR debe ser lo más pequeño posible. Es preferible crear varios PRs pequeños que uno gigante.

### Flujo de Trabajo Resumido

1. Cambiar a tu rama: `git checkout module_1/auth_&_profile`
2. Actualizar tu rama: `git pull origin develop`
3. Trabajar y hacer commits: `git add .` -> `git commit -m ":sparkles: feat(auth): add login form"`
4. Subir cambios: `git push origin module_1/auth_&_profile`
5. Crear PR hacia `develop` en GitHub
6. Esperar revisión y aprobación del integrador
7. Una vez mergeado, volver al paso 2 para la siguiente tarea

---

## 4. Convenciones de Código y Documentación

El código debe ser mantenible a largo plazo por cualquier persona del equipo. Para ello, nos basaremos en el **Principio de Responsabilidad Única** (cada función/componente debe hacer una sola cosa).

### Idioma en el Código

Todo el código se escribe en inglés: nombres de variables, funciones, componentes, tipos, constantes y valores de enums. Los valores que se guardan en la base de datos como status, roles y types también van en inglés (`'open'`, `'closed'`, `'pending'`, `'approved'`, `'rejected'`, `'regular'`, `'moderator'`, `'admin'`). Los únicos textos en español son los que el usuario ve en la interfaz (labels, mensajes, descripciones).

### Reglas de Documentación

**Funciones complejas:** Toda función díficil de entender debe estar documentada usando el estándar JSDoc (También las funciones simples, pero con una única linea de JSDoc).

**Bloques de código confusos:** Si una línea o bloque de código no es evidente a simple vista (por ejemplo, un algoritmo complejo o una manipulación de arreglos específica), se debe comentar el **por qué** se hizo así, no el **qué** hace.

```typescript
// Se filtra invertido porque la API externa devuelve los items más antiguos primero
const sortedReplies = rawReplies.reverse().filter(reply => reply.isValid);
```

### Reglas de TypeScript

- Obligatorio `"strict": true` en el `tsconfig.json`.
- Prohibido el uso de `any`. Si no conocen un tipo temporalmente, usen `unknown` y fuercen el casteo validado, o creen una interfaz temporal (Caso extremo, no debería ser necesario).
- Interfaces/Tipos deben usar PascalCase y sin prefijos (ej. usar `User`, `Post`, en lugar de `IUser`, `TPost`).

### Nomenclatura

**Archivos y Carpetas:** kebab-case (ej. `user-profile.tsx`, `auth-utils.ts`). A excepción de archivos propios de Next.js como `page.tsx` o `layout.tsx`, y componentes de React que usan PascalCase (ej. `LoginForm.tsx`).

**Componentes de React:** PascalCase (ej. `UserProfile.tsx` → `export function UserProfile()`).

**Funciones y Variables:** camelCase (ej. `getCurrentUser`, `isAuthenticated`).

**Constantes Globales:** UPPER_SNAKE_CASE (ej. `MAX_REPORT_COUNT = 5`).

**Booleanos:** Empiezan con `is`, `has` o `can` (ej. `isPublic`, `hasReports`, `canVote`).

**Handlers de eventos:** Empiezan con `handle` (ej. `handleSubmit`, `handleVote`, `handleDelete`).

**Funciones de datos:**
- Obtener: `get` (ej. `getUserProfile`, `getPostById`)
- Crear: `create` (ej. `createPost`, `createNotification`)
- Actualizar: `update` (ej. `updateProfile`, `updateReputation`)
- Eliminar: `delete` (ej. `deletePost`, `deleteVote`)

### Reglas de Next.js

**Separación Cliente/Servidor:** Mantener los componentes por defecto como Server Components. Usar `'use client'` estrictamente solo en el archivo que necesite interactividad (botones, hooks como `useState`).

**Data Fetching:** La obtención de datos debe hacerse del lado del servidor siempre que sea posible para aprovechar el rendimiento.

**Archivos page.tsx:** Deben ser delgados. Solo importan el componente del módulo correspondiente y lo renderizan:

```typescript
// src/app/posts/[postId]/page.tsx
import { ThreadView } from '@module_3/posts/components/ThreadView'

export default function PostPage({ params }: { params: { postId: string } }) {
  return <ThreadView postId={params.postId} />
}
```

### Reglas Generales

- No dejar `console.log` en el código que se suba al repositorio.
- No dejar código comentado sin razón. Si no se usa, se borra.
- Cada archivo debe tener una sola responsabilidad.
- No importar desde carpetas internas de otro módulo. Usar siempre el `exports.ts`.
- Usar las constantes de `lib/constants/`.

---

## 5. Convenciones de Commits

Para mantener un historial limpio, legible y estandarizado, es obligatorio el uso de **Conventional Commits** acompañado de **Gitmojis**. Todo mensaje de commit debe estar en inglés.

### Formato estricto

```
:gitmoji: type(functionality): commit message in english
```

### Tipos permitidos

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un bug |
| `refactor` | Cambio de código que no corrige un bug ni añade funcionalidad |
| `docs` | Cambios exclusivos en la documentación |
| `remove` | Eliminación de código o archivos |
| `chore` | Cambios que no afectan el código fuente |
| `build` | Cambios en el sistema de compilación o dependencias externas |
| `style` | Cambios de formato que no afectan el significado del código |
| `perf` | Cambio de código que mejora el rendimiento |
| `test` | Agregar o corregir pruebas existentes |

### Functionality (Scope)

Indica la funcionalidad afectada dentro del módulo:

- Módulo 1: `auth`, `profiles`
- Módulo 2: `communities`
- Módulo 3: `posts`, `search`
- Módulo 4: `votes`, `notifications`
- Módulo 5: `reports`, `moderation`
- General: `config`, `deps`, `readme`

### Gitmojis y ejemplos

| Emoji | Código | Tipo | Ejemplo |
|-------|--------|------|---------|
| ✨ | `:sparkles:` | feat | `:sparkles: feat(auth): add Google login button` |
| 🐛 | `:bug:` | fix | `:bug: fix(profiles): fix avatar not loading` |
| 🎨 | `:art:` | style | `:art: style(posts): adjust thread card spacing` |
| ♻️ | `:recycle:` | refactor | `:recycle: refactor(votes): simplify vote validation logic` |
| 📝 | `:memo:` | docs | `:memo: docs(readme): add installation instructions` |
| 🔧 | `:wrench:` | chore | `:wrench: chore(deps): update dependencies` |
| 🔥 | `:fire:` | remove | `:fire: remove(auth): delete unused mock data` |
| 🚀 | `:rocket:` | build | `:rocket: build(config): update production env` |
| ✅ | `:white_check_mark:` | test | `:white_check_mark: test(votes): add vote weight validation test` |
| ⚡ | `:zap:` | perf | `:zap: perf(search): optimize tag search query` |

---

## 6. Manejo de Base de Datos y Relaciones (Supabase/PostgreSQL)

### Reglas de Gestión de Cambios y Migraciones

- Queda prohibido que los desarrolladores modifiquen el esquema (crear tablas, añadir columnas).
- Todo cambio en la base de datos debe notificarse con antelación para poder aprobarse.

### Relaciones entre Módulos

A nivel de base de datos, sí se establecerán restricciones de Llaves Foráneas (Foreign Key constraints) para garantizar la integridad referencial (ej. un post en el Módulo 3 no puede existir sin un `user_id` válido del Módulo 1).

**Regla:** Aunque la base de datos tenga la relación estricta, a nivel de código Next.js, un módulo no debe hacer un JOIN directo a las tablas de otro módulo.

Lo correcto es que el Módulo 3 haga un SELECT a posts y obtenga el `author_id`. Luego, llama a la función `getUserProfile(authorId)` expuesta por el barril del Módulo 1.

```typescript
// Correcto
const post = await getPostById(postId)
const author = await getUserProfile(post.author_id) // función del Módulo 1

// Incorrecto — JOIN directo a tabla de otro módulo
const { data } = await supabase
  .from('posts')
  .select('*, users(*)')
  .eq('id', postId)
```
