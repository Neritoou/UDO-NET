# 📘 Guía Oficial de Integración: Módulo 3 (Publicaciones, Hilos y Buscador)

Esta guía documenta la integración oficial del **Módulo 3** en la arquitectura del proyecto **UDONET**. Explica cómo importar y consumir sus componentes desde el patrón barril público (`exports.ts`), los pasos de integración desacoplada en la aplicación, el estado de conexión con los demás módulos (1, 2, 4 y 5) y las estructuras de datos evaluadas académicamente.

---

## 📦 1. API Pública y Exportaciones (`@/modules/module_3/exports`)

Todos los componentes, tipos y Server Actions del Módulo 3 se exponen de forma desacoplada en:

```typescript
import { 
  CreatePostProvider,    // Proveedor del contexto global para el modal de publicación
  useCreatePost,         // Hook para abrir/cerrar el modal desde cualquier botón
  SearchBox,             // Tarjeta contenedor con buscador y desplegables de filtros
  SearchInput,           // Input de búsqueda individual desacoplado
  PostList,              // Lista de publicaciones con tarjetas (PostCard)
  ThreadView,            // Vista detallada de un hilo y sus respuestas
  searchPosts,           // Server Action para realizar búsquedas avanzadas
  getPostsAction,        // Server Action para obtener las publicaciones del feed
  createPostAction,      // Server Action para crear una nueva publicación
  getPostsByUserAction   // Server Action para obtener publicaciones de un usuario
} from '@/modules/module_3/exports';

import type { 
  UnifiedPost, 
  DatabaseReply, 
  DatabaseUser, 
  ActionResponse 
} from '@/modules/module_3/exports';
```

---

## 🚀 2. Pasos de Integración Desacoplada en Producción

> [!NOTE]
> El componente `Module3Container` se incluye únicamente como un contenedor Sandbox de desarrollo para pruebas locales aisladas. **Para la integración final en producción, utiliza la integración desacoplada componente por componente que se detalla a continuación.**

### Paso 1: Configurar el Proveedor Global en `src/app/layout.tsx`
Envuelve la aplicación dentro de `<CreatePostProvider>`. Esto inyecta el modal flotante de creación de publicaciones en todo el árbol de componentes:

```tsx
import { CreatePostProvider } from '@/modules/module_3/exports';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <CreatePostProvider>
          {children}
        </CreatePostProvider>
      </body>
    </html>
  );
}
```

### Paso 2: Disparar el Modal desde cualquier Botón o Navbar
Utiliza el hook `useCreatePost` en cualquier componente cliente para abrir el modal:

```tsx
"use client";

import { useCreatePost } from '@/modules/module_3/exports';

export default function CreateButton() {
  const { open } = useCreatePost();

  return (
    <button 
      onClick={open} 
      className="px-5 py-2.5 bg-regular-blue hover:bg-dark-main-blue text-pure-white font-candal font-normal rounded-full transition-all cursor-pointer border-0 shadow-sm active:scale-95"
    >
      + Crear Publicación
    </button>
  );
}
```

### Paso 3: Renderizar Buscador, Feed e Hilos en la Página Destino (`src/app/page.tsx`)

```tsx
"use client";

import { useState, Suspense } from 'react';
import { SearchBox, PostList, ThreadView } from '@/modules/module_3/exports';

function FeedContent() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  if (selectedThread) {
    return (
      <ThreadView threadId={selectedThread} onBack={() => setSelectedThread(null)} />
    );
  }

  return (
    <SearchBox>
      <PostList onSelectPost={(id) => setSelectedThread(id)} />
    </SearchBox>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-blue p-4 sm:p-8">
      <div className="max-w-[1000px] mx-auto">
        <Suspense fallback={<div className="p-12 text-center font-candal font-normal text-alpha-black">Cargando publicaciones...</div>}>
          <FeedContent />
        </Suspense>
      </div>
    </main>
  );
}
```

---

## 🔗 3. Matriz de Conexión entre Módulos

| Módulo | Tipo de Conexión | Estado y Punto de Integración |
|---|---|---|
| **MÓDULO 1** <br> *(Autenticación y Perfiles)* | Requerida (OAuth) | **Autenticación Real Activa:** Las Server Actions del Módulo 3 extraen la sesión con `await supabase.auth.getUser()`. Obtienen `user.id`, `username`, `avatar_url` y `bio` (carrera) directamente de la tabla `users` al crear posts, responder o votar. |
| **MÓDULO 2** <br> *(Comunidades y Feed)* | Requerida (Comunidades) | **Filtros por Comunidad:** `CreatePostModal` obtiene las comunidades desde la tabla `communities`. <br> **Pendiente (RF-05):** Conectar la función `isUserSubscribed(userId, communityId)` en `createPost` para restringir publicaciones a la carrera del usuario. |
| **MÓDULO 4** <br> *(Votos, Reputación y Notificaciones)* | **100% Integrado** | **Votos:** Integra el componente `<VoteManager />` de Módulo 4 en publicaciones y respuestas. <br> **Reputación:** Renderiza el componente `<UserBadge />` de Módulo 4 en la cabecera del autor. <br> **Notificaciones:** Invocación automática de `createNotification` al recibir respuestas o menciones `@`. |
| **MÓDULO 5** <br> *(Moderación y Reportes)* | Pendiente de Eventos | **Reportes (RF-13):** Las tarjetas `PostCard` y `ReplyItem` incluyen el menú `•••` listo para disparar el modal de reportes. <br> **Acciones de Moderador (RF-14):** La UI ya reacciona visualmente a `is_pinned` (📌 Fijado) y `status === 'closed'` (🔒 Cerrado) cuando un moderador actualice la BD. |

---

## 🧠 4. Estructuras de Datos Aplicadas (Cátedra)

1. **Árbol N-ario + Tabla Hash (`thread.ts` / `supabase-service.ts`):**  
   Indexación de respuestas en un `Map<string, DatabaseReply>` en $O(1)$ por ID y transformación de la lista plana en una estructura jerárquica `nestedReplies` en tiempo lineal $O(n)$.
2. **Árbol de Prefijos / Trie (`MentionTextarea` en `ThreadView.tsx`):**  
   Búsqueda e inserción instantánea de nombres de usuario sugeridos tras escribir `@` en tiempo $O(L)$ basado en la longitud de la palabra buscada.
3. **Hash Sets (`Set` en `supabase-service.ts` / `search.ts`):**  
   Filtrado e intersección de etiquetas de búsqueda en tiempo constante $O(1)$ para evitar iteraciones $O(n^2)$ en arreglos planos.
